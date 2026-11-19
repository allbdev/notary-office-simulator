import type { Rng } from "./rng";

/**
 * The player's fictional identity for the day, printed on their ID card. Generated from the seed;
 * the game never asks for or stores real personal data.
 */
export interface Profile {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  /** "V. Barros": what the ID card shows as the signature. */
  signature: string;
  motherName: string;
  /** "123.456.789-09", with valid check digits. */
  cpf: string;
  rg: string;
  /** Day, month, year. */
  birth: { day: number; month: number; year: number };
  street: string;
  number: number;
  cep: string;
  city: string;
}

const FIRST = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Eduarda",
  "Fábio",
  "Gisele",
  "Heitor",
  "Iara",
  "João",
  "Kátia",
  "Luís",
  "Marta",
  "Nilton",
  "Otávia",
  "Paulo",
  "Rosa",
  "Sérgio",
  "Tânia",
  "Vânia",
  "Wagner",
  "Zuleica",
];
const MIDDLE = [
  "Aparecida",
  "Benedito",
  "Conceição",
  "Dorival",
  "Expedito",
  "Fátima",
  "Graça",
  "Hermínio",
  "Lourdes",
  "Raimundo",
];
const LAST = [
  "Almeida",
  "Barros",
  "Cardoso",
  "Duarte",
  "Esteves",
  "Fontes",
  "Guimarães",
  "Holanda",
  "Medeiros",
  "Nogueira",
  "Pacheco",
  "Queiroz",
  "Rezende",
  "Siqueira",
  "Teixeira",
  "Vasconcelos",
];
const MOTHER_FIRST = ["Maria", "Joana", "Aurora", "Cleusa", "Dirce", "Neide", "Odete", "Zélia"];
const STREETS = [
  "Rua das Acácias",
  "Rua do Carimbo Torto",
  "Avenida Brasil",
  "Travessa do Protocolo",
  "Rua Sete de Setembro",
  "Rua da Fila Única",
  "Alameda dos Guichês",
  "Rua Treze de Maio",
];
const CITIES = ["São Paulo", "Recife", "Belo Horizonte", "Curitiba", "Salvador", "Belém"];

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((acc, d, i) => acc + d * (weightStart - i), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/**
 * Eleven digits with valid CPF check digits, and at least one even digit (form 27-B asks for the
 * even digits only, so there must be some).
 */
export function makeCpfDigits(rng: Rng): string {
  for (;;) {
    const base = Array.from({ length: 9 }, () => rng.int(0, 9));
    if (base.every((d) => d === base[0])) base[8] = (base[8]! + 1) % 10;
    const d1 = cpfCheckDigit(base);
    const d2 = cpfCheckDigit([...base, d1]);
    const digits = [...base, d1, d2];
    if (digits.some((d) => d % 2 === 0)) return digits.join("");
  }
}

export function isValidCpfDigits(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  const nums = Array.from(digits, Number);
  if (nums.every((d) => d === nums[0])) return false;
  return (
    cpfCheckDigit(nums.slice(0, 9)) === nums[9] && cpfCheckDigit(nums.slice(0, 10)) === nums[10]
  );
}

export function formatCpf(digits: string): string {
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function makeProfile(rng: Rng): Profile {
  const firstName = rng.pick(FIRST);
  const middleName = rng.pick(MIDDLE);
  const lastName = rng.pick(LAST);
  const rgDigits = Array.from({ length: 9 }, () => rng.int(0, 9)).join("");
  const cepDigits = Array.from({ length: 8 }, () => rng.int(0, 9)).join("");
  return {
    firstName,
    middleName,
    lastName,
    fullName: `${firstName} ${middleName} ${lastName}`,
    signature: `${firstName[0]}. ${lastName}`,
    motherName: `${rng.pick(MOTHER_FIRST)} ${rng.pick(MIDDLE)} ${lastName}`,
    cpf: formatCpf(makeCpfDigits(rng)),
    rg: `${rgDigits.slice(0, 2)}.${rgDigits.slice(2, 5)}.${rgDigits.slice(5, 8)}-${rgDigits[8]}`,
    birth: { day: rng.int(1, 28), month: rng.int(1, 12), year: rng.int(1962, 2004) },
    street: rng.pick(STREETS),
    number: rng.int(12, 1999),
    cep: `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}`,
    city: rng.pick(CITIES),
  };
}

/** Age on a given date. */
export function ageOn(profile: Profile, on: { year: number; month: number; day: number }): number {
  const { birth } = profile;
  let age = on.year - birth.year;
  if (on.month < birth.month || (on.month === birth.month && on.day < birth.day)) age--;
  return age;
}

/** The same person, renamed: name fields, signature and the mother's surname follow the new name. */
export function withName(profile: Profile, fullName: string): Profile {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2)
    throw new RangeError(`A name needs a first name and a surname: ${fullName}`);
  const firstName = parts[0]!;
  const lastName = parts[parts.length - 1]!;
  const motherParts = profile.motherName.split(" ");
  motherParts[motherParts.length - 1] = lastName;
  return {
    ...profile,
    firstName,
    middleName: parts.slice(1, -1).join(" "),
    lastName,
    fullName: parts.join(" "),
    signature: `${firstName[0]}. ${lastName}`,
    motherName: motherParts.join(" "),
  };
}
