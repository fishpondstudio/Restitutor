import { $t, L } from "../../utils/i18n";

export const ScenarioFlags = {
   Christianity: () => $t(L.ReligionChristianity),
   Concubinage: () => $t(L.Concubinage),
   TKCharacter: () => $t(L.ThreeKingdomsCharacter),
   Senate: () => $t(L.Senate),
   ImperialCourt: () => $t(L.ImperialCourt),
} as const satisfies Record<string, () => string>;

export type ScenarioFlag = keyof typeof ScenarioFlags;
