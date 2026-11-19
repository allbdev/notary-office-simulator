import type { Input } from "../core/game";
import type { RunResult } from "../core/result";
import { addDays } from "../core/daily";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../content/i18n";

/**
 * Per-player conveniences in localStorage: language, today's run (so a reload resumes it) and
 * past results (for the streak). Every access is guarded: private windows and blocked storage
 * must still play, just without memory.
 */

const PREFIX = "cartorio.";

export interface SavedRun {
  v: 1;
  seed: string;
  inputs: Input[];
  tick: number;
  /** Index into PLAYER_NAMES: who you are in this run. */
  name?: number;
  result?: RunResult;
}

export interface HistoryEntry {
  finished: boolean;
  ticks: number;
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export class Store {
  constructor(private readonly backend: KeyValueStore | null = defaultStore()) {}

  private read<T>(key: string): T | null {
    try {
      const raw = this.backend?.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.backend?.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Full or blocked storage: the game goes on without memory.
    }
  }

  locale(): Locale | null {
    const v = this.read<string>("locale");
    return LOCALES.includes(v as Locale) ? (v as Locale) : null;
  }

  setLocale(locale: Locale): void {
    this.write("locale", locale);
  }

  run(id: string): SavedRun | null {
    const r = this.read<SavedRun>(`run.${id}`);
    if (!r || r.v !== 1 || !Array.isArray(r.inputs) || typeof r.tick !== "number") return null;
    return r;
  }

  saveRun(id: string, run: SavedRun): void {
    this.write(`run.${id}`, run);
  }

  history(): Record<string, HistoryEntry> {
    const h = this.read<Record<string, HistoryEntry>>("history");
    return h && typeof h === "object" ? h : {};
  }

  record(dateKey: string, entry: HistoryEntry): void {
    this.write("history", { ...this.history(), [dateKey]: entry });
  }

  /** Days in a row finished, ending today (or yesterday, if today isn't played yet). */
  streak(today: string): number {
    const h = this.history();
    let day = h[today]?.finished ? today : addDays(today, -1);
    let n = 0;
    while (h[day]?.finished) {
      n++;
      day = addDays(day, -1);
    }
    return n;
  }
}

export function initialLocale(store: Store, browserLanguages: readonly string[]): Locale {
  void browserLanguages; // English is the default; the toggle is remembered.
  return store.locale() ?? DEFAULT_LOCALE;
}
