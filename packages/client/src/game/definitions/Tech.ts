import { $t, L } from "../../utils/i18n";
import type { Building } from "./Building";
import type { Goods } from "./Goods";
import type { IBaseModifier, Modifier } from "./Modifier";
import type { TimedAction } from "./TimedAction";

export interface ITechDefinition {
   name: () => string;
   requires: Tech[];
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
   buildings?: Building[];
   goods?: Goods[];
   timedActions?: TimedAction[];
   upgrades?: Array<() => string>;
}

export class TechDefinitions {
   A1: ITechDefinition = {
      requires: [],
      name: () => $t(L.Infrastructure),
      timedActions: ["UpgradeInfrastructure"],
   } as const;

   A2: ITechDefinition = {
      requires: [],
      name: () => $t(L.Production),
      timedActions: ["UpgradeProduction"],
   } as const;

   A3: ITechDefinition = {
      requires: [],
      name: () => $t(L.Population),
      timedActions: ["UpgradePopulation"],
   } as const;

   B1: ITechDefinition = {
      requires: ["A1"],
      name: () => $t(L.TechAppeasement),
      timedActions: ["Appease", "CurryFavor"],
      goods: ["flour"],
   } as const;

   B2: ITechDefinition = {
      requires: ["A1", "A2", "A3"],
      name: () => $t(L.TechFormalTreaties),
      timedActions: ["DiplomaticTreaty", "DeterAggression", "GuaranteeDefense"],
      goods: ["milk"],
   } as const;

   B3: ITechDefinition = {
      requires: ["A3"],
      name: () => $t(L.TechHarshPacification),
      modifiers: {
         InfantryUnitPower: { type: "add", value: 1 },
      },
      timedActions: ["Crackdown"],
      goods: ["lumber"],
   } as const;

   C1: ITechDefinition = {
      requires: ["B1"],
      name: () => $t(L.BuildingTemple),
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
      timedActions: ["RecruitTalents"],
      buildings: ["Temple"],
   } as const;

   C2: ITechDefinition = {
      requires: ["B1", "B2"],
      name: () => $t(L.BuildingMarket),
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
         TradeProfit: { type: "multiply", value: 0.1 },
      },
      buildings: ["Market"],
      timedActions: ["DemandTribute"],
      goods: ["leather"],
   } as const;

   C3: ITechDefinition = {
      requires: ["B2", "B3"],
      name: () => $t(L.TechMercenaries),
      timedActions: ["HireMercenaries"],
      modifiers: {
         CavalryUnitPower: { type: "add", value: 1 },
      },
      buildings: ["ArmyCamp"],
      goods: ["ironIngots"],
   } as const;

   D1: ITechDefinition = {
      requires: ["C1", "C2"],
      name: () => $t(L.TechBreadAndCircuses),
      timedActions: ["HoldGames", "SummonGovernor"],
      buildings: ["Amphitheatre"],
      goods: ["bread"],
   } as const;

   D2: ITechDefinition = {
      requires: ["C2", "C3"],
      name: () => $t(L.TechPublicSpace),
      timedActions: ["DemandElectionBacking", "UpgradeRations", "Denounce"],
      buildings: ["TownSquare"],
      goods: ["cheese"],
   } as const;

   D3: ITechDefinition = {
      requires: ["C3"],
      name: () => $t(L.TechFortification),
      timedActions: ["ServiceWeapons"],
      buildings: ["Castra"],
      goods: ["weapon"],
      modifiers: {
         RangedUnitPower: { type: "add", value: 1 },
      },
   } as const;

   E1: ITechDefinition = {
      requires: ["D1", "D2"],
      name: () => $t(L.TechGovernmentReform),
      timedActions: ["AppointPontiff", "ReformCuria"],
      modifiers: {
         BuildingSlot: { type: "add", value: 1 },
      },
   } as const;

   E2: ITechDefinition = {
      requires: ["D2"],
      name: () => $t(L.TechCulturalEnvoys),
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
      timedActions: ["AppointEnvoy", "RenewVestments"],
      goods: ["garments"],
   } as const;

   E3: ITechDefinition = {
      requires: ["D2", "D3"],
      name: () => $t(L.TechBandedArmor),

      timedActions: ["AppointArmyStaff", "RefitArmor"],
      goods: ["armor"],
   } as const;

   F1: ITechDefinition = {
      requires: ["E1"],
      name: () => $t(L.TechLegalCodification),
      buildings: ["Courthouse"],
      modifiers: {
         ResearchCost: { type: "multiply", value: -0.1 },
      },
      timedActions: ["DissolveTreaty", "ExpandGrainDole"],
   } as const;

   F2: ITechDefinition = {
      requires: ["E2"],
      name: () => $t(L.TechDiplomaticMissions),
      modifiers: {
         Diplomat: { type: "add", value: 1 },
         DiplomaticRange: { type: "add", value: 5 },
         TradeProfit: { type: "multiply", value: 0.1 },
      },
      timedActions: ["AnnexClient", "SendAGift"],
   } as const;

   F3: ITechDefinition = {
      requires: ["E3"],
      name: () => $t(L.TechInfantryDrills),
      modifiers: {
         InfantryUnitPower: { type: "add", value: 1 },
      },
      timedActions: ["InciteUnrest", "PlunderWarTile"],
   } as const;

   G1: ITechDefinition = {
      requires: ["F1"],
      name: () => $t(L.TechUrbanPlanning),
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
         InfrastructureUpgradeCost: { type: "multiply", value: -0.2 },
      },
      buildings: ["CircusMaximus"],
      timedActions: ["PublicEnemy"],
   } as const;

   G2: ITechDefinition = {
      requires: ["F1", "F2"],
      name: () => $t(L.BuildingWorkshop),
      buildings: ["Workshop"],
      timedActions: ["DemandTile"],
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
         ProductionUpgradeCost: { type: "multiply", value: -0.2 },
      },
   } as const;

   G3: ITechDefinition = {
      requires: ["F2", "F3"],
      name: () => $t(L.TechAuxilia),
      modifiers: {
         PopulationUpgradeCost: { type: "multiply", value: -0.2 },
         RangedUnitPower: { type: "add", value: 1 },
      },
      buildings: ["Citadel"],
      timedActions: ["SubvertGarrison", "RequestMilitaryAid"],
   } as const;

   H1: ITechDefinition = {
      requires: ["G1"],
      name: () => $t(L.TechLandSurveying),
      modifiers: {
         BuildingSlot: { type: "add", value: 1 },
      },
      timedActions: ["GrantTaxRelief"],
      buildings: ["Forum"],
   } as const;

   H2: ITechDefinition = {
      requires: ["G2"],
      name: () => $t(L.TechMerchantGuilds),
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
         TradeProfit: { type: "multiply", value: 0.1 },
      },
      buildings: ["TradeDistrict"],
   } as const;

   H3: ITechDefinition = {
      requires: ["G3"],
      name: () => $t(L.TechArmyIntelligence),
      timedActions: ["UndermineTheirArmy"],
      buildings: ["Barracks"],
      modifiers: {
         CavalryUnitPower: { type: "add", value: 1 },
      },
   } as const;

   I1: ITechDefinition = {
      requires: ["H1"],
      name: () => $t(L.TechCivicEducation),
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
         MakeCoreCost: { type: "multiply", value: -0.2 },
         GoverningCapacity: { type: "add", value: 100 },
      },
   } as const;

   I2: ITechDefinition = {
      requires: ["H2"],
      name: () => $t(L.TechMaritimeTrade),
      buildings: ["Harbour"],
      modifiers: {
         DiplomaticRange: { type: "add", value: 5 },
         TradeCapacity: { type: "add", value: 1 },
         Prestige: { type: "multiply", value: 0.1 },
      },
   } as const;

   I3: ITechDefinition = {
      requires: ["H3"],
      name: () => $t(L.TechSupplyLogistics),
      modifiers: {
         InfantryUnitPower: { type: "add", value: 1 },
         WarPower: { type: "multiply", value: 0.1 },
      },
   } as const;
}

export type Tech = keyof TechDefinitions;
export const Tech = new TechDefinitions();
