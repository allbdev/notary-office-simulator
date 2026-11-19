import type { Chain } from "./chain";
import { LAST_TICK, secondsToTicks } from "./clock";
import { FINAL_WINDOW, WINDOW_IDS, chainOf, docKey, producer, type WindowId } from "./docs";
import { Game, type Input, type Visit } from "./game";
import { solve, type ValidationContext } from "./validators";
import { fillOrder, formById } from "../content/forms";
import { parseDateKey } from "./daily";

/**
 * Plays a run by itself. Two modes:
 * - "discovery" only acts on what window 3 has revealed, like a first-time player who reads
 *   carefully and fills every form right. The generator uses it to prove each day is fair.
 * - "ideal" also does steps for requirements it hasn't been told about yet (copying your ID
 *   before anyone asks). Its route is the "ideal path" on the result screen.
 * Both are greedy: at each choice they go to the useful window with the shortest wait. Humans
 * need time to write, so a form only counts as ready a few seconds per field after you get it.
 */

export type SolverMode = "discovery" | "ideal";

export interface Solution {
  finished: boolean;
  ticks: number;
  visits: Visit[];
  inputs: Input[];
}

/** Real seconds a person needs per form field. */
export const SECONDS_PER_FIELD = 4;

export function solveChain(chain: Chain, mode: SolverMode = "discovery"): Solution {
  const game = new Game(chain);
  const today = parseDateKey(chain.dateKey);
  const formReadyAt = new Map<string, number>();
  const filled = new Set<string>();

  const ctx = (values: Record<string, string>): ValidationContext => ({
    profile: chain.profile,
    today,
    clockNow: game.clock,
    values,
  });

  const fillForms = () => {
    if (game.pen !== "blue") game.dispatch({ type: "setPen", pen: "blue" });
    for (const [id, state] of game.forms) {
      if (!game.held.has(docKey({ kind: "form", template: id }))) continue;
      if (!formReadyAt.has(id)) {
        const t = formById(id);
        formReadyAt.set(id, game.tick + secondsToTicks(SECONDS_PER_FIELD * t.fields.length));
      }
      if (filled.has(id)) continue;
      const values: Record<string, string> = {};
      for (const field of fillOrder(formById(id))) {
        if (field.printed) continue;
        const v = solve(field.validator, ctx({ ...state.values, ...values }));
        values[field.id] = v;
        game.dispatch({ type: "fill", form: id, field: field.id, value: v });
      }
      filled.add(id);
    }
  };

  /** Re-writes time-dependent answers right before handing in. */
  const refreshClockFields = () => {
    for (const [id] of game.forms) {
      for (const field of formById(id).fields) {
        if (field.validator.type === "clockNow") {
          game.dispatch({
            type: "fill",
            form: id,
            field: field.id,
            value: solve(field.validator, ctx({})),
          });
        }
      }
    }
  };

  const formReady = (template: string) => (formReadyAt.get(template) ?? Infinity) <= game.tick;

  const known = (i: number) => mode === "ideal" || game.revealed.has(i);

  /** Windows where handing in would make progress right now (or once you get there). */
  const usefulWindows = (): WindowId[] => {
    const useful = new Set<WindowId>();
    const reqs = chain.requirements;
    const allHeld = reqs.every((r) => game.held.has(docKey(r)));
    const unrevealed = reqs.some(
      (_, i) => !game.revealed.has(i) && !game.held.has(docKey(reqs[i]!)),
    );
    const directFormsReady = reqs.every((r) => r.kind !== "form" || formReady(r.template));
    if ((allHeld && directFormsReady) || unrevealed) useful.add(FINAL_WINDOW);
    reqs.forEach((req, i) => {
      if (!known(i)) return;
      for (const node of chainOf(req)) {
        const w = producer(node);
        if (w === null || node.kind === "start" || node.kind === "form") continue;
        const done = chainOf(req)
          .slice(chainOf(req).indexOf(node))
          .some((n) => game.held.has(docKey(n)));
        if (done || !game.held.has(docKey(node.of))) continue;
        if (node.of.kind === "form" && !formReady(node.of.template)) continue;
        useful.add(w);
      }
    });
    return WINDOW_IDS.filter((w) => useful.has(w));
  };

  while (!game.over && game.tick < LAST_TICK) {
    fillForms();
    const where = game.where;
    if (where.kind === "window") {
      if (!where.handedIn) {
        refreshClockFields();
        game.dispatch({ type: "handIn" });
      } else {
        game.dispatch({ type: "leave" });
      }
      continue;
    }
    if (where.kind === "queue") {
      game.step();
      continue;
    }
    const options = usefulWindows().filter((w) => game.statusAt(w).kind !== "closed");
    if (options.length === 0) {
      game.step();
      continue;
    }
    let best = options[0]!;
    for (const w of options) if (game.estimateWait(w) < game.estimateWait(best)) best = w;
    game.dispatch({ type: "takeTicket", window: best });
    game.step();
  }

  return {
    finished: game.finishedAt !== null,
    ticks: game.elapsed,
    visits: game.visits.slice(),
    inputs: game.inputs.slice(),
  };
}

/** The faster of the two greedy routes: what the result screen shows as the ideal path. */
export function bestRoute(chain: Chain): Solution {
  const ideal = solveChain(chain, "ideal");
  const discovery = solveChain(chain, "discovery");
  if (!ideal.finished) return discovery;
  if (!discovery.finished) return ideal;
  return ideal.ticks <= discovery.ticks ? ideal : discovery;
}
