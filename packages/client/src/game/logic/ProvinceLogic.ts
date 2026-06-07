import {
   entriesOf,
   filterInPlace,
   forEach,
   formatDelta,
   formatNumber,
   fromEntries,
   keysOf,
   pointToTile,
   range,
   safePush,
   shuffle,
   sizeOf,
   type Tile,
   tileToPoint,
} from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IValueBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { NegotiateWhitePeaceAction } from "../actions/NegotiateWhitePeaceAction";
import { hasProvinceUpgrade } from "../actions/ProvinceUpgrades";
import { getAdvisorMonthlyCost, initAdvisors } from "../definitions/Advisor";
import { Buildings } from "../definitions/Building";
import { Goods, Price } from "../definitions/Goods";
import type { IModifier, Modifier } from "../definitions/Modifier";
import { getProvinceTraits } from "../definitions/PersonTrait";
import {
   type ActiveTrade,
   type GovernorPower,
   type IProvince,
   Province,
   ProvinceExtraGoverningCapacity,
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
import { SocialClasses, SocialClassNames } from "../definitions/SocialClass";
import type { ITileConfig } from "../definitions/Tile";
import { getTileName } from "../definitions/TileName";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import { makeCached } from "./CacheLogic";
import { getRelations } from "./DiplomacyLogic";
import { generateRandomGovernor } from "./GovernorLogic";
import { getSocialClassBonusName, isSocialClassDissent, SocialClassDissentEffectPct } from "./SocialClassLogic";
import {
   BankruptcyStabilityReduction,
   getTileDefense,
   getTileGoodsTax,
   getTileGoverningCost,
   getTileLandTax,
   getTileMaintenanceCost,
   getTileManpower,
} from "./TileLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";
import { getClients, getPatrons } from "./TreatyLogic";
import {
   getCavalryUnitWarPower,
   getCurrentWars,
   getGeneralMonthlyCost,
   getInfantryUnitWarPower,
   getRangedUnitWarPower,
   MonthlyExtraArmyMaintenancePct,
   MonthlyStabilityCostWithCB,
   MonthlyStabilityCostWithoutCB,
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

export function getProvinceManpower(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         breakdown.add.push({ name: getTileName(tile), value: getTileManpower(tile, save).value });
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

export function getProvinceUpgrade(province: Province, save: SaveGame): number {
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
   breakdown.add.push({ name: $t(L.TileUpgrades), value: getProvinceUpgrade(province, save) });
   if (hasProvinceUpgrade("MiddleClassPrestige", province, save)) {
      breakdown.multiply.push({
         ...getSocialClassBonusName("MiddleClassPrestige"),
         value: 0.1,
      });
   }
   attachModifiers("Prestige", breakdown, province, save);
   getProvinceTraits("Distinguished", province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: 0.02 });
   });
   return finalizeBreakdown(breakdown);
}

export function getProvinceStability(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   if (hasProvinceUpgrade("UpperClassStability", province, save)) {
      breakdown.add.push({
         ...getSocialClassBonusName("UpperClassStability"),
         value: 10,
      });
   }
   if (isSocialClassDissent("UpperClass", province, save)) {
      breakdown.add.push({
         name: $t(L.XClassDissent, SocialClassNames.UpperClass()),
         value: SocialClassDissentEffectPct * 100,
      });
   }
   if (isSocialClassDissent("MiddleClass", province, save)) {
      breakdown.add.push({
         name: $t(L.XClassDissent, SocialClassNames.MiddleClass()),
         value: SocialClassDissentEffectPct * 100,
      });
   }
   if (isSocialClassDissent("LowerClass", province, save)) {
      breakdown.add.push({
         name: $t(L.XClassDissent, SocialClassNames.LowerClass()),
         value: SocialClassDissentEffectPct * 100,
      });
   }

   const overextension = getProvinceOverextension(province, save).value;
   if (overextension > 0) {
      breakdown.add.push({ name: $t(L.FromOverextension), value: -overextension });
   }

   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", province, save);
   if (bankruptcy > 0) {
      breakdown.add.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyStabilityReduction,
      });
   }

   attachModifiers("Stability", breakdown, province, save);
   getProvinceTraits("Calm", province, save).forEach((trait) => {
      breakdown.add.push({ ...trait, value: 2 });
   });

   const wars = getCurrentWars(province, save);

   for (const war of wars) {
      if (war.attacker === province) {
         let warCost = war.casusBelli === "None" ? MonthlyStabilityCostWithoutCB : MonthlyStabilityCostWithCB;
         warCost *= war.log.length;
         breakdown.add.push({
            name: $t(L.XYWar, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
            desc: $t(L.WarHasBeenGoingOnForXMonths, formatNumber(war.log.length)),
            value: -warCost,
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

export function getProvinceense(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         breakdown.add.push({ name: getTileName(tile), value: getTileDefense(tile, save).value });
      }
   }
   return finalizeBreakdown(breakdown);
}

const InfantryMaintenanceCost = 0.01;
const RangedMaintenanceCost = 0.02;
const CavalryMaintenanceCost = 0.03;

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
      desc: $t(L.XGoldPerArmySize, formatNumber(InfantryMaintenanceCost)),
      value: infantryCost,
   });
   const rangedCost = manpower.value * conscription * RangedMaintenanceCost * rangedUnit * 0.01;
   breakdown.add.push({
      name: $t(L.RangedCost),
      desc: $t(L.XGoldPerArmySize, formatNumber(RangedMaintenanceCost)),
      value: rangedCost,
   });
   const cavalryCost = manpower.value * conscription * CavalryMaintenanceCost * cavalryUnit * 0.01;
   breakdown.add.push({
      name: $t(L.CavalryCost),
      desc: $t(L.XGoldPerArmySize, formatNumber(CavalryMaintenanceCost)),
      value: cavalryCost,
   });
   const wars = getCurrentWars(province, save);
   for (const war of wars) {
      if (war.attacker === province) {
         breakdown.multiply.push({
            name: $t(L.XYWar, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
            value: MonthlyExtraArmyMaintenancePct,
         });
      }
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
         desc: $t(L.XInfantry, formatDelta(infantryUnits)),
      });
      const rangedUnits = manpower.value * diff * rangedUnit * 0.01;
      const rangedCost = rangedUnits * RangedMaintenanceCost;
      result.add.push({
         name: $t(L.RangedMercenaryCost),
         value: rangedCost * 12,
         desc: $t(L.XRanged, formatDelta(rangedUnits)),
      });
      const cavalryUnits = manpower.value * diff * cavalryUnit * 0.01;
      const cavalryCost = cavalryUnits * CavalryMaintenanceCost;
      result.add.push({
         name: $t(L.CavalryMercenaryCost),
         value: cavalryCost * 12,
         desc: $t(L.XCavalry, formatDelta(cavalryUnits)),
      });
   }
   return finalizeBreakdown(result);
}

export const getProvinceOverextension = makeCached(_getProvinceOverextension);
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
   const extraCapacity = ProvinceExtraGoverningCapacity[province] ?? 0;
   if (extraCapacity > 0) {
      breakdown.add.push({ name: getProvinceName(province, save), value: extraCapacity });
   }
   const restoration = getRestoration(province, save);
   if (restoration > 0) {
      breakdown.add.push({
         name: $t(L.Restoration),
         value: restoration * getGoverningCapacityPerRestoration(province, save).value,
      });
   }
   attachModifiers("GoverningCapacity", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export const getProvinceGoverningCost = makeCached(_getProvinceGoverningCost);
function _getProvinceGoverningCost(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   let result = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         result += getTileGoverningCost(tile, save).value;
      }
   }
   breakdown.add.push({ name: $t(L.FromAllTiles), value: result });
   return finalizeBreakdown(breakdown);
}

export const GovernorMinIncl = 3;
export const GovernorMaxIncl = 6;
export const GovernorMaxExcl = GovernorMaxIncl + 1;

export function initProvince(province: Province): IProvince {
   return {
      nameOverride: undefined,
      culture: Province[province].culture,
      religion: Province[province].religion,
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
      capital: getProvinceCapital(province, RomeMap),
      rivals: [null, null],
      _relations: new Map(),
      unlockedTech: new Set(["A1", "A2", "A3"]),
      loans: [],
      timedActions: new Map(),
      production: fromEntries(entriesOf(Goods).map(([goods]) => [goods, { capacity: 0, storage: 0, autoSell: false }])),
      modifiers: {},
      monthlyModifiers: {},
      events: new Map(),
      usedEvents: new Set(),
      legacyUpgrades: new Map(),
      provinceUpgrades: new Set(),
      blackboard: {
         resources: {},
      },
      completedMissions: new Set(),
      socialClasses: fromEntries(
         SocialClasses.map((socialClass) => [
            socialClass,
            {
               loyalty: 50,
               influence: 50,
               dissent: 0,
            },
         ]),
      ),
      tradeOffers: [],
      flags: ProvinceFlags.None,
      monthly: {
         tradeGold: new Map(),
         goodsTax: new Map(),
         skippedTrade: new Set(),
      },
   };
}

function getProvinceCapital(province: Province, tiles: Map<Tile, ITileConfig>): Tile {
   for (const [tile, data] of tiles) {
      if (data.province === province && data.isCapital) {
         return tile;
      }
   }
   throw new Error(`No capital found for province ${province}`);
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
   if (type === "administrative") {
      attachModifiers("AdministrativePoint", breakdown, province, save);
   }
   if (type === "administrative" && hasProvinceUpgrade("UpperClassAdministrativePoint", province, save)) {
      breakdown.add.push({
         ...getSocialClassBonusName("UpperClassAdministrativePoint"),
         value: 1,
      });
   }
   if (type === "diplomatic") {
      attachModifiers("DiplomaticPoint", breakdown, province, save);
   }
   if (type === "diplomatic" && hasProvinceUpgrade("MiddleClassDiplomaticPoint", province, save)) {
      breakdown.add.push({
         ...getSocialClassBonusName("MiddleClassDiplomaticPoint"),
         value: 1,
      });
   }
   if (type === "military") {
      attachModifiers("MilitaryPoint", breakdown, province, save);
   }
   if (type === "military" && hasProvinceUpgrade("LowerClassMilitaryPoint", province, save)) {
      breakdown.add.push({
         ...getSocialClassBonusName("LowerClassMilitaryPoint"),
         value: 1,
      });
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

export function getProvinceIncome(
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
         name: $t(L.TributeFromX, getProvinceName(clientProvince, save)),
         value: getProvinceIncome(clientProvince, save).revenue.value * 0.1,
      });
   });

   expense.add.push({ name: $t(L.TileMaintenance), value: -tileMaintenanceCost });
   expense.add.push({ name: $t(L.BuildingMaintenance), value: -buildingMaintenanceCost });
   expense.add.push({ name: $t(L.ArmyMaintenance), value: -armyMaintenanceCost });
   expense.add.push({ name: $t(L.AdvisorCost), value: -advisorCost });

   state.monthly.tradeGold.forEach((value, otherProvince) => {
      if (value > 0) {
         revenue.add.push({ name: $t(L.TradeWithX, getProvinceName(otherProvince, save)), value: value });
      } else {
         expense.add.push({ name: $t(L.TradeWithX, getProvinceName(otherProvince, save)), value: -value });
      }
   });

   // Finalize revenue before calculating tributes
   finalizeBreakdown(revenue);
   getPatrons(province, save).forEach((patronProvince) => {
      expense.add.push({
         name: $t(L.TributeToX, getProvinceName(patronProvince, save)),
         value: -revenue.value * 0.1,
      });
   });

   const recruitAGeneral = getTimedActionTimeLeft("RecruitAGeneral", province, save);
   if (recruitAGeneral > 0) {
      expense.add.push({
         name: $t(L.RecruitAGeneral),
         value: -getGeneralMonthlyCost(province, save).value,
      });
   }

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
      desc: $t(L.UnitPowerX, formatNumber(infantryUnitWarPower)),
   });
   result.add.push({
      name: $t(L.Ranged),
      value: totalArmy * rangedUnit * 0.01 * rangedUnitWarPower,
      desc: $t(L.UnitPowerX, formatNumber(rangedUnitWarPower)),
   });
   result.add.push({
      name: $t(L.Cavalry),
      value: totalArmy * cavalryUnit * 0.01 * cavalryUnitWarPower,
      desc: $t(L.UnitPowerX, formatNumber(cavalryUnitWarPower)),
   });
   getProvinceTraits("Bold", province, save).forEach((trait) => {
      result.multiply.push({ ...trait, value: 0.02 });
   });
   attachModifiers("WarPower", result, province, save);
   const makeWarSpeech = getTimedActionTimeLeft("MakeWarSpeech", province, save);
   if (makeWarSpeech > 0) {
      result.multiply.push({
         name: $t(L.MakeWarSpeech),
         desc: $t(L.XMonthsLeft, formatNumber(makeWarSpeech)),
         value: 0.1,
      });
   }
   if (hasProvinceUpgrade("LowerClassWarPower", province, save)) {
      result.multiply.push({
         ...getSocialClassBonusName("LowerClassWarPower"),
         value: 0.1,
      });
   }
   const wars = getCurrentWars(province, save);
   if (wars.length > 1) {
      wars.forEach((war) => {
         if (war.attacker === province) {
            result.multiply.push({
               name: $t(L.XYWarAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: AttackerWarPowerDiscount,
            });
         }
         if (war.defender === province) {
            result.multiply.push({
               name: $t(L.XYWarDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: DefenderWarPowerDiscount,
            });
         }
         if (war.coAttackers.has(province)) {
            result.multiply.push({
               name: $t(L.XYWarCoAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoAttackerWarPowerDiscount,
            });
         }
         if (war.coDefenders.has(province)) {
            result.multiply.push({
               name: $t(L.XYWarCoDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoDefenderWarPowerDiscount,
            });
         }
      });
   }
   return finalizeBreakdown(result);
}

export function ensureProvinceCapital(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (save.state.tiles.get(state.capital)?.province === province) {
      return;
   }
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         state.capital = tile;
         return;
      }
   }
   console.warn(
      `ensureProvinceCapital: cannot find a capital for ${province}. It is likely that the province has no tiles.`,
   );
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
      name: $t(L.XIsAGreatPower, getProvinceName(province, save)),
      value: isProvinceGreatPower(province, save),
   };
}

export function isNorGreatPowerCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.XIsNotAGreatPower, getProvinceName(province, save)),
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

function fillOfferAmount(offer: TradeOfferBase): TradeOffer {
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

export function getProvinceProductionCapacity(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: 5 });
   attachModifiers("ProductionCapacity", result, province, save);
   let workshop = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && data.buildings.has("Workshop")) {
         ++workshop;
      }
   }
   if (workshop > 0) {
      result.add.push({ name: Buildings.Workshop.name(), value: workshop });
   }
   return finalizeBreakdown(result);
}

export function getProvinceUsedProductionCapacity(province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   return entriesOf(state.production).reduce(
      (acc, [goods, data]) => acc + (sizeOf(Goods[goods].input) > 0 ? data.capacity : 0),
      0,
   );
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
   attachModifiers("TradeCapacity", result, province, save);
   return finalizeBreakdown(result);
}

export function getProvinceTradeProfit(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({ multiplyBase: { name: $t(L.BaseValue), value: 0.1 } });
   result.add.push({ name: $t(L.ReferenceValue), value: 1 });
   attachModifiers("TradeProfit", result, province, save);
   return finalizeBreakdown(result);
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

export const ConsulElectionMonths = 24;

export function pledgeProvinceConsulVotes(province: Province, save: SaveGame): void {
   const votes = save.state.senate.votes.get(province);
   if (!votes) {
      save.state.senate.votes.set(
         province,
         new Set(shuffle(range(0, save.state.senate.consulCandidates.length)).slice(0, 2)),
      );
   }
}

interface IAddModifier extends IModifier {
   modifier: Modifier;
   province: Province;
   save: SaveGame;
}

export function addModifier({ modifier, name, type, value, duration, province, save }: IAddModifier): void {
   const state = save.state.provinces[province];
   if (state) {
      safePush(state.modifiers, modifier, { name, type, value, duration });
   }
}

export function addMonthlyModifier(type: Modifier, value: IModifier, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (state) {
      safePush(state.monthlyModifiers, type, value);
   }
}

export function attachTileModifiers(modifiers: IModifier[] | undefined, breakdown: IValueBreakdown): IValueBreakdown {
   if (modifiers) {
      for (const modifier of modifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.XMonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      }
   }
   return breakdown;
}

export function attachModifiers(
   type: Modifier,
   breakdown: IValueBreakdown,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   const modifiers = save.state.provinces[province]?.modifiers[type];
   if (modifiers) {
      for (const modifier of modifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.XMonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      }
   }
   const monthlyModifiers = save.state.provinces[province]?.monthlyModifiers[type];
   if (monthlyModifiers) {
      for (const modifier of monthlyModifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            value: modifier.value,
         });
      }
   }
   return breakdown;
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

// This function should remove `province` and clean up all references to it from `SaveGame`
export function cleanUpProvince(province: Province, save: SaveGame): void {
   forEach(save.state.provinces, (otherProvince, state) => {
      if (otherProvince === province) {
         return;
      }
      getRelations(otherProvince, save)?.delete(province);
      for (let i = 0; i < state.rivals.length; i++) {
         if (state.rivals[i] === province) {
            state.rivals[i] = null;
         }
      }
   });
   filterInPlace(save.state.wars, (war) => {
      if (war.attacker === province || war.defender === province) {
         NegotiateWhitePeaceAction(war, province, save).effect({ headless: true });
         return false;
      }
      war.coAttackers.delete(province);
      war.coDefenders.delete(province);
      return true;
   });
   delete save.state.provinces[province];
   clearProvincePrestigeRankingCache();
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
export const BaseGoverningCapacityPerRestoration = 10;

export function getGoverningCapacityPerRestoration(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: BaseGoverningCapacityPerRestoration });
   return finalizeBreakdown(result);
}

export function getChristianityYearly(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: 1 });
   attachModifiers("ChristianityYearly", result, province, save);
   return finalizeBreakdown(result);
}
