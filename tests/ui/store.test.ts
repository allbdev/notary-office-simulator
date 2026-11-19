import { describe, expect, it } from "vitest";
import { Store, initialLocale, type KeyValueStore } from "../../src/ui/store";

function memory(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("store", () => {
  it("remembers the language, defaulting to English", () => {
    const s = new Store(memory());
    expect(initialLocale(s, ["pt-BR"])).toBe("en");
    s.setLocale("pt-BR");
    expect(initialLocale(s, [])).toBe("pt-BR");
  });

  it("survives corrupt data", () => {
    const m = memory();
    m.data.set("cartorio.run.2026-11-19", "{not json");
    m.data.set("cartorio.locale", '"klingon"');
    m.data.set("cartorio.history", "42");
    const s = new Store(m);
    expect(s.run("2026-11-19")).toBeNull();
    expect(s.locale()).toBeNull();
    expect(s.history()).toEqual({});
  });

  it("survives storage that throws, or no storage at all", () => {
    const throwing: KeyValueStore = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
      removeItem: () => {},
    };
    for (const s of [new Store(throwing), new Store(null)]) {
      expect(() => s.setLocale("en")).not.toThrow();
      expect(s.locale()).toBeNull();
      expect(s.streak("2026-11-19")).toBe(0);
    }
  });

  it("round-trips a run", () => {
    const s = new Store(memory());
    s.saveRun("x", { v: 1, seed: "s", inputs: [{ tick: 3, action: { type: "leave" } }], tick: 10 });
    expect(s.run("x")?.inputs).toHaveLength(1);
  });

  it("counts the streak back from today or yesterday", () => {
    const s = new Store(memory());
    s.record("2026-11-17", { finished: true, ticks: 1 });
    s.record("2026-11-18", { finished: true, ticks: 1 });
    expect(s.streak("2026-11-19")).toBe(2);
    s.record("2026-11-19", { finished: true, ticks: 1 });
    expect(s.streak("2026-11-19")).toBe(3);
    s.record("2026-11-20", { finished: false, ticks: 1 });
    expect(s.streak("2026-11-21")).toBe(0);
  });
});
