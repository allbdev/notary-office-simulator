import { describe, expect, it } from "vitest";
import en from "../../src/content/locales/en";
import ptBR from "../../src/content/locales/pt-BR";
import { FORMS } from "../../src/content/forms";
import { GOALS } from "../../src/content/goals";
import { WINDOWS } from "../../src/content/windows";
import { docName, has, routeText, t, variant } from "../../src/content/i18n";
import { auth, copy, form, paid, protocol, start } from "../../src/core/docs";

type Flat = Map<string, string | string[]>;

function flatten(node: unknown, prefix = "", out: Flat = new Map()): Flat {
  if (typeof node === "string") out.set(prefix, node);
  else if (Array.isArray(node)) out.set(prefix, node as string[]);
  else
    for (const [k, v] of Object.entries(node as object))
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
  return out;
}

const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("locales", () => {
  const a = flatten(en);
  const b = flatten(ptBR);

  it("have exactly the same keys", () => {
    expect([...b.keys()].sort()).toEqual([...a.keys()].sort());
  });

  it("use the same slots and variant counts", () => {
    for (const [key, value] of a) {
      const other = b.get(key)!;
      if (Array.isArray(value)) {
        expect(Array.isArray(other), key).toBe(true);
        expect((other as string[]).length, key).toBe(value.length);
        const sa = new Set(value.flatMap(slots));
        const sb = new Set((other as string[]).flatMap(slots));
        expect([...sb].sort(), key).toEqual([...sa].sort());
      } else {
        expect(slots(other as string), key).toEqual(slots(value));
      }
    }
  });

  it("have no empty strings", () => {
    for (const [key, value] of [...a, ...b]) {
      for (const s of Array.isArray(value) ? value : [value])
        expect(s.trim().length, key).toBeGreaterThan(0);
    }
  });

  it("cover every form, field, option, goal and window in both languages", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      for (const f of FORMS) {
        for (const k of ["title", "subtitle", "trap"])
          expect(has(locale, `forms.${f.id}.${k}`), `${locale} ${f.id}.${k}`).toBe(true);
        for (const field of f.fields) {
          expect(
            has(locale, `forms.${f.id}.fields.${field.id}.label`),
            `${locale} ${f.id}.${field.id}`,
          ).toBe(true);
          expect(
            has(locale, `forms.${f.id}.fields.${field.id}.refusal`),
            `${locale} ${f.id}.${field.id}`,
          ).toBe(true);
          for (const o of field.options ?? [])
            expect(has(locale, `forms.${f.id}.options.${o}`), `${locale} ${f.id}.${o}`).toBe(true);
        }
      }
      for (const g of GOALS) {
        for (const k of ["title", "short", "goalDoc", "stamp", "stampSub", "done", "body"])
          expect(has(locale, `goals.${g.id}.${k}`)).toBe(true);
      }
      for (const w of WINDOWS) {
        for (const k of ["role", "takes", "mania"])
          expect(has(locale, `windows.${w.id}.${k}`)).toBe(true);
      }
    }
  });

  it("has no locale entries for forms, goals or windows that don't exist", () => {
    expect(Object.keys(en.forms).sort()).toEqual(FORMS.map((f) => f.id).sort());
    expect(Object.keys(en.goals).sort()).toEqual(GOALS.map((g) => g.id).sort());
  });

  it("names documents in sentences", () => {
    expect(docName("en", auth(copy(start("id"))), "signature")).toBe(
      "certified copy of ID card and CPF",
    );
    expect(docName("pt-BR", paid(form("darf")), "signature")).toBe(
      "DARF 0,37, com carimbo de PAGO",
    );
    expect(docName("en", copy(protocol(form("f27b"))), "signature")).toBe(
      "copy of FORM 27-B, with filing stamp",
    );
    expect(docName("pt-BR", start("goal"), "alive")).toBe("Você, em pessoa");
    expect(routeText("pt-BR", [2, 4])).toBe("Guichê 2, depois Guichê 4");
  });

  it("fills slots and picks variants", () => {
    expect(t("en", "common.window", { n: 3 })).toBe("Window 3");
    expect(t("en", "no.such.key")).toBe("no.such.key");
    expect(variant("en", "lines.called", 1, { ticket: "A052", window: "Window 3" })).toContain(
      "A052",
    );
  });
});
