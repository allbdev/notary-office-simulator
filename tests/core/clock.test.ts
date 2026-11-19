import { describe, expect, it } from "vitest";
import {
  CLOCK_SECONDS_PER_TICK,
  DAY_START,
  LAST_TICK,
  clockToTick,
  formatClock,
  formatCountdown,
  formatDuration,
  parseClock,
  tickToClock,
} from "../../src/core/clock";

describe("clock", () => {
  it("runs the wall clock 30× faster than real time", () => {
    expect(CLOCK_SECONDS_PER_TICK).toBe(3);
    expect(tickToClock(0)).toBe(DAY_START);
    expect(tickToClock(10)).toBe(DAY_START + 30);
  });

  it("converts back and forth", () => {
    expect(clockToTick(tickToClock(123))).toBe(123);
    expect(formatClock(tickToClock(LAST_TICK))).toBe("15:00");
  });

  it("formats", () => {
    expect(formatClock(11 * 3600 + 42 * 60 + 59)).toBe("11:42");
    expect(formatDuration(2770)).toBe("04:37");
    expect(formatDuration(-5)).toBe("00:00");
    expect(formatCountdown(400)).toBe("0:40");
  });

  it("parses wall-clock answers", () => {
    expect(parseClock("11:42")).toBe(11 * 3600 + 42 * 60);
    expect(parseClock("11h42")).toBe(11 * 3600 + 42 * 60);
    expect(parseClock("1142")).toBe(11 * 3600 + 42 * 60);
    expect(parseClock("25:00")).toBeNull();
    expect(parseClock("meio-dia")).toBeNull();
  });
});
