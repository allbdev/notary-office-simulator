import { describe, expect, it } from "vitest";
import { PLAYER_NAMES } from "../../src/content/names";
import { FORMS } from "../../src/content/forms";
import { makeProfile, withName } from "../../src/core/profile";
import { createRng } from "../../src/core/rng";
import { isValid, solve, type ValidationContext } from "../../src/core/validators";

describe("player names", () => {
  it("has about 20 unique names, each with a first name and a surname", () => {
    expect(PLAYER_NAMES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(PLAYER_NAMES).size).toBe(PLAYER_NAMES.length);
    for (const n of PLAYER_NAMES) expect(n.trim().split(/\s+/).length, n).toBeGreaterThanOrEqual(2);
  });

  it("every form can be filled in correctly whatever your name is", () => {
    const base = makeProfile(createRng("names"));
    for (const name of PLAYER_NAMES) {
      const profile = withName(base, name);
      for (const form of FORMS) {
        const values: Record<string, string> = {};
        for (const field of form.fields) {
          const ctx: ValidationContext = {
            profile,
            today: { year: 2026, month: 11, day: 19 },
            clockNow: 12 * 3600,
            values: { ...values },
          };
          const answer = field.printed ?? solve(field.validator, ctx);
          values[field.id] = answer;
          expect(
            isValid(field.validator, answer, { ...ctx, values: { ...values } }),
            `${name}: ${form.id}.${field.id}`,
          ).toBe(true);
        }
      }
    }
  });
});
