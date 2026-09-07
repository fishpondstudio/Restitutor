import { formatDelta, formatNumber, formatPercentDelta } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { attachModifiers } from "../logic/ModifierLogic";
import type { Province } from "./Province";

export interface IBaseModifier {
   type: "add" | "multiply";
   value: number;
   duration?: number;
}

export interface IModifier extends IBaseModifier {
   name: string;
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
   WarScore: {
      name: () => $t(L.WarScore),
      desc: () => $t(L.ModifierWarScoreDesc),
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
      name: () => $t(L.ChristianInfluencePerYear),
      desc: () => $t(L.ChristianInfluencePerYearDesc),
   },
   MonthlyInterestRate: {
      name: () => $t(L.MonthlyInterestRate),
      desc: () => $t(L.ModifierMonthlyInterestRateDesc),
   },
   InfiltrationRate: {
      name: () => $t(L.InfiltrationRate),
      desc: () => $t(L.ModifierInfiltrationRateDesc),
   },
   ImproveRelationsRate: {
      name: () => $t(L.ImproveRelationsRate),
      desc: () => $t(L.ModifierImproveRelationsRateDesc),
   },
   TruceDuration: {
      name: () => $t(L.TruceDuration),
      desc: () => $t(L.ModifierTruceDurationDesc),
   },
   AnnexCostDiscount: {
      name: () => $t(L.AnnexCostDiscount),
      desc: () => $t(L.ModifierAnnexCostDiscountDesc),
   },
   UpperClassInfluenceYearly: {
      name: () => $t(L.UpperClassInfluenceYearly),
      desc: () => $t(L.UpperClassInfluenceYearlyDesc),
   },
   MiddleClassInfluenceYearly: {
      name: () => $t(L.MiddleClassInfluenceYearly),
      desc: () => $t(L.MiddleClassInfluenceYearlyDesc),
   },
   LowerClassInfluenceYearly: {
      name: () => $t(L.LowerClassInfluenceYearly),
      desc: () => $t(L.LowerClassInfluenceYearlyDesc),
   },
   ReligiousClassInfluenceYearly: {
      name: () => $t(L.ReligiousClassInfluenceYearly),
      desc: () => $t(L.ReligiousClassInfluenceYearlyDesc),
   },
   MilitaryClassInfluenceYearly: {
      name: () => $t(L.MilitaryClassInfluenceYearly),
      desc: () => $t(L.MilitaryClassInfluenceYearlyDesc),
   },
   ToleratedCulture: {
      name: () => $t(L.ToleratedCulture),
      desc: () => $t(L.ToleratedCultureDesc),
   },
   ToleratedReligion: {
      name: () => $t(L.ToleratedReligion),
      desc: () => $t(L.ToleratedReligionDesc),
   },
} as const satisfies Record<string, IModifierDefinition>;

export type Modifier = keyof typeof Modifiers;

export function modifierToString(mod: Modifier, data: IBaseModifier): string {
   if (data.duration) {
      return `${modifierValueToString(data)} ${Modifiers[mod].name()} (${durationToString(data.duration)})`;
   }
   return `${modifierValueToString(data)} ${Modifiers[mod].name()}`;
}

export function modifierValueToString(data: IBaseModifier): string {
   return data.type === "add" ? formatDelta(data.value) : formatPercentDelta(data.value);
}

export function durationToString(duration: number): string {
   if (duration > 12 && duration % 12 === 0) {
      const years = Math.floor(duration / 12);
      return $t(L.$1Years, formatNumber(years));
   }
   return $t(L.$1Months, formatNumber(duration));
}

export function makeModifierGetter(
   modifier: Modifier,
   baseValue: number,
   func: (result: IValueBreakdown, province: Province, save: SaveGame) => void,
): (province: Province, save: SaveGame) => IValueBreakdown {
   return (province: Province, save: SaveGame) => {
      const result = makeValueBreakdown();
      result.add.push({ name: $t(L.BaseValue), value: baseValue });
      func(result, province, save);
      attachModifiers(modifier, result, province, save);
      return finalizeBreakdown(result);
   };
}
