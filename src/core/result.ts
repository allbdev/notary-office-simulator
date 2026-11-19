import { formatDuration } from "./clock";
import type { Game, Outcome } from "./game";

/** The end of a run, reduced to what's scored and shared. */
export interface RunResult {
  number: number;
  dateKey: string;
  finished: boolean;
  ticks: number;
  forms: number;
  sendBacks: number;
  path: Outcome[];
}

export function resultOf(game: Game): RunResult {
  return {
    number: game.chain.number,
    dateKey: game.chain.dateKey,
    finished: game.finishedAt !== null,
    ticks: game.elapsed,
    forms: game.formsHandedIn,
    sendBacks: game.refusals,
    path: game.visits.map((v) => v.outcome),
  };
}

const SQUARES: Record<Outcome, string> = { resolved: "🟩", info: "🟨", refused: "🟥" };

/** The path as coloured squares, wrapped every 8 visits. */
export function pathGrid(path: readonly Outcome[]): string {
  const squares = path.map((o) => SQUARES[o]);
  const rows: string[] = [];
  for (let i = 0; i < squares.length; i += 8) rows.push(squares.slice(i, i + 8).join(""));
  return rows.join("\n");
}

export interface ShareWords {
  /** "Cartório Simulator nº {number}" already filled. */
  title: string;
  /** Stats line already filled. */
  stats: string;
  url: string;
}

/** The pasteable result. The words come from the locale; numbers and grid are the same in both. */
export function shareText(result: RunResult, words: ShareWords): string {
  const parts = [
    words.title,
    words.stats,
    pathGrid(result.path) + (result.finished ? " 🔏" : " ❌"),
  ];
  if (words.url) parts.push(words.url);
  return parts.join("\n");
}

export function resultTime(result: RunResult): string {
  return formatDuration(result.ticks);
}
