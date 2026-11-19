import type { Chain } from "../core/chain";
import { formatCountdown } from "../core/clock";
import { FINAL_WINDOW, chainOf, docKey, producer, type WindowId } from "../core/docs";
import type { Line, Message, WindowStatus } from "../core/game";
import { docName, joinList, routeText, t, variant, windowName, type Locale } from "../content/i18n";

/** Turns simulation state into words. Kept out of the screens so it can be tested on its own. */

export function ticketLabel(n: number): string {
  return `A${String(n % 1000).padStart(3, "0")}`;
}

export function lineText(locale: Locale, chain: Chain, message: Message): string {
  const line: Line = message.line;
  const n = message.variant;
  const name = (d: Parameters<typeof docName>[1]) => docName(locale, d, chain.goal);
  switch (line.kind) {
    case "called":
      return variant(locale, "lines.called", n, {
        ticket: ticketLabel(line.ticket),
        window: windowName(locale, message.window ?? FINAL_WINDOW),
      });
    case "reveal": {
      const slots = { doc: name(line.doc), route: routeText(locale, line.route) };
      if (line.forms.length > 0 && line.route.length > 0)
        return variant(locale, "lines.revealForm", n, slots);
      if (line.forms.length > 0) return variant(locale, "lines.revealFormOnly", n, slots);
      return variant(locale, "lines.reveal", n, slots);
    }
    case "stillMissing":
      return variant(locale, "lines.stillMissing", n, { doc: name(line.doc) });
    case "final":
      return variant(locale, "lines.final", n);
    case "done":
      return variant(locale, "lines.done", n, { docs: joinList(locale, line.docs.map(name)) });
    case "notHere":
      return variant(locale, "lines.notHere", n);
    case "needInput":
      return variant(locale, "lines.needInput", n, {
        doc: name(line.doc),
        input: name(line.input),
      });
    case "needCopyNotOriginal":
      return variant(locale, "lines.needCopyNotOriginal", n);
    case "formInvalid":
      return `${t(locale, `forms.${line.form}.title`)}: ${t(locale, `forms.${line.form}.fields.${line.field}.refusal`)}`;
    case "fieldOrder":
      return `${t(locale, `forms.${line.form}.title`)}: ${variant(locale, "lines.fieldOrder", n)}`;
    case "bluePen":
      return `${t(locale, `forms.${line.form}.title`)}: ${variant(locale, "lines.bluePen", n)}`;
    case "jam":
      return variant(locale, "lines.jam", n);
    case "closed":
      return variant(locale, "lines.closed", n, { window: windowName(locale, line.window) });
    case "skipped":
      return variant(locale, "lines.skipped", n, { window: windowName(locale, line.window) });
    case "cartorioClosed":
      return variant(locale, "lines.cartorioClosed", n);
  }
}

export type StatusTone = "good" | "wait" | "off" | "you";

export function statusText(
  locale: Locale,
  status: WindowStatus,
  queue: number,
  tick: number,
  closesAt: number,
  closesSoonTicks = 900,
): { text: string; tone: StatusTone } {
  switch (status.kind) {
    case "closed":
      return { text: t(locale, "hall.closed"), tone: "off" };
    case "systemDown":
      return { text: t(locale, "hall.systemDown"), tone: "off" };
    case "outOfInk":
      return {
        text: t(locale, "hall.outOfInk", { time: formatCountdown(status.until - tick) }),
        tone: "wait",
      };
    case "break":
      return {
        text: t(locale, status.reason === "lunch" ? "hall.lunch" : "hall.coffee", {
          time: formatCountdown(status.until - tick),
        }),
        tone: "off",
      };
    case "open":
      if (closesAt - tick <= closesSoonTicks) {
        return {
          text: t(locale, "hall.closesIn", { time: formatCountdown(closesAt - tick) }),
          tone: "wait",
        };
      }
      return {
        text: queue === 0 ? t(locale, "hall.openEmpty") : t(locale, "hall.open", { n: queue }),
        tone: queue >= 4 ? "wait" : "good",
      };
  }
}

/** Where a form goes when filled: the window that uses it next (window 3 if it goes straight in). */
export function formDestination(chain: Chain, template: string): WindowId {
  for (const req of chain.requirements) {
    const nodes = chainOf(req);
    const i = nodes.findIndex((n) => docKey(n) === `form:${template}`);
    if (i < 0) continue;
    const next = nodes[i + 1];
    return next ? (producer(next) ?? FINAL_WINDOW) : FINAL_WINDOW;
  }
  return FINAL_WINDOW;
}

/** A refusal is shown with the red stamp; information is amber; a stamp you earned is blue. */
export function lineTone(line: Line): "good" | "info" | "bad" {
  switch (line.kind) {
    case "final":
    case "done":
      return "good";
    case "reveal":
    case "called":
    case "jam":
    case "skipped":
      return "info";
    default:
      return "bad";
  }
}
