import { $t, L } from "../../utils/i18n";
import type { IBaseModifier, Modifier } from "./Modifier";

interface IBaseLegacyUpgradeDefinition {
   requires: LegacyUpgrade[];
   position: [number, number];
}

export interface ILegacyUpgradeModifier extends IBaseLegacyUpgradeDefinition {
   modifiers: Partial<Record<Modifier, IBaseModifier>>;
}

export interface ILegacyUpgradeDefinition extends IBaseLegacyUpgradeDefinition {
   name: () => string;
   desc: () => string;
}

export class LegacyUpgradeDefinitions {
   Administrative1: ILegacyUpgradeModifier = {
      requires: [],
      position: [0, 0],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative2: ILegacyUpgradeModifier = {
      requires: ["Administrative1"],
      position: [0, 1],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative3: ILegacyUpgradeModifier = {
      requires: ["Administrative2"],
      position: [0, 2],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative4: ILegacyUpgradeModifier = {
      requires: ["Administrative3"],
      position: [0, 3],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative5: ILegacyUpgradeModifier = {
      requires: ["Administrative4"],
      position: [0, 4],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Administrative6: ILegacyUpgradeModifier = {
      requires: ["Administrative5"],
      position: [0, 5],
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic1: ILegacyUpgradeModifier = {
      requires: ["Administrative1"],
      position: [1, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic2: ILegacyUpgradeModifier = {
      requires: ["Diplomatic1"],
      position: [2, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic3: ILegacyUpgradeModifier = {
      requires: ["Diplomatic2"],
      position: [3, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic4: ILegacyUpgradeModifier = {
      requires: ["Diplomatic3"],
      position: [4, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic5: ILegacyUpgradeModifier = {
      requires: ["Diplomatic4"],
      position: [5, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Diplomatic6: ILegacyUpgradeModifier = {
      requires: ["Diplomatic5"],
      position: [6, 0],
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   } as const;
   Military1: ILegacyUpgradeModifier = {
      requires: ["Administrative1"],
      position: [-1, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;

   Military2: ILegacyUpgradeModifier = {
      requires: ["Military1"],
      position: [-2, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Military3: ILegacyUpgradeModifier = {
      requires: ["Military2"],
      position: [-3, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Military4: ILegacyUpgradeModifier = {
      requires: ["Military3"],
      position: [-4, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Military5: ILegacyUpgradeModifier = {
      requires: ["Military4"],
      position: [-5, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   Military6: ILegacyUpgradeModifier = {
      requires: ["Military5"],
      position: [-6, 0],
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   } as const;
   GoverningCapacity1: ILegacyUpgradeModifier = {
      requires: ["Administrative2"],
      position: [1, 2],
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   } as const;
   GoverningCapacity2: ILegacyUpgradeModifier = {
      requires: ["GoverningCapacity1"],
      position: [2, 3],
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   } as const;
   Prestige1: ILegacyUpgradeModifier = {
      requires: ["Diplomatic1"],
      position: [2, -1],
      modifiers: {
         Prestige: { type: "add", value: 10 },
      },
   } as const;
   DiplomaticRange1: ILegacyUpgradeModifier = {
      requires: ["Prestige1"],
      position: [3, -1],
      modifiers: {
         DiplomaticRange: { type: "add", value: 5 },
      },
   } as const;
   ImproveRelationsRate1: ILegacyUpgradeModifier = {
      requires: ["Prestige1"],
      position: [3, -2],
      modifiers: {
         ImproveRelationsRate: { type: "multiply", value: 0.5 },
      },
   } as const;
   ProductionUpgrade1: ILegacyUpgradeModifier = {
      requires: ["Diplomatic1"],
      position: [2, 1],
      modifiers: {
         ProductionUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   InfiltrationOnDeclaringWar: ILegacyUpgradeDefinition = {
      name: () => $t(L.$1InfiltrationWhenDeclaringWar, "+25"),
      desc: () => $t(L.InfiltrationOnDeclaringWarDesc$1, "+25"),
      requires: ["ProductionUpgrade1"],
      position: [3, 1],
   } as const;
   InfiltrationRate1: ILegacyUpgradeModifier = {
      requires: ["ProductionUpgrade1"],
      position: [3, 2],
      modifiers: {
         InfiltrationRate: { type: "multiply", value: 0.5 },
      },
   } as const;
   TradeCapacity1: ILegacyUpgradeModifier = {
      requires: ["ProductionCapacity1"],
      position: [-1, -2],
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
      },
   } as const;
   TradeCapacity2: ILegacyUpgradeModifier = {
      requires: ["TradeCapacity1"],
      position: [-1, -3],
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
      },
   } as const;
   TileOutput1: ILegacyUpgradeModifier = {
      requires: ["ResearchCost1"],
      position: [2, -3],
      modifiers: {
         TileOutput: { type: "multiply", value: 0.1 },
      },
   } as const;
   LandTax1: ILegacyUpgradeModifier = {
      requires: ["ResearchCost1"],
      position: [1, -3],
      modifiers: {
         LandTax: { type: "multiply", value: 0.1 },
      },
   } as const;
   TradeProfitForAttitude: ILegacyUpgradeDefinition = {
      name: () => $t(L.$1TradeProfitPerPositiveAttitude, "+1%"),
      desc: () => $t(L.AttitudeTradeProfit$1, "1%"),
      requires: ["TradeProfit1"],
      position: [-2, -4],
   } as const;
   ResearchCost1: ILegacyUpgradeModifier = {
      requires: ["ProductionCapacity1"],
      position: [1, -2],
      modifiers: {
         ResearchCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   BuildingSlot1: ILegacyUpgradeModifier = {
      requires: ["LandTax1"],
      position: [1, -4],
      modifiers: {
         BuildingSlot: { type: "add", value: 1 },
      },
   } as const;
   MakeCore1: ILegacyUpgradeModifier = {
      requires: ["Administrative3", "GoverningCapacity1"],
      position: [1, 3],
      modifiers: {
         MakeCoreCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   InfrastructureUpgrade1: ILegacyUpgradeModifier = {
      requires: ["Stability1", "Administrative3"],
      position: [-1, 3],
      modifiers: {
         InfrastructureUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
   Stability1: ILegacyUpgradeModifier = {
      requires: ["Administrative2"],
      position: [-1, 2],
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   } as const;
   Stability2: ILegacyUpgradeModifier = {
      requires: ["Stability1"],
      position: [-2, 3],
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   } as const;
   ProductionCapacity1: ILegacyUpgradeModifier = {
      requires: ["Administrative1"],
      position: [0, -1],
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   ProductionCapacity2: ILegacyUpgradeModifier = {
      requires: ["ProductionCapacity1"],
      position: [0, -2],
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   ProductionCapacity3: ILegacyUpgradeModifier = {
      requires: ["ProductionCapacity2"],
      position: [0, -3],
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   ProductionCapacity4: ILegacyUpgradeModifier = {
      requires: ["ProductionCapacity3"],
      position: [0, -4],
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   } as const;
   TradeProfit1: ILegacyUpgradeModifier = {
      requires: ["TradeCapacity1"],
      position: [-2, -3],
      modifiers: {
         TradeProfit: { type: "multiply", value: 0.1 },
      },
   } as const;
   ArmyMaintenance1: ILegacyUpgradeModifier = {
      requires: ["Military1"],
      position: [-2, 1],
      modifiers: {
         ArmyMaintenance: { type: "multiply", value: -0.1 },
      },
   } as const;
   InfantryUnitPower1: ILegacyUpgradeModifier = {
      requires: ["ArmyMaintenance1", "Military2"],
      position: [-3, 1],
      modifiers: {
         InfantryUnitPower: { type: "add", value: 1 },
      },
   } as const;
   RangedUnitPower1: ILegacyUpgradeModifier = {
      requires: ["ArmyMaintenance1"],
      position: [-3, 2],
      modifiers: {
         RangedUnitPower: { type: "add", value: 1 },
      },
   } as const;
   CavalryUnitPower1: ILegacyUpgradeModifier = {
      requires: ["Military2", "PopulationUpgrade1"],
      position: [-3, -1],
      modifiers: {
         CavalryUnitPower: { type: "add", value: 1 },
      },
   } as const;
   CavalryUnitPower2: ILegacyUpgradeModifier = {
      requires: ["CavalryUnitPower1"],
      position: [-4, -1],
      modifiers: {
         CavalryUnitPower: { type: "add", value: 1 },
      },
   } as const;
   WarScore1: ILegacyUpgradeModifier = {
      requires: ["PopulationUpgrade1"],
      position: [-3, -2],
      modifiers: {
         WarScore: { type: "multiply", value: -0.1 },
      },
   } as const;
   TruceDuration1: ILegacyUpgradeModifier = {
      requires: ["WarScore1"],
      position: [-4, -2],
      modifiers: {
         TruceDuration: { type: "multiply", value: -0.2 },
      },
   } as const;
   PopulationUpgrade1: ILegacyUpgradeModifier = {
      requires: ["Military1"],
      position: [-2, -1],
      modifiers: {
         PopulationUpgradeCost: { type: "multiply", value: -0.1 },
      },
   } as const;
}

export type LegacyUpgrade = keyof LegacyUpgradeDefinitions;
export const LegacyUpgrades = new LegacyUpgradeDefinitions();
