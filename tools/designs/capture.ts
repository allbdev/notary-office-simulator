/**
 * Captures every screen board of the design canvas from the real game, so the mockups match it.
 * Needs a running build: `npm run build && npm run preview`, then in another terminal
 * `npm run designs [-- --url=http://localhost:4173 --out=/tmp/boards]`.
 * Writes PNGs per locale (en/, pt-BR/) named after the canvas boards; upload them to the canvas
 * and refresh designs/*.jpg (see designs/README.md).
 */
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const arg = (name: string, fallback: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const URL_BASE = arg("url", "http://localhost:4173");
const OUT = arg("out", "design-captures");
const LOCALES = ["en", "pt-BR"] as const;

type Hook = { __cartorio: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function open(browser: Browser, locale: string, seed: string, viewport = { width: 1280, height: 720 }, mobile = false): Promise<Page> {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript((l) => localStorage.setItem("cartorio.locale", JSON.stringify(l)), locale);
  const page = await ctx.newPage();
  await page.goto(`${URL_BASE}/?test=1&speed=40&seed=${seed}&date=2026-11-19`);
  await page.evaluate(() => document.fonts.ready);
  // Toasts are momentary; keep them out of the boards.
  await page.addStyleTag({ content: ".toast-area { display: none !important; }" });
  return page;
}

/** A seed whose first requirement goes through window 1 with a form (for the form and sent-back boards). */
async function findSeed(browser: Browser, test: string): Promise<string> {
  const page = await open(browser, "en", "probe");
  for (let i = 0; i < 300; i++) {
    const seed = `board${i}`;
    await page.goto(`${URL_BASE}/?test=1&seed=${seed}&date=2026-11-19`);
    const ok = await page.evaluate(new Function(`const c = window.__cartorio.chain; return (${test})(c);`) as () => boolean);
    if (ok) {
      await page.context().close();
      return seed;
    }
  }
  throw new Error(`No seed found for ${test}`);
}

const waitWindow = (page: Page) =>
  page.waitForFunction(() => (window as unknown as Hook).__cartorio.game.where.kind === "window", null, { timeout: 60_000 });

async function shot(page: Page, locale: string, name: string) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: join(OUT, locale, `${name}.png`) });
}

async function screens(browser: Browser, locale: string, formSeed: string, eventSeed: string) {
  const t = (en: string, pt: string) => (locale === "en" ? en : pt);
  let page = await open(browser, locale, formSeed);
  await shot(page, locale, "Main");
  await page.getByTestId("start").click();
  await page.evaluate(() => {
    // A busier hall than 11:00 sharp: let a minute of cartório life pass.
    const a = (window as unknown as Hook).__cartorio;
    a.game.advanceTo(a.game.tick + 120);
  });
  await shot(page, locale, "Hall");
  await page.getByRole("button", { name: new RegExp(t("Take a ticket for Window 3", "Retirar senha para o Guichê 3")) }).last().click();
  await page.evaluate(() => (window as unknown as Hook).__cartorio.dispatch({ type: "setPen", pen: "black" }));
  await waitWindow(page);
  await page.getByRole("button", { name: t("Hand in what I have", "Entregar o que tenho") }).click();
  await shot(page, locale, "Window");
  await page.getByRole("button", { name: t("Back to the hall", "Voltar ao saguão") }).click();
  // The form as you get it: blank.
  const form = await page.evaluate(() => [...(window as unknown as Hook).__cartorio.game.forms.keys()][0] as string);
  await page.evaluate((f) => (window as unknown as Hook).__cartorio.openForm(f), form);
  await shot(page, locale, "Form");
  await page.getByRole("button", { name: t("Put it back in the folder", "Guardar na pasta") }).click();
  await page.getByRole("button", { name: new RegExp(t("Take a ticket for Window 1", "Retirar senha para o Guichê 1")) }).last().click();
  await waitWindow(page);
  await page.getByRole("button", { name: t("Hand in what I have", "Entregar o que tenho") }).click();
  await shot(page, locale, "SentBack");
  await page.evaluate(() => (window as unknown as Hook).__cartorio.autoplay());
  await page.waitForSelector("[data-testid=share]", { timeout: 15_000 });
  await shot(page, locale, "Result");
  await page.context().close();

  // Waiting in line: the busiest window, clock stopped for the picture.
  page = await open(browser, locale, formSeed);
  await page.getByTestId("start").click();
  await page.evaluate(() => {
    const a = (window as unknown as Hook).__cartorio;
    a.paused = true;
    let best = 1;
    for (const w of [1, 2, 3, 4, 5]) if (a.game.queueLength(w) > a.game.queueLength(best)) best = w;
    a.dispatch({ type: "takeTicket", window: best });
  });
  await shot(page, locale, "Queue");
  await page.context().close();

  page = await open(browser, locale, eventSeed);
  await page.getByTestId("start").click();
  await page.evaluate(() => {
    const a = (window as unknown as Hook).__cartorio;
    const e = a.chain.events.find((x: { kind: string }) => x.kind === "systemDown");
    a.game.advanceTo(e.start + 60);
  });
  await shot(page, locale, "Event");
  await page.context().close();
}

async function phones(browser: Browser, locale: string, formSeed: string) {
  const t = (en: string, pt: string) => (locale === "en" ? en : pt);
  const page = await open(browser, locale, formSeed, { width: 390, height: 844 }, true);
  await page.getByTestId("start").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, locale, "phone-hall.png") });
  await page.getByRole("button", { name: new RegExp(t("Take a ticket for Window 3", "Retirar senha para o Guichê 3")) }).last().click();
  await waitWindow(page);
  await page.getByRole("button", { name: t("Hand in what I have", "Entregar o que tenho") }).click();
  await page.getByRole("button", { name: t("Back to the hall", "Voltar ao saguão") }).click();
  const form = await page.evaluate(() => [...(window as unknown as Hook).__cartorio.game.forms.keys()][0] as string);
  await page.evaluate((f) => (window as unknown as Hook).__cartorio.openForm(f), form);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, locale, "phone-form.png") });
  await page.keyboard.press("Escape");
  await page.evaluate(() => (window as unknown as Hook).__cartorio.autoplay());
  await page.waitForSelector("[data-testid=share]", { timeout: 15_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, locale, "phone-result.png") });
  await page.context().close();

  // The "Phone layouts" board: the three phones side by side, at board size.
  const board = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
  const img = (f: string) => `data:image/png;base64,${readFileSync(join(OUT, locale, f)).toString("base64")}`;
  await board.setContent(`<body style="margin:0;background:#b7b3a0;display:flex;gap:56px;justify-content:center;align-items:center;height:1000px">
    ${["phone-hall.png", "phone-form.png", "phone-result.png"].map((f) => `<img src="${img(f)}" style="width:390px;border:10px solid #1c1d1a;border-radius:28px;box-shadow:0 14px 34px rgba(0,0,0,.32)">`).join("")}
  </body>`);
  await board.screenshot({ path: join(OUT, locale, "Mobile.png") });
  await board.close();
}

const browser = await chromium.launch();

// The link-preview image (Open Graph), from the English landing page.
{
  const page = await open(browser, "en", "og", { width: 1200, height: 630 });
  await page.addStyleTag({ content: ".topbar, .landing > section > .small { display: none !important; } .landing { padding-top: 0; min-height: 630px; }" });
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: join(OUT, "og.png") });
  await page.context().close();
}
const formSeed = await findSeed(browser, "(c) => c.requirements[0].kind === 'protocol' && c.requirements[0].of.kind === 'form' && c.pen === 'blue'");
const eventSeed = await findSeed(browser, "(c) => c.events.some((e) => e.kind === 'systemDown')");
for (const locale of LOCALES) {
  mkdirSync(join(OUT, locale), { recursive: true });
  await screens(browser, locale, formSeed, eventSeed);
  await phones(browser, locale, formSeed);
  console.log(`${locale}: done`);
}
await browser.close();
console.log(`Seeds: form ${formSeed}, event ${eventSeed}. Captures in ${OUT}/`);
