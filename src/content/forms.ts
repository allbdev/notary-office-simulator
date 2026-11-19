import type { Validator } from "../core/validators";

/**
 * Form templates. Structure and rules live here; every word the player reads lives in the locale
 * files under `forms.<id>` (title, subtitle, trap, and per field: label, refusal; per option: a
 * label). Each template has exactly one trap for people who fill in on autopilot.
 */

export type FieldKind = "text" | "signature" | "checks";

export interface FieldSpec {
  id: string;
  kind: FieldKind;
  validator: Validator;
  /** Option ids for a checkbox group. */
  options?: string[];
  /** The number printed on the box, when it differs from the reading order. */
  number?: number;
  /** Text the cartório already typed into the box (read-only). */
  printed?: string;
}

export interface FormTemplate {
  id: string;
  /** Fee forms are paid at window 5. */
  fee?: { cents: number };
  fields: FieldSpec[];
  /** Fields must be filled in the order of their printed numbers. */
  fillInNumberOrder?: boolean;
  /** The id of the field that holds the trap. */
  trapField: string;
}

const text = (id: string, validator: Validator, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  id,
  kind: "text",
  validator,
  ...extra,
});
const sig = (id: string, validator: Validator): FieldSpec => ({ id, kind: "signature", validator });
const checks = (id: string, options: string[], mustCheck: string[]): FieldSpec => ({
  id,
  kind: "checks",
  options,
  validator: { type: "checks", options, mustCheck },
});

export const FORMS: readonly FormTemplate[] = [
  {
    id: "f27b",
    fillInNumberOrder: true,
    trapField: "reversed",
    fields: [
      text("reversed", { type: "profile", key: "fullName", transform: "reverse" }, { number: 3 }),
      text("name", { type: "profile", key: "fullName" }, { number: 1 }),
      text("cpfEven", { type: "profile", key: "cpf", transform: "evenDigits" }, { number: 2 }),
    ],
  },
  {
    id: "darf",
    fee: { cents: 37 },
    trapField: "amount",
    fields: [
      text("amount", { type: "amountNoSeparators", cents: 37 }),
      text("code", { type: "nonEmpty" }),
      text("cpf", { type: "profile", key: "cpf", transform: "digits" }),
    ],
  },
  {
    id: "gru",
    fee: { cents: 199 },
    trapField: "amount",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      text("amount", { type: "amountNoSeparators", cents: 199 }),
      text("reason", { type: "notContains", phrases: ["porque sim", "because"], minWords: 2 }),
    ],
  },
  {
    id: "annexU",
    trapField: "which",
    fields: [
      checks("which", ["none", "this", "both"], ["this"]),
      text("pages", { type: "oneOf", answers: ["1", "um", "uma", "one"] }),
    ],
  },
  {
    id: "copyOfCopy",
    trapField: "copyOf",
    fields: [
      text("copies", { type: "number", parity: "odd", min: 3 }),
      text("copyOf", {
        type: "oneOf",
        answers: [
          "da copia",
          "de copia",
          "de uma copia",
          "copia",
          "a copy",
          "copy",
          "of a copy",
          "the copy",
        ],
      }),
    ],
  },
  {
    id: "protocolOfProtocol",
    trapField: "time",
    fields: [
      text(
        "previous",
        { type: "equalsPrinted", printed: "2026/000323-B" },
        { printed: "2026/000323-B" },
      ),
      text("repeat", { type: "equalsPrinted", printed: "2026/000323-B" }),
      text("time", { type: "clockNow", toleranceMinutes: 15 }),
    ],
  },
  {
    id: "signatureCard",
    trapField: "sig3",
    fields: [
      sig("sig1", { type: "nonEmpty" }),
      sig("sig2", { type: "differs", from: ["sig1"] }),
      sig("sig3", { type: "differs", from: ["sig1", "sig2"] }),
    ],
  },
  {
    id: "residence",
    trapField: "cepReversed",
    fields: [
      text("address", { type: "profile", key: "address" }),
      text("cepReversed", { type: "profile", key: "cep", transform: "reverse" }),
    ],
  },
  {
    id: "proofOfLife",
    trapField: "birth",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      checks("alive", ["yes", "no", "rather"], ["yes"]),
      text("birth", { type: "profile", key: "birth", transform: "birthYearFirst" }),
    ],
  },
  {
    id: "powerOfAttorney",
    trapField: "grantee",
    fields: [
      text("grantor", { type: "profile", key: "fullName" }),
      text("grantee", { type: "profile", key: "fullName" }),
    ],
  },
  {
    id: "negativeCertificate",
    trapField: "number",
    fields: [text("name", { type: "profile", key: "fullName" }), text("number", { type: "empty" })],
  },
  {
    id: "filiation",
    trapField: "motherUpper",
    fields: [
      text("mother", { type: "profile", key: "motherName" }),
      text("motherUpper", { type: "profile", key: "motherName", transform: "upper" }),
    ],
  },
  {
    id: "threeCopies",
    trapField: "which",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      text("which", {
        type: "oneOf",
        answers: ["2", "dois", "segunda", "two", "second", "2a", "2nd"],
      }),
    ],
  },
  {
    id: "awareness",
    trapField: "agree",
    fields: [
      text("initials", { type: "profile", key: "fullName", transform: "initials" }),
      checks("agree", ["agree"], []),
    ],
  },
  {
    id: "absence",
    trapField: "reason",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      text("reason", { type: "noLetter", letter: "a", minWords: 3 }),
    ],
  },
  {
    id: "update",
    trapField: "cpf",
    fields: [
      text("cpf", { type: "formattedCpf" }),
      text("changed", {
        type: "oneOf",
        answers: ["nada", "nothing", "nenhum", "nada mudou", "none"],
      }),
    ],
  },
  {
    id: "majority",
    trapField: "age",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      text("age", { type: "ageNextBirthday" }),
    ],
  },
  {
    id: "autograph",
    trapField: "signature",
    fields: [
      text("rg", { type: "profile", key: "rg", transform: "digits" }),
      sig("signature", { type: "profile", key: "signature" }),
    ],
  },
  {
    id: "contact",
    trapField: "count",
    fields: [
      text("name", { type: "profile", key: "fullName" }),
      text("date", { type: "todayDigits" }),
      text("count", { type: "oneOf", answers: ["3", "tres", "three"] }),
    ],
  },
  {
    id: "notApplicable",
    trapField: "which",
    fields: [checks("which", ["me", "notMe", "here", "elsewhere"], ["notMe", "elsewhere"])],
  },
  {
    id: "justification",
    trapField: "reason",
    fields: [
      text("date", { type: "todayDigits" }),
      text("reason", {
        type: "notContains",
        phrases: ["porque precisa", "porque preciso", "because i need", "because need"],
        minWords: 3,
      }),
    ],
  },
];

export const FEE_FORMS = FORMS.filter((f) => f.fee);
export const PLAIN_FORMS = FORMS.filter((f) => !f.fee);

export function formById(id: string): FormTemplate {
  const f = FORMS.find((t) => t.id === id);
  if (!f) throw new RangeError(`Unknown form template: ${id}`);
  return f;
}

/** Fields in the order the player should fill them. */
export function fillOrder(template: FormTemplate): FieldSpec[] {
  if (!template.fillInNumberOrder) return template.fields;
  return [...template.fields].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}
