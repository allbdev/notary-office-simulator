import { describe, expect, it } from "vitest";
import {
  EPOCH_KEY,
  addDays,
  challengeNumber,
  dailySeed,
  daysBetween,
  isDateKey,
  localDateKey,
  parseDateKey,
} from "../../src/core/daily";

describe("daily", () => {
  it("numbers the epoch day 1", () => {
    expect(challengeNumber(EPOCH_KEY)).toBe(1);
    expect(challengeNumber(addDays(EPOCH_KEY, 10))).toBe(11);
  });

  it("counts days across month, year and DST boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2027-03-27", "2027-03-29")).toBe(2);
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("validates date keys", () => {
    expect(isDateKey("2026-11-19")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("19/11/2026")).toBe(false);
    expect(() => parseDateKey("nope")).toThrow();
  });

  it("uses the local calendar date, including just before midnight", () => {
    expect(localDateKey(new Date(2026, 10, 19, 23, 59, 59))).toBe("2026-11-19");
    expect(localDateKey(new Date(2026, 10, 20, 0, 0, 0))).toBe("2026-11-20");
  });

  it("gives each day its own seed", () => {
    expect(dailySeed("2026-11-19")).not.toBe(dailySeed("2026-11-20"));
  });
});
