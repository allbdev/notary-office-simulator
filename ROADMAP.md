# Roadmap — Cartório Simulator

> Tasks **in order**. Work top to bottom; move to the next phase only when the current phase's exit criteria are met.
> **The risky thing gets proven first:** that the generator always makes a fair, solvable chain, checked by property tests over thousands of seeds. Then a playable vertical slice, to check it's funny and not tedious. Content, polish and launch come after.
> Design details live in `GAME_PLAN.md`. Mockups on the design canvas and in `/designs`. Project rules in `CLAUDE.md`. Things only the developer can do in `TODO_FOR_YOU.md`.

**Language rule:** player-facing text in **English (default) and PT-BR**, both complete, through the two-locale content files. Code, comments and docs in English.

**Design rule:** any task that changes what a board shows also updates the board and its `designs/` JPG (see `CLAUDE.md`).

**Definition of done:** a task is `[x]` only when it's implemented **and covered by passing tests** (see `CLAUDE.md`).

**Target (from `GAME_PLAN.md`):** a run takes 3 to 5 minutes. The first version is about 2 weekends. Every number below is a first guess.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done

---

## Phase 0 · Setup

1. [~] `git init`, public GitHub repo, MIT `LICENSE`, Git LFS (`.gitattributes` already lists the binary types) (repo initialised on `main`, LFS on, `origin` = https://github.com/allbdev/notary-office-simulator.git; `LICENSE` and first push to do)
2. [ ] Vite + TypeScript strict scaffold; `src/core`, `src/content`, `src/ui`, `tests/`, `public/`, `tools/`
3. [ ] ESLint + Prettier; `npm run check` (lint + typecheck + unit tests + build)
4. [ ] Vitest + fast-check, first test; Playwright with a "page loads" smoke test
5. [ ] GitHub Actions: `check` + e2e on every push/PR; deploy `main` to the static host (host decision in `TODO_FOR_YOU.md`)
6. [ ] Fonts self-hosted (Public Sans, Courier Prime, Caveat, VT323; OFL, full PT-BR accents) and the colour tokens from `GAME_PLAN.md` §9 as CSS custom properties
7. [ ] Locale layer: `t(key, slots)`, `en` default + `pt-BR`, toggle remembered in `localStorage`; test that both locales have the same keys and slots

**Exit:** the empty page builds, deploys, and CI is green.

---

## Phase 1 · Core: the generator and the simulation (no UI)

> Everything here is pure logic in `src/core`, tested without a DOM.

8. [ ] Seeded RNG (small, fast, deterministic across browsers) + tests for repeatability and distribution
9. [ ] Daily seed and challenge number from the date (rollover rule in `TODO_FOR_YOU.md`); midnight edge cases
10. [ ] Document and window types; the dependency graph model (document produced at window W from documents X, Y)
11. [ ] Generator: builds a chain from the goal, solvable by construction; picks templates, windows and hours from the seed
12. [ ] Solver: finds the ideal path and its time for any seed
13. [ ] Property tests: for 10,000 seeds the chain is solvable and the solver finishes within the time bound; failing seeds become fixed regression tests
14. [ ] Clock: cartório clock at 30× real time, fixed simulation ticks
15. [ ] Window state machine: open, lunch, closed; hours from the seed; manias as fixed rules per window
16. [ ] Queues and tickets: take a ticket, panel calls numbers (~12 s per ticket), switching lines loses your place, a window closing while you queue
17. [ ] Form validation: fields, rules per form, one trap per template; send-back reasons
18. [ ] `simulate(seed, inputs)`: the whole run as a pure function; replay test (same seed + inputs → same state)
19. [ ] Scoring and result: real time, forms filled, send-backs, path through windows (resolved / waited / sent back)
20. [ ] Share string (numbers + path grid), localised at the edge
21. [ ] `tools/seed-report.ts` (`npm run seed-report`): par time, chain length and send-back opportunities across many seeds

**Exit:** the property tests pass over 10,000 seeds, and the seed report shows ideal runs between about 2 and 4 minutes.

---

## Phase 2 · Vertical slice: one playable chain

> One full run, start to stamp, with the first few forms. Re-read the screen boards before starting each screen (see `CLAUDE.md`).

22. [ ] Hall (board 2): Canvas 2D background, window status labels, LED panel, header (cartório clock, your time, ticket, challenge), folder checklist, last message
23. [ ] At the window (board 3): blurred attendant, typewriter line, "what's missing" sticky note, actions
24. [ ] Filling a form (board 4): paper form with real inputs, blue-pen handwriting font, field counter, today's rules at this window, tear up and restart
25. [ ] Waiting in line (board 5): LED panel, your ticket, wait / switch line
26. [ ] Sent back (board 6): refusal stamp, reason, joke, send-back count and time lost
27. [ ] Result and share (board 8): stamped declaration, stats, path grid, copy result
28. [ ] First 6 form templates (the six on the Documents board) and the 5 windows with their manias, in both locales
29. [ ] Keyboard-only and screen-reader pass on the whole run; focus order tests

**Exit (kill test):** the developer plays the daily chain 5 days in a row (5 seeds) and wants to play the next one. In `TODO_FOR_YOU.md`.

---

## Phase 3 · First version complete

30. [ ] Landing (board 1): goal of the day, ticket-styled challenge card, "Take a ticket", "How it works", language toggle
31. [ ] Phone layouts (Phone layouts board): hall as a list of windows, one field at a time, result in one screenshot
32. [ ] About 20 form templates with traps, rules and send-back jokes, in both locales; content tests (every template reachable, every slot filled, no orphan strings)
33. [ ] Attendant lines per window and per situation, in both locales
34. [ ] "See the ideal path" on the result screen (from the solver)
35. [ ] Today's result and streak saved in `localStorage`; today's challenge can't be replayed for a new score
36. [ ] Stamps drawn rough (rotation, uneven ink) and the stamp moment; `prefers-reduced-motion` respected
37. [ ] "How it works" screen
38. [ ] Performance budget check (bundle size, load on a mid-range phone); Lighthouse in CI

**Exit:** the first version from `GAME_PLAN.md` §4 is playable end to end on desktop and phone, in both languages.

---

## Phase 4 · Events

39. [ ] Event system: drawn by the seed, same for everyone; the solver accounts for them
40. [ ] "Sistema fora do ar" (board 7): no window serves, paper-only work continues
41. [ ] Stamp out of ink; ticket skipped
42. [ ] Property tests extended: chains with events stay solvable within the bound

---

## Phase 5 · Design sync tooling

43. [ ] `tools/designs/`: Playwright captures every screen board from the real game (fixed seed, fixed state) at board size
44. [ ] Upload the captures to the canvas and replace the drawn screen mockups; refresh `designs/` JPGs
45. [ ] EN versions of the screen boards on the canvas (English is the default locale)

---

## Phase 6 · Launch

46. [ ] README: architecture write-up, the generator and its guarantees, seed-report numbers, how to replay a bug
47. [ ] Open Graph image and meta tags for link previews, in both locales
48. [ ] Playtests: 5 people, including English speakers who don't know what a cartório is (risk in `GAME_PLAN.md` §13)
49. [ ] Tune hours, queue speed and template mix from playtests and the seed report
50. [ ] Domain and production deploy (decision in `TODO_FOR_YOU.md`)
51. [ ] Press kit and launch posts (`marketing/`)

---

## Later (not in the first version)

- Practice mode with custom seeds
- Share as an image
- Leaderboard (the first thing that needs a backend)
