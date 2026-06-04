import { $t, L } from "../utils/i18n";

export interface IShortcutConfig {
   key: string;
   ctrl: boolean;
   alt: boolean;
   shift: boolean;
   meta: boolean;
}

export const DefaultShortcuts = {
   Pause: {
      key: " ",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   CloseOpenModal: {
      key: "Escape",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   IncreaseGameSpeed: {
      key: "=",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   DecreaseGameSpeed: {
      key: "-",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
} as const satisfies Record<string, IShortcutConfig>;

export type Shortcut = keyof typeof DefaultShortcuts;

export const Shortcut = {
   Pause: () => $t(L.PauseResumeGame),
   CloseOpenModal: () => $t(L.CloseCurrentlyOpenModal),
   IncreaseGameSpeed: () => $t(L.IncreaseGameSpeed),
   DecreaseGameSpeed: () => $t(L.DecreaseGameSpeed),
} as const satisfies Record<Shortcut, () => string>;
