import { describe, expect, it } from "vitest";
import {
  auth,
  baseOf,
  chainOf,
  consumesInput,
  copy,
  docKey,
  form,
  formsIn,
  paid,
  producer,
  protocol,
  routeOf,
  start,
} from "../../src/core/docs";

describe("docs", () => {
  const d = auth(copy(protocol(form("f27b"))));

  it("keys documents structurally", () => {
    expect(docKey(d)).toBe("auth(copy(protocol(form:f27b)))");
    expect(docKey(start("id"))).toBe("start:id");
  });

  it("knows who makes what", () => {
    expect(routeOf(d)).toEqual([1, 2, 4]);
    expect(routeOf(paid(form("darf")))).toEqual([5]);
    expect(routeOf(form("x"))).toEqual([]);
    expect(producer(start("id"))).toBeNull();
  });

  it("walks the chain", () => {
    expect(chainOf(d).map(docKey)).toEqual([
      "form:f27b",
      "protocol(form:f27b)",
      "copy(protocol(form:f27b))",
      docKey(d),
    ]);
    expect(baseOf(d)).toEqual(form("f27b"));
    expect(formsIn(d)).toEqual(["f27b"]);
    expect(formsIn(auth(copy(start("id"))))).toEqual([]);
  });

  it("keeps originals when copying only", () => {
    expect(consumesInput(copy(start("id")))).toBe(false);
    expect(consumesInput(protocol(form("a")))).toBe(true);
  });
});
