import { describe, expect, it } from "vitest";
import { buildChain } from "../../src/core/chain";
import { auth, copy, form, paid, start } from "../../src/core/docs";
import type { Line, WindowStatus } from "../../src/core/game";
import { LOCALES } from "../../src/content/i18n";
import { formDestination, lineText, lineTone, statusText, ticketLabel } from "../../src/ui/format";

const chain = {
  ...buildChain("fmt", "2026-11-19"),
  requirements: [auth(copy(start("id"))), paid(form("darf")), form("annexU")],
};

const lines: Line[] = [
  { kind: "called", ticket: 52 },
  { kind: "reveal", doc: auth(copy(start("id"))), route: [2, 4], forms: [] },
  { kind: "reveal", doc: paid(form("darf")), route: [5], forms: ["darf"] },
  { kind: "reveal", doc: form("annexU"), route: [], forms: ["annexU"] },
  { kind: "stillMissing", doc: form("annexU") },
  { kind: "final" },
  { kind: "done", docs: [copy(start("id")), copy(start("goal"))] },
  { kind: "notHere" },
  { kind: "needInput", doc: auth(copy(start("id"))), input: copy(start("id")) },
  { kind: "needCopyNotOriginal", doc: auth(copy(start("id"))) },
  { kind: "formInvalid", form: "darf", field: "amount" },
  { kind: "fieldOrder", form: "f27b" },
  { kind: "bluePen", form: "f27b" },
  { kind: "jam" },
  { kind: "closed", window: 5 },
  { kind: "skipped", window: 3 },
  { kind: "cartorioClosed" },
];

describe("format", () => {
  it("every line has words in both languages, with no unfilled slots or raw keys", () => {
    for (const locale of LOCALES) {
      for (const line of lines) {
        for (const variant of [0, 1, 2, 7]) {
          const text = lineText(locale, chain, { tick: 0, window: 3, line, variant });
          expect(text, `${locale} ${line.kind}`).not.toMatch(/\{\w+\}/);
          expect(text, `${locale} ${line.kind}`).not.toMatch(/^lines\.|forms\./);
          expect(text.length).toBeGreaterThan(3);
        }
      }
    }
  });

  it("formats tickets like the LED panel", () => {
    expect(ticketLabel(52)).toBe("A052");
    expect(ticketLabel(1047)).toBe("A047");
  });

  it("describes window status with a word, not only a colour", () => {
    const at = (s: WindowStatus, q = 0, closes = 10_000) => statusText("en", s, q, 100, closes);
    expect(at({ kind: "open" })).toEqual({ text: "Open · no line", tone: "good" });
    expect(at({ kind: "open" }, 2).text).toBe("Open · line of 2");
    expect(at({ kind: "open" }, 5).tone).toBe("wait");
    expect(at({ kind: "break", reason: "lunch", until: 500 }).text).toBe("Lunch · back in 0:40");
    expect(at({ kind: "open" }, 0, 700).text).toBe("Closes in 1:00");
    expect(at({ kind: "closed" }).tone).toBe("off");
    expect(statusText("pt-BR", { kind: "systemDown", until: 200 }, 0, 100, 10_000).text).toBe(
      "Sistema fora do ar",
    );
  });

  it("knows where each form goes", () => {
    expect(formDestination(chain, "darf")).toBe(5);
    expect(formDestination(chain, "annexU")).toBe(3);
  });

  it("tones: stamps are good, information is amber, refusals are red", () => {
    expect(lineTone({ kind: "done", docs: [] })).toBe("good");
    expect(lineTone({ kind: "reveal", doc: form("x"), route: [], forms: [] })).toBe("info");
    expect(lineTone({ kind: "notHere" })).toBe("bad");
  });
});
