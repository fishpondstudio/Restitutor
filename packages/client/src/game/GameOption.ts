import type { CountryCode } from "@project/shared/src/utils/CountryCode";
import { uuid4, type ValueOf } from "@project/shared/src/utils/Helper";
import type { ChronicleEntryType } from "./definitions/Chronicle";
import { SupportedSaveVersion } from "./definitions/Constant";
import type { Languages } from "./Languages";
import { DefaultShortcuts } from "./ShortcutDefinition";

export const GameOptionFlag = {
   None: 0,
   AlwaysShowChat: 1 << 0,
   PauseGameOnEvent: 1 << 1,
   HideTutorial: 1 << 2,
   HideSteamDiscordButton: 1 << 3,
   CollapseTutorial: 1 << 4,
   ShowAllMissions: 1 << 5,
};

export type GameOptionFlag = ValueOf<typeof GameOptionFlag>;

export class GameOption {
   country: keyof typeof CountryCode = "EARTH";
   chatLanguages: Set<keyof typeof Languages> = new Set(["en"]);
   language: keyof typeof Languages = "en";
   flag: GameOptionFlag = GameOptionFlag.None;
   chronicleALerts: Set<ChronicleEntryType> = new Set();
   volume = 1;
   shortcuts = DefaultShortcuts;
   version = SupportedSaveVersion;
   build = 0;
   chroniclePopupFrequency = 5;
   id = uuid4();
}
