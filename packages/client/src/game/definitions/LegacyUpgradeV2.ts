import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { IBaseModifier, Modifier } from "./Modifier";

export interface ILegacyUpgradeDefinition {
   requires: LegacyUpgrade[];
   position: IHaveXY;
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
   provinceUpgrades?: ProvinceUpgrade[];
}

export class LegacyUpgradeDefinitions {
   Administrative1: ILegacyUpgradeDefinition = {
      requires: [],
      position: { x: 0, y: 0 },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic1: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: 1, y: 0 },
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Military1: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: -1, y: 0 },
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Stability1: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: 0, y: 1 },
      modifiers: {
         Stability: { type: "add", value: 5 },
      },
   } as const;
   GoverningCapacity1: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: 0, y: -1 },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   } as const;
   Prestige1: ILegacyUpgradeDefinition = {
      requires: ["Diplomatic1"],
      position: { x: 2, y: 0 },
      modifiers: {
         Prestige: { type: "add", value: 10 },
      },
   } as const;
   TradeCapacity1: ILegacyUpgradeDefinition = {
      requires: ["GoverningCapacity1"],
      position: { x: 0, y: -2 },
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
      },
   } as const;
   ProductionCapacity1: ILegacyUpgradeDefinition = {
      requires: ["Stability1"],
      position: { x: 0, y: 2 },
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   BuildingSlot1: ILegacyUpgradeDefinition = {
      requires: ["Military1"],
      position: { x: -2, y: 0 },
      modifiers: {
         BuildingSlot: { type: "add", value: 1 },
      },
   } as const;
}

export type LegacyUpgrade = keyof LegacyUpgradeDefinitions;
export const LegacyUpgrades = new LegacyUpgradeDefinitions();
