import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { MAX_STEPS, MIN_STEPS, buildChain, stepCount } from "../../src/core/chain";
import { baseOf, docKey, formsIn } from "../../src/core/docs";
import { LAST_TICK } from "../../src/core/clock";
import { GOALS } from "../../src/content/goals";

describe("chain", () => {
  it("is a pure function of the seed", () => {
    expect(buildChain("a", "2026-11-19")).toEqual(buildChain("a", "2026-11-19"));
    expect(buildChain("a", "2026-11-19")).not.toEqual(buildChain("b", "2026-11-19"));
  });

  it("keeps requirements within the step budget, with unique forms and start docs", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const c = buildChain(seed, "2026-11-19");
        const steps = stepCount(c);
        expect(steps).toBeGreaterThanOrEqual(MIN_STEPS);
        expect(steps).toBeLessThanOrEqual(MAX_STEPS);
        expect(c.requirements.length).toBeGreaterThanOrEqual(3);
        expect(c.requirements.length).toBeLessThanOrEqual(4);
        const bases = c.requirements.map((r) => docKey(baseOf(r)));
        expect(new Set(bases).size).toBe(bases.length);
        const forms = c.requirements.flatMap(formsIn);
        expect(new Set(forms).size).toBe(forms.length);
        const goal = GOALS.find((g) => g.id === c.goal)!;
        if (!goal.goalDocCopyable) expect(bases).not.toContain("start:goal");
      }),
      { numRuns: 300 },
    );
  });

  it("schedules: window 4 lunches, window 5 closes early, arrivals are sorted", () => {
    const c = buildChain("hours", "2026-11-19");
    expect(c.schedules[3]!.breaks.some((b) => b.kind === "lunch")).toBe(true);
    expect(c.schedules[4]!.closes).toBeLessThan(LAST_TICK);
    for (const list of c.arrivals) {
      for (let i = 1; i < list.length; i++)
        expect(list[i]!.tick).toBeGreaterThan(list[i - 1]!.tick);
    }
  });

  it("re-rolls only hours and events on later attempts", () => {
    const a = buildChain("r", "2026-11-19", 0);
    const b = buildChain("r", "2026-11-19", 3);
    expect(b.requirements).toEqual(a.requirements);
    expect(b.profile).toEqual(a.profile);
    expect(b.arrivals).toEqual(a.arrivals);
  });

  it("the gentle schedule has no breaks, closings or events", () => {
    const c = buildChain("g", "2026-11-19", 12, true);
    expect(c.events).toEqual([]);
    for (const s of c.schedules) {
      expect(s.breaks).toEqual([]);
      expect(s.closes).toBe(LAST_TICK);
    }
  });
});
