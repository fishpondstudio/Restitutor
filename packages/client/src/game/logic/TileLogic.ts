import { clamp, formatNumber, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import Land from "../../data/Land.json";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, finalizeCondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { hasProvinceUpgrade } from "../actions/ProvinceUpgrades";
import { type Building, Buildings } from "../definitions/Building";
import { Price } from "../definitions/Goods";
import { getProvinceTraits } from "../definitions/PersonTrait";
import type { GovernorPower, Province } from "../definitions/Province";
import { SocialClassNames } from "../definitions/SocialClass";
import { Tech } from "../definitions/Tech";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { attachModifiers, attachTileModifiers } from "./ModifierLogic";
import { getProvinceOverextension, getProvinceStability, getProvinceStat } from "./ProvinceLogic";
import { getSocialClassBonusName, isSocialClassDissent, SocialClassDissentEffectPct } from "./SocialClassLogic";
import { getBuildingTech, hasResearched } from "./TechLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";
import { getCurrentWars, type IWar } from "./WarLogic";

export function isCapital(tile: Tile, save: SaveGame): boolean {
   const data = save.state.tiles.get(tile);
   if (!data) {
      return false;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return false;
   }
   return state.capital === tile;
}

export function getTileGoverningCost(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.TotalUpgrades),
      value: data.infrastructure + data.production + data.population,
   });
   attachTileModifiers(data.modifiers.GoverningCapacity, breakdown);
   if (data.buildings.has("Courthouse")) {
      breakdown.multiply.push({ name: Buildings.Courthouse.name(), value: -0.2 });
   }
   const distanceFromCapital = getDistanceFromCapital(tile, save);
   breakdown.multiply.push({
      name: $t(L.DistanceFromCapital),
      desc: $t(L.XTilesFromCapitalYPerTile, formatNumber(distanceFromCapital), "10%"),
      value: distanceFromCapital * 0.1,
   });
   if (isCapital(tile, save)) {
      breakdown.multiply.push({ name: $t(L.IsCurrentCapital), value: -0.9 });
   }
   if (data.terrain === "Mountain") {
      breakdown.multiply.push({ name: $t(L.TerrainMountain), value: +0.1 });
   }
   if (data.terrain === "Hill") {
      breakdown.multiply.push({ name: $t(L.TerrainHill), value: +0.05 });
   }
   if (data.terrain === "Forest") {
      breakdown.multiply.push({ name: $t(L.TerrainForest), value: +0.05 });
   }
   if (!data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.NotCore), value: 1 });
   }
   return finalizeBreakdown(breakdown);
}

export const BankruptcyRevenueReduction = -0.8;
export const BankruptcyStabilityReduction = -10;
export const BankruptcyExpenseIncreasePct = 1;

export function getTileManpower(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Population),
      desc: $t(L.XPerPopulationUpgrade, "1000"),
      value: data.population * 1000,
   });
   attachTileModifiers(data.modifiers.Manpower, breakdown);
   attachModifiers("Manpower", breakdown, data.province, save);
   getProvinceTraits("Robust", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   if (data.autonomy > 0) {
      breakdown.multiply.push({ name: $t(L.Autonomy), value: -data.autonomy * 0.01 });
   }
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.Overextension), value: -overextension * 0.01 });
   }
   if (data.buildings.has("ArmyCamp")) {
      breakdown.multiply.push({ name: Buildings.ArmyCamp.name(), value: 0.2 });
   }
   if (data.buildings.has("Barracks")) {
      breakdown.multiply.push({ name: Buildings.Barracks.name(), value: 0.4 });
   }
   if (hasProvinceUpgrade("LowerClassManpower", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("LowerClassManpower"),
         value: 0.1,
      });
   }
   if (hasProvinceUpgrade("LowerClassManpowerRelief", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("LowerClassManpowerRelief"),
         value: -0.05,
      });
   }
   if (isSocialClassDissent("UpperClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.UpperClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("MiddleClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.MiddleClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("LowerClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.LowerClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   const fortifyBorders = getTimedActionTimeLeft("FortifyBorders", data.province, save);
   if (fortifyBorders > 0) {
      const wars = getCurrentWars(data.province, save);
      for (const war of wars) {
         for (const warTile of war.tiles) {
            if (MapGrid.distanceTile(tile, warTile) <= 1) {
               breakdown.multiply.push({
                  name: $t(L.FortifiedBorders),
                  desc: $t(L.XMonthsLeft, formatNumber(fortifyBorders)),
                  value: 1,
               });
               break;
            }
         }
      }
   }
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", data.province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyRevenueReduction,
      });
   }
   if (data.rebellion >= 10) {
      breakdown.multiply.push({ name: $t(L.Rebellion), value: -1 });
   }
   return finalizeBreakdown(breakdown);
}

export function getTileDefense(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.TotalUpgrades),
      value: data.infrastructure + data.production + data.population,
   });
   attachTileModifiers(data.modifiers.Defense, breakdown);
   attachModifiers("Defense", breakdown, data.province, save);
   getProvinceTraits("Steadfast", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   if (data.buildings.has("Castra")) {
      breakdown.multiply.push({ name: Buildings.Castra.name(), value: 0.2 });
   }
   if (data.buildings.has("Citadel")) {
      breakdown.multiply.push({ name: Buildings.Citadel.name(), value: 0.4 });
   }
   breakdown.multiply.push({
      name: $t(L.Infrastructure),
      desc: $t(L.XPerInfrastructureLevel, "1%"),
      value: data.infrastructure * 0.01,
   });
   if (data.terrain === "Mountain") {
      breakdown.multiply.push({ name: $t(L.TerrainMountain), value: +0.2 });
   }
   if (data.terrain === "Hill") {
      breakdown.multiply.push({ name: $t(L.TerrainHill), value: +0.1 });
   }
   if (data.terrain === "Forest") {
      breakdown.multiply.push({ name: $t(L.TerrainForest), value: +0.05 });
   }
   if (isCapital(tile, save)) {
      breakdown.multiply.push({ name: $t(L.IsCurrentCapital), value: 1 });
   }
   if (data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.IsCore), value: +0.2 });
   } else {
      breakdown.multiply.push({ name: $t(L.NotCore), value: -0.2 });
   }
   const unrest = getTileUnrest(tile, save);
   if (unrest.value > 0) {
      breakdown.multiply.push({ name: $t(L.UnrestMax50), value: -clamp(unrest.value / 100, 0, 0.5) });
   }
   return finalizeBreakdown(breakdown);
}

const UnrestPerActualConscription = 0.5;

export function getTileUnrest(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Stability),
      desc: $t(L.XStabilityReducesUnrestByY, "1", "1"),
      value: -getProvinceStability(data.province, save).value,
   });
   breakdown.add.push({
      name: $t(L.Population),
      desc: $t(L.XUnrestPerPopulation, "+3"),
      value: data.population * 3,
   });
   breakdown.add.push({
      name: $t(L.Production),
      desc: $t(L.XUnrestPerProduction, "-2"),
      value: -2 * data.production,
   });
   if (isCapital(tile, save)) {
      breakdown.add.push({ name: $t(L.IsCurrentCapital), value: -50 });
   }
   attachTileModifiers(data.modifiers.Unrest, breakdown);
   if (data.buildings.has("Amphitheatre")) {
      breakdown.add.push({ name: Buildings.Amphitheatre.name(), value: -10 });
   }
   if (data.buildings.has("CircusMaximus")) {
      breakdown.add.push({ name: Buildings.CircusMaximus.name(), value: -20 });
   }
   if (data.coreProvinces.has(data.province)) {
      breakdown.add.push({ name: $t(L.IsCore), value: -10 });
   } else {
      breakdown.add.push({ name: $t(L.NotCore), value: +10 });
   }
   if (data.culture === state.culture) {
      breakdown.add.push({ name: $t(L.DominantCulture), value: -10 });
   } else {
      breakdown.add.push({ name: $t(L.MinorCulture), value: +10 });
   }
   if (data.autonomy > 0) {
      breakdown.add.push({ name: $t(L.Autonomy), value: -data.autonomy });
   }
   if (data.religion === state.religion) {
      breakdown.add.push({ name: $t(L.DominantReligion), value: -10 });
   } else if (!hasProvinceUpgrade("EdictOfMilan", data.province, save)) {
      breakdown.add.push({ name: $t(L.MinorReligion), value: +10 });
   }
   const conscription = getProvinceStat("actualConscription", data.province, save);
   breakdown.add.push({
      name: $t(L.ConscriptionX, formatNumber(conscription)),
      desc: $t(L.XUnrestPerYConscription, "0.5", "1%"),
      value: conscription * UnrestPerActualConscription,
   });

   return finalizeBreakdown(breakdown);
}

export function getTileLandTax(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Infrastructure),
      desc: $t(L.XPerInfrastructureLevel, "2"),
      value: data.infrastructure * 2,
   });
   attachTileModifiers(data.modifiers.LandTax, breakdown);
   attachModifiers("LandTax", breakdown, data.province, save);
   getProvinceTraits("Diligent", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   if (data.autonomy > 0) {
      breakdown.multiply.push({ name: $t(L.Autonomy), value: -data.autonomy * 0.01 });
   }
   if (data.buildings.has("TownSquare")) {
      breakdown.multiply.push({ name: Buildings.TownSquare.name(), value: 0.2 });
   }
   if (data.buildings.has("Forum")) {
      breakdown.multiply.push({ name: Buildings.Forum.name(), value: 0.4 });
   }
   if (!data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.NotCore), value: -0.5 });
   }
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.Overextension), value: -overextension * 0.01 });
   }
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", data.province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyRevenueReduction,
      });
   }
   if (hasProvinceUpgrade("UpperClassLandTax", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("UpperClassLandTax"),
         value: 0.1,
      });
   }
   if (hasProvinceUpgrade("UpperClassLandTaxRelief", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("UpperClassLandTaxRelief"),
         value: -0.05,
      });
   }
   if (isSocialClassDissent("UpperClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.UpperClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("MiddleClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.MiddleClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("LowerClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.LowerClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (data.terrain === "Mountain") {
      breakdown.multiply.push({ name: $t(L.TerrainMountain), value: -0.25 });
   }
   if (data.terrain === "Hill") {
      breakdown.multiply.push({ name: $t(L.TerrainHill), value: -0.1 });
   }
   if (data.terrain === "Plain") {
      breakdown.multiply.push({ name: $t(L.TerrainPlain), value: +0.1 });
   }
   if (data.rebellion >= 10) {
      breakdown.multiply.push({ name: $t(L.Rebellion), value: -1 });
   }
   return finalizeBreakdown(breakdown);
}

export const ImportRangeUpgradeFactor = 10;

export function getTileOutput(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Production),
      value: data.production,
   });
   attachTileModifiers(data.modifiers.GoodsTax, breakdown);
   attachModifiers("TileOutput", breakdown, data.province, save);
   getProvinceTraits("Methodical", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   if (data.autonomy > 0) {
      breakdown.multiply.push({ name: $t(L.Autonomy), value: -data.autonomy * 0.01 });
   }
   if (data.buildings.has("Market")) {
      breakdown.multiply.push({ name: Buildings.Market.name(), value: 0.2 });
   }
   if (data.buildings.has("TradeDistrict")) {
      breakdown.multiply.push({ name: Buildings.TradeDistrict.name(), value: 0.4 });
   }
   if (!data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.NotCore), value: -0.5 });
   }
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.Overextension), value: -overextension * 0.01 });
   }
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", data.province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyRevenueReduction,
      });
   }
   if (hasProvinceUpgrade("MiddleClassGoodsTax", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("MiddleClassGoodsTax"),
         value: 0.1,
      });
   }
   if (hasProvinceUpgrade("MiddleClassGoodsTaxRelief", data.province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("MiddleClassGoodsTaxRelief"),
         value: -0.05,
      });
   }
   if (isSocialClassDissent("UpperClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.UpperClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("MiddleClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.MiddleClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (isSocialClassDissent("LowerClass", data.province, save)) {
      breakdown.multiply.push({
         name: $t(L.XClassDissent, SocialClassNames.LowerClass()),
         value: SocialClassDissentEffectPct,
      });
   }
   if (data.terrain === "Mountain") {
      breakdown.multiply.push({ name: $t(L.TerrainMountain), value: -0.1 });
   }
   if (data.terrain === "Hill") {
      breakdown.multiply.push({ name: $t(L.TerrainHill), value: +0.1 });
   }
   if (data.rebellion >= 10) {
      breakdown.multiply.push({ name: $t(L.Rebellion), value: -1 });
   }
   return finalizeBreakdown(breakdown);
}

export function getTileGoodsTax(tile: Tile, save: SaveGame): number {
   const data = save.state.tiles.get(tile);
   if (!data) {
      return 0;
   }
   const goodsTaxRate = getProvinceStat("goodsTaxRate", data.province, save) / 100;
   const goodsProduction = getTileOutput(tile, save).value;
   return goodsProduction * Price[data.goods] * goodsTaxRate;
}

export function getDistanceFromCapital(tile: Tile, save: SaveGame): number {
   const data = save.state.tiles.get(tile);
   if (!data) {
      return 0;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return 0;
   }
   const capital = state.capital;
   return MapGrid.distanceTile(tile, capital);
}

export function getTileMaintenanceCost(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return breakdown;
   }
   const distance = getDistanceFromCapital(tile, save);
   breakdown.add.push({
      name: $t(L.DistanceFromCapital),
      desc: $t(L.XTilesFromCapitalYGoldPerTile, formatNumber(distance), formatNumber(MaintenanceCostPerTileDistance)),
      value: distance * MaintenanceCostPerTileDistance,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (!hasProvinceUpgrade("EdictOfMilan", data.province, save)) {
      breakdown.multiply.push({ name: $t(L.MinorReligion), value: 0.1 });
   }
   if (data.buildings.has("Temple")) {
      breakdown.multiply.push({ name: Buildings.Temple.name(), value: -0.2 });
   }
   const unevenUpgrades =
      Math.max(data.infrastructure, data.production, data.population) -
      Math.min(data.infrastructure, data.production, data.population);
   if (unevenUpgrades > 0) {
      breakdown.multiply.push({
         name: $t(L.UnevenUpgrade),
         desc: $t(L.UnevenUpgradeDesc, "10%", formatNumber(unevenUpgrades)),
         value: unevenUpgrades * 0.1,
      });
   }
   const stability = getProvinceStability(data.province, save).value;
   if (stability > 0) {
      breakdown.multiply.push({
         name: $t(L.FromStability),
         value: -clamp(stability, 0, 50) * 0.01,
         desc: $t(L.XPerStabilityMaxYReduction, "1%", "50%"),
      });
   }
   attachTileModifiers(data.modifiers.Maintenance, breakdown);
   attachModifiers("TileMaintenance", breakdown, data.province, save);
   getProvinceTraits("Efficient", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: -0.02 });
   });
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.FromOverextension), value: overextension * 0.01 });
   }
   return finalizeBreakdown(breakdown);
}

const MaintenanceCostPerTileDistance = 1;

export function getTileWar(tile: Tile, save: SaveGame): IWar | undefined {
   for (const war of save.state.wars) {
      if (war.tiles.has(tile)) {
         return war;
      }
   }
   return undefined;
}

export function getTileMakeCoreCost(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return breakdown;
   }
   const totalUpgrades = data.infrastructure + data.production + data.population;
   breakdown.add.push({
      name: $t(L.TileUpgrades),
      desc: $t(L.XAdministrativePointsPerUpgrade, "10"),
      value: totalUpgrades * 10,
   });
   const makeCoreCount = getProvinceStat("makeCoreCount", data.province, save);
   breakdown.multiply.push({
      name: $t(L.NumberOfCoresMade),
      desc: $t(L.EachCoreMadeRaisesTheCostByXCompoundedYCoresHaveBeenMade, "20%", formatNumber(makeCoreCount)),
      value: 1.2 ** makeCoreCount - 1,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (!hasProvinceUpgrade("EdictOfMilan", data.province, save)) {
      breakdown.multiply.push({ name: $t(L.MinorReligion), value: 0.1 });
   }
   attachModifiers("MakeCoreCost", breakdown, data.province, save);
   return finalizeBreakdown(breakdown);
}

export function getTileUpgradeCost(tile: Tile, resource: GovernorPower, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   const state = save.state.provinces[data.province];
   if (!state) {
      return breakdown;
   }
   breakdown.add.push({ name: $t(L.BaseValue), value: 50 });
   breakdown.multiply.push({
      name: $t(L.TileUpgrades),
      desc: $t(L.TileUpgradesCostDesc, formatNumber(data.upgradeCount)),
      value: 1.2 ** data.upgradeCount - 1,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (!hasProvinceUpgrade("EdictOfMilan", data.province, save)) {
      breakdown.multiply.push({ name: $t(L.MinorReligion), value: 0.1 });
   }
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", data.province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyExpenseIncreasePct,
      });
   }
   if (resource === "administrative") {
      attachModifiers("InfrastructureUpgradeCost", breakdown, data.province, save);
   }
   if (resource === "diplomatic") {
      attachModifiers("ProductionUpgradeCost", breakdown, data.province, save);
   }
   if (resource === "military") {
      attachModifiers("PopulationUpgradeCost", breakdown, data.province, save);
   }

   return finalizeBreakdown(breakdown);
}

export function getTileBuildingCondition(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IConditionBreakdown {
   const buildingConfig = Buildings[building];
   const tileData = save.state.tiles.get(tile);
   const buildingSlot = getBuildingSlot(tile, save);
   const buildingCount = tileData?.buildings.size ?? 0;
   const breakdown: ICondition[] = [
      tileIsOurCoreCondition(tile, province, save),
      {
         name: $t(L.TileHasAFreeBuildingSlot),
         desc: $t(L.UsedTotalBuildingSlotsXY, formatNumber(buildingCount), formatNumber(buildingSlot.value)),
         value: buildingSlot.value > buildingCount,
      },
      {
         name: $t(L.NotAlreadyBuilt),
         value: !!tileData && !tileData.buildings.has(building),
      },
      ...buildingConfig.conditions(tile, save),
   ];
   const tech = getBuildingTech(building);
   if (tech) {
      breakdown.push({
         name: $t(L.XResearched, Tech[tech].name()),
         value: hasResearched(tech, province, save),
      });
   }
   return finalizeCondition({ breakdown: breakdown });
}

export function tileIsOurCoreCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   const tileData = save.state.tiles.get(tile);
   return {
      name: $t(L.TileIsCurrentlyOurCore),
      value: !!tileData && tileData.coreProvinces.has(province) && tileData.province === province,
   };
}

export function getNearestTile(tilesA: Tile[], tilesB: Tile[]): [Tile, Tile] | undefined {
   let nearestTile: [Tile, Tile] | undefined;
   let nearestDistance = Number.POSITIVE_INFINITY;
   for (const tileA of tilesA) {
      for (const tileB of tilesB) {
         const distance = MapGrid.distanceTile(tileA, tileB);
         if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestTile = [tileA, tileB];
         }
      }
   }
   return nearestTile ?? undefined;
}

const LandTiles = new Set<Tile>(Land);

export function isCoastal(tile: Tile): boolean {
   const point = tileToPoint(tile);
   for (let dir = 0; dir < 6; dir++) {
      const neighbor = MapGrid.getNeighbor(point, dir);
      if (MapGrid.isValid(neighbor) && !LandTiles.has(pointToTile(neighbor))) {
         return true;
      }
   }
   return false;
}

export function getBuildingSlot(tile: Tile, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: 2 });
   const data = save.state.tiles.get(tile);
   if (data) {
      attachModifiers("BuildingSlot", result, data.province, save);
      if (data.buildings.has("Temple")) {
         result.add.push({ name: Buildings.Temple.name(), value: 1 });
      }
   }
   return finalizeBreakdown(result);
}
