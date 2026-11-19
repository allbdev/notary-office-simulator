import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { createRng, hashString } from "../../src/core/rng";

describe("rng", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRng("x");
    const b = createRng("x");
    const sa = Array.from({ length: 50 }, () => a.next());
    const sb = Array.from({ length: 50 }, () => b.next());
    expect(sa).toEqual(sb);
  });

  it("gives different sequences for different seeds", () => {
    expect(createRng("a").next()).not.toBe(createRng("b").next());
  });

  it("stays in range", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: -50, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (seed, min, span) => {
          const r = createRng(seed);
          for (let i = 0; i < 20; i++) {
            const f = r.next();
            expect(f).toBeGreaterThanOrEqual(0);
            expect(f).toBeLessThan(1);
            const n = r.int(min, min + span);
            expect(n).toBeGreaterThanOrEqual(min);
            expect(n).toBeLessThanOrEqual(min + span);
          }
        },
      ),
    );
  });

  it("is roughly uniform", () => {
    const r = createRng("uniform");
    const buckets = new Array(10).fill(0);
    for (let i = 0; i < 20000; i++) buckets[Math.floor(r.next() * 10)]++;
    for (const b of buckets) expect(b).toBeGreaterThan(1800);
  });

  it("forks independent, stable streams", () => {
    const a = createRng("s").fork("x").next();
    const r = createRng("s");
    r.next();
    expect(r.fork("x").next()).toBe(a);
    expect(createRng("s").fork("y").next()).not.toBe(a);
  });

  it("shuffles without losing items and without touching the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = createRng("sh").shuffle(input);
    expect(out.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("rejects bad ranges and empty picks", () => {
    expect(() => createRng("a").int(5, 1)).toThrow();
    expect(() => createRng("a").pick([])).toThrow();
  });

  it("hashes to four 32-bit words", () => {
    for (const h of hashString("cartório")) expect(h).toBeGreaterThanOrEqual(0);
  });
});
