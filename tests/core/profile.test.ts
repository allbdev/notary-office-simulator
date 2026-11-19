import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ageOn, isValidCpfDigits, makeProfile } from "../../src/core/profile";
import { createRng } from "../../src/core/rng";
import { digitsOf } from "../../src/core/text";

describe("profile", () => {
  it("always makes a valid CPF", () => {
    fc.assert(
      fc.property(fc.string(), (seed) => {
        const p = makeProfile(createRng(seed));
        expect(isValidCpfDigits(digitsOf(p.cpf))).toBe(true);
        expect(p.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      }),
      { numRuns: 300 },
    );
  });

  it('always has an even digit in the CPF (form 27-B needs one); regression: seed "{/"', () => {
    for (const seed of ["{/", ...Array.from({ length: 2000 }, (_, i) => `even-${i}`)]) {
      const digits = digitsOf(makeProfile(createRng(seed)).cpf);
      expect(
        Array.from(digits).some((d) => Number(d) % 2 === 0),
        seed,
      ).toBe(true);
    }
  });

  it("rejects bad CPFs", () => {
    expect(isValidCpfDigits("11111111111")).toBe(false);
    expect(isValidCpfDigits("123")).toBe(false);
    expect(isValidCpfDigits("52998224725")).toBe(true);
    expect(isValidCpfDigits("52998224724")).toBe(false);
  });

  it("is deterministic and self-consistent", () => {
    const a = makeProfile(createRng("p"));
    expect(makeProfile(createRng("p"))).toEqual(a);
    expect(a.fullName).toBe(`${a.firstName} ${a.middleName} ${a.lastName}`);
    expect(a.signature).toBe(`${a.firstName[0]}. ${a.lastName}`);
  });

  it("computes age around the birthday", () => {
    const p = { ...makeProfile(createRng("p")), birth: { day: 20, month: 11, year: 1990 } };
    expect(ageOn(p, { year: 2026, month: 11, day: 19 })).toBe(35);
    expect(ageOn(p, { year: 2026, month: 11, day: 20 })).toBe(36);
  });
});
