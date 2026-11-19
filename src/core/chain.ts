import {
  CLOCK_SECONDS_PER_TICK,
  LAST_TICK,
  clockMinutes,
  clockToTick,
  secondsToTicks,
} from "./clock";
import { challengeNumber, parseDateKey } from "./daily";
import {
  auth,
  copy,
  form,
  paid,
  protocol,
  routeOf,
  start,
  type Doc,
  type StartDocId,
  type WindowId,
} from "./docs";
import { makeProfile, type Profile } from "./profile";
import { createRng, type Rng } from "./rng";
import { FEE_FORMS, PLAIN_FORMS } from "../content/forms";
import { GOALS } from "../content/goals";
import { WINDOWS } from "../content/windows";

/**
 * A day at the cartório: what you need, who is in line, when each window works, and what goes
 * wrong. Everything comes from the seed. `buildChain` makes one candidate; `generateChain`
 * (generator.ts) checks it with the solver and re-rolls the parts that can make it unfair.
 */

export type Pen = "blue" | "black";

export interface Break {
  kind: "lunch" | "coffee";
  start: number; // tick
  end: number; // tick
}

export interface Schedule {
  window: WindowId;
  /** Tick at which the window closes for the day. */
  closes: number;
  breaks: Break[];
}

export interface Arrival {
  tick: number;
  /** Ticks this person keeps the window busy. */
  service: number;
}

export type GameEvent =
  | { kind: "systemDown"; start: number; end: number }
  | { kind: "outOfInk"; window: WindowId; start: number; end: number }
  | { kind: "ticketSkipped"; window: WindowId; tick: number };

export interface Chain {
  seed: string;
  dateKey: string;
  number: number;
  goal: string;
  profile: Profile;
  /** In the order window 3 reveals them. */
  requirements: Doc[];
  schedules: Schedule[];
  /** Per window (index = id - 1), sorted by tick; ticks before 0 fill the line before you arrive. */
  arrivals: Arrival[][];
  events: GameEvent[];
  /** The pen on your desk at the start. Window 1 only takes blue. */
  pen: Pen;
  /** Which re-roll of the hours and events this is (0 = first try). */
  attempt: number;
}

/** The simulation runs this many ticks before you arrive (the morning crowd gets in line). */
export const WARM_UP_TICKS = 600;
/** People already in each line when you arrive. */
export const CROWD_MIN = 0;
export const CROWD_MAX = 3;
/** Arrival rate as a share of the service rate. */
export const UTILISATION = 0.9;

type Shape =
  "form" | "protocol" | "authStart" | "fee" | "copyForm" | "authProtocol" | "copyProtocol";

const SHAPE_STEPS: Record<Shape, number> = {
  form: 0,
  protocol: 1,
  authStart: 2,
  fee: 1,
  copyForm: 1,
  authProtocol: 3,
  copyProtocol: 2,
};

const NON_FEE_SHAPES: readonly Shape[] = [
  "form",
  "protocol",
  "protocol",
  "authStart",
  "authStart",
  "copyForm",
  "authProtocol",
  "copyProtocol",
];

export const MIN_STEPS = 3;
export const MAX_STEPS = 6;

/** Picks the requirement shapes and fills them with forms and start documents. */
export function buildRequirements(rng: Rng, goalDocCopyable: boolean): Doc[] {
  for (;;) {
    const count = rng.chance(0.55) ? 3 : 4;
    const shapes: Shape[] = [];
    if (rng.chance(0.85)) shapes.push("fee");
    while (shapes.length < count) shapes.push(rng.pick(NON_FEE_SHAPES));
    const steps = shapes.reduce((sum, s) => sum + SHAPE_STEPS[s], 0);
    const startDocs: StartDocId[] = goalDocCopyable ? ["id", "goal"] : ["id"];
    const authStarts = shapes.filter((s) => s === "authStart").length;
    if (steps < MIN_STEPS || steps > MAX_STEPS || authStarts > startDocs.length) continue;

    const plain = rng.shuffle(PLAIN_FORMS.map((f) => f.id));
    const startPool = rng.shuffle(startDocs);
    const nextForm = () => form(plain.pop()!);
    const reqs = shapes.map((s): Doc => {
      switch (s) {
        case "form":
          return nextForm();
        case "protocol":
          return protocol(nextForm());
        case "authStart":
          return auth(copy(start(startPool.pop()!)));
        case "fee":
          return paid(form(rng.pick(FEE_FORMS).id));
        case "copyForm":
          return copy(nextForm());
        case "authProtocol":
          return auth(copy(protocol(nextForm())));
        case "copyProtocol":
          return copy(protocol(nextForm()));
      }
    });
    return rng.shuffle(reqs);
  }
}

const atClock = (h: number, m: number) => clockToTick(clockMinutes(h, m));
const cartorioMinutes = (m: number) => Math.round((60 * m) / CLOCK_SECONDS_PER_TICK);

/** Opening hours. `gentle` gives the gentle fallback schedule (no breaks, nobody closes early). */
export function buildSchedules(rng: Rng, gentle = false): Schedule[] {
  const schedules: Schedule[] = WINDOWS.map((w) => ({
    window: w.id,
    closes: LAST_TICK,
    breaks: [],
  }));
  if (gentle) return schedules;

  // Window 4 always has lunch; the time changes every day.
  const lunchStart = atClock(11, 15 + 5 * rng.int(0, 12));
  const lunchLength = cartorioMinutes(rng.int(20, 40));
  schedules[3]!.breaks.push({ kind: "lunch", start: lunchStart, end: lunchStart + lunchLength });

  // Window 5 closes early.
  schedules[4]!.closes = atClock(13, 5 * rng.int(0, 9));

  // Sometimes window 1 or 2 takes a coffee.
  if (rng.chance(0.4)) {
    const w = rng.pick([0, 1]);
    const s = atClock(11, 30 + 5 * rng.int(0, 18));
    const len = cartorioMinutes(rng.int(10, 15));
    schedules[w]!.breaks.push({ kind: "coffee", start: s, end: s + len });
  }
  return schedules;
}

/**
 * Who else is in line. Each window starts the day with a crowd (from the seed) and then people
 * arrive at about the rate the window serves them, so lines hold their length with some drift.
 */
export function buildArrivals(rng: Rng): Arrival[][] {
  return WINDOWS.map((w) => {
    const r = rng.fork(`window-${w.id}`);
    const out: Arrival[] = [];
    const meanService = secondsToTicks(w.serviceSeconds);
    const meanGap = meanService / UTILISATION;
    const service = () => Math.max(10, Math.round(meanService * (0.6 + 0.8 * r.next())));
    const crowd = r.int(CROWD_MIN, CROWD_MAX);
    for (let i = crowd; i > 0; i--) out.push({ tick: -i, service: service() });
    let t = 0;
    for (;;) {
      // Fairly steady arrivals (0.5× to 1.5× the mean gap): lines drift, but rarely explode.
      t += Math.max(1, Math.round(meanGap * (0.5 + r.next())));
      if (t > LAST_TICK) break;
      out.push({ tick: t, service: service() });
    }
    return out;
  });
}

export function buildEvents(rng: Rng, none = false): GameEvent[] {
  if (none) return [];
  const events: GameEvent[] = [];
  if (rng.chance(0.45)) {
    const s = atClock(11, 30 + 5 * rng.int(0, 18));
    events.push({ kind: "systemDown", start: s, end: s + secondsToTicks(20) });
  }
  if (rng.chance(0.35)) {
    const s = atClock(11, 20 + 5 * rng.int(0, 20));
    events.push({
      kind: "outOfInk",
      window: rng.pick([1, 3, 4] as const),
      start: s,
      end: s + secondsToTicks(15),
    });
  }
  if (rng.chance(0.3)) {
    events.push({
      kind: "ticketSkipped",
      window: rng.pick([1, 2, 3, 4, 5] as const),
      tick: atClock(11, 20 + 5 * rng.int(0, 26)),
    });
  }
  return events.sort(
    (a, b) => ("start" in a ? a.start : a.tick) - ("start" in b ? b.start : b.tick),
  );
}

/** One candidate chain for a seed. Attempt > 0 re-rolls hours and events only. */
export function buildChain(seed: string, dateKeyValue: string, attempt = 0, gentle = false): Chain {
  parseDateKey(dateKeyValue); // validates
  const rng = createRng(seed);
  const goal = rng.fork("goal").pick(GOALS);
  const suffix = attempt === 0 ? "" : `#${attempt}`;
  return {
    seed,
    dateKey: dateKeyValue,
    number: challengeNumber(dateKeyValue),
    goal: goal.id,
    profile: makeProfile(rng.fork("profile")),
    requirements: buildRequirements(rng.fork("requirements"), goal.goalDocCopyable),
    schedules: buildSchedules(rng.fork(`hours${suffix}`), gentle),
    arrivals: buildArrivals(rng.fork("queues")),
    events: buildEvents(rng.fork(`events${suffix}`), gentle),
    pen: rng.fork("pen").chance(0.4) ? "black" : "blue",
    attempt,
  };
}

/** Number of window visits the requirements need besides window 3. */
export function stepCount(chain: Pick<Chain, "requirements">): number {
  return chain.requirements.reduce((sum, r) => sum + routeOf(r).length, 0);
}
