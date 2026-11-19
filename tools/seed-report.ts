/**
 * Par times and chain stats across many daily seeds. Run after changing queue speeds, hours,
 * templates or the generator: `npm run seed-report [-- days]`.
 */
import { stepCount } from "../src/core/chain";
import { addDays } from "../src/core/daily";
import { FAIR_BOUND_TICKS, generateChain } from "../src/core/generator";
import { solveChain } from "../src/core/solver";

const days = Number(process.argv[2] ?? 2000);
const start = "2026-11-19";

const discovery: number[] = [];
const ideal: number[] = [];
const visits: number[] = [];
const steps: number[] = [];
let rerolled = 0;
let fallback = 0;
let events = 0;

for (let i = 0; i < days; i++) {
  const key = addDays(start, i);
  const chain = generateChain(`cartorio:${key}`, key);
  if (chain.attempt > 0) rerolled++;
  if (chain.attempt >= 12) fallback++;
  if (chain.events.length > 0) events++;
  const d = solveChain(chain, "discovery");
  const id = solveChain(chain, "ideal");
  discovery.push(d.ticks / 10);
  ideal.push(id.ticks / 10);
  visits.push(d.visits.length);
  steps.push(stepCount(chain));
}

const pct = (xs: number[], p: number) => {
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]!;
};
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const row = (name: string, xs: number[], fmt = mmss) =>
  console.log(
    `${name.padEnd(22)} p10 ${fmt(pct(xs, 10)).padStart(6)}  median ${fmt(pct(xs, 50)).padStart(6)}  p90 ${fmt(pct(xs, 90)).padStart(6)}  max ${fmt(pct(xs, 100)).padStart(6)}`,
  );

console.log(`Seed report: ${days} days from ${start} (bound ${mmss(FAIR_BOUND_TICKS / 10)})\n`);
row("discovery solver", discovery);
row("ideal solver", ideal);
row("visits", visits, String);
row("steps (non-G3 visits)", steps, String);
console.log(`\nre-rolled hours/events: ${((100 * rerolled) / days).toFixed(1)}%`);
console.log(`gentle fallback:        ${((100 * fallback) / days).toFixed(2)}%`);
console.log(`days with events:       ${((100 * events) / days).toFixed(1)}%`);
console.log(
  "\nHumans read, click and type slower than the solver: expect real runs around 2× the discovery time.",
);
