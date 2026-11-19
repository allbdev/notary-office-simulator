import type { WindowId } from "../core/docs";

/**
 * The five windows. Each has a fixed mania so regulars learn it; the seed shuffles hours and
 * requirements. Names, roles, manias and rules are in the locale files under `windows.<id>`.
 */
export interface WindowSpec {
  id: WindowId;
  /** Average real seconds to serve one person. */
  serviceSeconds: number;
  /** Average real seconds between people arriving. */
  arrivalSeconds: number;
}

export const WINDOWS: readonly WindowSpec[] = [
  { id: 1, serviceSeconds: 9, arrivalSeconds: 11 },
  { id: 2, serviceSeconds: 6, arrivalSeconds: 7.5 },
  { id: 3, serviceSeconds: 10, arrivalSeconds: 12 },
  { id: 4, serviceSeconds: 9, arrivalSeconds: 11 },
  { id: 5, serviceSeconds: 9, arrivalSeconds: 11 },
];

/** Window 2's copier jams on every Nth copy. */
export const JAM_EVERY = 4;

export function windowSpec(id: WindowId): WindowSpec {
  return WINDOWS[id - 1]!;
}
