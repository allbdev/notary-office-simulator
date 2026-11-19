import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { FAIR_BOUND_TICKS, MAX_ATTEMPTS, generateChain, thinLines } from "../../src/core/generator";
import { buildChain } from "../../src/core/chain";
import { solveChain } from "../../src/core/solver";
import { addDays } from "../../src/core/daily";

/**
 * The guarantee: every day can be finished by a careful first-time player within the bound.
 * Seeds that ever fail here get pinned in REGRESSION_SEEDS.
 */
const REGRESSION_SEEDS: string[] = [];

describe("generator", () => {
  it("every daily chain for 10,000 days is finishable within the bound", () => {
    let worst = 0;
    for (let i = 0; i < 10_000; i++) {
      const key = addDays("2026-11-19", i);
      const chain = generateChain(`cartorio:${key}`, key);
      const run = solveChain(chain, "discovery");
      expect(run.finished, key).toBe(true);
      expect(run.ticks, key).toBeLessThanOrEqual(FAIR_BOUND_TICKS);
      worst = Math.max(worst, run.ticks);
    }
    expect(worst).toBeGreaterThan(0);
  }, 120_000);

  it("holds for arbitrary seeds too", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const run = solveChain(generateChain(seed, "2026-11-19"), "discovery");
        expect(run.finished).toBe(true);
        expect(run.ticks).toBeLessThanOrEqual(FAIR_BOUND_TICKS);
      }),
      { numRuns: 500 },
    );
  });

  it("pinned regression seeds", () => {
    for (const seed of REGRESSION_SEEDS) {
      expect(solveChain(generateChain(seed, "2026-11-19"), "discovery").finished).toBe(true);
    }
  });

  it("the ideal route is never slower than the cautious one by much", () => {
    for (let i = 0; i < 200; i++) {
      const chain = generateChain(`ideal-${i}`, "2026-11-19");
      const ideal = solveChain(chain, "ideal");
      expect(ideal.finished).toBe(true);
    }
  });

  it("the last-resort fallback (gentle hours, empty lines) always fits", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const chain = thinLines(buildChain(seed, "2026-11-19", MAX_ATTEMPTS, true), 0);
        const run = solveChain(chain, "discovery");
        expect(run.finished).toBe(true);
        expect(run.ticks).toBeLessThanOrEqual(FAIR_BOUND_TICKS);
      }),
      { numRuns: 300 },
    );
  });

  it("is deterministic", () => {
    expect(generateChain("same", "2026-11-19")).toEqual(generateChain("same", "2026-11-19"));
  });
});

describe("bestRoute", () => {
  it("is never slower than either solver", async () => {
    const { bestRoute } = await import("../../src/core/solver");
    for (let i = 0; i < 100; i++) {
      const chain = generateChain(`best-${i}`, "2026-11-19");
      const best = bestRoute(chain);
      expect(best.ticks).toBeLessThanOrEqual(solveChain(chain, "discovery").ticks);
      expect(best.ticks).toBeLessThanOrEqual(solveChain(chain, "ideal").ticks);
    }
  });
});
