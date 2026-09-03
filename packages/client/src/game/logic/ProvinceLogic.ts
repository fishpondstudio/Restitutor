import {
   clamp,
   entriesOf,
   forEach,
   formatDelta,
   formatNumber,
   fromEntries,
   keysOf,
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
import type { Culture } from "../definitions/Culture";
import { Goods, Price } from "../definitions/Goods";
import { LegacyUpgrades } from "../definitions/LegacyUpgrade";
import { makeModifierGetter } from "../definitions/Modifier";
import { getProvinceTraits } from "../definitions/PersonTrait";
import {
   type ActiveTrade,
   type GovernorPower,
   type IProvince,
   Province,
   ProvinceFlags,
   type ProvinceNameOverride,
   ProvinceNameOverrides,
   type ProvinceResource,
   ProvinceResources,
   type ProvinceStat,
   ProvinceStats,
   type TradeOffer,
   type TradeOfferBase,
} from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { isChristianReligion, type Religion } from "../definitions/Religion";
import type { SpawnedProvince } from "../definitions/SpawnedProvince";
import {
   BarbarianRaidNegativeEffect,
   SpawnedProvinceBoostMonths,
   SpawnedProvinces,
} from "../definitions/SpawnedProvince";
import { getBorderingProvinces } from "../definitions/Tile";
import { MediterraneanTiles, StraitOfGibraltarTiles, Tiles } from "../definitions/TileConstants";
import { getTileName } from "../definitions/TileName";
import { GameStateUpdated } from "../Events";
import type { SaveGame } from "../GameState";
import { getSeaComponent } from "../Land";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import { cacheProvince } from "./CacheLogic";
import { getAttitudeTowards, getRelation, getRelations } from "./DiplomacyLogic";
import { EcumenicalCouncilChristianityPct, ongoingEcumenicalCouncilCondition } from "./EcumenicalCouncilLogic";
import { generateRandomGovernor } from "./GovernorLogic";
import { hasLegacyUpgrade } from "./LegacyUpgradeLogic";
import { addModifier, attachModifiers } from "./ModifierLogic";
import { getBaselineTechs } from "./TechLogic";
import {
   getTileGoodsTax,
   getTileGoverningCost,
   getTileLandTax,
   getTileMaintenanceCost,
   getTileManpower,
   isCoastal,
   settleTile,
} from "./TileLogic";
import { getTimedActionTimeLeft, startTimedAction } from "./TimedActionLogic";
import { getClients, getPatrons, getTreatyCount } from "./TreatyLogic";
import {
   calculateWarTotalStability,
   getCavalryUnitWarPower,
   getCurrentWars,
   getInfantryUnitWarPower,
   getRangedUnitWarPower,
   getWarPowerPerTile,
   MonthlyExtraArmyMaintenancePct,
} from "./WarLogic";

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

export function provinceResourceOf(resource: ProvinceResource, province: Province, save: SaveGame): [number, number] {
   const state = save.state.provinces[province];
   if (!state) {
      return [0, 0];
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   return state.resources[resource];
}

export function getProvinceResource(resource: ProvinceResource, province: Province, save: SaveGame): number {
   const [total, used] = provinceResourceOf(resource, province, save);
   return total - used;
}

export function addProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][0] += value;
}

export function spendProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][1] += value;
}

export function refundProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][1] -= value;
}

export function resetProvinceResource(resource: ProvinceResource, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.resources[resource] = [0, 0];
}

export function hasEnoughProvinceResources(
   resources: Partial<Record<ProvinceResource, number>>,
   province: Province,
   save: SaveGame,
): boolean {
   for (const [resource, value] of entriesOf(resources)) {
      if (getProvinceResource(resource, province, save) < value) {
         return false;
      }
   }
   return true;
}

export function trySpendProvinceResources(
   resources: Partial<Record<ProvinceResource, number>>,
   province: Province,
   save: SaveGame,
): boolean {
   if (!hasEnoughProvinceResources(resources, province, save)) {
      return false;
   }
   for (const [resource, value] of entriesOf(resources)) {
      spendProvinceResource(resource, value, province, save);
   }
   return true;
}

export const getProvinceManpower = cacheProvince(_getProvinceManpower);

function _getProvinceManpower(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         breakdown.add.push({ name: getTileName(tile, save), value: getTileManpower(tile, save).value });
      }
   }
   return finalizeBreakdown(breakdown);
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

export function getProvinceCoreTileCount(province: Province, save: SaveGame): number {
   let count = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && data.coreProvinces.has(province)) {
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
   getProvinceTraits("Distinguished", province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   return finalizeBreakdown(breakdown);
}

export function getProvinceStability(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const overextension = getProvinceOverextension(province, save).value;
   if (overextension > 0) {
      breakdown.add.push({ name: $t(L.FromOverextension), value: -overextension });
   }
   attachModifiers("Stability", breakdown, province, save);
   getProvinceTraits("Calm", province, save).forEach((trait) => {
      breakdown.add.push({ ...trait, value: 2 });
   });
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

const InfantryMaintenanceCost = 0.01;
const RangedMaintenanceCost = 0.02;
const CavalryMaintenanceCost = 0.03;

export const GeneralArmyMaintenancePct = 0.1;

export function getArmyMaintenanceCost(province: Province, save: SaveGame): IValueBreakdown {
   const maintenance = getProvinceStat("armyMaintenance", province, save);
   const breakdown: IValueBreakdown = makeValueBreakdown({
      reverse: true,
      multiplyBase: { name: $t(L.ArmyMaintenance), value: maintenance / 100 },
   });
   const manpower = getProvinceManpower(province, save);
   const conscription = getProvinceStat("actualConscription", province, save) / 100;
   const rangedUnit = getProvinceStat("rangedUnit", province, save);
   const cavalryUnit = getProvinceStat("cavalryUnit", province, save);
   const infantryUnit = 100 - rangedUnit - cavalryUnit;
   const infantryCost = manpower.value * conscription * InfantryMaintenanceCost * infantryUnit * 0.01;
   breakdown.add.push({
      name: $t(L.InfantryCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(InfantryMaintenanceCost)),
      value: infantryCost,
   });
   const rangedCost = manpower.value * conscription * RangedMaintenanceCost * rangedUnit * 0.01;
   breakdown.add.push({
      name: $t(L.RangedCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(RangedMaintenanceCost)),
      value: rangedCost,
   });
   const cavalryCost = manpower.value * conscription * CavalryMaintenanceCost * cavalryUnit * 0.01;
   breakdown.add.push({
      name: $t(L.CavalryCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(CavalryMaintenanceCost)),
      value: cavalryCost,
   });
   const wars = getCurrentWars(province, save);
   for (const war of wars) {
      if (war.attacker === province) {
         breakdown.multiply.push({
            name: $t(L.$1$2War, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
            value: MonthlyExtraArmyMaintenancePct,
         });
      }
   }
   const recruitAGeneral = getTimedActionTimeLeft("RecruitAGeneral", province, save);
   if (recruitAGeneral > 0) {
      breakdown.multiply.push({
         name: $t(L.RecruitAGeneral),
         value: GeneralArmyMaintenancePct,
      });
   }
   attachModifiers("ArmyMaintenance", breakdown, province, save);
   getProvinceTraits("Prudent", province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: -0.02 });
   });
   return finalizeBreakdown(breakdown);
}

export function getMercenaryCost(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   const actualConscription = getProvinceStat("actualConscription", province, save);
   const targetConscription = getProvinceStat("targetConscription", province, save);
   if (actualConscription < targetConscription) {
      const diff = (targetConscription - actualConscription) * 0.01;
      const manpower = getProvinceManpower(province, save);
      const rangedUnit = getProvinceStat("rangedUnit", province, save);
      const cavalryUnit = getProvinceStat("cavalryUnit", province, save);
      const infantryUnit = 100 - rangedUnit - cavalryUnit;

      const infantryUnits = manpower.value * diff * infantryUnit * 0.01;
      const infantryCost = infantryUnits * InfantryMaintenanceCost;
      result.add.push({
         name: $t(L.InfantryMercenaryCost),
         value: infantryCost * 12,
         desc: $t(L.$1Infantry, formatDelta(infantryUnits)),
      });
      const rangedUnits = manpower.value * diff * rangedUnit * 0.01;
      const rangedCost = rangedUnits * RangedMaintenanceCost;
      result.add.push({
         name: $t(L.RangedMercenaryCost),
         value: rangedCost * 12,
         desc: $t(L.$1Ranged, formatDelta(rangedUnits)),
      });
      const cavalryUnits = manpower.value * diff * cavalryUnit * 0.01;
      const cavalryCost = cavalryUnits * CavalryMaintenanceCost;
      result.add.push({
         name: $t(L.CavalryMercenaryCost),
         value: cavalryCost * 12,
         desc: $t(L.$1Cavalry, formatDelta(cavalryUnits)),
      });
   }
   return finalizeBreakdown(result);
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

export const GovernorMinIncl = 3;
export const GovernorMaxIncl = 6;
export const GovernorMaxExcl = GovernorMaxIncl + 1;

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
         tileMaintenanceCost += getTileMaintenanceCost(tile, save).value;
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

const AttackerWarPowerDiscount = -0.2;
const DefenderWarPowerDiscount = -0.1;
const CoAttackerWarPowerDiscount = -0.1;
const CoDefenderWarPowerDiscount = -0.05;

export function getWarPower(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({
      multiplyBase: { name: $t(L.CurrentMorale), value: getProvinceStat("armyMorale", province, save) / 100 },
   });
   const totalArmy =
      (getProvinceManpower(province, save).value * getProvinceStat("actualConscription", province, save)) / 100;
   const rangedUnit = getProvinceStat("rangedUnit", province, save);
   const cavalryUnit = getProvinceStat("cavalryUnit", province, save);
   const infantryUnit = 100 - rangedUnit - cavalryUnit;

   const infantryUnitWarPower = getInfantryUnitWarPower(province, save).value;
   const rangedUnitWarPower = getRangedUnitWarPower(province, save).value;
   const cavalryUnitWarPower = getCavalryUnitWarPower(province, save).value;
   result.add.push({
      name: $t(L.Infantry),
      value: totalArmy * infantryUnit * 0.01 * infantryUnitWarPower,
      desc: $t(L.UnitPower$1, formatNumber(infantryUnitWarPower)),
   });
   result.add.push({
      name: $t(L.Ranged),
      value: totalArmy * rangedUnit * 0.01 * rangedUnitWarPower,
      desc: $t(L.UnitPower$1, formatNumber(rangedUnitWarPower)),
   });
   result.add.push({
      name: $t(L.Cavalry),
      value: totalArmy * cavalryUnit * 0.01 * cavalryUnitWarPower,
      desc: $t(L.UnitPower$1, formatNumber(cavalryUnitWarPower)),
   });
   getProvinceTraits("Bold", province, save).forEach((trait) => {
      result.multiply.push({ ...trait, value: 0.02 });
   });
   if (hasProvinceUpgrade("CavalryWarPower", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.CavalryWarPower.name(),
         value: cavalryUnit * 0.01,
      });
   }
   if (hasProvinceUpgrade("RangedPredominance", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.RangedPredominance.name(),
         value: rangedUnit * 0.01,
      });
   }
   if (hasProvinceUpgrade("MartialSociety", province, save)) {
      const actualConscription = getProvinceStat("actualConscription", province, save);
      result.multiply.push({
         name: ProvinceUpgrades.MartialSociety.name(),
         value: actualConscription * 0.01,
      });
   }
   if (hasProvinceUpgrade("UnitedFrontier", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.UnitedFrontier.name(),
         value: Math.min(getNeighborProvinces(province, save).size * 0.05, 0.5),
      });
   }
   if (hasProvinceUpgrade("MoorishMuster", province, save)) {
      const coreTileGroups = Math.floor(getProvinceCoreTileCount(province, save) / 10);
      if (coreTileGroups > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.MoorishMuster.name(),
            value: coreTileGroups * 0.05,
         });
      }
   }
   if (hasProvinceUpgrade("NavalTradition", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.NavalTradition.name(),
         value: Math.min(getProvinceCoreCoastalTileCount(province, save) * 0.005, 0.5),
      });
   }
   if (hasProvinceUpgrade("MercantileMobilization", province, save)) {
      const tradeCount = getProvinceTrades(province, save).size;
      if (tradeCount > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.MercantileMobilization.name(),
            value: tradeCount * 0.1,
         });
      }
   }
   if (hasProvinceUpgrade("ExperiencedCommand", province, save)) {
      const generalSkill =
         getProvinceStat("infantrySkill", province, save) +
         getProvinceStat("rangedSkill", province, save) +
         getProvinceStat("cavalrySkill", province, save);
      if (generalSkill > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.ExperiencedCommand.name(),
            value: generalSkill * 0.02,
         });
      }
   }
   if (hasProvinceUpgrade("MulticulturalArmy", province, save)) {
      const cultures = getProvinceCultures(province, save);
      result.multiply.push({
         name: ProvinceUpgrades.MulticulturalArmy.name(),
         value: Math.min(cultures.size * 0.05, 0.5),
      });
   }
   attachModifiers("WarPower", result, province, save);
   const wars = getCurrentWars(province, save);
   if (wars.length > 1) {
      wars.forEach((war) => {
         if (war.attacker === province) {
            result.multiply.push({
               name: $t(L.$1$2WarAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: AttackerWarPowerDiscount,
            });
         }
         if (war.defender === province) {
            result.multiply.push({
               name: $t(L.$1$2WarDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: DefenderWarPowerDiscount,
            });
         }
         if (war.coAttackers.has(province)) {
            result.multiply.push({
               name: $t(L.$1$2WarCoAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoAttackerWarPowerDiscount,
            });
         }
         if (war.coDefenders.has(province)) {
            result.multiply.push({
               name: $t(L.$1$2WarCoDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoDefenderWarPowerDiscount,
            });
         }
      });
   }
   return finalizeBreakdown(result);
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
      .slice(0, 10)
      .forEach(([province, prestige], index) => {
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

export function isNorGreatPowerCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsNotAGreatPower, getProvinceName(province, save)),
      value: !isProvinceGreatPower(province, save),
   };
}

export function getProvinceTrades(province: Province, save: SaveGame): Map<Province, ActiveTrade> {
   const result = new Map<Province, ActiveTrade>();
   const relations = getRelations(province, save);
   if (relations) {
      for (const [otherProvince, relation] of relations) {
         if (relation.trade) {
            result.set(otherProvince, relation.trade);
         }
      }
   }
   return result;
}

export function rollTradeOffers(save: SaveGame): void {
   forEach(save.state.provinces, (province, state) => {
      const goods = shuffle(keysOf(Goods));
      state.tradeOffers = [
         fillOfferAmount({ theyOffer: goods[0], weOffer: goods[1] }),
         fillOfferAmount({ theyOffer: goods[2], weOffer: "gold" }),
         fillOfferAmount({ theyOffer: "gold", weOffer: goods[3] }),
      ];
   });
}

export function fillOfferAmount(offer: TradeOfferBase): TradeOffer {
   const result: TradeOffer = { ...offer, theyOfferAmount: 0, weOfferAmount: 0 };
   if (result.theyOffer !== "gold" && result.weOffer !== "gold") {
      if (Price[result.weOffer] > Price[result.theyOffer]) {
         result.weOfferAmount = 1;
         result.theyOfferAmount = Price[result.weOffer] / Price[result.theyOffer];
      } else {
         result.theyOfferAmount = 1;
         result.weOfferAmount = Price[result.theyOffer] / Price[result.weOffer];
      }
   }
   if (result.weOffer === "gold") {
      result.theyOfferAmount = 1;
      result.weOfferAmount = Price[result.theyOffer];
   }
   if (result.theyOffer === "gold") {
      result.weOfferAmount = 1;
      result.theyOfferAmount = Price[result.weOffer];
   }
   return result;
}

export function getProvinceTradeCapacity(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: 1 });
   let harbour = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && data.buildings.has("Harbour")) {
         ++harbour;
      }
   }
   if (harbour > 0) {
      result.add.push({ name: Buildings.Harbour.name(), value: harbour });
   }
   if (hasProvinceUpgrade("CommercialAlliances", province, save)) {
      const treatyCount = getTreatyCount(province, save);
      result.add.push({ name: ProvinceUpgrades.CommercialAlliances.name(), value: treatyCount });
   }
   if (hasProvinceUpgrade("CommandOfThePillars", province, save) && hasStraitOfGibraltar(province, save)) {
      result.add.push({ name: ProvinceUpgrades.CommandOfThePillars.name(), value: 3 });
   }
   attachModifiers("TradeCapacity", result, province, save);
   return finalizeBreakdown(result);
}

export function hasStraitOfGibraltar(province: Province, save: SaveGame): boolean {
   return StraitOfGibraltarTiles.every((tile) => {
      const data = save.state.tiles.get(tile);
      return data?.province === province && data.coreProvinces.has(province);
   });
}

export function getProvinceTradeProfit(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({ multiplyBase: { name: $t(L.BaseValue), value: 0.1 } });
   result.add.push({ name: $t(L.ReferenceValue), value: 1 });
   if (hasProvinceUpgrade("TradeProfitForEachTrade", province, save)) {
      const tradeCount = getProvinceTrades(province, save).size;
      if (tradeCount > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.TradeProfitForEachTrade.name(),
            value: 0.1 * tradeCount,
         });
      }
   }
   if (hasProvinceUpgrade("MaritimeProsperity", province, save)) {
      let harbour = 0;
      for (const [tile, data] of save.state.tiles) {
         if (data.province === province && data.buildings.has("Harbour")) {
            ++harbour;
         }
      }
      if (harbour > 0) {
         result.multiply.push({ name: ProvinceUpgrades.MaritimeProsperity.name(), value: harbour * 0.1 });
      }
   }
   if (hasProvinceUpgrade("CommandOfThePillars", province, save) && hasStraitOfGibraltar(province, save)) {
      result.multiply.push({ name: ProvinceUpgrades.CommandOfThePillars.name(), value: 0.3 });
   }
   attachModifiers("TradeProfit", result, province, save);
   return finalizeBreakdown(result);
}

export function getTradeProfit(ourProvince: Province, theirProvince: Province, save: SaveGame): IValueBreakdown {
   const tradeProfit = getProvinceTradeProfit(ourProvince, save);
   if (hasLegacyUpgrade("TradeProfitForAttitude", ourProvince, save)) {
      const attitude = getAttitudeTowards(theirProvince, ourProvince, save);
      if (attitude.value > 0) {
         tradeProfit.multiply.push({
            name: $t(L.LegacyUpgrade),
            desc: LegacyUpgrades.TradeProfitForAttitude.name(),
            value: attitude.value * 0.01,
         });
      }
   }
   return finalizeBreakdown(tradeProfit);
}

export function generateTrade(
   offer: TradeOfferBase,
   extraProfit: number,
   province: Province,
   save: SaveGame,
): { trade: TradeOffer; profit: number } {
   const tradeCapacity = getProvinceTradeCapacity(province, save).value;
   const tradeProfit = getProvinceTradeProfit(province, save).value;
   const result = fillOfferAmount({ ...offer });
   const totalProfit = tradeProfit + extraProfit;
   result.weOfferAmount *= tradeCapacity;
   result.theyOfferAmount *= tradeCapacity * (1 + totalProfit);
   return { trade: result, profit: totalProfit };
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
   for (const [tile, data] of save.state.tiles) {
      if (data.originalProvince === toAnnex && data.coreProvinces.has(ourProvince) && data.province === ourProvince) {
         annexed++;
      }
      if (data.originalProvince === toAnnex) {
         total++;
      }
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

export const getChristianityYearly = makeModifierGetter("ChristianityYearly", 1, (result, province, save) => {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (hasProvinceUpgrade("ChristianFervor", province, save) && isChristianReligion(state.religion)) {
      result.add.push({ name: ProvinceUpgrades.ChristianFervor.name(), value: 1 });
   }
   const ongoingCouncil = ongoingEcumenicalCouncilCondition(province, save);
   if (ongoingCouncil.value) {
      result.multiply.push({ name: ongoingCouncil.name, value: EcumenicalCouncilChristianityPct });
   }
});

export const getToleratedReligion = makeModifierGetter("ToleratedReligion", 0, (result, province, save) => {});
export const getToleratedCulture = makeModifierGetter("ToleratedCulture", 0, (result, province, save) => {
   if (hasProvinceUpgrade("InclusiveCitizenship", province, save)) {
      result.add.push({ name: ProvinceUpgrades.InclusiveCitizenship.name(), value: 1 });
   }
});

export function getReligiousCohesion(province: Province, save: SaveGame): number {
   let sameReligion = 0;
   let total = 0;
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         const totalUpgrades = data.infrastructure + data.production + data.population;
         if (data.religion === state.religion || state.toleratedReligions.has(data.religion)) {
            sameReligion += totalUpgrades;
         }
         total += totalUpgrades;
      }
   }
   return sameReligion / total;
}

export function getCulturalCohesion(province: Province, save: SaveGame): number {
   let sameCulture = 0;
   let total = 0;
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         const totalUpgrades = data.infrastructure + data.production + data.population;
         if (data.culture === state.culture || state.toleratedCultures.has(data.culture)) {
            sameCulture += totalUpgrades;
         }
         total += totalUpgrades;
      }
   }
   return sameCulture / total;
}

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

   const currentWarPower = getWarPower(province, save).value;
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

export function changeProvinceReligion(religion: Religion, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.toleratedReligions.has(religion)) {
      state.toleratedReligions.delete(religion);
   }
   state.religion = religion;
}

export function changeProvinceCulture(culture: Culture, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.toleratedCultures.has(culture)) {
      state.toleratedCultures.delete(culture);
   }
   state.culture = culture;
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

export function getCulturePercentage(
   culture: Culture,
   province: Province,
   save: SaveGame,
): { count: number; percentage: number } {
   let count = 0;
   let totalTiles = 0;
   for (const data of save.state.tiles.values()) {
      if (data.province !== province) {
         continue;
      }
      totalTiles++;
      if (data.culture === culture) {
         count++;
      }
   }
   return { count, percentage: totalTiles === 0 ? 0 : count / totalTiles };
}

export function getReligionPercentage(
   religion: Religion,
   province: Province,
   save: SaveGame,
): { count: number; percentage: number } {
   let count = 0;
   let totalTiles = 0;
   for (const data of save.state.tiles.values()) {
      if (data.province !== province) {
         continue;
      }
      totalTiles++;
      if (data.religion === religion) {
         count++;
      }
   }
   return { count, percentage: totalTiles === 0 ? 0 : count / totalTiles };
}

export function getProvinceCultures(province: Province, save: SaveGame): Set<Culture> {
   const cultures = new Set<Culture>();
   for (const data of save.state.tiles.values()) {
      if (data.province === province && data.coreProvinces.has(province)) {
         cultures.add(data.culture);
      }
   }
   return cultures;
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
