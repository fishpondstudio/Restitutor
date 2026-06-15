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
   Administrative2: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: 0, y: 1 },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative3: ILegacyUpgradeDefinition = {
      requires: ["Administrative2"],
      position: { x: 0, y: 2 },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   GoverningCapacity1: ILegacyUpgradeDefinition = {
      requires: ["Administrative2"],
      position: { x: 1, y: 2 },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   } as const;
   Prestige1: ILegacyUpgradeDefinition = {
      requires: ["Diplomatic1"],
      position: { x: 2, y: -1 },
      modifiers: {
         Prestige: { type: "add", value: 10 },
      },
   } as const;
   ProductionUpgrade1: ILegacyUpgradeDefinition = {
      requires: ["Diplomatic1"],
      position: { x: 2, y: 1 },
      modifiers: {
         ProductionUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   Diplomatic2: ILegacyUpgradeDefinition = {
      requires: ["Diplomatic1"],
      position: { x: 2, y: 0 },
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic3: ILegacyUpgradeDefinition = {
      requires: ["Diplomatic2"],
      position: { x: 3, y: 0 },
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   TradeCapacity1: ILegacyUpgradeDefinition = {
      requires: ["ProductionCapacity1"],
      position: { x: 0, y: -2 },
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
      },
   } as const;
   TileOutput1: ILegacyUpgradeDefinition = {
      requires: ["TradeCapacity1"],
      position: { x: 0, y: -3 },
      modifiers: {
         TileOutput: { type: "multiply", value: 0.1 },
      },
   } as const;
   LandTax1: ILegacyUpgradeDefinition = {
      requires: ["TradeCapacity1", "TradeProfit1"],
      position: { x: -1, y: -3 },
      modifiers: {
         LandTax: { type: "multiply", value: 0.1 },
      },
   } as const;
   ResearchCost1: ILegacyUpgradeDefinition = {
      requires: ["ProductionCapacity1"],
      position: { x: 1, y: -2 },
      modifiers: {
         ResearchCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   BuildingSlot1: ILegacyUpgradeDefinition = {
      requires: ["ResearchCost1", "TradeCapacity1"],
      position: { x: 1, y: -3 },
      modifiers: {
         BuildingSlot: { type: "add", value: 1 },
      },
   } as const;
   MakeCore1: ILegacyUpgradeDefinition = {
      requires: ["Administrative3", "GoverningCapacity1"],
      position: { x: 1, y: 3 },
      modifiers: {
         MakeCoreCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   InfrastructureUpgrade1: ILegacyUpgradeDefinition = {
      requires: ["Administrative2"],
      position: { x: -1, y: 2 },
      modifiers: {
         InfrastructureUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   AdvisorCost1: ILegacyUpgradeDefinition = {
      requires: ["InfrastructureUpgrade1", "Administrative3"],
      position: { x: -1, y: 3 },
      modifiers: {
         AdvisorCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   ProductionCapacity1: ILegacyUpgradeDefinition = {
      requires: ["Administrative1"],
      position: { x: 0, y: -1 },
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   TradeProfit1: ILegacyUpgradeDefinition = {
      requires: ["ProductionCapacity1"],
      position: { x: -1, y: -2 },
      modifiers: {
         TradeProfit: { type: "multiply", value: 0.1 },
      },
   } as const;
   ArmyMaintenance1: ILegacyUpgradeDefinition = {
      requires: ["Military1"],
      position: { x: -2, y: 1 },
      modifiers: {
         ArmyMaintenance: { type: "multiply", value: -0.1 },
      },
   } as const;
   InfantryUnitPower1: ILegacyUpgradeDefinition = {
      requires: ["ArmyMaintenance1", "Military2"],
      position: { x: -3, y: 1 },
      modifiers: {
         InfantryUnitPower: { type: "add", value: 1 },
      },
   } as const;
   RangedUnitPower1: ILegacyUpgradeDefinition = {
      requires: ["ArmyMaintenance1"],
      position: { x: -3, y: 2 },
      modifiers: {
         RangedUnitPower: { type: "add", value: 1 },
      },
   } as const;
   CavalryUnitPower1: ILegacyUpgradeDefinition = {
      requires: ["Military2", "PopulationUpgrade1"],
      position: { x: -3, y: -1 },
      modifiers: {
         CavalryUnitPower: { type: "add", value: 1 },
      },
   } as const;
   PopulationUpgrade1: ILegacyUpgradeDefinition = {
      requires: ["Military1"],
      position: { x: -2, y: -1 },
      modifiers: {
         PopulationUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   Military2: ILegacyUpgradeDefinition = {
      requires: ["Military1"],
      position: { x: -2, y: 0 },
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Military3: ILegacyUpgradeDefinition = {
      requires: ["Military2"],
      position: { x: -3, y: 0 },
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
}

export type LegacyUpgrade = keyof LegacyUpgradeDefinitions;
export const LegacyUpgrades = new LegacyUpgradeDefinitions();
