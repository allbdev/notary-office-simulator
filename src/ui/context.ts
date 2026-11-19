import type { Chain } from "../core/chain";
import type { Action, Game } from "../core/game";
import type { Locale } from "../content/i18n";

/** What a screen needs from the app. */
export interface PlayContext {
  locale: Locale;
  chain: Chain;
  game: Game;
  dispatch(action: Action): void;
  openForm(template: string): void;
  closeForm(): void;
  toggleLocale(): void;
  showHow(): void;
}
