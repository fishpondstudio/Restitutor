import type { Modifier } from "./Modifier";

export interface ILegacyUpgrade {
   modifierType: "add" | "multiply";
   modifierValue: number;
}

export const _LegacyUpgrades = {
   AdministrativePoint: {
      modifierType: "add",
      modifierValue: 1,
   },
   DiplomaticPoint: {
      modifierType: "add",
      modifierValue: 1,
   },
   MilitaryPoint: {
      modifierType: "add",
      modifierValue: 1,
   },
   GoverningCapacity: {
      modifierType: "add",
      modifierValue: 100,
   },
   Stability: {
      modifierType: "add",
      modifierValue: 10,
   },
   Prestige: {
      modifierType: "add",
      modifierValue: 10,
   },
   TradeCapacity: {
      modifierType: "add",
      modifierValue: 1,
   },
   ProductionCapacity: {
      modifierType: "add",
      modifierValue: 1,
   },
} as const satisfies Partial<Record<Modifier, ILegacyUpgrade>>;

export type LegacyUpgrade = keyof typeof _LegacyUpgrades;
export const LegacyUpgrades = _LegacyUpgrades as Record<LegacyUpgrade, ILegacyUpgrade>;
