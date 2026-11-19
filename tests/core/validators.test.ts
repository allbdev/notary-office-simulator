import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { makeProfile } from "../../src/core/profile";
import { createRng } from "../../src/core/rng";
import {
  isValid,
  joinChecks,
  parseChecks,
  profileAnswer,
  solve,
  type ValidationContext,
  type Validator,
} from "../../src/core/validators";
import { FORMS } from "../../src/content/forms";

const profile = {
  ...makeProfile(createRng("v")),
  firstName: "Vinícius",
  middleName: "Albuquerque",
  lastName: "Barros",
  fullName: "Vinícius Albuquerque Barros",
  cpf: "529.982.247-25",
  cep: "01234-567",
  birth: { day: 5, month: 3, year: 1990 },
  signature: "V. Barros",
  motherName: "Maria Graça Barros",
  street: "Rua das Acácias",
  number: 12,
  rg: "12.345.678-9",
};
const ctx = (
  values: Record<string, string> = {},
  clockNow = 11 * 3600 + 42 * 60,
): ValidationContext => ({
  profile,
  today: { year: 2026, month: 11, day: 19 },
  clockNow,
  values,
});
const ok = (v: Validator, value: string, c = ctx()) => isValid(v, value, c);

describe("validators", () => {
  it("profile rules forgive case, accents and spacing", () => {
    const v: Validator = { type: "profile", key: "fullName" };
    expect(ok(v, "vinicius albuquerque barros")).toBe(true);
    expect(ok(v, "  VINÍCIUS  Albuquerque Barros ")).toBe(true);
    expect(ok(v, "Vinícius A. Barros")).toBe(false);
    expect(ok(v, "")).toBe(false);
  });

  it("reverse, even digits, initials, year-first", () => {
    expect(
      ok({ type: "profile", key: "fullName", transform: "reverse" }, "sorraB euqreuqublA suicíniV"),
    ).toBe(true);
    expect(
      ok({ type: "profile", key: "fullName", transform: "reverse" }, "Vinícius Albuquerque Barros"),
    ).toBe(false);
    // 529.982.247-25 → even digits 2 8 2 2 4 2
    expect(ok({ type: "profile", key: "cpf", transform: "evenDigits" }, "282242")).toBe(true);
    expect(ok({ type: "profile", key: "cpf", transform: "evenDigits" }, "52998224725")).toBe(false);
    expect(ok({ type: "profile", key: "fullName", transform: "initials" }, "vab")).toBe(true);
    expect(ok({ type: "profile", key: "birth", transform: "birthYearFirst" }, "1990/03/05")).toBe(
      true,
    );
    expect(ok({ type: "profile", key: "birth", transform: "birthYearFirst" }, "05/03/1990")).toBe(
      false,
    );
  });

  it("block letters are case-sensitive", () => {
    const v: Validator = { type: "profile", key: "motherName", transform: "upper" };
    expect(ok(v, "MARIA GRAÇA BARROS")).toBe(true);
    expect(ok(v, "Maria Graça Barros")).toBe(false);
  });

  it("formatted CPF needs its punctuation", () => {
    expect(ok({ type: "formattedCpf" }, "529.982.247-25")).toBe(true);
    expect(ok({ type: "formattedCpf" }, "52998224725")).toBe(false);
  });

  it("amounts without separators", () => {
    const v: Validator = { type: "amountNoSeparators", cents: 37 };
    expect(ok(v, "0 37")).toBe(true);
    expect(ok(v, "037")).toBe(true);
    expect(ok(v, "0,37")).toBe(false);
    expect(ok(v, "0.37")).toBe(false);
    expect(ok(v, "38")).toBe(false);
  });

  it("numbers with parity and bounds", () => {
    const v: Validator = { type: "number", parity: "odd", min: 3 };
    expect(ok(v, "3")).toBe(true);
    expect(ok(v, "2")).toBe(false);
    expect(ok(v, "4")).toBe(false);
    expect(ok(v, "1")).toBe(false);
    expect(ok(v, "three")).toBe(false);
  });

  it("wall clock within tolerance", () => {
    const v: Validator = { type: "clockNow", toleranceMinutes: 15 };
    expect(ok(v, "11:42")).toBe(true);
    expect(ok(v, "11:55")).toBe(true);
    expect(ok(v, "12:10")).toBe(false);
    expect(ok(v, "agora")).toBe(false);
  });

  it("today's date in any common digit order", () => {
    for (const s of ["19/11/2026", "19112026", "2026-11-19", "11/19/2026", "19/11/26"])
      expect(ok({ type: "todayDigits" }, s)).toBe(true);
    expect(ok({ type: "todayDigits" }, "18/11/2026")).toBe(false);
  });

  it("phrases, letters and words", () => {
    const nc: Validator = { type: "notContains", phrases: ["porque precisa"], minWords: 3 };
    expect(ok(nc, "preciso pra ontem")).toBe(true);
    expect(ok(nc, "é porque precisa mesmo")).toBe(false);
    expect(ok(nc, "curto")).toBe(false);
    const nl: Validator = { type: "noLetter", letter: "a", minWords: 3 };
    expect(ok(nl, "fiquei doente ontem")).toBe(true);
    expect(ok(nl, "estava doente ontem")).toBe(false);
  });

  it("checkbox groups and differing signatures", () => {
    const v: Validator = { type: "checks", options: ["a", "b", "c"], mustCheck: ["b", "c"] };
    expect(ok(v, "c|b")).toBe(true);
    expect(ok(v, "b")).toBe(false);
    expect(ok(v, "")).toBe(false);
    expect(ok({ type: "checks", options: ["a"], mustCheck: [] }, "")).toBe(true);
    expect(parseChecks(joinChecks(["b", "a"]))).toEqual(["a", "b"]);
    const d: Validator = { type: "differs", from: ["s1"] };
    expect(ok(d, "V. Barros", ctx({ s1: "v barros" }))).toBe(false);
    expect(ok(d, "Vini B", ctx({ s1: "v barros" }))).toBe(true);
  });

  it("empty, printed, age next birthday", () => {
    expect(ok({ type: "empty" }, "  ")).toBe(true);
    expect(ok({ type: "empty" }, "0")).toBe(false);
    expect(ok({ type: "equalsPrinted", printed: "2026/000323-B" }, "2026/000323-b")).toBe(true);
    expect(ok({ type: "ageNextBirthday" }, "37")).toBe(true);
  });

  it("profileAnswer gives what a person would write", () => {
    expect(profileAnswer(profile, "cep", "reverse")).toBe("765-43210");
    expect(profileAnswer(profile, "address", "none")).toBe("Rua das Acácias, 12");
  });

  it("every field of every form has a solvable rule (for any profile and time)", () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 11 * 3600, max: 15 * 3600 }), (seed, clockNow) => {
        const p = makeProfile(createRng(seed));
        for (const form of FORMS) {
          const values: Record<string, string> = {};
          for (const field of form.fields) {
            const c: ValidationContext = {
              profile: p,
              today: { year: 2026, month: 11, day: 19 },
              clockNow,
              values: { ...values },
            };
            const answer = field.printed ?? solve(field.validator, c);
            values[field.id] = answer;
            expect(
              isValid(field.validator, answer, { ...c, values: { ...values } }),
              `${form.id}.${field.id}`,
            ).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("autopilot answers fail the trap", () => {
    // Typing the plain value where the trap asks for a twist is refused.
    const trapAutopilot: Record<string, string> = {
      "f27b.reversed": profile.fullName,
      "darf.amount": "0,37",
      "residence.cepReversed": profile.cep,
      "proofOfLife.birth": "05/03/1990",
      "negativeCertificate.number": "123",
      "filiation.motherUpper": profile.motherName,
      "update.cpf": "52998224725",
      "autograph.signature": profile.fullName,
      "notApplicable.which": "me|here",
      "awareness.agree": "agree",
      "annexU.which": "none",
    };
    for (const [key, value] of Object.entries(trapAutopilot)) {
      const [formId, fieldId] = key.split(".") as [string, string];
      const field = FORMS.find((f) => f.id === formId)!.fields.find((f) => f.id === fieldId)!;
      expect(ok(field.validator, value), key).toBe(false);
    }
  });
});
