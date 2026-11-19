import { describe, expect, it } from "vitest";
import { compact, digitsOf, normalize, reverse, words } from "../../src/core/text";

describe("text", () => {
  it("ignores case, accents and spacing", () => {
    expect(normalize("  Vinícius   A. BARROS ")).toBe("vinicius a. barros");
    expect(compact("Vinícius A. Barros")).toBe("viniciusabarros");
    expect(digitsOf("123.456.789-09")).toBe("12345678909");
    expect(words("Olá, mundo!")).toEqual(["ola", "mundo"]);
    expect(reverse("abc")).toBe("cba");
  });
});
