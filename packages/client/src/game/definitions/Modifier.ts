import { forEach, formatDelta, formatNumber, formatPercentDelta, safePush } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { ProvinceUpgrades } from "../actions/ProvinceUpgrades";
import { GameStateUpdated } from "../Events";
import { LegacyUpgrades } from "./LegacyUpgrade";
import { Tech } from "./Tech";

export interface IBaseModifier {
   type: "add" | "multiply";
   value: number;
}

export interface IModifier extends IBaseModifier {
   name: string;
   duration?: number;
}

interface IModifierDefinition {
   name: () => string;
   desc: () => string;
}

export const Modifiers = {
   AdministrativePoint: {
      name: () => $t(L.MonthlyAdministrativePoint),
      desc: () => "",
   },
   DiplomaticPoint: {
      name: () => $t(L.MonthlyDiplomaticPoint),
      desc: () => "",
   },
   MilitaryPoint: {
      name: () => $t(L.MonthlyMilitaryPoint),
      desc: () => "",
   },
   WarPower: {
      name: () => $t(L.WarPower),
      desc: () => $t(L.WarPowerMeasuresHowWellOurProvincePerformsInWars),
   },
   Stability: {
      name: () => $t(L.Stability),
      desc: () => $t(L.ModifierStabilityDesc),
   },
   Prestige: {
      name: () => $t(L.Prestige),
      desc: () => $t(L.ModifierPrestigeDesc),
   },
   GoverningCapacity: {
      name: () => $t(L.GoverningCapacity),
      desc: () => $t(L.ModifierGoverningCapacityDesc),
   },
   Defense: {
      name: () => $t(L.Defense),
      desc: () => $t(L.ModifierDefenseDesc),
   },
   Manpower: {
      name: () => $t(L.Manpower),
      desc: () => $t(L.ManpowerFormsTheBasePoolFromWhichOurStandingArmyIsConscripted),
   },
   LandTax: {
      name: () => $t(L.LandTax),
      desc: () => $t(L.LandTaxIsDeterminedPrimarilyByTheTilesInfrastructureLevel),
   },
   TileOutput: {
      name: () => $t(L.TileOutput),
      desc: () => $t(L.TileOutputIsDeterminedPrimarilyByTheTilesProductionLevel),
   },
   TileMaintenance: {
      name: () => $t(L.TileMaintenance),
      desc: () => $t(L.MaintenanceIsDeterminedPrimarilyByTheTilesUnrestLevel),
   },
   ArmyMaintenance: {
      name: () => $t(L.ArmyMaintenance),
      desc: () => $t(L.ArmyMaintenanceIsTheCostOfMaintainingOurStandingArmy),
   },
   BuildingSlot: {
      name: () => $t(L.BuildingSlot),
      desc: () => $t(L.EachBuildingOnATileRequiresABuildingSlot),
   },
   Diplomat: {
      name: () => $t(L.Diplomat),
      desc: () => $t(L.ModifierDiplomatDesc),
   },
   DiplomaticRange: {
      name: () => $t(L.DiplomaticRange),
      desc: () => $t(L.ModifierDiplomaticRangeDesc),
   },
   TradeCapacity: {
      name: () => $t(L.TradeCapacity),
      desc: () => $t(L.TradeCapacityDeterminesTheAmountOfGoodsExchangedInEachTrade),
   },
   TradeProfit: {
      name: () => $t(L.TradeProfit),
      desc: () => $t(L.TradeProfitIsTheProfitWeMakeFromEachTrade),
   },
   ProductionCapacity: {
      name: () => $t(L.ProductionCapacity),
      desc: () => $t(L.ProductionCapacityIsTheTotalProductionCapabilityOfOurProvince),
   },
   AdvisorCost: {
      name: () => $t(L.AdvisorCost),
      desc: () => $t(L.AdvisorCostDesc),
   },
   ResearchCost: {
      name: () => $t(L.ResearchCost),
      desc: () => $t(L.ModifierResearchCostDesc),
   },
   MakeCoreCost: {
      name: () => $t(L.MakeCoreCost),
      desc: () => $t(L.ModifierMakeCoreCostDesc),
   },
   InfantryUnitPower: {
      name: () => $t(L.InfantryUnitPower),
      desc: () => $t(L.InfantryUnitPowerIsTheWarPowerOfEachInfantryUnit),
   },
   RangedUnitPower: {
      name: () => $t(L.RangedUnitPower),
      desc: () => $t(L.RangedUnitPowerIsTheWarPowerOfEachRangedUnit),
   },
   CavalryUnitPower: {
      name: () => $t(L.CavalryUnitPower),
      desc: () => $t(L.CavalryUnitPowerIsTheWarPowerOfEachCavalryUnit),
   },
   InfrastructureUpgradeCost: {
      name: () => $t(L.InfrastructureUpgradeCost),
      desc: () => $t(L.ModifierInfrastructureUpgradeCostDesc),
   },
   ProductionUpgradeCost: {
      name: () => $t(L.ProductionUpgradeCost),
      desc: () => $t(L.ModifierProductionUpgradeCostDesc),
   },
   PopulationUpgradeCost: {
      name: () => $t(L.PopulationUpgradeCost),
      desc: () => $t(L.ModifierPopulationUpgradeCostDesc),
   },
   ChristianityYearly: {
      name: () => $t(L.ChristianityYearly),
      desc: () => $t(L.ChristianityYearlyDesc),
   },
   MonthlyInterestRate: {
      name: () => $t(L.MonthlyInterestRate),
      desc: () => $t(L.ModifierMonthlyInterestRateDesc),
   },
} as const satisfies Record<string, IModifierDefinition>;

export type Modifier = keyof typeof Modifiers;
export type Modifiers = Partial<Record<Modifier, IModifier[]>>;

export function modifierToString(mod: Modifier, data: Omit<IModifier, "name">): string {
   if (data.duration) {
      return `${modifierValueToString(data)} ${Modifiers[mod].name()} (${modifierDurationToString(data.duration)})`;
   }
   return `${modifierValueToString(data)} ${Modifiers[mod].name()}`;
}

export function modifierValueToString(data: Omit<IModifier, "name">): string {
   return data.type === "add" ? formatDelta(data.value) : formatPercentDelta(data.value);
}

export function modifierDurationToString(duration: number): string {
   if (duration > 12 && duration % 12 === 0) {
      const years = Math.floor(duration / 12);
      return $t(L.XYears, formatNumber(years));
   }
   return $t(L.XMonths, formatNumber(duration));
}

GameStateUpdated.on(() => {
   forEach(G.save.state.provinces, (province, state) => {
      state.dynamicModifiers = {};
      state.unlockedTech.forEach((tech) => {
         forEach(Tech[tech].modifiers, (modifier, data) => {
            const { type, value } = data;
            safePush(state.dynamicModifiers, modifier, {
               type,
               value,
               name: $t(L.XResearch, Tech[tech].name()),
            });
         });
      });
      state.provinceUpgrades.forEach((upgrade) => {
         const { modifiers } = ProvinceUpgrades[upgrade];
         if (modifiers) {
            forEach(modifiers, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: ProvinceUpgrades[upgrade].name(),
               });
            });
         }
      });
      state.legacyUpgrades.forEach((level, upgrade) => {
         const { modifierType, modifierValue } = LegacyUpgrades[upgrade];
         safePush(state.dynamicModifiers, upgrade, {
            type: modifierType,
            value: modifierValue * level,
            name: $t(L.LegacyUpgrade),
         });
      });
   });
});
