import { formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import {
   getProvinceGoverningCost,
   getProvinceIncome,
   getProvinceManpower,
   getProvinceTileCount,
   getWarPower,
} from "./ProvinceLogic";
import { getAllies } from "./TreatyLogic";

export function provinceIncomeCondition(minimum: number, province: Province, save: SaveGame): ICondition {
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

export function coreTileCountCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const tileCount = getProvinceTileCount(province, save);
   return {
      name: $t(L.HaveAtLeast$1CoreTiles, formatNumber(minimum)),
      value: tileCount >= minimum,
      progress: [tileCount, minimum],
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
