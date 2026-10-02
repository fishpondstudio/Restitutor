import { $t, L } from "../../utils/i18n";

export const ProvinceNameOverrides = {
   GallicEmpire: () => $t(L.GallicEmpire),
   WesternRomanEmpire: () => $t(L.ProvinceWesternRomanEmpire),
   EasternRomanEmpire: () => $t(L.ProvinceEasternRomanEmpire),
   AlpineConfederation: () => $t(L.ProvinceAlpineConfederation),
   Illyria: () => $t(L.ProvinceIllyria),
   DanubianAlliance: () => $t(L.ProvinceDanubianAlliance),
   HellenicLeague: () => $t(L.ProvinceHellenicLeague),
   BalkanEmpire: () => $t(L.ProvinceBalkanEmpire),
   GraeciaEmpire: () => $t(L.ProvinceGraeciaEmpire),
   HunnicEmpire: () => $t(L.ProvinceHunnicEmpire),
   AnatolianLeague: () => $t(L.ProvinceAnatolianLeague),
   LevantineLeague: () => $t(L.ProvinceLevantineLeague),
   EgyptianKingdom: () => $t(L.ProvinceEgyptianKingdom),
} as const satisfies Record<string, () => string>;

export type ProvinceNameOverride = keyof typeof ProvinceNameOverrides;
