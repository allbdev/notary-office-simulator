import { buildChain, type Chain } from "../../src/core/chain";
import type { Doc, WindowId } from "../../src/core/docs";
import { Game } from "../../src/core/game";
import { solve } from "../../src/core/validators";
import { fillOrder, formById } from "../../src/content/forms";
import { parseDateKey } from "../../src/core/daily";

/** A quiet day: nobody else in line, no breaks, no events, unless overridden. */
export function quietChain(requirements: Doc[], overrides: Partial<Chain> = {}): Chain {
  const base = buildChain("test", "2026-11-19", 0, true);
  return { ...base, requirements, arrivals: [[], [], [], [], []], pen: "blue", ...overrides };
}

/** Takes a ticket, waits to be called, hands in, returns to the hall. Returns the last line. */
export function visit(game: Game, window: WindowId) {
  game.dispatch({ type: "takeTicket", window });
  let guard = 0;
  while (game.where.kind !== "window" && !game.over && guard++ < 20000) game.step();
  game.dispatch({ type: "handIn" });
  const line = game.messages[game.messages.length - 1]!.line;
  game.dispatch({ type: "leave" });
  return line;
}

/** Fills a form correctly, in the right order. */
export function fillCorrectly(game: Game, template: string) {
  const values: Record<string, string> = {};
  for (const field of fillOrder(formById(template))) {
    if (field.printed) continue;
    const v = solve(field.validator, {
      profile: game.chain.profile,
      today: parseDateKey(game.chain.dateKey),
      clockNow: game.clock,
      values,
    });
    values[field.id] = v;
    game.dispatch({ type: "fill", form: template, field: field.id, value: v });
  }
}
