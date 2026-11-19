import type { Chain } from "../core/chain";
import { TICK_MS } from "../core/clock";
import { dailySeed, isDateKey, localDateKey } from "../core/daily";
import { Game, simulate, type Action } from "../core/game";
import { generateChain } from "../core/generator";
import { resultOf } from "../core/result";
import { bestRoute } from "../core/solver";
import { t, type Locale } from "../content/i18n";
import type { PlayContext } from "./context";
import { Desk } from "./desk";
import { h } from "./dom";
import { lineText } from "./format";
import { landing, type LandingState } from "./landing";
import { PlayScreen } from "./play";
import { resultScreen } from "./result";
import { Store, initialLocale } from "./store";

export interface AppOptions {
  root: HTMLElement;
  store?: Store;
  now?: () => Date;
  /** Practice/test: a fixed seed instead of today's (not offered in the UI). */
  seed?: string | null;
  /** Practice/test: a fixed date. */
  date?: string | null;
  /** Test only: run the clock faster. */
  speed?: number;
  /** The address pasted under the share text. */
  url?: string;
  clipboard?: (text: string) => Promise<void>;
  raf?: (cb: (t: number) => void) => number;
  perfNow?: () => number;
}

type Screen = "landing" | "play" | "result";

/**
 * The app: picks today's chain, routes between landing, play and result, runs the real-time loop
 * and saves the input log so a reload resumes the same run.
 */
export class App {
  locale: Locale;
  readonly chain: Chain;
  game: Game | null = null;
  screen: Screen = "landing";
  private readonly store: Store;
  private readonly runId: string;
  private readonly root: HTMLElement;
  private readonly speed: number;
  private readonly url: string;
  private play: PlayScreen | null = null;
  private desk: Desk | null = null;
  private baseTick = 0;
  private baseTime = 0;
  private lastSave = 0;
  private toasts: HTMLElement;
  private lastMessageCount = 0;
  private finishTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly opts: AppOptions) {
    this.root = opts.root;
    this.store = opts.store ?? new Store();
    this.speed = opts.speed ?? 1;
    this.url = opts.url ?? "";
    const today =
      opts.date && isDateKey(opts.date)
        ? opts.date
        : localDateKey((opts.now ?? (() => new Date()))());
    const seed = opts.seed ? `practice:${opts.seed}` : dailySeed(today);
    this.runId = opts.seed ? `practice.${opts.seed}.${today}` : today;
    this.chain = generateChain(seed, today);
    this.locale = initialLocale(this.store, []);
    this.toasts = h("div", { class: "toast-area", "aria-live": "assertive" });
  }

  get context(): PlayContext {
    const game = this.game!;
    return {
      locale: this.locale,
      chain: this.chain,
      game,
      dispatch: (a) => this.dispatch(a),
      openForm: (id) => this.openForm(id),
      closeForm: () => this.closeForm(),
      toggleLocale: () => this.toggleLocale(),
      showHow: () => this.showHow(),
    };
  }

  start(): void {
    const saved = this.store.run(this.runId);
    if (saved?.result) {
      this.game = simulate(this.chain, saved.inputs, saved.tick);
    }
    this.renderLanding();
    this.loop();
  }

  private landingState(): LandingState {
    const saved = this.store.run(this.runId);
    if (saved?.result) return "done";
    if (saved && saved.inputs.length > 0) return "resume";
    return "new";
  }

  private applyDocument(): void {
    document.documentElement.lang = this.locale;
    document.title = t(this.locale, "meta.title");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t(this.locale, "meta.description"));
  }

  private frame(content: HTMLElement, withTopbar: boolean): void {
    this.applyDocument();
    const top = withTopbar
      ? h(
          "nav",
          { class: "topbar" },
          h(
            "button",
            { class: "btn-link", type: "button", onclick: () => this.showHow() },
            t(this.locale, "landing.how"),
          ),
          h(
            "button",
            {
              class: "btn-link",
              type: "button",
              lang: this.locale === "en" ? "pt-BR" : "en",
              "aria-label": t(this.locale, "common.languageLabel"),
              onclick: () => this.toggleLocale(),
            },
            t(this.locale, "common.languageToggle"),
          ),
        )
      : null;
    this.root.replaceChildren(h("div", { class: "app" }, top, content), this.toasts);
  }

  renderLanding(): void {
    this.screen = "landing";
    this.play = null;
    this.frame(
      landing({
        locale: this.locale,
        chain: this.chain,
        state: this.landingState(),
        streak: this.store.streak(this.chain.dateKey),
        onStart: () => this.begin(),
        onHow: () => this.showHow(),
      }),
      true,
    );
    this.root.querySelector<HTMLElement>("[data-testid=start]")?.focus();
  }

  /** Starts or resumes today's run, or shows the result if it's done. */
  begin(): void {
    const saved = this.store.run(this.runId);
    if (saved?.result) {
      this.game = simulate(this.chain, saved.inputs, saved.tick);
      this.renderResult();
      return;
    }
    this.game = saved ? simulate(this.chain, saved.inputs, saved.tick) : new Game(this.chain);
    this.lastMessageCount = this.game.messages.length;
    this.baseTick = this.game.tick;
    this.baseTime = this.perfNow();
    this.renderPlay();
    this.save(true);
  }

  private renderPlay(): void {
    this.screen = "play";
    this.play = new PlayScreen(this.context);
    this.frame(this.play.el, false);
    this.root.querySelector<HTMLElement>("#stage")?.focus();
  }

  renderResult(): void {
    if (!this.game) return;
    this.screen = "result";
    this.play = null;
    this.closeForm();
    this.frame(
      resultScreen({
        locale: this.locale,
        chain: this.chain,
        result: resultOf(this.game),
        visits: this.game.visits,
        url: this.url,
        copy: (text) => this.copy(text),
      }),
      true,
    );
  }

  private async copy(text: string): Promise<boolean> {
    try {
      const write = this.opts.clipboard ?? ((s: string) => navigator.clipboard.writeText(s));
      await write(text);
      return true;
    } catch {
      return false;
    }
  }

  dispatch(action: Action): void {
    if (!this.game || this.game.over) return;
    if (this.game.dispatch(action)) {
      this.afterChange();
      this.save(false);
    }
  }

  private afterChange(): void {
    const game = this.game!;
    // React to new messages: being called closes the desk; some lines become toasts.
    for (let i = this.lastMessageCount; i < game.messages.length; i++) {
      const m = game.messages[i]!;
      if (m.line.kind === "called") {
        if (this.desk) this.closeForm();
        this.toast(lineText(this.locale, this.chain, m));
      } else if (m.line.kind === "skipped" || m.line.kind === "closed") {
        this.toast(lineText(this.locale, this.chain, m));
      }
    }
    this.lastMessageCount = game.messages.length;
    if (this.desk && !game.held.has(`form:${this.desk.template}`)) this.closeForm();
    this.play?.update();
    if (game.over && !this.finishTimer) {
      this.store.saveRun(this.runId, {
        v: 1,
        seed: this.chain.seed,
        inputs: game.inputs,
        tick: game.tick,
        result: resultOf(game),
      });
      this.store.record(this.chain.dateKey, {
        finished: game.finishedAt !== null,
        ticks: game.elapsed,
      });
      // Let the final stamp land before the result screen.
      this.finishTimer = setTimeout(
        () => this.renderResult(),
        game.finishedAt !== null ? 2200 : 1500,
      );
    }
  }

  private toast(text: string): void {
    const el = h("div", { class: "toast", role: "status" }, text);
    this.toasts.append(el);
    setTimeout(() => el.remove(), 3500);
  }

  private save(force: boolean): void {
    if (!this.game) return;
    const now = this.perfNow();
    if (!force && now - this.lastSave < 1500) return;
    this.lastSave = now;
    const game = this.game;
    this.store.saveRun(this.runId, {
      v: 1,
      seed: this.chain.seed,
      inputs: game.inputs,
      tick: game.tick,
      result: game.over ? resultOf(game) : undefined,
    });
  }

  saveNow(): void {
    this.save(true);
  }

  openForm(template: string): void {
    if (!this.game) return;
    this.closeForm();
    this.desk = new Desk(this.context, template);
    this.root.append(this.desk.el);
    this.desk.focusFirst();
  }

  closeForm(): void {
    if (!this.desk) return;
    this.desk.el.remove();
    this.desk = null;
    this.play?.update();
    this.root.querySelector<HTMLElement>(`.folder button`)?.focus();
  }

  toggleLocale(): void {
    this.locale = this.locale === "en" ? "pt-BR" : "en";
    this.store.setLocale(this.locale);
    const openForm = this.desk?.template ?? null;
    this.closeForm();
    if (this.screen === "landing") this.renderLanding();
    else if (this.screen === "play") {
      this.renderPlay();
      if (openForm) this.openForm(openForm);
    } else this.renderResult();
  }

  showHow(): void {
    const locale = this.locale;
    const close = () => dialog.close?.();
    const dialog = h(
      "dialog",
      { class: "how", "aria-labelledby": "how-title" },
      h(
        "div",
        { class: "inner" },
        h("h2", { id: "how-title" }, t(locale, "how.title")),
        ["p1", "p2", "p3", "p4", "p5"].map((k) => h("p", null, t(locale, `how.${k}`))),
        h(
          "button",
          { class: "btn btn-primary", type: "button", onclick: close },
          t(locale, "how.close"),
        ),
      ),
    ) as HTMLDialogElement;
    dialog.addEventListener("close", () => dialog.remove());
    this.root.append(dialog);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  /** Test hook (only reachable with ?test=1): plays the rest of the run with the solver's route. */
  autoplay(): void {
    if (!this.game || this.game.over) return;
    const route = bestRoute(this.chain);
    this.game = simulate(this.chain, route.inputs, route.ticks + 1);
    if (this.screen === "play") this.renderPlay();
    this.afterChange();
  }

  private perfNow(): number {
    return (this.opts.perfNow ?? (() => performance.now()))();
  }

  /** Advances the game with real time. */
  tickFrame(): void {
    if (this.screen !== "play" || !this.game || this.game.over) return;
    const target =
      this.baseTick + Math.floor(((this.perfNow() - this.baseTime) * this.speed) / TICK_MS);
    if (target > this.game.tick) {
      this.game.advanceTo(target);
      this.afterChange();
      this.save(false);
    }
    this.play?.update();
  }

  private loop(): void {
    const raf = this.opts.raf ?? ((cb: (t: number) => void) => requestAnimationFrame(cb));
    const step = () => {
      this.tickFrame();
      raf(step);
    };
    raf(step);
  }
}
