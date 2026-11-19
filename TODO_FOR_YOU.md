# What I need from you

> Things only you can do (decisions, money, accounts, people). Claude keeps this list current while working; newest items at the top of each section.
> Last updated: 19 Nov 2026. The first version is built: playable end to end on desktop and phone, in English and Portuguese, with tests, CI and the design boards captured from the game. What's left needs you: switching on GitHub Pages, the decisions below, and playtests.

## To do now

- [ ] **Switch on GitHub Pages** so the game goes live: repo → Settings → Pages → Source: **GitHub Actions**. The next push to `main` deploys to https://allbdev.github.io/notary-office-simulator/. (I didn't change repository settings myself.) (Roadmap task 5)
- [ ] **Play it.** `npm install && npm run dev`, or the Pages link once it's on. Tell me what drags, what's confusing, what isn't funny. Try `?seed=anything` for extra chains.

## Decisions (quick)

- [ ] **Hall art.** The hall on the canvas (board 2) is an image. Where does the game's hall come from, and can it ship under MIT? Options: (a) the canvas image, if its licence allows; (b) a 3D render you make; (c) drawn in Canvas 2D from shapes (cheap, fully ours); (d) commissioned. Built: (c), a Canvas 2D placeholder (`src/ui/hall.ts`). (Roadmap task 22)
- [ ] **Player's name on forms.** The mockups show your name ("Vinícius A. Barros"). Built: a fictional name and ID card generated from the seed (no personal data). Keep that, or let the player type a name (stored only in their browser)?
- [ ] **Challenge number.** The mockup shows "nº 323" on 19/11/2026, which is the day of the year and resets every January. Built: counted from `EPOCH_KEY` in `src/core/daily.ts`, set to 2026-11-19 = nº 1. Tell me the launch date and I'll move it. (Roadmap task 9)
- [ ] **Daily rollover.** When does a new chain start? Built: midnight in the player's local time, like Wordle. Alternative: one global moment (00:00 UTC or 00:00 Brasília) so everyone switches together. (Roadmap task 9)
- [ ] **Hosting and domain.** The result screen shows `[SEU DOMÍNIO]`. Pick a static host (GitHub Pages, Cloudflare Pages, Netlify) and whether to buy a domain. Built for GitHub Pages on the repo URL (the share text uses whatever address the game is served from). (Roadmap tasks 5, 50)
- [x] ~~**Repo name and owner.**~~ `allbdev/notary-office-simulator` (19 Nov 2026). (Roadmap task 1)
- [ ] **English title.** Keep "Cartório Simulator" in both languages (default), or an English subtitle?
- [x] ~~**Player-facing language.**~~ English by default with a PT-BR toggle (19 Nov 2026). The canvas has both: "Screens" (PT-BR) and "Screens (English)".

## Design canvas

- [ ] **Re-export `designs/10-Documents.jpg`** from the canvas (board "Documents"): I changed one trap line there ("Filing of Filing": the time must match the wall clock when you hand it in). The screen boards are captured from the game, so those JPGs are current.
- [ ] **Look at the canvas.** The "Screens" page now shows the real game (PT-BR), and there's a new "Screens (English)" page. The drawn mockups were replaced; their art is in the canvas history if you want any of it back.

## Playtesting (needs people)

- [ ] **Kill test (end of Phase 2):** play the daily chain 5 days in a row. Do you want to play tomorrow's? Tell me what drags.
- [ ] **Phone check:** play one run on a mid-range phone (load time, the folder sheet, typing in the form). (Roadmap task 38)
- [ ] **English-speaker test (roadmap task 48):** at least 2 people who don't know what a cartório is. Is it funny without the context?
