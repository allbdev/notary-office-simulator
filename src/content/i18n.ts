import type { Doc, WindowId } from "../core/docs";
import en, { type LocaleDict } from "./locales/en";
import ptBR from "./locales/pt-BR";

/** Two locales, English first. The locale changes words only, never the game. */
export type Locale = "en" | "pt-BR";
export const LOCALES: readonly Locale[] = ["en", "pt-BR"];
export const DEFAULT_LOCALE: Locale = "en";

export const DICTS: Record<Locale, LocaleDict> = { en, "pt-BR": ptBR };

export type Slots = Record<string, string | number>;

type Node = string | readonly string[] | { readonly [k: string]: Node };

function lookup(locale: Locale, key: string): Node | undefined {
  let node: Node | undefined = DICTS[locale] as unknown as Node;
  for (const part of key.split(".")) {
    if (node === undefined || typeof node === "string" || Array.isArray(node)) return undefined;
    node = (node as { readonly [k: string]: Node })[part];
  }
  return node;
}

export function fill(template: string, slots: Slots = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in slots ? String(slots[name]) : m,
  );
}

/** A string by dotted key. Missing keys show the key itself, so they're easy to spot. */
export function t(locale: Locale, key: string, slots: Slots = {}): string {
  const node = lookup(locale, key);
  if (typeof node === "string") return fill(node, slots);
  return key;
}

export function list(locale: Locale, key: string): readonly string[] {
  const node = lookup(locale, key);
  return Array.isArray(node) ? (node as readonly string[]) : [];
}

/** One variant of a line, chosen by the simulation's variant number. */
export function variant(locale: Locale, key: string, n: number, slots: Slots = {}): string {
  const options = list(locale, key);
  if (options.length === 0) return key;
  return fill(options[n % options.length]!, slots);
}

export function has(locale: Locale, key: string): boolean {
  return lookup(locale, key) !== undefined;
}

export function windowName(locale: Locale, id: WindowId): string {
  return t(locale, "common.window", { n: id });
}

/** Form names are printed in capitals on the form, and stay that way in sentences. */
export function formTitle(locale: Locale, template: string): string {
  return t(locale, `forms.${template}.title`);
}

/** A document's name in a sentence: "certified copy of Form 27-B, with filing stamp". */
export function docName(locale: Locale, doc: Doc, goal: string): string {
  switch (doc.kind) {
    case "start":
      return doc.id === "id" ? t(locale, "docs.id") : t(locale, `goals.${goal}.goalDoc`);
    case "form":
      return formTitle(locale, doc.template);
    case "auth":
      // An authenticated copy is always of a copy; name it after the original.
      if (doc.of.kind === "copy")
        return t(locale, "docs.auth", { doc: docName(locale, doc.of.of, goal) });
      return t(locale, "docs.auth", { doc: docName(locale, doc.of, goal) });
    default:
      return t(locale, `docs.${doc.kind}`, { doc: docName(locale, doc.of, goal) });
  }
}

/** "window 2, then window 4" */
export function routeText(locale: Locale, route: readonly WindowId[]): string {
  return route.map((w) => windowName(locale, w)).join(`, ${t(locale, "common.then")} `);
}

export function joinList(locale: Locale, items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${t(locale, "common.and")} ${items[items.length - 1]}`;
}

/** "19/11/2026" in pt-BR, "19 Nov 2026" in English. */
export function formatDate(locale: Locale, key: string): string {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  if (locale === "pt-BR") return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
