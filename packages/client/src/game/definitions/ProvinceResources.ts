import { fromEntries, mapOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Goods } from "./Goods";

export const ProvinceResources = {
   administrative: [0, 0] as [number, number],
   diplomatic: [0, 0] as [number, number],
   military: [0, 0] as [number, number],
   gold: [300, 0] as [number, number],
   legacy: [0, 0] as [number, number],
   generalSkillPoint: [0, 0] as [number, number],
   consulPoint: [0, 0] as [number, number],
   christianity: [10, 0] as [number, number],
   islam: [0, 0] as [number, number],
   mandate: [0, 0] as [number, number],
   ...fromEntries(mapOf(Goods, (goods) => [goods, [0, 0] as [number, number]])),
} as const;

export const ProvinceResourceNames: Record<ProvinceResource, () => string> = {
   administrative: () => $t(L.AdministrativePoint),
   diplomatic: () => $t(L.DiplomaticPoint),
   military: () => $t(L.MilitaryPoint),
   gold: () => $t(L.Gold),
   legacy: () => $t(L.LegacyPoint),
   generalSkillPoint: () => $t(L.GeneralSkillPoint),
   consulPoint: () => $t(L.ConsulPoint),
   christianity: () => $t(L.ChristianInfluence),
   islam: () => $t(L.IslamicInfluence),
   mandate: () => $t(L.Mandate),
   ...fromEntries(mapOf(Goods, (goods, def) => [goods, () => def.name()])),
} as const;

export type GovernorPower = keyof Pick<ProvinceResources, "administrative" | "diplomatic" | "military">;
export type GovernorStats = Record<GovernorPower, number>;
export type ProvinceResource = keyof typeof ProvinceResources;
export type ProvinceResources = Record<ProvinceResource, [number, number]>;
export type ProvinceResourceCosts = Partial<Record<ProvinceResource, number>>;
