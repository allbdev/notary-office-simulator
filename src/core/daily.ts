/**
 * The daily challenge: which date, which number, which seed.
 * A new chain starts at midnight in the player's local time (like Wordle).
 */

/** Challenge nº 1. Change at launch (see TODO_FOR_YOU.md). */
export const EPOCH_KEY = "2026-11-19";

const DAY_MS = 86_400_000;

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(key: string): boolean {
  const m = KEY_RE.exec(key);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const utc = new Date(Date.UTC(y, mo - 1, d));
  return utc.getUTCFullYear() === y && utc.getUTCMonth() === mo - 1 && utc.getUTCDate() === d;
}

export function parseDateKey(key: string): DateParts {
  if (!isDateKey(key)) throw new RangeError(`Not a date key: ${key}`);
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return { year: y, month: m, day: d };
}

export function dateKey(parts: DateParts): string {
  const p = (n: number, w: number) => String(n).padStart(w, "0");
  return `${p(parts.year, 4)}-${p(parts.month, 2)}-${p(parts.day, 2)}`;
}

/** The calendar date of a moment in the player's local time zone. */
export function localDateKey(moment: Date): string {
  return dateKey({
    year: moment.getFullYear(),
    month: moment.getMonth() + 1,
    day: moment.getDate(),
  });
}

function utcDay(key: string): number {
  const { year, month, day } = parseDateKey(key);
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

/** Whole days from a to b (b - a). DST-proof: computed on UTC calendar days. */
export function daysBetween(a: string, b: string): number {
  return utcDay(b) - utcDay(a);
}

export function addDays(key: string, days: number): string {
  const d = new Date((utcDay(key) + days) * DAY_MS);
  return dateKey({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
}

/** nº 1 on EPOCH_KEY. Dates before the epoch get numbers below 1; the UI only offers today. */
export function challengeNumber(key: string): number {
  return daysBetween(EPOCH_KEY, key) + 1;
}

export function dailySeed(key: string): string {
  return `cartorio:${key}`;
}
