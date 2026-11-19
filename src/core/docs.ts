/**
 * Documents and how they're made. A requirement is a small tree: an authenticated copy of a
 * protocolled form is auth(copy(protocol(form))). Each node above a leaf is made at one window.
 */

export type WindowId = 1 | 2 | 3 | 4 | 5;
export const WINDOW_IDS: readonly WindowId[] = [1, 2, 3, 4, 5];

/** Window 3 (Firmas) gives the final stamp. */
export const FINAL_WINDOW: WindowId = 3;

export type StartDocId = "id" | "goal";

export type Doc =
  | { kind: "start"; id: StartDocId }
  | { kind: "form"; template: string }
  | { kind: "protocol"; of: Doc }
  | { kind: "copy"; of: Doc }
  | { kind: "auth"; of: Doc }
  | { kind: "paid"; of: Doc };

export const start = (id: StartDocId): Doc => ({ kind: "start", id });
export const form = (template: string): Doc => ({ kind: "form", template });
export const protocol = (of: Doc): Doc => ({ kind: "protocol", of });
export const copy = (of: Doc): Doc => ({ kind: "copy", of });
export const auth = (of: Doc): Doc => ({ kind: "auth", of });
export const paid = (of: Doc): Doc => ({ kind: "paid", of });

/** A stable string for a document: "auth(copy(start:id))". */
export function docKey(doc: Doc): string {
  switch (doc.kind) {
    case "start":
      return `start:${doc.id}`;
    case "form":
      return `form:${doc.template}`;
    default:
      return `${doc.kind}(${docKey(doc.of)})`;
  }
}

/** The window that makes this document, or null for leaves (start documents and forms). */
export function producer(doc: Doc): WindowId | null {
  switch (doc.kind) {
    case "protocol":
      return 1;
    case "copy":
      return 2;
    case "auth":
      return 4;
    case "paid":
      return 5;
    default:
      return null;
  }
}

export function inputOf(doc: Doc): Doc | null {
  return doc.kind === "start" || doc.kind === "form" ? null : doc.of;
}

/** The leaf at the bottom of a requirement. */
export function baseOf(doc: Doc): Doc {
  const input = inputOf(doc);
  return input ? baseOf(input) : doc;
}

/** Every node from the leaf up to the document itself. */
export function chainOf(doc: Doc): Doc[] {
  const input = inputOf(doc);
  return input ? [...chainOf(input), doc] : [doc];
}

/** The windows a requirement passes through, in order: auth(copy(id)) → [2, 4]. */
export function routeOf(doc: Doc): WindowId[] {
  return chainOf(doc)
    .map(producer)
    .filter((w): w is WindowId => w !== null);
}

/** Copying keeps the original; every other step consumes its input. */
export function consumesInput(doc: Doc): boolean {
  return doc.kind !== "copy";
}

/** The form templates a requirement needs. */
export function formsIn(doc: Doc): string[] {
  const base = baseOf(doc);
  return base.kind === "form" ? [base.template] : [];
}
