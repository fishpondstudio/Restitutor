import { clamp, formatNumber, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import Land from "../../data/Land.json";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, finalizeCondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { type Building, Buildings } from "../definitions/Building";
import { Price } from "../definitions/Goods";
import { getProvinceTraits } from "../definitions/PersonTrait";
import type { GovernorPower, Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { isChristianReligion } from "../definitions/Religion";
import { BarbarianRaidNegativeEffect } from "../definitions/SpawnedProvince";
import { Tech } from "../definitions/Tech";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { cacheTile } from "./CacheLogic";
import { attachModifiers, attachTileModifiers } from "./ModifierLogic";
import {
   getCulturalCohesion,
   getProvinceName,
   getProvinceOverextension,
   getProvinceStability,
   getProvinceStat,
} from "./ProvinceLogic";
import { getBuildingTech, hasResearched } from "./TechLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";
import { getTreatyCount } from "./TreatyLogic";
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
   if (hasProvinceUpgrade("FortifiedAdministration", data.province, save)) {
      let result = 0;
      if (data.buildings.has("Castra")) {
         ++result;
      }
      if (data.buildings.has("Citadel")) {
         ++result;
      }
      if (result > 0) {
         breakdown.multiply.push({
            name: ProvinceUpgrades.FortifiedAdministration.name(),
            value: result * -0.1,
         });
      }
   }
   const distanceFromCapital = getDistanceFromCapital(tile, save);
   breakdown.multiply.push({
      name: $t(L.DistanceFromCapital),
      desc: $t(L.$1TilesFromCapital$2PerTile, formatNumber(distanceFromCapital), "10%"),
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

export const getTileManpower = cacheTile(_getTileManpower);

function _getTileManpower(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Population),
      desc: $t(L.$1PerPopulationUpgrade, "1000"),
      value: data.population * 1000,
   });
   attachTileModifiers(data.modifiers.Manpower, breakdown);
   attachModifiers("Manpower", breakdown, data.province, save);
   getProvinceTraits("Robust", data.province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   if (!data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.NotCore), value: -0.5 });
   }
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
   const fortifyBorders = getTimedActionTimeLeft("FortifyBorders", data.province, save);
   if (fortifyBorders > 0) {
      const wars = getCurrentWars(data.province, save);
      for (const war of wars) {
         for (const warTile of war.tiles) {
            if (MapGrid.distanceTile(tile, warTile) <= 1) {
               breakdown.multiply.push({
                  name: $t(L.FortifiedBorders),
                  desc: $t(L.$1MonthsLeft, formatNumber(fortifyBorders)),
                  value: 1,
               });
               break;
            }
         }
      }
   }
   if (data.rebellion >= 10) {
      breakdown.multiply.push({ name: $t(L.Rebellion), value: -1 });
   }
   return finalizeBreakdown(breakdown);
}

export const getTileDefense = cacheTile(_getTileDefense);

export function _getTileDefense(tile: Tile, save: SaveGame): IValueBreakdown {
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
      desc: $t(L.$1PerInfrastructureLevel, "0.5%"),
      value: data.infrastructure * 0.005,
   });
   if (data.terrain === "Mountain") {
      breakdown.multiply.push({ name: $t(L.TerrainMountain), value: +0.1 });
   }
   if (data.terrain === "Hill") {
      breakdown.multiply.push({ name: $t(L.TerrainHill), value: +0.05 });
   }
   if (data.terrain === "Forest") {
      breakdown.multiply.push({ name: $t(L.TerrainForest), value: +0.05 });
   }
   if (isCapital(tile, save)) {
      breakdown.multiply.push({ name: $t(L.IsCurrentCapital), value: +0.1 });
   }
   if (hasProvinceUpgrade("HillfortBastion", data.province, save)) {
      let hillTileCount = 0;
      for (const [tile, tileData] of save.state.tiles) {
         if (
            tileData.province === data.province &&
            tileData.coreProvinces.has(data.province) &&
            tileData.terrain === "Hill"
         ) {
            ++hillTileCount;
         }
      }
      breakdown.multiply.push({ name: ProvinceUpgrades.HillfortBastion.name(), value: hillTileCount * 0.01 });
   }
   if (data.coreProvinces.has(data.province)) {
      breakdown.multiply.push({ name: $t(L.IsCore), value: +0.1 });
   } else {
      breakdown.multiply.push({ name: $t(L.NotCore), value: -0.1 });
   }
   const unrest = getTileUnrest(tile, save);
   if (unrest.value > 0) {
      breakdown.multiply.push({ name: $t(L.UnrestMax50), value: -clamp(unrest.value / 100, 0, 0.5) });
   }
   return finalizeBreakdown(breakdown);
}

const UnrestPerActualConscription = 0.5;

export const getTileUnrest = cacheTile(_getTileUnrest);

function _getTileUnrest(tile: Tile, save: SaveGame): IValueBreakdown {
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
      desc: $t(L.$1StabilityReducesUnrestBy$2, "1", "1"),
      value: -getProvinceStability(data.province, save).value,
   });
   breakdown.add.push({
      name: $t(L.Population),
      desc: $t(L.$1UnrestPerPopulation, "+3"),
      value: data.population * 3,
   });
   breakdown.add.push({
      name: $t(L.Production),
      desc: $t(L.$1UnrestPerProduction, "-2"),
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
   } else if (state.toleratedCultures.has(data.culture)) {
      breakdown.add.push({ name: $t(L.ToleratedCulture), value: 0 });
   } else {
      breakdown.add.push({ name: $t(L.MinorCulture), value: +10 });
   }
   if (data.autonomy > 0) {
      breakdown.add.push({ name: $t(L.Autonomy), value: -data.autonomy });
   }
   if (data.religion === state.religion) {
      breakdown.add.push({ name: $t(L.DominantReligion), value: -10 });
   } else if (state.toleratedReligions.has(data.religion)) {
      breakdown.add.push({ name: $t(L.ToleratedReligion), value: 0 });
   } else {
      breakdown.add.push({ name: $t(L.MinorReligion), value: +10 });
   }
   if (hasProvinceUpgrade("ChristianTranquility", data.province, save) && isChristianReligion(data.religion)) {
      breakdown.add.push({ name: ProvinceUpgrades.ChristianTranquility.name(), value: -5 });
   }
   const conscription = getProvinceStat("actualConscription", data.province, save);
   breakdown.add.push({
      name: $t(L.Conscription$1, formatNumber(conscription)),
      desc: $t(L.$1UnrestPer$2Conscription, "0.5", "1%"),
      value: conscription * UnrestPerActualConscription,
   });

   return finalizeBreakdown(breakdown);
}

export const getTileLandTax = cacheTile(_getTileLandTax);

function _getTileLandTax(tile: Tile, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const data = save.state.tiles.get(tile);
   if (!data) {
      return breakdown;
   }
   breakdown.add.push({
      name: $t(L.Infrastructure),
      desc: $t(L.$1PerInfrastructureLevel, "2"),
      value: data.infrastructure * 2,
   });
   attachTileModifiers(data.modifiers.LandTax, breakdown);
   attachModifiers("LandTax", breakdown, data.province, save);
   if (
      hasProvinceUpgrade("OpulentPortCities", data.province, save) &&
      data.coreProvinces.has(data.province) &&
      isCoastal(tile)
   ) {
      breakdown.multiply.push({ name: ProvinceUpgrades.OpulentPortCities.name(), value: 0.3 });
   }
   if (hasProvinceUpgrade("TreatyRevenues", data.province, save)) {
      const treatyCount = getTreatyCount(data.province, save);
      if (treatyCount > 0) {
         breakdown.multiply.push({
            name: ProvinceUpgrades.TreatyRevenues.name(),
            value: treatyCount * 0.05,
         });
      }
   }
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
   save.state.wars.forEach((war) => {
      if (war.defender === data.province && war.casusBelli === "BarbarianRaid") {
         breakdown.multiply.push({
            name: $t(L.CurrentlyRaidedBy$1, getProvinceName(war.attacker, save)),
            value: BarbarianRaidNegativeEffect / 100,
         });
      }
   });
   if (hasProvinceUpgrade("CultivatedEstates", data.province, save)) {
      const tileUpgrades = data.infrastructure + data.production + data.population;
      breakdown.multiply.push({ name: ProvinceUpgrades.CultivatedEstates.name(), value: tileUpgrades * 0.01 });
   }
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.Overextension), value: -overextension * 0.01 });
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

export const getTileOutput = cacheTile(_getTileOutput);

export function _getTileOutput(tile: Tile, save: SaveGame): IValueBreakdown {
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
   if (
      hasProvinceUpgrade("OpulentPortCities", data.province, save) &&
      data.coreProvinces.has(data.province) &&
      isCoastal(tile)
   ) {
      breakdown.multiply.push({ name: ProvinceUpgrades.OpulentPortCities.name(), value: 0.3 });
   }
   if (hasProvinceUpgrade("PaxLusitana", data.province, save) && getCurrentWars(data.province, save).length === 0) {
      breakdown.multiply.push({
         name: ProvinceUpgrades.PaxLusitana.name(),
         value: 0.2,
      });
   }
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
   save.state.wars.forEach((war) => {
      if (war.defender === data.province && war.casusBelli === "BarbarianRaid") {
         breakdown.multiply.push({
            name: $t(L.CurrentlyRaidedBy$1, getProvinceName(war.attacker, save)),
            value: BarbarianRaidNegativeEffect / 100,
         });
      }
   });
   const overextension = getProvinceOverextension(data.province, save).value;
   if (overextension > 0) {
      breakdown.multiply.push({ name: $t(L.Overextension), value: -overextension * 0.01 });
   }
   if (hasProvinceUpgrade("SereneVineyards", data.province, save)) {
      const stability = getProvinceStability(data.province, save).value;
      if (stability > 0) {
         breakdown.multiply.push({ name: ProvinceUpgrades.SereneVineyards.name(), value: stability * 0.01 });
      }
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

export const getTileGoodsTax = cacheTile(_getTileGoodsTax);

function _getTileGoodsTax(tile: Tile, save: SaveGame): number {
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

export const getTileMaintenanceCost = cacheTile(_getTileMaintenanceCost);

function _getTileMaintenanceCost(tile: Tile, save: SaveGame): IValueBreakdown {
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
      desc: $t(L.$1TilesFromCapital$2GoldPerTile, formatNumber(distance), formatNumber(MaintenanceCostPerTileDistance)),
      value: distance * MaintenanceCostPerTileDistance,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else if (state.toleratedCultures.has(data.culture)) {
      breakdown.multiply.push({ name: $t(L.ToleratedCulture), value: 0 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (state.toleratedReligions.has(data.religion)) {
      breakdown.multiply.push({ name: $t(L.ToleratedReligion), value: 0 });
   } else {
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
         desc: $t(L.UnevenUpgradeDesc$1$2, "10%", formatNumber(unevenUpgrades)),
         value: unevenUpgrades * 0.1,
      });
   }
   const stability = getProvinceStability(data.province, save).value;
   if (stability > 0) {
      breakdown.multiply.push({
         name: $t(L.FromStability),
         value: -clamp(stability, 0, 50) * 0.01,
         desc: $t(L.$1PerStabilityMax$2Reduction, "1%", "50%"),
      });
   }
   if (hasProvinceUpgrade("CulturalEfficiency", data.province, save)) {
      const culturalCohesion = getCulturalCohesion(data.province, save);
      if (culturalCohesion > 0.5) {
         breakdown.multiply.push({
            name: ProvinceUpgrades.CulturalEfficiency.name(),
            value: (0.5 - culturalCohesion) * 0.4,
         });
      }
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
      desc: $t(L.$1AdministrativePointsPerUpgrade, "10"),
      value: totalUpgrades * 10,
   });
   const makeCoreCount = getProvinceStat("makeCoreCount", data.province, save);
   breakdown.multiply.push({
      name: $t(L.NumberOfCoresMade),
      desc: $t(L.EachCoreMadeRaisesTheCostBy$1Compounded$2CoresHaveBeenMade, "20%", formatNumber(makeCoreCount)),
      value: 1.2 ** makeCoreCount - 1,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else if (state.toleratedCultures.has(data.culture)) {
      breakdown.multiply.push({ name: $t(L.ToleratedCulture), value: 0 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (state.toleratedReligions.has(data.religion)) {
      breakdown.multiply.push({ name: $t(L.ToleratedReligion), value: 0 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorReligion), value: 0.1 });
   }
   attachModifiers("MakeCoreCost", breakdown, data.province, save);
   return finalizeBreakdown(breakdown);
}

export const UpgradeCostGrowthFactor = 1.2;

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
      desc: $t(L.TileUpgradesCostDesc$1, formatNumber(data.upgradeCount)),
      value: UpgradeCostGrowthFactor ** data.upgradeCount - 1,
   });
   if (data.culture === state.culture) {
      breakdown.multiply.push({ name: $t(L.DominantCulture), value: -0.1 });
   } else if (state.toleratedCultures.has(data.culture)) {
      breakdown.multiply.push({ name: $t(L.ToleratedCulture), value: 0 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorCulture), value: 0.1 });
   }
   if (data.religion === state.religion) {
      breakdown.multiply.push({ name: $t(L.DominantReligion), value: -0.1 });
   } else if (state.toleratedReligions.has(data.religion)) {
      breakdown.multiply.push({ name: $t(L.ToleratedReligion), value: 0 });
   } else {
      breakdown.multiply.push({ name: $t(L.MinorReligion), value: 0.1 });
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
         desc: $t(L.UsedTotalBuildingSlots$1$2, formatNumber(buildingCount), formatNumber(buildingSlot.value)),
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
         name: $t(L.$1Researched, Tech[tech].name()),
         value: hasResearched(tech, province, save),
      });
   }
   return finalizeCondition(breakdown);
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
      if (
         hasProvinceUpgrade("OpulentPortCities", data.province, save) &&
         data.coreProvinces.has(data.province) &&
         isCoastal(tile)
      ) {
         result.add.push({ name: ProvinceUpgrades.OpulentPortCities.name(), value: 2 });
      }
      if (hasProvinceUpgrade("MunicipalPrivilege", data.province, save) && data.coreProvinces.has(data.province)) {
         result.add.push({ name: ProvinceUpgrades.MunicipalPrivilege.name(), value: 1 });
      }
   }
   return finalizeBreakdown(result);
}

function isCoreTile(tile: Tile, province: Province, save: SaveGame): boolean {
   const data = save.state.tiles.get(tile);
   return data?.province === province && data.coreProvinces.has(province);
}

export function isCoreTileCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1AnnexesAndCores$2, getProvinceName(province, save), `<Tile>${tile}</Tile>`),
      value: isCoreTile(tile, province, save),
   };
}

export function anyCoreTileCondition(tiles: Iterable<Tile>, province: Province, save: SaveGame): ICondition {
   const tileList = Array.from(tiles);
   return {
      name: $t(
         L.$1AnnexesAndCoresAnyOf$2,
         getProvinceName(province, save),
         tileList.map((tile) => `<Tile>${tile}</Tile>`).join(", "),
      ),
      value: tileList.some((tile) => isCoreTile(tile, province, save)),
   };
}

export function allCoreTileCondition(tiles: Iterable<Tile>, province: Province, save: SaveGame): ICondition {
   const tileList = Array.from(tiles);
   return {
      name: $t(
         L.$1AnnexesAndCoresAllOf$2,
         getProvinceName(province, save),
         tileList.map((tile) => `<Tile>${tile}</Tile>`).join(", "),
      ),
      value: tileList.every((tile) => isCoreTile(tile, province, save)),
      progress: [tileList.filter((tile) => isCoreTile(tile, province, save)).length, tileList.length],
   };
}
