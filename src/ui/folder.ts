import { chainOf, docKey, producer, type WindowId } from "../core/docs";
import { docName, t, windowName } from "../content/i18n";
import type { PlayContext } from "./context";
import { h, icon } from "./dom";

/** "Sua pasta": what window 3 has asked for so far, what you brought, your forms and your pen. */

export function idCard(ctx: PlayContext, open = false): HTMLElement {
  const { locale } = ctx;
  const p = ctx.chain.profile;
  const birth = `${String(p.birth.day).padStart(2, "0")}/${String(p.birth.month).padStart(2, "0")}/${p.birth.year}`;
  const row = (key: string, value: string, cls = "") => [
    h("dt", null, t(locale, `folder.${key}`)),
    h("dd", { class: cls }, value),
  ];
  return h(
    "details",
    { class: "id", open },
    h("summary", null, t(locale, "folder.idCard")),
    h(
      "dl",
      { class: "id-card" },
      row("idName", p.fullName),
      row("idCpf", p.cpf),
      row("idRg", p.rg),
      row("idBirth", birth),
      row("idMother", p.motherName),
      row("idAddress", `${p.street}, ${p.number}`),
      row("idCep", p.cep),
      row("idSignature", p.signature, "sig"),
    ),
  );
}

function routeChips(ctx: PlayContext, index: number): HTMLElement | null {
  const req = ctx.chain.requirements[index]!;
  const nodes = chainOf(req).filter((n) => producer(n) !== null);
  if (nodes.length === 0) return null;
  const next = ctx.game.nextWindowFor(index);
  let passedNext = false;
  const chips = nodes.map((n, i) => {
    const w = producer(n) as WindowId;
    const done =
      ctx.game.held.has(docKey(n)) ||
      chainOf(req)
        .slice(chainOf(req).indexOf(n))
        .some((m) => ctx.game.held.has(docKey(m)));
    const isNext = !passedNext && w === next && !done;
    if (isNext) passedNext = true;
    return [
      i > 0 ? icon("arrow") : null,
      h(
        "span",
        { class: done ? "past" : isNext ? "next" : "" },
        t(ctx.locale, "common.windowShort", { n: w }),
      ),
    ];
  });
  return h("span", { class: "route" }, chips);
}

export function folderPanel(ctx: PlayContext): HTMLElement {
  const { locale, game, chain } = ctx;
  const items: HTMLElement[] = [];
  chain.requirements.forEach((req, i) => {
    const state = game.requirementState(i);
    if (state === "unknown") return;
    items.push(
      h(
        "li",
        { class: `req ${state}` },
        icon(state === "done" ? "check" : "circle"),
        h("span", { class: "name" }, docName(locale, req, chain.goal)),
        routeChips(ctx, i),
      ),
    );
  });
  const unknown = chain.requirements.some((_, i) => game.requirementState(i) === "unknown");

  const forms = [...game.forms.values()].filter((f) => game.held.has(`form:${f.template}`));
  const formRows = forms.map((f) => {
    const started = Object.values(f.values).some((v) => v.trim() !== "");
    return h(
      "div",
      { class: "form-row" },
      h(
        "span",
        null,
        t(locale, `forms.${f.template}.title`),
        h("span", { class: "state" }, t(locale, started ? "folder.filled" : "folder.toFill")),
      ),
      h(
        "button",
        { class: "btn btn-small", type: "button", onclick: () => ctx.openForm(f.template) },
        t(locale, started ? "folder.view" : "folder.fill"),
      ),
    );
  });

  const pen = h(
    "fieldset",
    { class: "pen-toggle", style: { border: "0", padding: "0", margin: "0" } },
    h("legend", { class: "label" }, t(locale, "folder.penLabel")),
    (["blue", "black"] as const).map((p) =>
      h(
        "label",
        null,
        h("input", {
          type: "radio",
          name: "pen",
          value: p,
          checked: game.pen === p,
          onchange: () => ctx.dispatch({ type: "setPen", pen: p }),
        }),
        h("span", {
          class: "swatch",
          style: { background: p === "blue" ? "var(--pen)" : "var(--ink)" },
        }),
        t(locale, `folder.${p}`),
      ),
    ),
  );

  return h(
    "section",
    { class: "folder paper", "aria-label": t(locale, "folder.title") },
    h("h2", { class: "label", style: { margin: "0" } }, t(locale, "folder.title")),
    items.length > 0 ? h("ul", null, items) : null,
    unknown ? h("p", { class: "note", style: { margin: "0" } }, t(locale, "folder.more")) : null,
    formRows.length > 0 ? h("div", { class: "section" }, formRows) : null,
    h(
      "div",
      { class: "section" },
      h("span", { class: "label" }, t(locale, "folder.brought")),
      h("div", { class: "form-row" }, docName(locale, { kind: "start", id: "goal" }, chain.goal)),
      idCard(ctx),
    ),
    h("div", { class: "section" }, pen),
    h("p", { class: "note", style: { margin: "0" } }, t(locale, "folder.hint")),
  );
}

export function windowLabel(ctx: PlayContext, w: WindowId): string {
  return windowName(ctx.locale, w);
}
