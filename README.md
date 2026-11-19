# Cartório Simulator

> *You only need one stamp.* A free daily browser game: get one document stamped at a Brazilian cartório before the windows close for lunch. Today's bureaucracy is generated from a seed, and it is the same for everyone.

**Status:** the first version is playable end to end, on desktop and phone, in English and Portuguese. Live at https://allbdev.github.io/notary-office-simulator/ once Pages is on (see `TODO_FOR_YOU.md`). What's left is playtesting and tuning (see `ROADMAP.md`).

Player-facing text is English by default, with a Brazilian Portuguese toggle. Code, comments and docs are in English.

| Doc | What's in it |
|---|---|
| [`GAME_PLAN.md`](GAME_PLAN.md) | Design, windows, documents, clock, look, architecture, risks |
| [`ROADMAP.md`](ROADMAP.md) | Ordered task list and current progress |
| [`CLAUDE.md`](CLAUDE.md) | Project rules (language, testing, git workflow, design sync, architecture) |
| [`TODO_FOR_YOU.md`](TODO_FOR_YOU.md) | Open decisions and things only the developer can do |
| [`designs/`](designs) | The design canvas boards: screens captured from the game (PT-BR, and `en/`), plus documents, stamps, windows and art direction |
| [`marketing/`](marketing) | Press kit and launch posts |

## How it plays

1. Open the link. Today's goal: *"Get a signature notarised on a declaration."*
2. Window 3 says you need Form 27-B. Form 27-B needs a copy, the copy must be authenticated at Window 4, and Window 4 goes to lunch in 40 seconds.
3. Take a ticket, queue, fill the forms (every form has a trap), get sent back, try again.
4. Get the stamp, and paste your result: time, forms, send-backs and your path through the windows.
5. Tomorrow: a new chain.

## The interesting problem

The game is a pure function of a seed and the player's inputs.

- **Generation with guarantees.** A seeded generator builds a dependency graph of documents from the goal, so every daily chain is solvable by construction. Property-based tests run a solver over thousands of seeds and check that each one finishes within a time bound.
- **Deterministic simulation.** Windows, queues, lunch breaks and the 30× cartório clock are state machines advanced in fixed ticks. A replay or a bug report is a seed plus an input log.
- **A game made of forms.** Forms are real HTML form controls: playable with a keyboard and a screen reader, readable on a phone.

### The numbers

`npm run seed-report` over 2,000 consecutive days (the discovery solver plays like a careful first-time player who never misreads a label; people take roughly twice as long):

| | p10 | median | p90 | max |
|---|---|---|---|---|
| Discovery solver | 0:37 | 1:18 | 3:01 | 5:41 |
| Window visits | 7 | 8 | 10 | 11 |

The fairness bound is 6:00 for the discovery solver. 0.1% of days need their hours or events re-rolled to fit; none needed the gentle fallback. A property test checks the bound for 10,000 consecutive days plus 500 random seeds on every run of the suite.

### Replaying a bug

The game saves the input log in `localStorage` (`cartorio.run.<date>`): a list of `{ tick, action }`. `simulate(chain, inputs, tick)` in `src/core/game.ts` rebuilds the exact state, so a bug report is the date (or seed) plus that log.

## Requirements

- **Node.js 22 LTS** and npm
- **Git LFS** (images and fonts are stored in LFS)

```sh
brew install node git-lfs && git lfs install
git clone https://github.com/allbdev/notary-office-simulator.git && cd notary-office-simulator
git lfs pull
npm install
```

## Running

```sh
npm run dev          # local dev server
npm run build        # static build in dist/
npm run preview      # serve the build
```

| Keyboard | Touch / mouse | Action |
|---|---|---|
| **Tab** / **Shift+Tab** | Tap | Move between windows, fields and buttons |
| **Enter** | Tap | Go to a window, hand in, confirm |
| Type | Type | Fill a field |
| **Esc** | Back button | Close the form |

Dev and test URL parameters (not offered in the UI): `?seed=abc` plays a practice chain, `?date=2026-11-19` picks a day, `?test=1` exposes `window.__cartorio` and allows `&speed=N`.

## Tests and tools

```sh
npm run check        # lint + typecheck + unit tests + build (run before every commit)
npm test             # Vitest (unit + property tests)
npm run e2e          # Playwright smoke test
npm run seed-report  # par times and chain stats across many seeds
npm run designs      # capture the design-canvas screen boards from the game (needs `npm run preview` running)
```

GitHub Actions runs `check` and the e2e smoke test on every push and pull request, and deploys `main`.

## Project layout

```
src/
  core/        Pure game logic: seeded RNG, daily seed, generator, solver,
               windows, queues, clock, simulation, scoring, share string. No DOM.
  content/     Windows, form templates, traps, lines, events (typed data),
               and locales/en.ts + locales/pt-BR.ts.
  ui/          Canvas hall and DOM paper (forms, ticket, folder, stamps), app loop, storage.
  main.ts      Wiring.
tests/         Vitest tests mirroring src/, plus e2e/ (Playwright).
tools/         Seed report, design-board capture (tools/designs/).
designs/       Mockups (reference only, not used in the game).
marketing/     Press kit and posts.
```

## Contributing workflow

1. Pick the next task in `ROADMAP.md`.
2. Write the feature together with its tests, keeping logic in `src/core/`.
3. If it changes something a design board shows, update the board (see `CLAUDE.md`).
4. Run `npm run check` and make sure it passes.
5. Commit. Before every push, run the `security-audit` skill on the changes (see `CLAUDE.md`).

## License

MIT.
