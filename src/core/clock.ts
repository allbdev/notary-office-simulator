/**
 * Two clocks. The simulation advances in fixed ticks of real time; the cartório clock on the
 * wall runs 30× faster. "Your time" (the score) is real time.
 */

export const TICK_MS = 100;
export const TICKS_PER_SECOND = 1000 / TICK_MS;
export const CLOCK_SPEED = 30;
/** Cartório seconds per tick. */
export const CLOCK_SECONDS_PER_TICK = (CLOCK_SPEED * TICK_MS) / 1000;

/** The run starts at 11:00 on the wall clock. */
export const DAY_START = 11 * 3600;
/** The cartório closes for everyone at 15:00. */
export const CLOSING_TIME = 15 * 3600;

export const LAST_TICK = clockToTick(CLOSING_TIME);

export function tickToClock(tick: number): number {
  return DAY_START + tick * CLOCK_SECONDS_PER_TICK;
}

/** First tick at or after a wall-clock time. */
export function clockToTick(clockSeconds: number): number {
  return Math.ceil((clockSeconds - DAY_START) / CLOCK_SECONDS_PER_TICK);
}

export function secondsToTicks(realSeconds: number): number {
  return Math.round(realSeconds * TICKS_PER_SECOND);
}

export function clockMinutes(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "11:42" */
export function formatClock(clockSeconds: number): string {
  const total = Math.floor(clockSeconds / 60);
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/** Real time of a tick count: "04:37" (minutes:seconds). */
export function formatDuration(ticks: number): string {
  const s = Math.max(0, Math.floor(ticks / TICKS_PER_SECOND));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

/** Cartório duration shown as real time left: "0:40". */
export function formatCountdown(ticks: number): string {
  const s = Math.max(0, Math.ceil(ticks / TICKS_PER_SECOND));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

/** Parses "11:42", "11h42", "1142"; null if it isn't a wall-clock time. */
export function parseClock(text: string): number | null {
  const m = /^\s*(\d{1,2})\s*[:hH.]?\s*(\d{2})\s*$/.exec(text);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 3600 + min * 60;
}
