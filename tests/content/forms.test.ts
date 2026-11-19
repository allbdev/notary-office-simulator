import { describe, expect, it } from "vitest";
import { FEE_FORMS, FORMS, fillOrder, formById } from "../../src/content/forms";

describe("form templates", () => {
  it("has about 20 templates with unique ids", () => {
    expect(FORMS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(FORMS.map((f) => f.id)).size).toBe(FORMS.length);
  });

  it("each has a trap field that exists, and unique field ids", () => {
    for (const f of FORMS) {
      expect(
        f.fields.some((x) => x.id === f.trapField),
        f.id,
      ).toBe(true);
      expect(new Set(f.fields.map((x) => x.id)).size, f.id).toBe(f.fields.length);
    }
  });

  it("checkbox fields declare their options in the validator", () => {
    for (const f of FORMS) {
      for (const field of f.fields) {
        if (field.kind !== "checks") continue;
        expect(field.validator.type).toBe("checks");
        if (field.validator.type === "checks") {
          for (const id of field.validator.mustCheck) expect(field.options).toContain(id);
        }
      }
    }
  });

  it("there are fee forms for window 5", () => {
    expect(FEE_FORMS.length).toBeGreaterThan(0);
  });

  it("number-ordered forms number every field", () => {
    const f = formById("f27b");
    expect(fillOrder(f).map((x) => x.number)).toEqual([1, 2, 3]);
    expect(() => formById("nope")).toThrow();
  });
});
