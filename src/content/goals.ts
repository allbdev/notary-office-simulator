/**
 * The procedure of the day. Text lives in the locale files under `goals.<id>`: title, goalDoc
 * (the document you arrive with), body (the declaration shown stamped at the end) and stamp.
 */
export interface Goal {
  id: string;
  /** Whether the document you arrive with can be copied (you can't photocopy yourself). */
  goalDocCopyable: boolean;
}

export const GOALS: readonly Goal[] = [
  { id: "signature", goalDocCopyable: true },
  { id: "residence", goalDocCopyable: true },
  { id: "attorney", goalDocCopyable: true },
  { id: "alive", goalDocCopyable: false },
  { id: "nothing", goalDocCopyable: true },
  { id: "parking", goalDocCopyable: true },
];
