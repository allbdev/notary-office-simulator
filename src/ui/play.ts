import { formatClock, formatCountdown, formatDuration, tickToClock } from "../core/clock";
import { FINAL_WINDOW, WINDOW_IDS, type WindowId } from "../core/docs";
import type { Message } from "../core/game";
import { docName, formatDate, t, windowName } from "../content/i18n";
import { windowSpec } from "../content/windows";
import type { PlayContext } from "./context";
import { clear, h, setText } from "./dom";
import { folderPanel } from "./folder";
import { lineText, lineTone, statusText, ticketLabel } from "./format";
import { HALL_H, HALL_W, boothRect, drawHall, type HallScene } from "./hall";
import hallPhotoUrl from "../assets/hall.jpg";

/** The hall render, loaded once, only when the hall is first shown on a wide screen. */
let hallPhoto: HTMLImageElement | null = null;
function loadHallPhoto(onReady: () => void): HTMLImageElement | null {
  if (typeof Image === "undefined") return null;
  if (!hallPhoto) {
    hallPhoto = new Image();
    hallPhoto.decoding = "async";
    hallPhoto.src = hallPhotoUrl;
  }
  if (hallPhoto.complete && hallPhoto.naturalWidth > 0) return hallPhoto;
  hallPhoto.addEventListener("load", onReady, { once: true });
  return null;
}
import { stamp } from "./stamp";

type View = "hall" | "queue" | "window";

/** The playing screen. Structure is rebuilt when the game's shape changes; numbers tick every frame. */
export class PlayScreen {
  readonly el: HTMLElement;
  private readonly hud: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly under: HTMLElement;
  private readonly side: HTMLElement;
  private readonly live: HTMLElement;
  private readonly folderToggle: HTMLButtonElement;
  private hudEls: Record<string, HTMLElement> = {};
  private statusEls = new Map<
    WindowId,
    { chip: HTMLElement; text: HTMLElement; row?: HTMLElement; rowText?: HTMLElement }
  >();
  private canvas: HTMLCanvasElement | null = null;
  private sceneKey = "";
  private structureKey = "";
  private folderKey = "";
  private eventKey = "";
  private eventEls: { countdown?: HTMLElement } = {};
  private lookingAtHall = false;
  private announced = 0;
  private dynamic: (() => void)[] = [];

  constructor(private readonly ctx: PlayContext) {
    this.hud = h("header", { class: "hud" });
    this.stage = h("main", { class: "stage", id: "stage", tabindex: -1 });
    this.under = h("div");
    this.side = h("aside", { class: "side", id: "folder" });
    this.folderToggle = h(
      "button",
      {
        class: "btn btn-primary folder-toggle",
        type: "button",
        "aria-controls": "folder",
        "aria-expanded": "false",
        onclick: () => this.toggleFolder(),
      },
      t(ctx.locale, "folder.open"),
    );
    this.live = h("div", { class: "sr-only", "aria-live": "polite", role: "status" });
    this.el = h(
      "div",
      { class: "play" },
      this.hud,
      h("div", null, this.stage, this.under),
      this.side,
      this.folderToggle,
      this.live,
    );
    this.announced = ctx.game.messages.length;
    this.buildHud();
    this.update();
  }

  private toggleFolder(force?: boolean): void {
    const open = force ?? !this.side.classList.contains("open");
    this.side.classList.toggle("open", open);
    this.folderToggle.setAttribute("aria-expanded", String(open));
    this.folderToggle.textContent = t(this.ctx.locale, open ? "folder.close" : "folder.open");
  }

  /** Opens the folder on phones (on desktop it's always visible). */
  showFolder(): void {
    this.toggleFolder(true);
  }

  private buildHud(): void {
    const { locale, chain } = this.ctx;
    const item = (key: string, label: string, cls = "value") => {
      const value = h("span", { class: cls });
      this.hudEls[key] = value;
      return h("div", { class: `item ${key}-item` }, h("span", { class: "label" }, label), value);
    };
    this.hud.replaceChildren(
      item("clock", t(locale, "header.clock")),
      item("time", t(locale, "header.yourTime")),
      item("ticket", t(locale, "header.ticket")),
      item("challenge", t(locale, "header.challenge"), "challenge"),
      h("span", { class: "spacer" }),
      h(
        "button",
        { class: "btn-link", type: "button", onclick: () => this.ctx.showHow() },
        t(locale, "landing.how"),
      ),
      h(
        "button",
        {
          class: "btn-link",
          type: "button",
          lang: locale === "en" ? "pt-BR" : "en",
          "aria-label": t(locale, "common.languageLabel"),
          onclick: () => this.ctx.toggleLocale(),
        },
        t(locale, "common.languageToggle"),
      ),
    );
    setText(
      this.hudEls["challenge"],
      t(locale, "header.challengeValue", {
        number: chain.number,
        date: formatDate(locale, chain.dateKey),
        goal: t(locale, `goals.${chain.goal}.short`),
      }),
    );
  }

  private view(): View {
    const w = this.ctx.game.where;
    if (w.kind === "window") return "window";
    if (w.kind === "queue" && !this.lookingAtHall) return "queue";
    return "hall";
  }

  private computeStructureKey(): string {
    const g = this.ctx.game;
    const w = g.where;
    return [
      this.view(),
      w.kind,
      "window" in w ? w.window : "",
      w.kind === "window" ? String(w.handedIn) : "",
      g.messages.length,
      [...g.held.keys()].join(","),
      g.revealed.size,
      g.over,
    ].join("|");
  }

  private computeFolderKey(): string {
    const g = this.ctx.game;
    const forms = [...g.forms.values()].map(
      (f) => `${f.template}:${Object.values(f.values).some((v) => v.trim()) ? 1 : 0}`,
    );
    return [this.structureKey, g.pen, forms.join(",")].join("|");
  }

  /** Called every frame. */
  update(): void {
    const g = this.ctx.game;
    if (g.where.kind !== "queue") this.lookingAtHall = false;
    const sk = this.computeStructureKey();
    if (sk !== this.structureKey) {
      this.structureKey = sk;
      this.renderStage();
      this.renderUnder();
    }
    const fk = this.computeFolderKey();
    if (fk !== this.folderKey) {
      this.folderKey = fk;
      const scroll = this.side.scrollTop;
      const openId = this.side.querySelector("details.id")?.hasAttribute("open");
      this.side.replaceChildren(folderPanel(this.ctx));
      if (openId) this.side.querySelector("details.id")?.setAttribute("open", "");
      this.side.scrollTop = scroll;
    }
    this.updateHud();
    this.updateStatuses();
    this.updateEvent();
    for (const fn of this.dynamic) fn();
    this.drawHallIfNeeded();
    this.announce();
  }

  private updateHud(): void {
    const g = this.ctx.game;
    setText(this.hudEls["clock"], formatClock(tickToClock(g.tick)));
    setText(this.hudEls["time"], formatDuration(g.elapsed));
    const w = g.where;
    setText(
      this.hudEls["ticket"],
      w.kind === "queue" ? ticketLabel(w.ticket) : t(this.ctx.locale, "header.noTicket"),
    );
  }

  private announce(): void {
    const msgs = this.ctx.game.messages;
    if (msgs.length <= this.announced) return;
    const latest = msgs[msgs.length - 1]!;
    this.announced = msgs.length;
    this.live.textContent = lineText(this.ctx.locale, this.ctx.chain, latest);
  }

  // ---------------------------------------------------------------------------------------------

  private renderStage(): void {
    this.statusEls.clear();
    this.dynamic = [];
    this.canvas = null;
    this.sceneKey = "";
    this.eventKey = "";
    const v = this.view();
    clear(this.stage);
    if (v === "hall") this.stage.append(this.renderHall());
    else if (v === "queue") this.stage.append(this.renderQueue());
    else this.stage.append(this.renderWindow());
    // Keyboard and screen-reader players land on what they can do next.
    if (v === "window" || v === "queue") {
      const target = this.stage.querySelector<HTMLElement>(
        ".actions-row .btn-primary, .actions-row .btn",
      );
      if (target && !document.querySelector(".desk")) target.focus({ preventScroll: true });
    }
  }

  private renderHall(): HTMLElement {
    const { locale, game } = this.ctx;
    const canvas = h("canvas", { width: HALL_W, height: HALL_H, "aria-hidden": "true" });
    this.canvas = canvas;
    const booths = WINDOW_IDS.map((id) => {
      const text = h("span");
      const chip = h("span", { class: "chip" }, h("span", { class: "dot" }), text);
      const role = t(locale, `windows.${id}.role`);
      const r = boothRect(id);
      const btn = h(
        "button",
        {
          class: "booth-btn",
          type: "button",
          style: {
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            width: `${r.w * 100}%`,
            height: `${(r.h + 0.07) * 100}%`,
          },
          "aria-label": t(locale, "hall.take", { window: windowName(locale, id), role }),
          onclick: () => this.takeTicket(id),
        },
        chip,
      );
      const rowText = h("span");
      const row = h(
        "button",
        {
          class: "row",
          type: "button",
          onclick: () => this.takeTicket(id),
          "aria-label": t(locale, "hall.take", { window: windowName(locale, id), role }),
        },
        h("span", { class: "w" }, t(locale, "common.windowShort", { n: id })),
        h(
          "span",
          null,
          h("span", { class: "role" }, role),
          h("span", { class: "status" }, h("span", { class: "dot" }), rowText),
        ),
      );
      this.statusEls.set(id, { chip: btn, text, row, rowText });
      return { btn, row };
    });
    const backToLine =
      game.where.kind === "queue"
        ? h(
            "button",
            {
              class: "btn btn-primary",
              type: "button",
              onclick: () => ((this.lookingAtHall = false), this.renderStage(), this.update()),
            },
            t(locale, "hall.backToLine"),
          )
        : null;
    return h(
      "section",
      { "aria-label": t(locale, "hall.label") },
      h(
        "div",
        { class: "hall" },
        canvas,
        h("span", { class: "hall-hint", "aria-hidden": "true" }, t(locale, "hall.hint")),
        booths.map((b) => b.btn),
      ),
      h(
        "div",
        { class: "hall-list" },
        booths.map((b) => b.row),
      ),
      backToLine
        ? h("div", { class: "actions-row", style: { marginTop: "12px" } }, backToLine)
        : null,
    );
  }

  private takeTicket(id: WindowId): void {
    this.lookingAtHall = false;
    this.ctx.dispatch({ type: "takeTicket", window: id });
  }

  private updateStatuses(): void {
    const { locale, game } = this.ctx;
    for (const [id, els] of this.statusEls) {
      const where = game.where;
      const inLine = where.kind === "queue" && where.window === id;
      let { text, tone } = statusText(
        locale,
        game.statusAt(id),
        game.queueLength(id),
        game.tick,
        game.chain.schedules[id - 1]!.closes,
      );
      if (inLine && where.kind === "queue") {
        const ahead = game.peopleAhead(id) ?? 0;
        text =
          ahead === 0
            ? t(locale, "hall.youNext", { ticket: ticketLabel(where.ticket) })
            : t(locale, "hall.you", { ticket: ticketLabel(where.ticket), n: ahead });
        tone = "you";
      }
      for (const el of [els.chip, els.row]) {
        if (!el) continue;
        el.classList.remove("tone-good", "tone-wait", "tone-off", "tone-you");
        el.classList.add(`tone-${tone}`);
      }
      setText(els.text, text);
      setText(els.rowText, text);
    }
  }

  private drawHallIfNeeded(): void {
    if (!this.canvas) return;
    const { locale, game } = this.ctx;
    const panel = game.panel;
    const where = game.where;
    const scene: HallScene = {
      clock: formatClock(tickToClock(game.tick)),
      panelTicket: panel ? ticketLabel(panel.ticket) : "----",
      panelWindow: panel ? String(panel.window) : "-",
      systemDown: game.statusAt(1).kind === "systemDown",
      booths: WINDOW_IDS.map((id) => ({
        id,
        role: t(locale, `windows.${id}.role`),
        status: game.statusAt(id).kind,
        queue: game.queueLength(id),
        playerInLine: where.kind === "queue" && where.window === id,
        playerAtWindow: where.kind === "window" && where.window === id,
      })),
      labels: {
        ticket: t(locale, "hall.panelLabel"),
        window: t(locale, "hall.panelWindow"),
        systemDown: t(locale, "event.systemDown"),
        closed: t(locale, "hall.boothClosed"),
        away: t(locale, "hall.boothAway"),
        sign: (id) => windowName(locale, id).toUpperCase(),
      },
    };
    if (
      this.canvas.offsetParent === null &&
      typeof window !== "undefined" &&
      window.innerWidth <= 860
    )
      return; // phone: list instead
    const photo = loadHallPhoto(() => {
      this.sceneKey = "";
      this.drawHallIfNeeded();
    });
    const key = JSON.stringify({ ...scene, labels: locale, photo: Boolean(photo) });
    if (key === this.sceneKey) return;
    this.sceneKey = key;
    const ctx2d = this.canvas.getContext("2d");
    if (ctx2d) drawHall(ctx2d, scene, photo);
  }

  private renderQueue(): HTMLElement {
    const { locale, game } = this.ctx;
    const where = game.where;
    if (where.kind !== "queue") return h("div");
    const id = where.window;
    const called = h("span", { class: "num" });
    const ahead = h("p", { class: "ahead", style: { margin: "0" } });
    const paused = h("p", { class: "warn", style: { margin: "0" } });
    this.dynamic.push(() => {
      const last = game.lastCalled(id);
      setText(called, last === null ? "----" : ticketLabel(last));
      const n = game.peopleAhead(id) ?? 0;
      setText(
        ahead,
        n === 0
          ? t(locale, "queue.next")
          : n === 1
            ? t(locale, "queue.aheadOne")
            : t(locale, "queue.ahead", { n }),
      );
      const st = game.statusAt(id);
      setText(
        paused,
        st.kind === "open"
          ? ""
          : statusText(locale, st, 0, game.tick, game.chain.schedules[id - 1]!.closes).text,
      );
    });
    return h(
      "section",
      {
        class: "queue-view",
        "aria-label": t(locale, "queue.inLine", { window: windowName(locale, id) }),
      },
      h(
        "div",
        { class: "led", "aria-hidden": "true" },
        h(
          "div",
          { class: "col" },
          h("span", { class: "cap" }, t(locale, "hall.panelLabel")),
          called,
        ),
        h(
          "div",
          { class: "col" },
          h("span", { class: "cap" }, t(locale, "hall.panelWindow")),
          h("span", { class: "num" }, id),
        ),
      ),
      h(
        "div",
        { class: "ticket" },
        h("span", { class: "office" }, t(locale, "landing.office")),
        h("span", { class: "small" }, t(locale, "landing.yourTicket")),
        h("span", { class: "big" }, ticketLabel(where.ticket)),
        h(
          "span",
          { class: "small" },
          `${t(locale, `windows.${id}.role`).toUpperCase()} · ${windowName(locale, id).toUpperCase()}`,
        ),
      ),
      h(
        "div",
        { class: "info" },
        h(
          "span",
          { class: "label" },
          t(locale, "queue.inLine", { window: windowName(locale, id) }),
        ),
        ahead,
        paused,
        h(
          "p",
          { style: { margin: "0" } },
          t(locale, "queue.explain", { seconds: windowSpec(id).serviceSeconds }),
        ),
        h("p", { style: { margin: "0", fontWeight: "700" } }, t(locale, "queue.meanwhile")),
        h(
          "div",
          { class: "actions-row" },
          h(
            "button",
            {
              class: "btn",
              type: "button",
              onclick: () => ((this.lookingAtHall = true), this.update()),
            },
            t(locale, "queue.lookHall"),
          ),
          h(
            "button",
            {
              class: "btn btn-danger",
              type: "button",
              onclick: () => this.ctx.dispatch({ type: "leave" }),
            },
            t(locale, "queue.leave"),
          ),
        ),
      ),
    );
  }

  /** Messages from the current visit to this window. */
  private visitMessages(id: WindowId): Message[] {
    const msgs = this.ctx.game.messages;
    let start = msgs.length - 1;
    while (start >= 0 && !(msgs[start]!.line.kind === "called" && msgs[start]!.window === id))
      start--;
    return start < 0 ? [] : msgs.slice(start);
  }

  private renderWindow(): HTMLElement {
    const { locale, game, chain } = this.ctx;
    const where = game.where;
    if (where.kind !== "window") return h("div");
    const id = where.window;
    const msgs = this.visitMessages(id);
    const response = msgs.filter((m) => m.line.kind !== "called");
    const shown = response.length > 0 ? response : msgs;
    const last = response.at(-1);
    const tone = last ? lineTone(last.line) : "info";

    let stampEl: SVGElement | null = null;
    if (last && tone === "bad") {
      stampEl = stamp(t(locale, "stamps.refused"), windowName(locale, id).toUpperCase(), {
        color: "red",
        rotate: -9,
        width: 230,
        animate: true,
      });
    } else if (last?.line.kind === "jam") {
      stampEl = stamp(t(locale, "stamps.jam"), windowName(locale, 2).toUpperCase(), {
        color: "red",
        rotate: 6,
        width: 200,
        animate: true,
      });
    } else if (last?.line.kind === "final") {
      stampEl = stamp(
        t(locale, `goals.${chain.goal}.stamp`),
        t(locale, `goals.${chain.goal}.stampSub`),
        { rotate: -6, width: 260, animate: true },
      );
    } else if (last?.line.kind === "done") {
      stampEl = stamp(t(locale, `stamps.w${id}`), t(locale, "stamps.sub"), {
        rotate: 5,
        width: 220,
        shape: id === 4 || id === 5 ? "oval" : "rect",
        animate: true,
      });
    }
    if (stampEl) stampEl.classList.add("refusal-stamp");

    const missing = chain.requirements
      .map((req, i) => ({ req, i, state: game.requirementState(i) }))
      .filter((r) => r.state === "todo");
    const sticky =
      missing.length > 0
        ? h(
            "div",
            { class: "sticky" },
            h("span", { class: "label" }, t(locale, "window.missing")),
            h(
              "ul",
              { style: { margin: "4px 0 0", paddingLeft: "18px" } },
              missing.map((m) => {
                const next = game.nextWindowFor(m.i);
                return h(
                  "li",
                  null,
                  `${docName(locale, m.req, chain.goal)}${next ? ` (${t(locale, "common.windowShort", { n: next })})` : ""}`,
                );
              }),
            ),
          )
        : null;

    const refusedForm =
      last &&
      (last.line.kind === "formInvalid" ||
        last.line.kind === "fieldOrder" ||
        last.line.kind === "bluePen")
        ? last.line.form
        : null;
    const actions: HTMLElement[] = [];
    if (!where.handedIn) {
      actions.push(
        h(
          "button",
          {
            class: "btn btn-primary",
            type: "button",
            onclick: () => this.ctx.dispatch({ type: "handIn" }),
          },
          t(locale, "window.hand"),
        ),
      );
    }
    if (refusedForm && game.held.has(`form:${refusedForm}`)) {
      actions.push(
        h(
          "button",
          { class: "btn", type: "button", onclick: () => this.ctx.openForm(refusedForm) },
          t(locale, "window.openForm"),
        ),
      );
    }
    if (!(last?.line.kind === "final")) {
      actions.push(
        h(
          "button",
          {
            class: where.handedIn ? "btn btn-primary" : "btn",
            type: "button",
            onclick: () => this.ctx.dispatch({ type: "leave" }),
          },
          t(locale, "window.back"),
        ),
      );
    }

    const counters =
      tone === "bad"
        ? h(
            "div",
            { class: "actions-row" },
            h(
              "div",
              { class: "paper", style: { padding: "8px 12px" } },
              h("div", { class: "label" }, t(locale, "sentBack.count")),
              h("strong", { class: "typed", style: { fontSize: "22px" } }, game.refusals),
            ),
            h(
              "div",
              { class: "paper", style: { padding: "8px 12px" } },
              h("div", { class: "label" }, t(locale, "sentBack.lost")),
              h(
                "strong",
                { class: "typed", style: { fontSize: "22px" } },
                formatDuration(game.elapsed),
              ),
            ),
          )
        : null;

    return h(
      "section",
      { class: "counter", "aria-label": windowName(locale, id) },
      h(
        "div",
        { class: "glass" },
        h(
          "div",
          { class: "sign window-sign" },
          `${windowName(locale, id)} · ${t(locale, `windows.${id}.role`)}`,
        ),
        h(
          "div",
          { class: "attendant", "aria-hidden": "true" },
          h("div", { class: "head" }),
          h("div", { class: "body" }),
        ),
      ),
      h(
        "div",
        { class: "counter-side" },
        h(
          "div",
          { class: "speech paper" },
          tone === "bad"
            ? h(
                "span",
                { class: "label", style: { color: "var(--refusal)" } },
                t(locale, "sentBack.title", { window: windowName(locale, id) }),
              )
            : h(
                "span",
                { class: "label" },
                t(locale, "window.attendant", { window: windowName(locale, id) }),
              ),
          shown.map((m) =>
            h("p", { class: "said", style: { margin: "0" } }, `“${lineText(locale, chain, m)}”`),
          ),
          stampEl,
        ),
        counters,
        id === FINAL_WINDOW || tone === "bad" ? sticky : null,
        h("div", { class: "actions-row" }, actions),
      ),
    );
  }

  private renderUnder(): void {
    const { locale, game, chain } = this.ctx;
    if (this.view() === "window") {
      clear(this.under);
      return;
    }
    const last = [...game.messages].reverse().find((m) => m.line.kind !== "called");
    const text = last ? `“${lineText(locale, chain, last)}”` : t(locale, "hall.welcome");
    const tone = last ? lineTone(last.line) : "info";
    this.under.replaceChildren(
      h(
        "div",
        { class: "under-stage" },
        h(
          "div",
          { class: `message-slip paper tone-${tone}` },
          h("span", { class: "label" }, t(locale, "hall.lastMessage")),
          h("span", { class: "text" }, text),
        ),
      ),
    );
  }

  private updateEvent(): void {
    const { locale, game } = this.ctx;
    const down = game.chain.events.find(
      (e) => e.kind === "systemDown" && game.tick >= e.start && game.tick < e.end,
    );
    const key = down && this.view() !== "window" ? `down:${"start" in down ? down.start : 0}` : "";
    if (key !== this.eventKey) {
      this.eventKey = key;
      this.stage.querySelector(".event-banner")?.remove();
      this.eventEls = {};
      if (key) {
        const countdown = h("span", { class: "cap" });
        this.eventEls.countdown = countdown;
        this.stage.append(
          h(
            "div",
            { class: "event-banner", role: "alert" },
            h(
              "div",
              { class: "event-card" },
              h(
                "div",
                { class: "led amber" },
                h("span", { class: "num" }, t(locale, "event.systemDown")),
                h("span", { class: "cap" }, countdown),
              ),
              h(
                "div",
                { class: "paper" },
                h("div", { class: "label" }, t(locale, "event.drawn")),
                h(
                  "p",
                  { style: { margin: "6px 0 10px", fontWeight: "600" } },
                  t(locale, "event.explain"),
                ),
                h(
                  "button",
                  { class: "btn btn-primary", type: "button", onclick: () => this.showFolder() },
                  t(locale, "folder.open"),
                ),
              ),
            ),
          ),
        );
      }
    }
    if (down && "end" in down && this.eventEls.countdown) {
      setText(
        this.eventEls.countdown,
        t(locale, "event.backIn", { time: formatCountdown(down.end - game.tick) }),
      );
    }
  }
}
