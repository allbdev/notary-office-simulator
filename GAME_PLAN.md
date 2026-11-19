# Cartório Simulator — Game Plan

> *Você só precisa de um carimbo.* You only need one stamp.
> A free, open-source daily browser game, played from a link. A portfolio piece: the code is part of the product.

**Author:** Vinícius Albuquerque Barros · **Written:** 18 Nov 2026 · **Updated:** 19 Nov 2026 · **Status:** first version built and playable; playtests next

Mockups live on the design canvas "Cartório Simulator — Mockups" (https://claude.ai/artifact/Up5fwDm2a96skeVgn3PWt9) and as JPG exports in `designs/`. The canvas and this file are kept in sync both ways (see `CLAUDE.md`). All form names, traps and lines are first drafts. Effort figures are estimates, not measurements.

---

## 1. Pitch

You need one document stamped. Today's bureaucracy is generated, and it is the same for everyone.

## 2. Decisions so far

| # | Decision | Choice | Why |
|---|---|---|---|
| D1 | Concept | A daily seeded race through a Brazilian cartório, from the citizen's side | Bureaucracy games are common, but most put you behind the desk; I found no daily seeded race from the citizen's side |
| D2 | Platform | Browser, client only, played from a link; works on a phone | No store, no review queue, no login |
| D3 | Stack | TypeScript strict, Vite, Canvas 2D for the hall, DOM for paper, Vitest + fast-check, Playwright smoke, GitHub Actions | Shared with the other browser game (`../um-buraco-so`); see §11 |
| D4 | Text | **English by default, PT-BR toggle** (decided 19 Nov 2026) | The audience includes recruiters abroad; the Brazilian humour stays in the PT-BR locale |
| D5 | Session | 3 to 5 minutes, one challenge per day | It is opened from a link and shared |
| D6 | Money | None. No ads, no accounts, no personal data stored | Keeps it outside any compliance work |
| D7 | Look | A real cartório on real paper (see §9) | Deliberately different from Dig to Japan and Um Buraco Só |
| D8 | Repo | Public, MIT | The README is what a recruiter reads |

Open decisions are in `TODO_FOR_YOU.md`.

## 3. The loop

1. You get today's goal: "Reconhecer firma de uma declaração." / "Get a signature notarised on a declaration."
2. Window 3 says you need Form 27-B. Form 27-B needs a copy, the copy needs to be authenticated at Window 4, and Window 4 goes to lunch in 40 seconds.
3. You move between windows, take a ticket, queue, fill fields, get sent back.
4. You get the stamp. Result: time, forms filled, times sent back, and your path through the windows in a pasteable grid.
5. Tomorrow: a new chain. Same for everyone.

Each window only tells you the **next** step. The rest you find out.

## 4. Scope

**First version**
- A generator that builds a chain of requirements from a seed, guaranteed solvable.
- 5 windows with queues and opening hours on a fast clock.
- About 20 form and rule templates with absurd text, in both locales.
- Daily seed, challenge number, and a share string.

**Later**
- ~~Random events~~ (built: system down, stamp out of ink, ticket skipped).
- A practice mode with custom seeds.
- A leaderboard, which would be the first thing here to need a backend.

## 5. The windows (guichês)

Five windows, each a small state machine: open hours on the fast clock, a queue, what it accepts and what it hands back. The seed shuffles hours and requirements; the **manias stay**, so regulars learn them. (Canvas board "The five windows".)

| Window | Role | Takes → gives | Mania (fixed) |
|---|---|---|---|
| Guichê 1 | Protocolo | filled form → protocol number | Only accepts blue pen |
| Guichê 2 | Cópias | anything → a copy, copies of copies too | The machine jams on every fourth copy |
| Guichê 3 | Firmas | everything → the final stamp | Never tells you everything that's missing at once |
| Guichê 4 | Autenticação | copy → authenticated copy ("confere" stamp) | Goes to lunch; the time changes every day |
| Guichê 5 | Caixa | fee → paid DARF | Closes early and has no change |

## 6. The documents

About 20 form templates with slots; the daily seed picks which ones, in which order, with which rules. Each has **one trap** that punishes filling in on autopilot. Six drafted on the canvas (board "Documents"):

| Form | Subtitle | Trap |
|---|---|---|
| Formulário 27-B | Requerimento para requerer | Field order is not reading order |
| DARF 0,37 | Taxa de expediente do expediente | The amount must be written wrong on purpose |
| Anexo Ú | Declaração de que não há anexos | It is itself an annex; tick accordingly |
| Cópia da Cópia | Requisição de cópia autenticada de cópia simples | Needs the copy, not the original; bringing the original sends you back |
| Protocolo de Protocolo | Comprovante de que o protocolo foi protocolado | The time must match the wall clock when you hand it in (±15 cartório minutes) |
| Ficha de Firma | Cartão de autógrafo | Signatures that must differ from each other |

All 21 templates are in `src/content/forms.ts` (two of them, DARF 0,37 and GRU 1,99, are fees paid at window 5); their words are in the locale files. Rules shown at a window change per form ("Campo vazio volta. Campo certo demais também levanta suspeita."). Every send-back has a joke.

## 7. Clock, queues and events

- **Two clocks:** the cartório clock runs **30× faster** than real time, from 11:00 to closing at 15:00 (8 real minutes); "seu tempo" is real elapsed time and is the score. Service takes 6 to 10 real seconds per person depending on the window.
- **Crowd:** each window starts with 0 to 3 people in line and people keep arriving at about 90% of the rate the window serves them.
- **Queues:** take a ticket (senha, e.g. A052) at a window; the LED panel calls numbers; switching lines loses your place.
- **Opening hours:** windows open, close and go to lunch on the cartório clock; the hall shows each window's status (open + queue length, lunch + return time, closing soon).
- **Events:** drawn by the daily seed, so everyone gets the same ones: "SISTEMA FORA DO AR · volta em 0:20 · o relógio não para" (no window serves; paperwork continues), a window out of stamp ink for 15 seconds, and the panel skipping your ticket (you go to the back of the line). About three days in four have at least one.
- **Fairness:** a discovery solver (acts only on what window 3 has revealed, fills every form right) must finish within 6 real minutes, or the hours and events are re-rolled; after 12 tries a gentle schedule with thinner lines is used. Property tests check this for 10,000 days.

## 8. Result and sharing

- The final screen is the stamped declaration, the stats (time, forms handed in, send-backs) and **your path through the windows**: green resolved (you got a stamp), amber told something (a requirement, a jammed copier), red sent back.
- Share string (draft): `Cartório Simulator nº 323` / `04:37 · 6 formulários · 3 voltas` / the path grid / the game URL. Localised wording, same numbers and grid.
- "See the ideal path" shows the solver's route after you finish.
- "Tomorrow there's another one. Today's doesn't open again."

## 9. Look

A real cartório, played on real paper: a rendered hall (five guichês, queue panel, ropes, plastic chairs) and forms, tickets and stamps on a formica desk. (Canvas page "Art direction".)

- **Two materials only:** the hall (fluorescent light, laminate, glass, a queue panel) and paper on a formica desk.
- **No character art.** The attendant is a blur behind glass and a line of text.
- The interface is made of things in the room: green signage, paper slips, sticky notes, an LED panel.
- **Blue handwriting is always the player. Typewriter is always the cartório.**
- Deadpan. The paper is never in on the joke.
- Against the other two: Dig to Japan is round cartoon, Um Buraco Só is dark glass over a photo. This one is daylight paper, hard edges, 2–4 px corners. No depth-of-field tricks on play screens; forms are sharp and readable.
- **Colour means status** (green resolved, amber waiting, red sent back), always with a word or a shape as well.
- Stamps are drawn rough on purpose: uneven pressure, slightly rotated, never centred. The queue ticket and the LED panel are the only "screens" in the cartório.

**Tokens**

| Token | Value | Use |
|---|---|---|
| signage | `#17402e` | Window signs, primary buttons, accent |
| paper | `#f4f0e2` | Forms, cards |
| pen / stamp | `#24459c` | Player handwriting, approval stamps |
| refusal | `#a8231c` | Send-backs, refusal stamps |
| desk | `#b7b3a0` | Background |
| folder | `#e9d9a6` | "Sua pasta" checklist |
| status green / amber / grey | `#1f6b3a` / `#8a5a00` / `#6b6b63` | Window status dots |

| Font | Use |
|---|---|
| Public Sans | Signage and labels |
| Courier Prime | What the cartório types |
| Caveat | What you write |
| VT323 | LED panel and ticket numbers |

All four are OFL and are self-hosted in the build (no runtime calls to Google Fonts).

**The hall** is drawn in Canvas 2D from shapes (booths, glass, the LED panel, the wall clock, ropes, plastic chairs, people in line) as a placeholder until the hall art is decided (`TODO_FOR_YOU.md`).

**Screens on the canvas:** 1 Landing · 2 The hall · 3 At the window · 4 Filling a form · 5 Waiting in line · 6 Sent back · 7 Event: system down · 8 Result and share · Phone layouts (the hall becomes a list of windows; a form is one field at a time; the result fits one screenshot).

## 10. Architecture

- **Seeded random generator** producing a dependency graph of documents. Built from the goal so every graph is solvable by construction.
- **Deterministic simulation:** the whole run is a pure function of seed and inputs. Replays and bug reports are a seed plus an input log.
- **State machine** for windows, queues and the clock.
- **Language is presentation only:** the seed decides the chain; the locale only decides the words. An English and a Portuguese player on the same day race the same chain and share comparable results.
- **Client only.** No server for the first version.

## 11. Stack and conventions

Shared with `../um-buraco-so`: one scaffold (Vite + TS + tests + CI + deploy) is built once and reused.

| Decision | Choice | Why |
|---|---|---|
| Language | TypeScript, strict | Day-to-day stack; readable to recruiters |
| Build | Vite | Fast, zero-config static output |
| Rendering | Canvas 2D for the hall; DOM for forms, tickets and dialogs (PixiJS only if needed) | Small bundle; real form controls for accessibility |
| Tests | Vitest for logic, fast-check for property tests, Playwright for one end-to-end smoke test | Logic separate from drawing, and tested |
| CI | GitHub Actions: lint, typecheck, test, build, deploy on push | Shows the pipeline, not only the game |
| Hosting | Any static host | No store, no review queue |
| Repo | Public, MIT, README explains the architecture and the interesting problem | The README is what a recruiter reads |
| Session | 3 to 5 minutes, works on a phone, no login | It is opened from a link |
| Sharing | A result you can paste (text first, image later) | That is how these spread |
| Text | English default, PT-BR toggle | D4 |
| Money | None. No ads, no accounts, no personal data stored | D6 |

## 12. What it shows

- Procedural generation with guarantees, backed by property-based tests: for thousands of seeds, a solver finishes, and within a bound.
- Deterministic simulation, which makes replays and bug reports trivial.
- Careful forms UI and accessibility. It is a game made of forms.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Tedious instead of funny | Runs of 3 to 5 minutes; the clock is fast; every send-back has a joke |
| A lot of jokes to write, twice | Templates with slots; start with 20; English copy is written, not machine-translated |
| Many bureaucracy games exist | The angle is the daily seeded race with a shareable result, and Brazilian cartório humour |
| Jokes that only Brazilians get | Write them so the form is funny even if "cartório" means nothing to you; playtest in English |
| Unfair chains (lunch closes before you can possibly arrive) | Solver checks every seed is finishable within a time bound; property tests over thousands of seeds |

**Effort (estimate):** 2 weekends for the first version. The generator and its tests are most of it.

## 14. What already exists

A quick search on 18 Nov 2026, not exhaustive.

Bureaucracy games are common: *Bureau of Bureaucracy*, *Civil Servant*, *The Registry*, a German bureaucracy idle game on Steam, and a long list under itch.io's bureaucracy tag. Most put you behind the desk. I did not find a daily seeded race from the citizen's side.

Sources:
- https://pantsonfirestudios.itch.io/bureau-of-bureaucracy
- https://sirdaniel.itch.io/civil-servant
- https://www.pocketgamer.com/off-the-appstore/the-registry/
- https://store.steampowered.com/app/4765220
- https://itch.io/games/tag-bureaucracy
