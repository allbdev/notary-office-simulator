# CLAUDE.md — Cartório Simulator

Daily browser game in **TypeScript (strict) + Vite**. Client only, played from a link. Sibling of `../um-buraco-so` (same scaffold) and of the Godot games `../dig-to-japan-3d` and `../shave-the-capybara` (same habits: data-driven content, logic separate from views, tests for everything). Design: `GAME_PLAN.md`. Ordered task list: `ROADMAP.md`. Things only the developer can do: `TODO_FOR_YOU.md`. Art references: the design canvas and `/designs`.

Repo: https://github.com/allbdev/notary-office-simulator (remote `origin`, branch `main`).

## Security audit before every push (strict)

- **Run the `security-audit` skill on the changes being pushed before every `git push`.** No exceptions: not for small fixes, docs-only changes or a push the developer asked for in a hurry.
- Fix every finding, or get the developer to explicitly accept it, before pushing. Mention the audit result in your message when you push.
- If the audit can't run, don't push; say why.

## Design canvas (two-way sync, strict)

The mockups live on the claude.ai design canvas **"Cartório Simulator — Mockups"**: https://claude.ai/artifact/Up5fwDm2a96skeVgn3PWt9 (pages: Screens, Mobile, Documents & stamps, Windows, Art direction). `designs/*.jpg` are exports of its boards; `designs/README.md` maps each board to its file.

The game, the docs and the canvas must always agree:

- **Game → canvas.** Any change to something a board shows (layout, colours, fonts, copy, window rules and manias, form templates and traps, stamps, the share string, phone layouts) updates that board in the same task, and its JPG in `designs/`. A task isn't done until both match.
- **Canvas → game.** The developer edits boards by hand. Before starting any UI or content task, re-read the boards it touches (Artifact `read`), and bring every difference into the code, the content files and `GAME_PLAN.md`. If a canvas change conflicts with the plan, ask.
- **Docs too.** `GAME_PLAN.md` §5–§9 (windows, documents, clock, result, look and tokens) describe the same things as the boards; keep them in step.
- **New looks are tried on the canvas first**, on a new page, then built in the game.
- **Once screens render, boards show the real game:** screen boards use screenshots captured from the game (`tools/designs/`, roadmap Phase 5), uploaded as canvas assets, replacing the drawn mockups.
- The canvas currently shows the **PT-BR** copy. English is the default locale, so EN copy changes are reflected on the canvas too (roadmap Phase 5 adds EN versions of the screen boards).
- If Claude can't regenerate a JPG export itself, list the stale files in `TODO_FOR_YOU.md`.

## Language rules (strict)

| What | Language |
|---|---|
| Code: identifiers, file/folder names, CSS classes, content keys, test names | **English** |
| Code comments, docstrings, commit messages, PR descriptions | **English** |
| Docs (`*.md`, including this file) | **English** |
| **Player-facing text** (UI, forms, window lines, send-backs, share string, `<title>`/meta) | **English (default) and Brazilian Portuguese (PT-BR)**, both complete |

- There is **one small translation layer** with exactly two locales: `en` (default) and `pt-BR`. Don't add a third locale or an i18n library without asking.
- Player-facing strings live in locale content files (`src/content/locales/en.ts`, `src/content/locales/pt-BR.ts`, and per-template text under `src/content/`), never inline in UI or logic code. Keys and field names stay in English.
- Both locales have the same keys; a test fails on any missing or extra key and on slot mismatches (`{window}` present in one locale but not the other).
- English copy is **written**, not machine-translated. The joke must land in English on its own; "cartório", "guichê", "senha" and "DARF" may stay as flavour where the context explains them.
- The locale changes words only. It never changes the seed, the chain, the clock or the score.
- The language toggle is on the landing screen and in the header; the choice is remembered in `localStorage` (try/catch, works without it).
- Example: `const SENT_BACK_TITLE = t("sentBack.title")` is fine. `const devolvido = "Devolvido"` is not.

## Testing rules

- **Every feature ships with tests.** A roadmap task isn't done until its tests are written and passing.
- Frameworks: **Vitest** (unit), **fast-check** (property-based), **Playwright** (one end-to-end smoke test, plus the board screenshots in Phase 5).
- Tests go in `tests/`, mirroring `src/` (`src/core/generator.ts` → `tests/core/generator.test.ts`). The e2e smoke test is `tests/e2e/`.
- Cover the logic: RNG and daily seed, chain generation, the solver, window state machines (hours, lunch, closing), queues and the fast clock, form validation and traps, send-back rules, scoring, the share string, replays (seed + inputs → same result), locale completeness, and edge cases (midnight rollover, empty and malformed inputs, a window closing while you're in its queue, corrupt `localStorage`).
- **Property tests guard the generator:** for thousands of seeds, the chain is solvable and the solver finishes within the time bound. A failing seed found by fast-check becomes a fixed regression test.
- UI gets tests too: what's rendered for a given state, focus order, labels on every input. Test the state, not the pixels.
- Keep game logic out of UI code so it can be tested without a DOM.
- Bug fixes start with a failing test that reproduces the bug (usually a seed + input log).
- Run the full check before every commit, and don't commit when it fails:
  ```sh
  npm run check && git commit ...
  ```
  (`npm run check` = lint + typecheck + unit tests + build.)

## Git workflow

- **Before every push, run the `security-audit` skill** (see the section at the top).
- Commit or push only when asked. Never push with failing checks.
- Small, logical commits (one feature or chore each).
- Large binary assets (`.png`, `.jpg`, `.webp`, `.woff2`, `.ogg`, `.wav`) go through Git LFS (see `.gitattributes`); CI checks out with `lfs: true`.

## Code conventions

- TypeScript `strict: true`, no `any` (use `unknown` and narrow). ESLint + Prettier, enforced in CI.
- `camelCase` for variables and functions, `PascalCase` for types and classes, `CONSTANT_CASE` for module constants, `kebab-case` for file names.
- Content is data: windows, form templates, traps, rules, attendant lines, send-back jokes and events are typed data under `src/content/`, not hardcoded in logic. Adding a form means adding a data entry and its strings in both locales.
- No runtime dependencies without asking. Dev dependencies are fine when they serve the stack above.
- No `Math.random()` and no `Date.now()` / `new Date()` in `src/core`. Randomness comes from the seeded RNG; time comes in as input.

## Architecture notes

- **Layout.** `src/core` is pure logic (no DOM, no canvas, no globals). `src/content` is data and locale strings. `src/ui` draws state and turns clicks and keys into inputs; it never owns game rules. `src/main.ts` wires them.
- **Determinism.** A run is `simulate(seed, inputs) → state`. The daily seed comes from the challenge date; the same seed always gives the same chain, hours, queues and events. Replays and bug reports are a seed plus an input log.
- **Generator.** Builds a dependency graph of documents from the goal, so every graph is solvable by construction. Each node is a document produced at a window from other documents. Hours and lunch are placed so a solver run finishes within the bound.
- **Solver.** Finds the ideal path for a seed. Used by the property tests, by `tools/seed-report.ts` (par times across many seeds), and by "See the ideal path" on the result screen.
- **Windows** are state machines (open, lunch, closed, system down) on the cartório clock; each owns a queue and a ticket counter. Manias are fixed per window; the seed shuffles hours and requirements.
- **Clock.** Two clocks: the cartório clock (30× real time) and the player's real elapsed time (the score). The simulation advances in fixed ticks; the UI interpolates.
- **Rendering.** The hall is Canvas 2D (background art + status labels + the LED panel). Paper (forms, ticket, folder, stamps, attendant line) is DOM with real `<input>`, `<label>` and `<button>` elements. On phones the hall becomes a list of windows and forms show one field at a time (canvas board "Phone layouts").
- **Accessibility.** Playable with keyboard only and with a screen reader; text contrast 4.5:1; colour never carries meaning alone (status always has a word or a shape); `prefers-reduced-motion` disables stamp and queue animations.
- **Storage.** `localStorage` only, for per-player conveniences (today's result, streak, language, settings), always in try/catch. No accounts, no server, no personal data. The player's name on forms is generated from the seed, never asked for.
- **Sharing.** The share string is built in `src/core` from the result (numbers + path grid) and localised at the edge. Copy to clipboard with a visible fallback.
- **Performance budget.** First load under 200 KB gzipped JS+CSS (fonts and hall art aside), interactive in under 2 s on a mid-range phone over 4G. No per-frame allocations in the hall render loop.

## Workflow

- Work through `ROADMAP.md` in order. Mark tasks `[~]` when started and `[x]` when done and tested.
- Don't add scope that isn't in the roadmap without asking first.
- Keep `TODO_FOR_YOU.md` current: anything that needs the developer (decisions, money, accounts, domain, playtests) goes there, newest at the top of each section.
- Keep the design canvas, `designs/` and `GAME_PLAN.md` in sync with the game (see the first section).
