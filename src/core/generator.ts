import { buildChain, type Chain } from "./chain";
import { secondsToTicks } from "./clock";
import { solveChain } from "./solver";

/**
 * The fair-day guarantee. Requirements are solvable by construction (every chain is built up from
 * documents you have or can get); what can still make a day unfair is timing: a window going to
 * lunch or closing at the wrong moment, or long lines. So each candidate is played by the
 * discovery solver, and if it doesn't finish within the bound, the hours and events are re-rolled.
 * After MAX_ATTEMPTS, a gentle schedule (no breaks, no events, nobody closes early) is tried with
 * fewer and fewer people in line, ending with empty lines, which always fits.
 */

/** A careful first-time player must be able to finish within this much real time. */
export const FAIR_BOUND_TICKS = secondsToTicks(6 * 60);
export const MAX_ATTEMPTS = 12;

function fits(chain: Chain): boolean {
  const run = solveChain(chain, "discovery");
  return run.finished && run.ticks <= FAIR_BOUND_TICKS;
}

/** Keeps every `keep`-th person in each line (keep = 0 empties the lines). */
export function thinLines(chain: Chain, keep: number): Chain {
  return {
    ...chain,
    arrivals: chain.arrivals.map((list) =>
      keep === 0 ? [] : list.filter((_, i) => i % keep === 0),
    ),
  };
}

export function generateChain(seed: string, dateKey: string): Chain {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const chain = buildChain(seed, dateKey, attempt);
    if (fits(chain)) return chain;
  }
  const gentle = buildChain(seed, dateKey, MAX_ATTEMPTS, true);
  for (const keep of [1, 2, 3]) {
    const chain = thinLines(gentle, keep);
    if (fits(chain)) return chain;
  }
  return thinLines(gentle, 0);
}
