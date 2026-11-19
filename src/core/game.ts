import type { Chain, GameEvent, Pen } from "./chain";
import { WARM_UP_TICKS } from "./chain";
import { LAST_TICK, tickToClock } from "./clock";
import { parseDateKey } from "./daily";
import {
  FINAL_WINDOW,
  WINDOW_IDS,
  chainOf,
  consumesInput,
  docKey,
  formsIn,
  producer,
  routeOf,
  type Doc,
  type WindowId,
} from "./docs";
import { hashInt } from "./rng";
import { isValid, type ValidationContext } from "./validators";
import { formById, type FormTemplate } from "../content/forms";
import { JAM_EVERY } from "../content/windows";

/**
 * The simulation. A run is a pure function of the chain (from the seed) and the player's inputs:
 * `simulate(chain, inputs, untilTick)`. The UI drives a live `Game` by advancing ticks with real
 * time and dispatching actions; every action is logged, so the log replays the run exactly.
 */

export type Where =
  | { kind: "hall" }
  | { kind: "queue"; window: WindowId; ticket: number }
  | { kind: "window"; window: WindowId; handedIn: boolean };

export type Outcome = "resolved" | "info" | "refused";

export interface Visit {
  window: WindowId;
  tick: number;
  outcome: Outcome;
}

export interface FormState {
  template: string;
  values: Record<string, string>;
  /** The pen the form was started with; null while blank. */
  pen: Pen | null;
  /** Field ids in the order they were first filled. */
  order: string[];
  /** How many times this form was handed in and refused. */
  refusals: number;
}

export type Action =
  | { type: "takeTicket"; window: WindowId }
  | { type: "leave" }
  | { type: "handIn" }
  | { type: "fill"; form: string; field: string; value: string }
  | { type: "tear"; form: string }
  | { type: "setPen"; pen: Pen };

export interface Input {
  tick: number;
  action: Action;
}

export type Line =
  | { kind: "called"; ticket: number }
  | { kind: "reveal"; doc: Doc; route: WindowId[]; forms: string[] }
  | { kind: "stillMissing"; doc: Doc }
  | { kind: "final" }
  | { kind: "done"; docs: Doc[] }
  | { kind: "notHere" }
  | { kind: "needInput"; doc: Doc; input: Doc }
  | { kind: "needCopyNotOriginal"; doc: Doc }
  | { kind: "formInvalid"; form: string; field: string }
  | { kind: "fieldOrder"; form: string }
  | { kind: "bluePen"; form: string }
  | { kind: "jam" }
  | { kind: "closed"; window: WindowId }
  | { kind: "skipped"; window: WindowId }
  | { kind: "cartorioClosed" };

export interface Message {
  tick: number;
  window: WindowId | null;
  line: Line;
  /** Picks one of a line's written variants; the UI takes it modulo the number of variants. */
  variant: number;
}

export type WindowStatus =
  | { kind: "open" }
  | { kind: "break"; reason: "lunch" | "coffee"; until: number }
  | { kind: "systemDown"; until: number }
  | { kind: "outOfInk"; until: number }
  | { kind: "closed" };

interface QueueEntry {
  ticket: number;
  player: boolean;
  service: number;
}

interface WindowRuntime {
  id: WindowId;
  queue: QueueEntry[];
  serving: QueueEntry | null;
  servingUntil: number;
  lastCalled: number | null;
  nextArrival: number;
}

/** The morning's first ticket number (the LED panel shows A040 and up). */
export const FIRST_TICKET = 40;

export class Game {
  readonly chain: Chain;
  tick = -WARM_UP_TICKS;
  where: Where = { kind: "hall" };
  pen: Pen;
  /** Documents in your folder, by key. */
  readonly held = new Map<string, Doc>();
  readonly forms = new Map<string, FormState>();
  /** Requirement indexes window 3 has told you about. */
  readonly revealed = new Set<number>();
  readonly messages: Message[] = [];
  readonly visits: Visit[] = [];
  readonly inputs: Input[] = [];
  refusals = 0;
  formsHandedIn = 0;
  finishedAt: number | null = null;
  failed = false;
  /** Copies window 2 has made (or tried to make) for you. */
  copiesMade = 0;
  private readonly windows: WindowRuntime[];
  private nextTicket = FIRST_TICKET;
  private readonly today: ValidationContext["today"];

  constructor(chain: Chain) {
    this.chain = chain;
    this.pen = chain.pen;
    this.today = parseDateKey(chain.dateKey);
    this.windows = WINDOW_IDS.map((id) => ({
      id,
      queue: [],
      serving: null,
      servingUntil: -Infinity,
      lastCalled: null,
      nextArrival: 0,
    }));
    this.held.set(docKey({ kind: "start", id: "id" }), { kind: "start", id: "id" });
    this.held.set(docKey({ kind: "start", id: "goal" }), { kind: "start", id: "goal" });
    // Fill the lines with the people who got there before you.
    while (this.tick < 0) this.step();
  }

  get over(): boolean {
    return this.finishedAt !== null || this.failed;
  }

  /** Real ticks since you arrived (the score), frozen when the run ends. */
  get elapsed(): number {
    return this.finishedAt ?? Math.min(this.tick, LAST_TICK);
  }

  get clock(): number {
    return tickToClock(this.tick);
  }

  // ---------------------------------------------------------------------------------------------
  // Time

  advanceTo(target: number): void {
    while (this.tick < target && !this.over) this.step();
  }

  step(): void {
    if (this.over) return;
    const t = this.tick;
    for (const w of this.windows) this.stepWindow(w, t);
    for (const e of this.chain.events) {
      if (e.kind === "ticketSkipped" && e.tick === t) this.skipTicket(e.window);
    }
    this.tick++;
    if (this.tick >= LAST_TICK && this.finishedAt === null) {
      this.failed = true;
      this.where = { kind: "hall" };
      this.say(null, { kind: "cartorioClosed" });
    }
  }

  private stepWindow(w: WindowRuntime, t: number): void {
    const schedule = this.chain.schedules[w.id - 1]!;
    const arrivals = this.chain.arrivals[w.id - 1]!;
    const closed = t >= schedule.closes;
    while (w.nextArrival < arrivals.length && arrivals[w.nextArrival]!.tick <= t) {
      const a = arrivals[w.nextArrival++]!;
      if (!closed) w.queue.push({ ticket: this.nextTicket++, player: false, service: a.service });
    }
    if (closed) {
      if (w.queue.length > 0) {
        const hadPlayer = w.queue.some((q) => q.player);
        w.queue = [];
        if (hadPlayer) {
          this.where = { kind: "hall" };
          this.say(w.id, { kind: "closed", window: w.id });
        }
      }
      if (w.serving && !w.serving.player) w.serving = null;
      return;
    }
    if (w.serving && !w.serving.player && t >= w.servingUntil) w.serving = null;
    if (!w.serving && w.queue.length > 0 && this.statusAt(w.id, t).kind === "open") {
      const next = w.queue.shift()!;
      w.lastCalled = next.ticket;
      w.serving = next;
      if (next.player) {
        w.servingUntil = Infinity;
        this.where = { kind: "window", window: w.id, handedIn: false };
        this.say(w.id, { kind: "called", ticket: next.ticket });
      } else {
        w.servingUntil = t + next.service;
      }
    }
  }

  private skipTicket(window: WindowId): void {
    const w = this.windows[window - 1]!;
    const i = w.queue.findIndex((q) => q.player);
    if (i < 0 || i === w.queue.length - 1) return;
    const [entry] = w.queue.splice(i, 1);
    w.queue.push(entry!);
    this.say(window, { kind: "skipped", window });
  }

  statusAt(window: WindowId, t: number = this.tick): WindowStatus {
    const schedule = this.chain.schedules[window - 1]!;
    if (t >= schedule.closes) return { kind: "closed" };
    for (const e of this.chain.events) {
      if (e.kind === "systemDown" && t >= e.start && t < e.end)
        return { kind: "systemDown", until: e.end };
    }
    for (const e of this.chain.events) {
      if (e.kind === "outOfInk" && e.window === window && t >= e.start && t < e.end) {
        return { kind: "outOfInk", until: e.end };
      }
    }
    for (const b of schedule.breaks) {
      if (t >= b.start && t < b.end) return { kind: "break", reason: b.kind, until: b.end };
    }
    return { kind: "open" };
  }

  /** People waiting in line at a window (not counting whoever is being served). */
  queueLength(window: WindowId): number {
    return this.windows[window - 1]!.queue.filter((q) => !q.player).length;
  }

  /** People ahead of you, counting the one at the counter. Null if you're not in that line. */
  peopleAhead(window: WindowId): number | null {
    const w = this.windows[window - 1]!;
    const i = w.queue.findIndex((q) => q.player);
    if (i < 0) return null;
    return i + (w.serving && !w.serving.player ? 1 : 0);
  }

  lastCalled(window: WindowId): number | null {
    return this.windows[window - 1]!.lastCalled;
  }

  /** The most recent ticket called anywhere, for the LED panel. */
  get panel(): { ticket: number; window: WindowId } | null {
    let best: { ticket: number; window: WindowId } | null = null;
    for (const w of this.windows) {
      if (w.lastCalled !== null && (!best || w.lastCalled > best.ticket))
        best = { ticket: w.lastCalled, window: w.id };
    }
    return best;
  }

  /** A rough wait in ticks for a new ticket at a window right now. */
  estimateWait(window: WindowId): number {
    const w = this.windows[window - 1]!;
    const status = this.statusAt(window);
    if (status.kind === "closed") return Infinity;
    const ahead = w.queue.filter((q) => !q.player);
    let wait = ahead.reduce((s, q) => s + q.service, 0);
    if (w.serving && !w.serving.player) wait += Math.max(0, w.servingUntil - this.tick);
    if ("until" in status) wait += status.until - this.tick;
    return wait;
  }

  // ---------------------------------------------------------------------------------------------
  // Actions

  /** Applies an action at the current tick and logs it. Returns false if it did nothing. */
  dispatch(action: Action): boolean {
    if (this.over) return false;
    const ok = this.apply(action);
    if (ok) this.inputs.push({ tick: this.tick, action });
    return ok;
  }

  private apply(action: Action): boolean {
    switch (action.type) {
      case "takeTicket":
        return this.takeTicket(action.window);
      case "leave":
        return this.leave();
      case "handIn":
        return this.handIn();
      case "fill":
        return this.fill(action.form, action.field, action.value);
      case "tear":
        return this.tear(action.form);
      case "setPen":
        if (this.pen === action.pen) return false;
        this.pen = action.pen;
        return true;
    }
  }

  private takeTicket(window: WindowId): boolean {
    if (this.where.kind === "window") return false;
    if (this.where.kind === "queue" && this.where.window === window) return false;
    if (this.statusAt(window).kind === "closed") {
      this.say(window, { kind: "closed", window });
      return true;
    }
    if (this.where.kind === "queue") this.removeFromQueue(this.where.window);
    const ticket = this.nextTicket++;
    this.windows[window - 1]!.queue.push({ ticket, player: true, service: 0 });
    this.where = { kind: "queue", window, ticket };
    return true;
  }

  private removeFromQueue(window: WindowId): void {
    const w = this.windows[window - 1]!;
    w.queue = w.queue.filter((q) => !q.player);
  }

  private leave(): boolean {
    if (this.where.kind === "hall") return false;
    if (this.where.kind === "queue") {
      this.removeFromQueue(this.where.window);
    } else {
      const w = this.windows[this.where.window - 1]!;
      w.serving = null;
      w.servingUntil = this.tick;
    }
    this.where = { kind: "hall" };
    return true;
  }

  private fill(formId: string, field: string, value: string): boolean {
    const state = this.forms.get(formId);
    if (!state || !this.held.has(docKey({ kind: "form", template: formId }))) return false;
    const template = formById(formId);
    if (!template.fields.some((f) => f.id === field && !f.printed)) return false;
    if ((state.values[field] ?? "") === value) return false;
    state.values[field] = value;
    const filled = value.trim() !== "";
    if (filled && !state.order.includes(field)) state.order.push(field);
    if (!filled) state.order = state.order.filter((f) => f !== field);
    if (filled && state.pen === null) state.pen = this.pen;
    if (state.order.length === 0) state.pen = null;
    return true;
  }

  private tear(formId: string): boolean {
    const state = this.forms.get(formId);
    if (!state || !this.held.has(docKey({ kind: "form", template: formId }))) return false;
    state.values = {};
    state.order = [];
    state.pen = null;
    return true;
  }

  private handIn(): boolean {
    if (this.where.kind !== "window" || this.where.handedIn) return false;
    const window = this.where.window;
    this.where = { ...this.where, handedIn: true };
    const outcome = window === FINAL_WINDOW ? this.handInFinal() : this.handInStep(window);
    this.visits.push({ window, tick: this.tick, outcome });
    if (outcome === "refused") this.refusals++;
    return true;
  }

  // ---------------------------------------------------------------------------------------------
  // What windows do

  /** A node in a requirement is done when you hold it or anything made from it. */
  private isDone(requirement: Doc, node: Doc): boolean {
    const chain = chainOf(requirement);
    const i = chain.findIndex((n) => docKey(n) === docKey(node));
    return chain.slice(i).some((n) => this.held.has(docKey(n)));
  }

  /** Steps at a window that still need doing, in requirement order. */
  private pendingAt(window: WindowId): { node: Doc; requirement: number }[] {
    const out: { node: Doc; requirement: number }[] = [];
    this.chain.requirements.forEach((req, i) => {
      for (const node of chainOf(req)) {
        if (producer(node) === window && !this.isDone(req, node))
          out.push({ node, requirement: i });
      }
    });
    return out;
  }

  private validationContext(values: Record<string, string>): ValidationContext {
    return { profile: this.chain.profile, today: this.today, clockNow: this.clock, values };
  }

  /** Null if the form passes at this window; otherwise the refusal. */
  formProblem(formId: string, window: WindowId): Line | null {
    const state = this.forms.get(formId);
    const template = formById(formId);
    const values = state?.values ?? {};
    if (window === 1 && state?.pen !== "blue") return { kind: "bluePen", form: formId };
    const ctx = this.validationContext(values);
    for (const field of template.fields) {
      if (!isValid(field.validator, values[field.id] ?? field.printed ?? "", ctx)) {
        return { kind: "formInvalid", form: formId, field: field.id };
      }
    }
    if (template.fillInNumberOrder && !this.filledInOrder(template, state)) {
      return { kind: "fieldOrder", form: formId };
    }
    return null;
  }

  private filledInOrder(template: FormTemplate, state: FormState | undefined): boolean {
    if (!state) return false;
    const numbered = template.fields
      .filter((f) => f.number !== undefined && !f.printed)
      .sort((a, b) => a.number! - b.number!)
      .map((f) => f.id);
    const firstFilled = state.order.filter((id) => numbered.includes(id));
    return firstFilled.join(",") === numbered.join(",");
  }

  private handInStep(window: WindowId): Outcome {
    const pending = this.pendingAt(window);
    const ready = pending.filter(({ node }) => {
      const input = node.kind === "start" || node.kind === "form" ? null : node.of;
      return input !== null && this.held.has(docKey(input));
    });

    if (ready.length === 0) {
      const revealedPending = pending.filter((p) => this.revealed.has(p.requirement));
      if (window === 4) {
        const original = revealedPending.find(({ node }) => {
          const c = node.kind === "auth" ? node.of : null;
          return c?.kind === "copy" && this.held.has(docKey(c.of));
        });
        if (original) {
          this.say(window, { kind: "needCopyNotOriginal", doc: original.node });
          return "refused";
        }
      }
      const first = revealedPending[0];
      if (first && first.node.kind !== "start" && first.node.kind !== "form") {
        this.say(window, { kind: "needInput", doc: first.node, input: first.node.of });
        return "refused";
      }
      this.say(window, { kind: "notHere" });
      return "refused";
    }

    const produced: Doc[] = [];
    for (const { node } of ready) {
      const input = (node as Extract<Doc, { of: Doc }>).of;
      if (!this.held.has(docKey(input))) continue; // used up by an earlier step this visit
      if (input.kind === "form") {
        const problem = this.formProblem(input.template, window);
        this.formsHandedIn++;
        if (problem) {
          this.forms.get(input.template)!.refusals++;
          if (produced.length > 0) this.say(window, { kind: "done", docs: produced });
          this.say(window, problem);
          return "refused";
        }
      }
      if (window === 2 && (this.copiesMade + 1) % JAM_EVERY === 0) {
        this.copiesMade++;
        if (produced.length > 0) this.say(window, { kind: "done", docs: produced });
        this.say(window, { kind: "jam" });
        return produced.length > 0 ? "resolved" : "info";
      }
      if (window === 2) this.copiesMade++;
      this.held.set(docKey(node), node);
      if (consumesInput(node)) this.held.delete(docKey(input));
      produced.push(node);
    }
    this.say(window, { kind: "done", docs: produced });
    return "resolved";
  }

  private handInFinal(): Outcome {
    const reqs = this.chain.requirements;
    const missing = reqs.map((_, i) => i).filter((i) => !this.held.has(docKey(reqs[i]!)));
    if (missing.length === 0) {
      for (const req of reqs) {
        if (req.kind !== "form") continue;
        const problem = this.formProblem(req.template, FINAL_WINDOW);
        this.formsHandedIn++;
        if (problem) {
          this.forms.get(req.template)!.refusals++;
          this.say(FINAL_WINDOW, problem);
          return "refused";
        }
      }
      reqs.forEach((_, i) => this.revealed.add(i));
      this.finishedAt = this.tick;
      this.say(FINAL_WINDOW, { kind: "final" });
      return "resolved";
    }
    const next = missing.find((i) => !this.revealed.has(i));
    if (next !== undefined) {
      const doc = reqs[next]!;
      this.revealed.add(next);
      const forms = formsIn(doc);
      for (const f of forms) {
        if (!this.forms.has(f))
          this.forms.set(f, { template: f, values: {}, pen: null, order: [], refusals: 0 });
        this.held.set(docKey({ kind: "form", template: f }), { kind: "form", template: f });
      }
      this.say(FINAL_WINDOW, { kind: "reveal", doc, route: routeOf(doc), forms });
      return "info";
    }
    this.say(FINAL_WINDOW, { kind: "stillMissing", doc: reqs[missing[0]!]! });
    return "refused";
  }

  private say(window: WindowId | null, line: Line): void {
    const variant = hashInt(`${this.chain.seed}|${this.messages.length}|${line.kind}`);
    this.messages.push({ tick: this.tick, window, line, variant });
  }

  // ---------------------------------------------------------------------------------------------
  // Reading state

  /** What a requirement still needs, for the folder checklist. */
  requirementState(index: number): "unknown" | "done" | "todo" {
    const req = this.chain.requirements[index]!;
    if (this.finishedAt !== null) return "done";
    if (!this.revealed.has(index)) return "unknown";
    if (req.kind === "form")
      return this.formProblem(req.template, FINAL_WINDOW) === null ? "done" : "todo";
    return this.held.has(docKey(req)) ? "done" : "todo";
  }

  /** The next window a revealed requirement needs, or null if it only needs filling in. */
  nextWindowFor(index: number): WindowId | null {
    const req = this.chain.requirements[index]!;
    for (const node of chainOf(req)) {
      if (producer(node) !== null && !this.isDone(req, node)) return producer(node);
    }
    return null;
  }

  eventsActive(): GameEvent[] {
    return this.chain.events.filter((e) =>
      "start" in e ? this.tick >= e.start && this.tick < e.end : false,
    );
  }
}

export function simulate(chain: Chain, inputs: readonly Input[], untilTick: number): Game {
  const game = new Game(chain);
  for (const input of inputs) {
    game.advanceTo(input.tick);
    if (game.over) break;
    game.dispatch(input.action);
  }
  game.advanceTo(untilTick);
  return game;
}
