import {
   clamp,
   entriesOf,
   forEach,
   formatNumber,
   fromEntries,
   pointToTile,
   range,
   shuffle,
   type Tile,
   tileToPoint,
} from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IValueBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { getAdvisorMonthlyCost, initAdvisors } from "../definitions/Advisor";
import { Buildings } from "../definitions/Building";
import { Goods } from "../definitions/Goods";
import { type GreatWork, TileToGreatWork } from "../definitions/GreatWork";
import {
   type GovernorPower,
   type IProvince,
   Province,
   ProvinceFlags,
   type ProvinceNameOverride,
   ProvinceNameOverrides,
   ProvinceOriginalTiles,
   ProvinceResources,
   type ProvinceStat,
   ProvinceStats,
} from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import type { SpawnedProvince } from "../definitions/SpawnedProvince";
import {
   BarbarianRaidNegativeEffect,
   SpawnedProvinceBoostMonths,
   SpawnedProvinces,
} from "../definitions/SpawnedProvince";
import { getBorderingProvinces } from "../definitions/Tile";
import { MediterraneanTiles, StraitOfGibraltarTiles, Tiles } from "../definitions/TileConstants";
import { GameStateUpdated } from "../Events";
import type { SaveGame } from "../GameState";
import { getSeaComponent } from "../Land";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import { getArmyMaintenanceCost, getWarPower } from "./ArmyLogic";
import { cacheProvince } from "./CacheLogic";
import type { ConditionChecks } from "./Calculation";
import { getRelation } from "./DiplomacyLogic";
import { generateRandomGovernor } from "./GovernorLogic";
import { getCulturalCohesion, getReligiousCohesion } from "./InternalAffairsLogic";
import { addModifier, attachModifiers } from "./ModifierLogic";
import { addProvinceResource } from "./ResourceLogic";
import { getBaselineTechs } from "./TechLogic";
import {
   getTileGoodsTax,
   getTileGoverningCost,
   getTileLandTax,
   getTileMaintenanceCost,
   isCoastal,
   settleTile,
} from "./TileLogic";
import { startTimedAction } from "./TimedActionLogic";
import { getProvinceTrades } from "./TradeLogic";
import { getClients, getPatrons } from "./TreatyLogic";
import { calculateWarTotalStability, getCurrentWars, getWarPowerPerTile } from "./WarLogic";

export function getProvinceStat(stat: ProvinceStat, province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   const stats = state.stats;
   if (stats[stat] === undefined) {
      stats[stat] = ProvinceStats[stat];
   }
   return stats[stat];
}

export function setProvinceStat(stat: ProvinceStat, value: number, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.stats[stat] = value;
}

export function addProvinceStat(stat: ProvinceStat, value: number, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const oldValue = getProvinceStat(stat, province, save);
   state.stats[stat] = oldValue + value;
}

export function getProvinceOriginalTileCount(province: Province): number {
   let count = 0;
   for (const [_tile, data] of RomeMap) {
      if (data.province === province) {
         count++;
      }
   }
   return count;
}

export function getProvinceTileCount(province: Province, save: SaveGame): number {
   let count = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         count++;
      }
   }
   return count;
}

export function getProvinceCoreCoastalTileCount(province: Province, save: SaveGame): number {
   let count = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && data.coreProvinces.has(province) && isCoastal(tile)) {
         count++;
      }
   }
   return count;
}

export function getTotalUpgrades(province: Province, save: SaveGame): number {
   let upgrade = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         upgrade += data.infrastructure;
         upgrade += data.production;
         upgrade += data.population;
      }
   }
   return upgrade;
}

export function getProvincePrestige(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.TileUpgrades), value: getTotalUpgrades(province, save) });
   attachModifiers("Prestige", breakdown, province, save);
   if (hasProvinceUpgrade("MaritimeRenown", province, save)) {
      breakdown.multiply.push({
         name: ProvinceUpgrades.MaritimeRenown.name(),
         value: Math.min(getProvinceCoreCoastalTileCount(province, save) * 0.01, 0.5),
      });
   }
   if (hasProvinceUpgrade("CommercialRenown", province, save)) {
      const tradeCount = getProvinceTrades(province, save).size;
      if (tradeCount > 0) {
         breakdown.multiply.push({
            name: ProvinceUpgrades.CommercialRenown.name(),
            value: tradeCount * 0.1,
         });
      }
   }
   if (hasProvinceUpgrade("CaputMundi", province, save) && save.state.provinces[province]?.capital === Tiles.Rome) {
      breakdown.multiply.push({ name: ProvinceUpgrades.CaputMundi.name(), value: 0.1 });
   }
   return finalizeBreakdown(breakdown);
}

export function getProvinceStability(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const overextension = getProvinceOverextension(province, save).value;
   if (overextension > 0) {
      breakdown.add.push({ name: $t(L.FromOverextension), value: -overextension });
   }
   attachModifiers("Stability", breakdown, province, save);
   const wars = getCurrentWars(province, save);
   for (const war of wars) {
      if (war.attacker === province) {
         // Here we should use `war.log.length`, instead of `war.log.length + 1`. Check the implementation of `calculateWarTotalStability`.
         const warCost = calculateWarTotalStability(war.log.length, war.casusBelli);
         breakdown.add.push({
            name: $t(L.$1$2War, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
            desc: $t(L.WarHasBeenGoingOnFor$1Months, formatNumber(war.log.length)),
            value: -warCost,
         });
      }
      if (war.defender === province && war.casusBelli === "BarbarianRaid") {
         breakdown.add.push({
            name: $t(L.CurrentlyRaidedBy$1, getProvinceName(war.attacker, save)),
            value: BarbarianRaidNegativeEffect,
         });
      }
   }
   return finalizeBreakdown(breakdown);
}

export function getProvincesInRange(range: number, province: Province, save: SaveGame): Map<Province, Tile[]> {
   const neighbors = new Set<Tile>();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         MapGrid.getRange(tileToPoint(tile), range).forEach((tile) => {
            neighbors.add(pointToTile(tile));
         });
      }
   }
   const result = new Map<Province, Tile[]>();
   for (const tile of neighbors) {
      const data = save.state.tiles.get(tile);
      if (data && data.province !== province) {
         const tiles = result.get(data.province);
         if (tiles) {
            tiles.push(tile);
         } else {
            result.set(data.province, [tile]);
         }
      }
   }
   return result;
}

export function getProvincesByDistance(province: Province, save: SaveGame): Province[] {
   const capital = save.state.provinces[province]?.capital;
   if (!capital) {
      return [];
   }
   return entriesOf(save.state.provinces)
      .filter(([p]) => p !== province)
      .sort(([p1, d1], [p2, d2]) => {
         return MapGrid.distanceTile(d1.capital, capital) - MapGrid.distanceTile(d2.capital, capital);
      })
      .map(([p]) => p);
}

export const getProvinceOverextension = cacheProvince(_getProvinceOverextension);
function _getProvinceOverextension(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   const overCapacity =
      getProvinceGoverningCost(province, save).value - getProvinceGoverningCapacity(province, save).value;
   if (overCapacity > 0) {
      breakdown.add.push({
         name: $t(L.GoverningOvercapacity),
         value: overCapacity,
      });
   }
   return finalizeBreakdown(breakdown);
}

export function getProvinceGoverningCapacity(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.BaseValue), value: 200 });
   attachModifiers("GoverningCapacity", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export const getProvinceGoverningCost = cacheProvince(_getProvinceGoverningCost);
function _getProvinceGoverningCost(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   let result = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         result += getTileGoverningCost(tile, save).value;
      }
   }
   breakdown.add.push({ name: $t(L.FromAllTiles), value: result });
   const religiousCohesion = (0.5 - getReligiousCohesion(province, save)) * 0.1;
   if (religiousCohesion !== 0) {
      breakdown.multiply.push({ name: $t(L.ReligiousCohesion), value: religiousCohesion });
   }
   const culturalCohesion = (0.5 - getCulturalCohesion(province, save)) * 0.1;
   if (culturalCohesion !== 0) {
      breakdown.multiply.push({ name: $t(L.CulturalCohesion), value: culturalCohesion });
   }
   return finalizeBreakdown(breakdown);
}

export function initProvince(province: Province, capital: Tile): IProvince {
   return {
      nameOverride: undefined,
      culture: Province[province].culture,
      toleratedCultures: new Set(),
      religion: Province[province].religion,
      toleratedReligions: new Set(),
      stats: {
         ...structuredClone(ProvinceStats),
      },
      resources: {
         ...structuredClone(ProvinceResources),
      },
      governor: generateRandomGovernor(province),
      advisors: {
         administrative: initAdvisors(),
         diplomatic: initAdvisors(),
         military: initAdvisors(),
      },
      focus: "administrative",
      capital: capital,
      rivals: [null, null],
      _relations: new Map(),
      unlockedTech: new Set(["A1", "A2", "A3"]),
      loans: [],
      timedActions: new Map(),
      production: fromEntries(entriesOf(Goods).map(([goods]) => [goods, { capacity: 0, storage: 0, autoSell: false }])),
      modifiers: {},
      dynamicModifiers: {},
      events: new Map(),
      usedEvents: new Set(),
      legacyUpgrades: new Set(),
      provinceUpgrades: new Set(Province[province].upgrades),
      blackboard: {
         resources: {},
      },
      tradeOffers: [],
      flags: ProvinceFlags.None,
      monthly: {
         tradeGold: new Map(),
         goodsTax: new Map(),
         skippedTrade: new Set(),
      },
   };
}

export function getProvinceGovernmentPoint(type: GovernorPower, province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const state = save.state.provinces[province];
   if (!state) {
      return breakdown;
   }
   breakdown.add.push({ name: $t(L.FromGovernor), value: state.governor.male[type] });
   const fromAdvisor = state.advisors[type].selected?.level ?? 0;
   if (fromAdvisor > 0) {
      breakdown.add.push({ name: $t(L.FromAdvisor), value: fromAdvisor });
   }
   breakdown.add.push({ name: $t(L.FromFocus), value: state.focus === type ? 2 : -1 });
   if (hasProvinceUpgrade("FocusedGovernance", province, save) && state.focus === type) {
      breakdown.add.push({ name: ProvinceUpgrades.FocusedGovernance.name(), value: 1 });
   }
   if (type === "administrative") {
      attachModifiers("AdministrativePoint", breakdown, province, save);
   }
   if (type === "diplomatic") {
      attachModifiers("DiplomaticPoint", breakdown, province, save);
   }
   if (type === "military") {
      attachModifiers("MilitaryPoint", breakdown, province, save);
   }
   return finalizeBreakdown(breakdown);
}

export function getTilesAnnexedAndCored(province: Province, save: SaveGame): number {
   let count = 0;
   for (const [tile, data] of save.state.tiles) {
      if (
         data.province === province &&
         data.coreProvinces.has(data.province) &&
         data.originalProvince !== data.province
      ) {
         count++;
      }
   }
   return count;
}

export const getProvinceIncome = cacheProvince(_getProvinceIncome);

function _getProvinceIncome(
   province: Province,
   save: SaveGame,
): { revenue: IValueBreakdown; expense: IValueBreakdown; income: number } {
   const revenue: IValueBreakdown = makeValueBreakdown();
   const expense: IValueBreakdown = makeValueBreakdown();
   const state = save.state.provinces[province];
   if (!state) {
      return { revenue, expense, income: 0 };
   }
   let landTax = 0;
   let tileMaintenanceCost = 0;
   let buildingMaintenanceCost = 0;
   let tileGoodsTax = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         landTax += getTileLandTax(tile, save).value;
         tileMaintenanceCost += getTileMaintenanceCost(tile, save, "value");
         tileGoodsTax += getTileGoodsTax(tile, save);
         data.buildings.forEach((building) => {
            buildingMaintenanceCost += Buildings[building].maintenance.gold ?? 0;
         });
      }
   }
   const armyMaintenanceCost = getArmyMaintenanceCost(province, save).value;
   let advisorCost = 0;
   forEach(state.advisors, (_, data) => {
      if (data.selected) {
         advisorCost += getAdvisorMonthlyCost(data.selected.level, province, save).value;
      }
   });

   revenue.add.push({ name: $t(L.LandTax), value: landTax });
   let goodsTax = 0;
   state.monthly.goodsTax.forEach((value, goods) => {
      goodsTax += value;
   });

   if (state.monthly.goodsTax.size > 0) {
      revenue.add.push({ name: $t(L.GoodsTax), value: goodsTax });
   } else {
      // If we reach here, it means we call this function without ticking production, which should only
      // happen during initial tile setup. So we use tile goods tax, because we don't have any production
      // during initial tile setup anyway.
      revenue.add.push({ name: $t(L.GoodsTax), value: tileGoodsTax });
   }

   getClients(province, save).forEach((clientProvince) => {
      revenue.add.push({
         name: $t(L.TributeFrom$1, getProvinceName(clientProvince, save)),
         value: getProvinceIncome(clientProvince, save).revenue.value * 0.1,
      });
   });

   expense.add.push({ name: $t(L.TileMaintenance), value: -tileMaintenanceCost });
   expense.add.push({ name: $t(L.BuildingMaintenance), value: -buildingMaintenanceCost });
   expense.add.push({ name: $t(L.ArmyMaintenance), value: -armyMaintenanceCost });
   expense.add.push({ name: $t(L.AdvisorCost), value: -advisorCost });

   state.monthly.tradeGold.forEach((value, otherProvince) => {
      if (value > 0) {
         revenue.add.push({ name: $t(L.TradeWith$1, getProvinceName(otherProvince, save)), value: value });
      } else {
         expense.add.push({ name: $t(L.TradeWith$1, getProvinceName(otherProvince, save)), value: value });
      }
   });

   // Finalize revenue before calculating tributes
   finalizeBreakdown(revenue);
   getPatrons(province, save).forEach((patronProvince) => {
      expense.add.push({
         name: $t(L.TributeTo$1, getProvinceName(patronProvince, save)),
         value: -revenue.value * 0.1,
      });
   });

   return {
      revenue: revenue,
      expense: finalizeBreakdown(expense),
      income: revenue.value + expense.value,
   };
}

export function ensureProvinceCapitals(save: SaveGame): Tile[] {
   const result: Tile[] = [];
   forEach(save.state.provinces, (province, state) => {
      if (save.state.tiles.get(state.capital)?.province === province) {
         return;
      }
      for (const [tile, data] of save.state.tiles) {
         if (data.province === province) {
            state.capital = tile;
            result.push(tile);
            return;
         }
      }
   });
   return result;
}

const _cachedProvincePrestigeRanking = new Map<Province, number>();

export function clearProvincePrestigeRankingCache(): void {
   _cachedProvincePrestigeRanking.clear();
}

export function getProvincePrestigeRanking(save: SaveGame): Map<Province, number> {
   if (_cachedProvincePrestigeRanking.size > 0) {
      return _cachedProvincePrestigeRanking;
   }
   entriesOf(save.state.provinces)
      .map(([province]) => {
         return [province, getProvincePrestige(province, save).value] as [Province, number];
      })
      .sort(([_provinceA, prestigeA], [_provinceB, prestigeB]) => prestigeB - prestigeA)
      .forEach(([province], index) => {
         _cachedProvincePrestigeRanking.set(province, index + 1);
      });
   return _cachedProvincePrestigeRanking;
}

export function isProvinceGreatPower(province: Province, save: SaveGame): boolean {
   const ranking = getProvincePrestigeRanking(save).get(province);
   return ranking !== undefined && ranking <= 5;
}

export function isGreatPowerCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsAGreatPower, getProvinceName(province, save)),
      value: isProvinceGreatPower(province, save),
   };
}

export function* isGreatPowerChecks(province: Province, save: SaveGame): ConditionChecks {
   (yield isProvinceGreatPower(province, save))?.describe($t(L.$1IsAGreatPower, getProvinceName(province, save)));
}

export function isNorGreatPowerCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsNotAGreatPower, getProvinceName(province, save)),
      value: !isProvinceGreatPower(province, save),
   };
}

export function hasStraitOfGibraltar(province: Province, save: SaveGame): boolean {
   return StraitOfGibraltarTiles.every((tile) => {
      const data = save.state.tiles.get(tile);
      return data?.province === province && data.coreProvinces.has(province);
   });
}

export const ConsulCandidatesCount = 10;
export const ConsulElectionMonths = 24;

export function monthsToNextConsulElection(save: SaveGame): number {
   const elapsedMonths = save.state.month % ConsulElectionMonths;
   return elapsedMonths === 0 ? ConsulElectionMonths : ConsulElectionMonths - elapsedMonths;
}

export function pledgeProvinceConsulVotes(province: Province, save: SaveGame): void {
   const votes = save.state.senate.votes.get(province);
   if (!votes) {
      save.state.senate.votes.set(
         province,
         new Set(shuffle(range(0, save.state.senate.consulCandidates.length)).slice(0, 2)),
      );
   }
}

export function getProvinceName(province: Province, save: SaveGame): string {
   const nameOverride = save.state.provinces[province]?.nameOverride;
   if (nameOverride) {
      return ProvinceNameOverrides[nameOverride]();
   }
   return Province[province].name();
}

export function setProvinceNameOverride(province: Province, nameOverride: ProvinceNameOverride, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   forEach(save.state.provinces, (p, data) => {
      if (data.nameOverride === nameOverride) {
         data.nameOverride = undefined;
      }
   });
   state.nameOverride = nameOverride;
}

export function getAnnexedTiles(toAnnex: Province, ourProvince: Province, save: SaveGame): [number, number] {
   let annexed = 0;
   let total = 0;
   const originalTiles = ProvinceOriginalTiles.get(toAnnex);
   if (!originalTiles) {
      return [0, 0];
   }
   for (const tile of originalTiles) {
      const tileData = save.state.tiles.get(tile);
      if (tileData?.province === ourProvince && tileData.coreProvinces.has(ourProvince)) {
         annexed++;
      }
      total++;
   }
   return [annexed, total];
}

export function getRestoration(province: Province, save: SaveGame): number {
   const tileAnnexedAndCored = getTilesAnnexedAndCored(province, save);
   return Math.floor(tileAnnexedAndCored / TilesPerRestoration);
}

export function getProgressToNextRestoration(province: Province, save: SaveGame): number {
   const tileAnnexedAndCored = getTilesAnnexedAndCored(province, save);
   return (tileAnnexedAndCored % TilesPerRestoration) / TilesPerRestoration;
}

export const TilesPerRestoration = 5;

export function spawnProvince(province: Province, source: string, save: SaveGame): Tile[] {
   if (save.state.provinces[province]) {
      return [];
   }
   const config = SpawnedProvinces[province as SpawnedProvince];
   if (!config) {
      return [];
   }
   const state = initProvince(province, config.tiles[0]);
   state.unlockedTech = new Set(getBaselineTechs(save));
   save.state.provinces[province] = state;
   const provinces = new Set<Province>();
   config.tiles.forEach((tile) => {
      const data = save.state.tiles.get(tile);
      if (!data) {
         settleTile(tile, province, save);
      } else {
         provinces.add(data.province);
         data.coreProvinces.forEach((p) => {
            provinces.add(p);
         });
         data.province = province;
         data.coreProvinces.add(province);
         data.rebellion = 0;
         data.culture = Province[province].culture;
         data.religion = Province[province].religion;
         data.modifiers.Unrest.length = 0;
      }
   });
   GameStateUpdated.emit();

   forEach(config.stats, (key, value) => {
      setProvinceStat(key, value, province, save);
   });

   forEach(config.resources, (key, value) => {
      addProvinceResource(key, value, province, save);
   });

   provinces.forEach((p) => {
      const relation = getRelation(p, province, save);
      if (relation) {
         relation.casusBelli.set("Reconquista", { monthsLeft: 12 * 20 });
      }
   });

   const neighboringProvinces = new Set<Province>();
   for (const tile of config.tiles) {
      for (const neighboringProvince of getBorderingProvinces(tile, save)) {
         if (neighboringProvince === province || neighboringProvince === save.state.playerProvince) {
            continue;
         }
         neighboringProvinces.add(neighboringProvince);
      }
   }

   let targetWarPower = 0;
   for (const neighboringProvince of neighboringProvinces) {
      const warPowerPerTile = getWarPowerPerTile(neighboringProvince, save);
      targetWarPower += warPowerPerTile;
   }
   targetWarPower = 2 * (targetWarPower / neighboringProvinces.size) * config.tiles.length;

   const currentWarPower = getWarPower(province, save).total.value;
   addModifier({
      modifier: "WarPower",
      name: source,
      type: "multiply",
      value: clamp(targetWarPower / currentWarPower, 1, 10),
      duration: SpawnedProvinceBoostMonths,
      province,
      save,
   });

   startTimedAction("BarbarianInvasions", province, save);

   return [...config.tiles, ...ensureProvinceCapitals(save)];
}

export function getNeighborProvinces(province: Province, save: SaveGame): Set<Province> {
   const result = new Set<Province>();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         getBorderingProvinces(tile, save).forEach((neighbor) => {
            result.add(neighbor);
         });
      }
   }
   return result;
}

export function isLandlocked(province: Province, save: SaveGame): boolean {
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && isCoastal(tile)) {
         return false;
      }
   }
   return true;
}

export function areProvincesConnectedBySea(province1: Province, province2: Province, save: SaveGame): boolean {
   const seaComponents1 = new Set<number>();
   const seaComponents2 = new Set<number>();

   for (const [tile, data] of save.state.tiles) {
      const isProvince1 = data.province === province1;
      const isProvince2 = data.province === province2;
      if (!isProvince1 && !isProvince2) {
         continue;
      }

      for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
         const component = getSeaComponent(pointToTile(neighbor));
         if (component === 0) {
            continue;
         }

         if (isProvince1) {
            if (seaComponents2.has(component)) {
               return true;
            }
            seaComponents1.add(component);
         }
         if (isProvince2) {
            if (seaComponents1.has(component)) {
               return true;
            }
            seaComponents2.add(component);
         }
      }
   }

   return false;
}

export function isTileConnectedBySea(tile: Tile, province: Province, save: SaveGame): boolean {
   const destinationSeaComponents = new Set<number>();
   for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
      const component = getSeaComponent(pointToTile(neighbor));
      if (component !== 0) {
         destinationSeaComponents.add(component);
      }
   }

   if (destinationSeaComponents.size === 0) {
      return false;
   }

   for (const [provinceTile, data] of save.state.tiles) {
      if (data.province !== province) {
         continue;
      }
      for (const neighbor of MapGrid.getNeighbors(tileToPoint(provinceTile))) {
         const component = getSeaComponent(pointToTile(neighbor));
         if (destinationSeaComponents.has(component)) {
            return true;
         }
      }
   }

   return false;
}

export function getMediterraneanCoastalTiles(requireCore: boolean, province: Province, save: SaveGame): Tile[] {
   const result: Tile[] = [];
   for (const [tile, data] of save.state.tiles) {
      if (data.province !== province) {
         continue;
      }
      if (requireCore && !data.coreProvinces.has(province)) {
         continue;
      }
      for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
         if (MediterraneanTiles.has(pointToTile(neighbor))) {
            result.push(tile);
            break;
         }
      }
   }
   return result;
}

export function getTileUpgradeTimes(province: Province, save: SaveGame): number {
   let times = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         times += data.upgradeCount;
      }
   }
   return times;
}

export function getProvinceGreatWorks(province: Province, save: SaveGame): Set<GreatWork> {
   const result = new Set<GreatWork>();
   for (const [tile, data] of save.state.tiles) {
      const currentProvince = data.province;
      const greatWork = TileToGreatWork.get(tile);
      if (currentProvince === province && greatWork) {
         result.add(greatWork);
      }
   }
   return result;
}

export function getProvinceOriginalGreatWorks(province: Province, save: SaveGame): Set<GreatWork> {
   const result = new Set<GreatWork>();
   for (const [tile, data] of save.state.tiles) {
      const originalProvince = data.originalProvince;
      const greatWork = TileToGreatWork.get(tile);
      if (originalProvince === province && greatWork) {
         result.add(greatWork);
      }
   }
   return result;
}
