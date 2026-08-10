import { formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import {
   type Province,
   type ProvinceResource,
   ProvinceResourceNames,
   type ProvinceStat,
   ProvinceStatNames,
} from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getMarriageAlliance } from "./DiplomacyLogic";
import {
   getProvinceCoreCoastalTileCount,
   getProvinceCoreTileCount,
   getProvinceGoverningCost,
   getProvinceIncome,
   getProvinceManpower,
   getProvinceName,
   getProvinceResource,
   getProvinceStat,
   getWarPower,
} from "./ProvinceLogic";
import { getAllies } from "./TreatyLogic";

export function provinceRevenueCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const monthlyRevenue = getProvinceIncome(province, save).revenue.value;
   return {
      name: $t(L.Reach$1MonthlyRevenue, formatNumber(minimum)),
      value: monthlyRevenue >= minimum,
      progress: [monthlyRevenue, minimum],
   };
}

export function manpowerCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const manpower = getProvinceManpower(province, save).value;
   return {
      name: $t(L.Reach$1Manpower, formatNumber(minimum)),
      value: manpower >= minimum,
      progress: [manpower, minimum],
   };
}

export function techCountCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const technologies = save.state.provinces[province]?.unlockedTech.size ?? 0;
   return {
      name: $t(L.Research$1Technologies, formatNumber(minimum)),
      value: technologies >= minimum,
      progress: [technologies, minimum],
   };
}

export function allyCountCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const allies = getAllies(province, save).length;
   return {
      name: $t(L.HaveAtLeast$1Allies, formatNumber(minimum)),
      value: allies >= minimum,
      progress: [allies, minimum],
   };
}

export function warPowerCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const warPower = getWarPower(province, save).value;
   return {
      name: $t(L.Reach$1WarPower, formatNumber(minimum)),
      value: warPower >= minimum,
      progress: [warPower, minimum],
   };
}

export function minCoreCoastalTileCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const tileCount = getProvinceCoreCoastalTileCount(province, save);
   return {
      name: $t(L.$1HasAtLeast$2CoreCoastalTiles, getProvinceName(province, save), formatNumber(minimum)),
      value: tileCount >= minimum,
      progress: [tileCount, minimum],
   };
}

export function minCoreTileCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const tileCount = getProvinceCoreTileCount(province, save);
   return {
      name: $t(L.$1HasAtLeast$2CoreTiles, getProvinceName(province, save), formatNumber(minimum)),
      value: tileCount >= minimum,
      progress: [tileCount, minimum],
   };
}

export function maxCoreTileCondition(max: number, province: Province, save: SaveGame): ICondition {
   const tileCount = getProvinceCoreTileCount(province, save);
   return {
      name: $t(L.$1HasAtMost$2CoreTiles, getProvinceName(province, save), formatNumber(max)),
      value: tileCount <= max,
   };
}

export function governingCostCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const governingCost = getProvinceGoverningCost(province, save).value;
   return {
      name: $t(L.Reach$1GoverningCost, formatNumber(minimum)),
      value: governingCost >= minimum,
      progress: [governingCost, minimum],
   };
}

export function provinceResourceCondition(
   resource: ProvinceResource,
   minimum: number,
   province: Province,
   save: SaveGame,
): ICondition {
   const available = getProvinceResource(resource, province, save);
   return {
      name: $t(L.HaveAtLeast$1$2, formatNumber(minimum), ProvinceResourceNames[resource]()),
      value: available >= minimum,
      progress: [available, minimum],
   };
}

export function provinceStatCondition(
   stat: ProvinceStat,
   minimum: number,
   province: Province,
   save: SaveGame,
): ICondition {
   const value = getProvinceStat(stat, province, save);
   return {
      name: $t(L.HaveAtLeast$1$2, formatNumber(minimum), ProvinceStatNames[stat]()),
      value: value >= minimum,
      progress: [value, minimum],
   };
}

export function marriageCondition(province1: Province, province2: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1HasAMarriageWith$2, getProvinceName(province1, save), getProvinceName(province2, save)),
      value: getMarriageAlliance(province1, province2, save).length > 0,
   };
}
