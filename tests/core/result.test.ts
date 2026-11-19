import { describe, expect, it } from "vitest";
import { pathGrid, resultOf, resultTime, shareText } from "../../src/core/result";
import { generateChain } from "../../src/core/generator";
import { solveChain } from "../../src/core/solver";
import { simulate } from "../../src/core/game";

describe("result", () => {
  it("draws the path as squares, 8 per row", () => {
    expect(pathGrid(["resolved", "info", "refused"])).toBe("🟩🟨🟥");
    expect(pathGrid(new Array(9).fill("resolved")).split("\n")).toHaveLength(2);
  });

  it("summarises a finished run and builds the share text", () => {
    const chain = generateChain("share", "2026-11-19");
    const run = solveChain(chain);
    const game = simulate(chain, run.inputs, run.ticks + 1);
    const r = resultOf(game);
    expect(r.finished).toBe(true);
    expect(r.path.length).toBe(game.visits.length);
    expect(resultTime(r)).toMatch(/^\d\d:\d\d$/);
    const text = shareText(r, {
      title: "Cartório Simulator nº 1",
      stats: "x",
      url: "https://example.org",
    });
    expect(text.split("\n")[0]).toBe("Cartório Simulator nº 1");
    expect(text).toContain("🔏");
    expect(text.endsWith("https://example.org")).toBe(true);
  });
});
