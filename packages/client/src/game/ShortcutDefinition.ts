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
   OpenGovernment: {
      key: "1",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenTreasury: {
      key: "2",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenArmy: {
      key: "3",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenFamilyTree: {
      key: "4",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenTileUpgrades: {
      key: "5",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenInternalAffairs: {
      key: "6",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenSocialClass: {
      key: "7",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenProduction: {
      key: "8",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenTrade: {
      key: "9",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenSenate: {
      key: "0",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenMissions: {
      key: "q",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenChronicle: {
      key: "w",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenLegacyUpgrade: {
      key: "e",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   OpenRebirth: {
      key: "r",
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
   OpenGovernment: () => $t(L.OpenGovernment),
   OpenTreasury: () => $t(L.OpenTreasury),
   OpenArmy: () => $t(L.OpenArmy),
   OpenFamilyTree: () => $t(L.OpenFamilyTree),
   OpenTileUpgrades: () => $t(L.OpenTileUpgrades),
   OpenInternalAffairs: () => $t(L.OpenInternalAffairs),
   OpenSocialClass: () => $t(L.OpenSocialClass),
   OpenProduction: () => $t(L.OpenProduction),
   OpenTrade: () => $t(L.OpenTrade),
   OpenSenate: () => $t(L.OpenSenate),
   OpenMissions: () => $t(L.OpenMissions),
   OpenChronicle: () => $t(L.OpenChronicle),
   OpenLegacyUpgrade: () => $t(L.OpenLegacyUpgrade),
   OpenRebirth: () => $t(L.OpenRebirth),
} as const satisfies Record<Shortcut, () => string>;
