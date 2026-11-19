/** Lenient text comparison for form answers: case, accents and spacing don't matter. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[\s]+/g, " ")
    .trim();
}

/** Letters and digits only, normalized. "Vinícius A. Barros" → "viniciusabarros". */
export function compact(text: string): string {
  return normalize(text).replace(/[^a-z0-9]/g, "");
}

export function digitsOf(text: string): string {
  return text.replace(/\D/g, "");
}

export function words(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0);
}

export function reverse(text: string): string {
  return Array.from(text).reverse().join("");
}
