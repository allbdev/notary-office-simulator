import type { Chain } from "../core/chain";
import { formatDate, t, type Locale } from "../content/i18n";
import { h } from "./dom";

export type LandingState = "new" | "resume" | "done";

export interface LandingProps {
  locale: Locale;
  chain: Chain;
  state: LandingState;
  streak: number;
  onStart(): void;
  onHow(): void;
}

/** Board 1: the goal of the day on a queue ticket. */
export function landing(p: LandingProps): HTMLElement {
  const { locale, chain } = p;
  const docs = chain.requirements.length + 2;
  const startLabel =
    p.state === "done"
      ? "landing.seeResult"
      : p.state === "resume"
        ? "landing.resume"
        : "landing.take";
  return h(
    "main",
    { class: "landing" },
    h(
      "section",
      null,
      h("span", { class: "sign" }, "Cartório Simulator"),
      h("p", { class: "label", style: { margin: "14px 0 0" } }, t(locale, "landing.kicker")),
      h("h1", null, t(locale, "landing.title")),
      h("p", { class: "subtitle" }, t(locale, "landing.subtitle")),
      h("p", { class: "body" }, t(locale, "landing.body")),
      h(
        "div",
        { class: "actions" },
        h(
          "button",
          { class: "btn btn-primary", type: "button", onclick: p.onStart, "data-testid": "start" },
          t(locale, startLabel),
        ),
        h("button", { class: "btn", type: "button", onclick: p.onHow }, t(locale, "landing.how")),
      ),
      h("p", { class: "small", style: { margin: "0" } }, t(locale, "landing.small")),
      p.streak > 0
        ? h(
            "p",
            { class: "streak" },
            p.streak === 1
              ? t(locale, "landing.streakOne")
              : t(locale, "landing.streak", { n: p.streak }),
          )
        : null,
    ),
    h(
      "aside",
      { class: "ticket landing-ticket", "aria-label": t(locale, "landing.yourTicket") },
      h("span", { class: "office" }, t(locale, "landing.office")),
      h("span", { class: "small" }, t(locale, "landing.yourTicket")),
      h("span", { class: "big" }, t(locale, "landing.number", { number: chain.number })),
      h(
        "span",
        { class: "small" },
        t(locale, "landing.dateLine", { date: formatDate(locale, chain.dateKey) }),
      ),
      h("hr"),
      h(
        "strong",
        { style: { fontSize: "14px" } },
        t(locale, "landing.todayLine", {
          goal: t(locale, `goals.${chain.goal}.title`).toUpperCase(),
        }),
      ),
      h("span", { class: "small" }, t(locale, "landing.countLine", { docs })),
      h("span", { class: "small" }, t(locale, "landing.lunchLine")),
      h("hr"),
      h("span", { class: "small" }, t(locale, "landing.wait")),
      h("span", { class: "small" }, t(locale, "landing.orNot")),
    ),
  );
}
