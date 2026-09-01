import { formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import { Culture } from "../definitions/Culture";
import {
   type Province,
   type ProvinceResource,
   ProvinceResourceNames,
   type ProvinceStat,
   ProvinceStatNames,
} from "../definitions/Province";
import { Religion, type Religion as ReligionType } from "../definitions/Religion";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getMarriageAlliance } from "./DiplomacyLogic";
import {
   getCulturePercentage,
   getMediterraneanCoastalTiles,
   getProvinceCoreCoastalTileCount,
   getProvinceCoreTileCount,
   getProvinceGoverningCost,
   getProvinceIncome,
   getProvinceManpower,
   getProvinceName,
   getProvinceResource,
   getProvinceStat,
   getReligionPercentage,
   getWarPower,
   provinceResourceOf,
} from "./ProvinceLogic";
import { isCoreTile } from "./TileLogic";
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

export function victoryCountCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const victoryCount = getProvinceStat("victoryCount", province, save);
   return {
      name: $t(L.Win$1Wars, formatNumber(minimum)),
      value: victoryCount >= minimum,
      progress: [victoryCount, minimum],
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

export function provinceTotalResourceCondition(
   resource: ProvinceResource,
   minimum: number,
   province: Province,
   save: SaveGame,
): ICondition {
   const [total, used] = provinceResourceOf(resource, province, save);
   return {
      name: $t(L.GenerateAtLeast$1$2, formatNumber(minimum), ProvinceResourceNames[resource]()),
      value: total >= minimum,
      progress: [total, minimum],
   };
}

export function provinceUsedResourceCondition(
   resource: ProvinceResource,
   minimum: number,
   province: Province,
   save: SaveGame,
): ICondition {
   const [total, used] = provinceResourceOf(resource, province, save);
   return {
      name: $t(L.SpendAtLeast$1$2, formatNumber(minimum), ProvinceResourceNames[resource]()),
      value: used >= minimum,
      progress: [used, minimum],
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

export function annexTiles({
   tiles,
   core = false,
   province,
   save,
}: {
   tiles: Tile[];
   core?: boolean;
   province: Province;
   save: SaveGame;
}): void {
   for (const tile of tiles) {
      const tileData = save.state.tiles.get(tile);
      if (tileData) {
         tileData.province = province;
         if (core) {
            tileData.coreProvinces.add(province);
         }
      }
   }
   RefreshTiles.emit({ tiles, options: { indicator: true, visual: true } });
}

export function mediterraneanCoastCondition(minimum: number, province: Province, save: SaveGame): ICondition {
   const coast = getMediterraneanCoastalTiles(true, province, save);
   return {
      name: $t(L.AnnexAndCore$1MediterraneanCoastalTiles, formatNumber(minimum)),
      value: coast.length >= minimum,
      progress: [coast.length, minimum],
   };
}

export function isUnsettledCondition(tile: Tile, save: SaveGame): ICondition {
   return {
      name: `<Tile>${tile}</Tile> is unsettled`,
      value: !save.state.tiles.has(tile),
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

export function isCoreTileCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1AnnexesAndCores$2, getProvinceName(province, save), `<Tile>${tile}</Tile>`),
      value: isCoreTile(tile, province, save),
   };
}

export function tileIsOurCoreCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   const tileData = save.state.tiles.get(tile);
   return {
      name: $t(L.TileIsCurrentlyOurCore),
      value: !!tileData && tileData.coreProvinces.has(province) && tileData.province === province,
   };
}

export function minCulturePercentageCondition(
   minimum: number,
   culture: Culture,
   province: Province,
   save: SaveGame,
): ICondition {
   const { percentage } = getCulturePercentage(culture, province, save);
   return {
      name: $t(
         L.$1HasAtLeast$2TilesWith$3Culture,
         getProvinceName(province, save),
         formatPercent(minimum),
         Culture[culture].name(),
      ),
      value: percentage >= minimum,
      progress: [formatPercent(percentage), formatPercent(minimum)],
   };
}

export function minReligionPercentageCondition(
   minimum: number,
   religion: ReligionType,
   province: Province,
   save: SaveGame,
): ICondition {
   const { percentage } = getReligionPercentage(religion, province, save);
   return {
      name: $t(
         L.$1HasAtLeast$2TilesFollowing$3,
         getProvinceName(province, save),
         formatPercent(minimum),
         Religion[religion].name(),
      ),
      value: percentage >= minimum,
      progress: [formatPercent(percentage), formatPercent(minimum)],
   };
}

export function minCultureCountCondition(
   minimum: number,
   culture: Culture,
   province: Province,
   save: SaveGame,
): ICondition {
   const { count } = getCulturePercentage(culture, province, save);
   return {
      name: $t(
         L.$1HasAtLeast$2TilesWith$3Culture,
         getProvinceName(province, save),
         formatNumber(minimum),
         Culture[culture].name(),
      ),
      value: count >= minimum,
      progress: [count, minimum],
   };
}

export function minReligionCountCondition(
   minimum: number,
   religion: ReligionType,
   province: Province,
   save: SaveGame,
): ICondition {
   const { count } = getReligionPercentage(religion, province, save);
   return {
      name: $t(
         L.$1HasAtLeast$2TilesFollowing$3,
         getProvinceName(province, save),
         formatNumber(minimum),
         Religion[religion].name(),
      ),
      value: count >= minimum,
      progress: [count, minimum],
   };
}
