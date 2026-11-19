import { formatClock, parseClock } from "./clock";
import { ageOn, type Profile } from "./profile";
import { compact, digitsOf, normalize, reverse, words } from "./text";

/**
 * Field rules. Every form field has one. They're data (so content files can declare them), and
 * each has a matching `solve` that produces a valid answer, which the solver and tests use.
 */
export type ProfileKey =
  | "fullName"
  | "firstName"
  | "lastName"
  | "motherName"
  | "signature"
  | "cpf"
  | "rg"
  | "cep"
  | "address"
  | "birth";

export type Transform =
  "none" | "reverse" | "upper" | "evenDigits" | "initials" | "digits" | "birthYearFirst";

export type Validator =
  | { type: "nonEmpty"; minWords?: number }
  | { type: "empty" }
  | { type: "profile"; key: ProfileKey; transform?: Transform }
  /** Must keep the CPF's punctuation exactly ("123.456.789-09"). */
  | { type: "formattedCpf" }
  | { type: "notContains"; phrases: string[]; minWords: number }
  | { type: "noLetter"; letter: string; minWords: number }
  | { type: "number"; parity?: "odd" | "even"; min?: number; max?: number }
  | { type: "oneOf"; answers: string[] }
  /** Today's date in digits, any common order. */
  | { type: "todayDigits" }
  /** The wall-clock time when the form is handed in, within a tolerance. */
  | { type: "clockNow"; toleranceMinutes: number }
  /** Amount written without "," or "." (e.g. 0,37 → "0 37" or "037"). */
  | { type: "amountNoSeparators"; cents: number }
  | { type: "digitsOnly"; minLength: number }
  | { type: "checks"; mustCheck: string[]; options: string[] }
  | { type: "differs"; from: string[] }
  | { type: "equalsPrinted"; printed: string }
  | { type: "ageNextBirthday" };

export interface ValidationContext {
  profile: Profile;
  /** The challenge date. */
  today: { year: number; month: number; day: number };
  /** Wall-clock seconds when the form is handed in. */
  clockNow: number;
  /** The form's other values, for rules that compare fields. */
  values: Readonly<Record<string, string>>;
}

/** Checkbox groups store the ticked option ids joined by "|". */
export function parseChecks(value: string): string[] {
  return value
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function joinChecks(ids: readonly string[]): string {
  return [...ids].sort().join("|");
}

function profileValue(profile: Profile, key: ProfileKey): string {
  switch (key) {
    case "address":
      return `${profile.street}, ${profile.number}`;
    case "birth": {
      const { day, month, year } = profile.birth;
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }
    default:
      return profile[key];
  }
}

function initials(name: string): string {
  return words(name)
    .map((w) => w[0])
    .join("");
}

function birthYearFirstDigits(profile: Profile): string {
  const { day, month, year } = profile.birth;
  return `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

/** The expected answer for a profile rule, in the form the player would write it. */
export function profileAnswer(profile: Profile, key: ProfileKey, transform: Transform): string {
  const raw = profileValue(profile, key);
  switch (transform) {
    case "none":
      return raw;
    case "reverse":
      return reverse(raw);
    case "upper":
      return raw.toUpperCase();
    case "digits":
      return digitsOf(raw);
    case "evenDigits":
      return Array.from(digitsOf(raw))
        .filter((d) => Number(d) % 2 === 0)
        .join("");
    case "initials":
      return initials(raw).toUpperCase();
    case "birthYearFirst":
      return birthYearFirstDigits(profile);
  }
}

function profileMatches(value: string, ctx: ValidationContext, key: ProfileKey, t: Transform) {
  const expected = profileAnswer(ctx.profile, key, t);
  switch (t) {
    case "upper":
      // Block letters: case matters here, and only here.
      return (
        value.trim().length > 0 &&
        value === value.toUpperCase() &&
        compact(value) === compact(expected)
      );
    case "digits":
    case "evenDigits":
    case "birthYearFirst":
      return digitsOf(value) === expected && digitsOf(value).length > 0;
    case "initials":
      return compact(value) === compact(expected);
    default:
      return compact(value) === compact(expected) && compact(value).length > 0;
  }
}

function todayVariants(today: ValidationContext["today"]): string[] {
  const d = String(today.day).padStart(2, "0");
  const m = String(today.month).padStart(2, "0");
  const y = String(today.year);
  return [`${d}${m}${y}`, `${y}${m}${d}`, `${m}${d}${y}`, `${d}${m}${y.slice(2)}`];
}

export function isValid(validator: Validator, value: string, ctx: ValidationContext): boolean {
  switch (validator.type) {
    case "nonEmpty":
      return words(value).length >= (validator.minWords ?? 1);
    case "empty":
      return value.trim() === "";
    case "profile":
      return profileMatches(value, ctx, validator.key, validator.transform ?? "none");
    case "formattedCpf":
      return value.replace(/\s/g, "") === ctx.profile.cpf;
    case "notContains": {
      const n = normalize(value);
      return (
        words(value).length >= validator.minWords &&
        validator.phrases.every((p) => !n.includes(normalize(p)))
      );
    }
    case "noLetter":
      return (
        words(value).length >= validator.minWords &&
        !normalize(value).includes(validator.letter.toLowerCase())
      );
    case "number": {
      const t = value.trim();
      if (!/^\d+$/.test(t)) return false;
      const n = Number(t);
      if (validator.min !== undefined && n < validator.min) return false;
      if (validator.max !== undefined && n > validator.max) return false;
      if (validator.parity === "odd" && n % 2 !== 1) return false;
      if (validator.parity === "even" && n % 2 !== 0) return false;
      return true;
    }
    case "oneOf":
      return validator.answers.some((a) => compact(a) === compact(value));
    case "todayDigits":
      return todayVariants(ctx.today).includes(digitsOf(value));
    case "clockNow": {
      const t = parseClock(value);
      if (t === null) return false;
      return Math.abs(t - ctx.clockNow) <= validator.toleranceMinutes * 60;
    }
    case "amountNoSeparators": {
      if (/[.,]/.test(value)) return false;
      const d = digitsOf(value);
      return d.length > 0 && Number(d) === validator.cents;
    }
    case "digitsOnly":
      return /^\d+$/.test(value.trim()) && value.trim().length >= validator.minLength;
    case "checks": {
      const ticked = parseChecks(value);
      return joinChecks(ticked) === joinChecks(validator.mustCheck);
    }
    case "differs": {
      if (words(value).length === 0) return false;
      return validator.from.every((id) => compact(ctx.values[id] ?? "") !== compact(value));
    }
    case "equalsPrinted":
      return compact(value) === compact(validator.printed);
    case "ageNextBirthday":
      return value.trim() === String(ageOn(ctx.profile, ctx.today) + 1);
  }
}

/** A valid answer. Used by the solver and by tests that prove every rule can be satisfied. */
export function solve(validator: Validator, ctx: ValidationContext): string {
  switch (validator.type) {
    case "nonEmpty":
      return Array.from(
        { length: validator.minWords ?? 1 },
        (_, i) => ["sim", "senhor", "obrigado"][i % 3],
      ).join(" ");
    case "empty":
      return "";
    case "profile":
      return profileAnswer(ctx.profile, validator.key, validator.transform ?? "none");
    case "formattedCpf":
      return ctx.profile.cpf;
    case "notContains":
      return Array.from({ length: validator.minWords }, () => "vontade").join(" ");
    case "noLetter":
      return Array.from({ length: validator.minWords }, () => "por isso")
        .join(" ")
        .split(" ")
        .slice(0, validator.minWords)
        .join(" ");
    case "number": {
      let n = validator.min ?? 1;
      if (validator.parity === "odd" && n % 2 === 0) n++;
      if (validator.parity === "even" && n % 2 === 1) n++;
      return String(n);
    }
    case "oneOf":
      return validator.answers[0]!;
    case "todayDigits": {
      const { day, month, year } = ctx.today;
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }
    case "clockNow":
      return formatClock(ctx.clockNow);
    case "amountNoSeparators":
      return `${Math.floor(validator.cents / 100)} ${String(validator.cents % 100).padStart(2, "0")}`;
    case "digitsOnly":
      return "1".repeat(validator.minLength);
    case "checks":
      return joinChecks(validator.mustCheck);
    case "differs":
      return `${initials(ctx.profile.fullName)} ${validator.from.length + 1} ${"x".repeat(validator.from.length + 1)}`;
    case "equalsPrinted":
      return validator.printed;
    case "ageNextBirthday":
      return String(ageOn(ctx.profile, ctx.today) + 1);
  }
}
