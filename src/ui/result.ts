import type { Chain } from "../core/chain";
import { formatDuration } from "../core/clock";
import type { Visit } from "../core/game";
import { shareText, type RunResult } from "../core/result";
import { bestRoute } from "../core/solver";
import { t, type Locale } from "../content/i18n";
import { h } from "./dom";
import { stamp } from "./stamp";

export interface ResultProps {
  locale: Locale;
  chain: Chain;
  result: RunResult;
  visits: Visit[];
  url: string;
  copy(text: string): Promise<boolean>;
}

function pathList(locale: Locale, visits: { window: number; outcome: string }[]): HTMLElement {
  const word: Record<string, string> = { resolved: "✓", info: "!", refused: "✗" };
  return h(
    "ol",
    { class: "path" },
    visits.map((v) =>
      h(
        "li",
        { class: v.outcome, title: v.outcome },
        h(
          "span",
          { "aria-hidden": "true" },
          `${t(locale, "common.windowShort", { n: v.window })} ${word[v.outcome]}`,
        ),
        h(
          "span",
          { class: "sr-only" },
          `${t(locale, "common.window", { n: v.window })}: ${v.outcome}`,
        ),
      ),
    ),
  );
}

export function shareFor(locale: Locale, result: RunResult, url: string): string {
  const time = formatDuration(result.ticks);
  return shareText(result, {
    title: t(locale, "result.share", { number: result.number }),
    stats: result.finished
      ? t(locale, "result.shareStats", { time, forms: result.forms, back: result.sendBacks })
      : t(locale, "result.shareFailed", { forms: result.forms, back: result.sendBacks }),
    url,
  });
}

/** Board 8: the stamped declaration, the numbers, your path, and the text to paste. */
export function resultScreen(p: ResultProps): HTMLElement {
  const { locale, chain, result } = p;
  const goal = `goals.${chain.goal}`;
  const share = shareFor(locale, result, p.url);
  const status = h("p", {
    "aria-live": "polite",
    style: { margin: "0", fontWeight: "700", minHeight: "1.4em" },
  });
  const idealBox = h("div", { hidden: true });
  const idealBtn = h("button", { class: "btn", type: "button" }, t(locale, "result.ideal"));
  idealBtn.addEventListener("click", () => {
    if (idealBox.hidden) {
      if (!idealBox.firstChild) {
        const best = bestRoute(chain);
        idealBox.append(
          h("p", { class: "label", style: { margin: "0 0 6px" } }, t(locale, "result.idealTitle")),
          pathList(locale, best.visits),
          h(
            "p",
            { style: { margin: "6px 0 0" } },
            t(locale, "result.idealTime", { time: formatDuration(best.ticks) }),
          ),
        );
      }
      idealBox.hidden = false;
      idealBtn.textContent = t(locale, "result.hideIdeal");
    } else {
      idealBox.hidden = true;
      idealBtn.textContent = t(locale, "result.ideal");
    }
  });

  const declaration = h(
    "article",
    { class: "declaration paper" },
    h("div", { class: "label", style: { textAlign: "center" } }, t(locale, "form.office")),
    h("h2", null, t(locale, "result.declaration")),
    h("p", { class: "body" }, t(locale, `${goal}.body`)),
    h("div", { class: "signed" }, chain.profile.signature),
    h("div", { class: "sigline" }, t(locale, "result.signedBy")),
    result.finished
      ? stamp(t(locale, `${goal}.stamp`), t(locale, `${goal}.stampSub`), {
          rotate: -8,
          width: 250,
          animate: true,
        })
      : stamp(t(locale, "stamps.refused"), t(locale, "result.failedTitle").toUpperCase(), {
          color: "red",
          rotate: -10,
          width: 250,
          animate: true,
        }),
  );

  const stat = (label: string, value: string | number) =>
    h(
      "div",
      { class: "paper" },
      h("span", { class: "label" }, label),
      h("span", { class: "value" }, value),
    );

  return h(
    "main",
    { class: "result" },
    declaration,
    h(
      "section",
      { class: "result-side" },
      h(
        "span",
        { class: "label" },
        t(locale, result.finished ? "result.done" : "result.failed", { number: result.number }),
      ),
      h("h1", null, result.finished ? t(locale, `${goal}.done`) : t(locale, "result.failedTitle")),
      result.finished ? null : h("p", { style: { margin: "0" } }, t(locale, "result.failedBody")),
      h(
        "div",
        { class: "stats" },
        stat(t(locale, "result.time"), formatDuration(result.ticks)),
        stat(t(locale, "result.forms"), result.forms),
        stat(t(locale, "result.sendBacks"), result.sendBacks),
      ),
      h(
        "div",
        null,
        h("p", { class: "label", style: { margin: "0 0 6px" } }, t(locale, "result.path")),
        pathList(locale, p.visits),
        h(
          "p",
          {
            class: "label",
            style: { margin: "6px 0 0", textTransform: "none", letterSpacing: "0" },
          },
          t(locale, "result.legend"),
        ),
      ),
      h("pre", { class: "share", "data-testid": "share" }, share),
      h(
        "div",
        { class: "actions-row" },
        h(
          "button",
          {
            class: "btn btn-primary",
            type: "button",
            onclick: async () => {
              const ok = await p.copy(share);
              status.textContent = t(locale, ok ? "result.copied" : "result.copyFailed");
            },
          },
          t(locale, "result.copy"),
        ),
        idealBtn,
      ),
      status,
      idealBox,
      h("p", { class: "tomorrow", style: { margin: "0" } }, t(locale, "result.tomorrow")),
    ),
  );
}
