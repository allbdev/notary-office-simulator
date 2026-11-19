// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/ui/app";
import { Store, type KeyValueStore } from "../../src/ui/store";

function memory(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

let clock = 0;
function makeApp(store = new Store(memory())) {
  document.body.innerHTML = '<div id="app"></div>';
  const app = new App({
    root: document.getElementById("app")!,
    store,
    seed: "ui-test",
    date: "2026-11-19",
    raf: () => 0,
    perfNow: () => clock,
    clipboard: async () => {},
  });
  app.start();
  return app;
}

const button = (name: RegExp) =>
  [...document.querySelectorAll("button")].find((b) =>
    name.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
  );

/** Lets real time pass and runs a frame. */
function wait(app: App, ms: number) {
  clock += ms;
  app.tickFrame();
}

beforeEach(() => {
  clock = 0;
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
});

describe("app", () => {
  it("shows today's challenge on the landing page", () => {
    makeApp();
    expect(document.querySelector("h1")?.textContent).toBe("You only need one stamp.");
    expect(document.querySelector(".landing-ticket")?.textContent).toContain("Nº 1");
    expect(document.documentElement.lang).toBe("en");
  });

  it("plays: take a ticket, get called, hand in, receive the first requirement", () => {
    const app = makeApp();
    button(/Take a ticket/)!.click();
    expect(app.screen).toBe("play");
    const booth = button(/Take a ticket for Window 3/);
    expect(booth).toBeTruthy();
    booth!.click();
    expect(app.game!.where.kind).toBe("queue");
    for (let i = 0; i < 400 && app.game!.where.kind !== "window"; i++) wait(app, 500);
    expect(app.game!.where.kind).toBe("window");
    button(/Hand in what I have/)!.click();
    expect(app.game!.revealed.size).toBe(1);
    expect(document.querySelector(".folder")?.textContent).not.toBe("");
  });

  it("every booth and every form input has an accessible name", () => {
    const app = makeApp();
    button(/Take a ticket/)!.click();
    for (const b of document.querySelectorAll("button")) {
      expect((b.getAttribute("aria-label") ?? b.textContent ?? "").trim().length).toBeGreaterThan(
        0,
      );
    }
    // Reveal a form and open it.
    button(/Take a ticket for Window 3/)!.click();
    for (let i = 0; i < 400 && app.game!.where.kind !== "window"; i++) wait(app, 500);
    button(/Hand in/)!.click();
    const form = [...app.game!.forms.keys()][0];
    if (form) {
      app.openForm(form);
      for (const input of document.querySelectorAll<HTMLInputElement>(".desk input[type=text]")) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        expect(label?.textContent?.trim().length).toBeGreaterThan(0);
      }
      const first = document.querySelector<HTMLInputElement>(".desk input[type=text]");
      if (first) {
        first.value = "teste";
        first.dispatchEvent(new Event("input"));
        expect(Object.values(app.game!.forms.get(form)!.values)).toContain("teste");
      }
    }
  });

  it("switches language without losing the run", () => {
    const app = makeApp();
    button(/Take a ticket/)!.click();
    button(/Take a ticket for Window 2/)!.click();
    button(/Mudar para português/)!.click();
    expect(app.locale).toBe("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(app.game!.where.kind).toBe("queue");
    expect(document.body.textContent).toContain("na fila do Guichê 2");
  });

  it("resumes a run after a reload, and shows the result once finished", () => {
    const store = new Store(memory());
    const app = makeApp(store);
    button(/Take a ticket/)!.click();
    button(/Take a ticket for Window 1/)!.click();
    wait(app, 2000);
    app.saveNow();
    const tick = app.game!.tick;

    const again = makeApp(store);
    expect(button(/Back to the line/)).toBeTruthy();
    button(/Back to the line/)!.click();
    expect(again.game!.tick).toBe(tick);
    expect(again.game!.where.kind).not.toBe("hall");

    again.autoplay();
    expect(again.game!.over).toBe(true);
    again.renderResult();
    expect(document.querySelector("[data-testid=share]")?.textContent).toContain(
      "Cartório Simulator nº 1",
    );

    makeApp(store);
    expect(button(/See today's result/)).toBeTruthy();
  });

  it("a damaged saved run starts over instead of breaking the page", () => {
    const m = memory();
    m.setItem(
      "cartorio.run.practice.ui-test.2026-11-19",
      JSON.stringify({
        v: 1,
        seed: "x",
        tick: 50,
        inputs: [{ tick: 1, action: { type: "takeTicket", window: 99 } }],
      }),
    );
    const app = makeApp(new Store(m));
    button(/Back to the line|Take a ticket/)!.click();
    expect(app.screen).toBe("play");
    expect(app.game!.tick).toBe(0);
  });
});
