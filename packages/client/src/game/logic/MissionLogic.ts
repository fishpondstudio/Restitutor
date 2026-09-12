import { filterInPlace, formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Culture } from "../definitions/Culture";
import { type Province, type ProvinceResource, ProvinceResourceNames } from "../definitions/Province";
import { RefreshTiles } from "../Events";
import type { ICustomEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { getProvinceManpower, getWarPower } from "./ArmyLogic";
import { getProvinceCoreTilesCached } from "./CacheLogic";
import type { ConditionChecks } from "./Calculation";
import { getMarriageAlliance, getRelation } from "./DiplomacyLogic";
import { getCulturePercentage } from "./InternalAffairsLogic";
import {
   getMediterraneanCoastalTiles,
   getProvinceCoreCoastalTileCount,
   getProvinceIncome,
   getProvinceName,
   getProvinceStat,
   getTileUpgradeTimes,
} from "./ProvinceLogic";
import { getProvinceResource, provinceResourceOf } from "./ResourceLogic";
import { isCoreTile } from "./TileLogic";
import { dissolveAllTreaties, getAllies } from "./TreatyLogic";

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

export function tileIsOurCoreCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   const tileData = save.state.tiles.get(tile);
   return {
      name: $t(L.TileIsCurrentlyOurCore),
      value: !!tileData && tileData.coreProvinces.has(province) && tileData.province === province,
   };
}

export function forcePatronageEffect(client: Province): ICustomEffect {
   return {
      execute: (province, save) => {
         if (province === client) return;
         dissolveAllTreaties(client, save);
         OfferPatronageAction(province, client, save).execute({ headless: false });
      },
      desc: (province, save) => $t(L.$1BecomesOurClient, getProvinceName(client, save)),
   };
}

export function nullifyNegativeAttitudesEffect(fromProvince: Province): ICustomEffect {
   return {
      execute: (province, save) => {
         const relation = getRelation(fromProvince, province, save);
         if (relation) {
            filterInPlace(relation.attitudeModifier, (modifier) => {
               return modifier.value > 0;
            });
         }
      },
      desc: (province, save) => {
         return $t(
            L.$1NullifiesAllNegativeAttitudesTowards$2,
            getProvinceName(fromProvince, save),
            getProvinceName(province, save),
         );
      },
   };
}

export function* provinceRevenueChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const monthlyRevenue = getProvinceIncome(province, save).revenue.value;
   (yield monthlyRevenue >= minimum)?.describe($t(L.Reach$1MonthlyRevenue, formatNumber(minimum)), {
      progress: [monthlyRevenue, minimum],
   });
}

export function* manpowerChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const manpower = getProvinceManpower(province, save).value;
   (yield manpower >= minimum)?.describe($t(L.Reach$1Manpower, formatNumber(minimum)), {
      progress: [manpower, minimum],
   });
}

export function* techCountChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const technologies = save.state.provinces[province]?.unlockedTech.size ?? 0;
   (yield technologies >= minimum)?.describe($t(L.Research$1Technologies, formatNumber(minimum)), {
      progress: [technologies, minimum],
   });
}

export function* allyCountChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const allies = getAllies(province, save).length;
   (yield allies >= minimum)?.describe($t(L.HaveAtLeast$1Allies, formatNumber(minimum)), {
      progress: [allies, minimum],
   });
}

export function* warPowerChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const warPower = getWarPower(province, save).total.value;
   (yield warPower >= minimum)?.describe($t(L.Reach$1WarPower, formatNumber(minimum)), {
      progress: [warPower, minimum],
   });
}

export function* victoryCountChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const victoryCount = getProvinceStat("victoryCount", province, save);
   (yield victoryCount >= minimum)?.describe($t(L.Win$1Wars, formatNumber(minimum)), {
      progress: [victoryCount, minimum],
   });
}

export function* makeCoreCountChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const makeCoreCount = getProvinceStat("makeCoreCount", province, save);
   (yield makeCoreCount >= minimum)?.describe($t(L.Make$1TilesOurCore, formatNumber(minimum)), {
      progress: [makeCoreCount, minimum],
   });
}

export function* minCoreCoastalTileChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const tileCount = getProvinceCoreCoastalTileCount(province, save);
   (yield tileCount >= minimum)?.describe(
      $t(L.$1HasAtLeast$2CoreCoastalTiles, getProvinceName(province, save), formatNumber(minimum)),
      { progress: [tileCount, minimum] },
   );
}

export function* minCoreTileChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const tileCount = getProvinceCoreTilesCached(province).length;
   (yield tileCount >= minimum)?.describe(
      $t(L.$1HasAtLeast$2CoreTiles, getProvinceName(province, save), formatNumber(minimum)),
      { progress: [tileCount, minimum] },
   );
}

export function* maxCoreTileChecks(max: number, province: Province, save: SaveGame): ConditionChecks {
   const tileCount = getProvinceCoreTilesCached(province).length;
   (yield tileCount <= max)?.describe($t(L.$1HasAtMost$2CoreTiles, getProvinceName(province, save), formatNumber(max)));
}

export function* provinceResourceChecks(
   resource: ProvinceResource,
   minimum: number,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   const available = getProvinceResource(resource, province, save);
   (yield available >= minimum)?.describe(
      $t(L.HaveAtLeast$1$2, formatNumber(minimum), ProvinceResourceNames[resource]()),
      { progress: [available, minimum] },
   );
}

export function* provinceUsedResourceChecks(
   resource: ProvinceResource,
   minimum: number,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   const [, used] = provinceResourceOf(resource, province, save);
   (yield used >= minimum)?.describe($t(L.SpendAtLeast$1$2, formatNumber(minimum), ProvinceResourceNames[resource]()), {
      progress: [used, minimum],
   });
}

export function* marriageChecks(province1: Province, province2: Province, save: SaveGame): ConditionChecks {
   (yield getMarriageAlliance(province1, province2, save).length > 0)?.describe(
      $t(L.$1HasAMarriageWith$2, getProvinceName(province1, save), getProvinceName(province2, save)),
   );
}

export function* mediterraneanCoastChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const coast = getMediterraneanCoastalTiles(true, province, save);
   (yield coast.length >= minimum)?.describe($t(L.AnnexAndCore$1MediterraneanCoastalTiles, formatNumber(minimum)), {
      progress: [coast.length, minimum],
   });
}

export function* allCoreTileChecks(tiles: Iterable<Tile>, province: Province, save: SaveGame): ConditionChecks {
   const tileList = Array.from(tiles);
   (yield tileList.every((tile) => isCoreTile(tile, province, save)))?.describe(
      $t(
         L.$1AnnexesAndCoresAllOf$2,
         getProvinceName(province, save),
         tileList.map((tile) => `<Tile>${tile}</Tile>`).join(", "),
      ),
      { progress: [tileList.filter((tile) => isCoreTile(tile, province, save)).length, tileList.length] },
   );
}

export function* anyCoreTileChecks(tiles: Iterable<Tile>, province: Province, save: SaveGame): ConditionChecks {
   const tileList = Array.from(tiles);
   (yield tileList.some((tile) => isCoreTile(tile, province, save)))?.describe(
      $t(
         L.$1AnnexesAndCoresAnyOf$2,
         getProvinceName(province, save),
         tileList.map((tile) => `<Tile>${tile}</Tile>`).join(", "),
      ),
   );
}

export function* isCoreTileChecks(tile: Tile, province: Province, save: SaveGame): ConditionChecks {
   (yield isCoreTile(tile, province, save))?.describe(
      $t(L.$1AnnexesAndCores$2, getProvinceName(province, save), `<Tile>${tile}</Tile>`),
   );
}

export function* minCulturePercentageChecks(
   minimum: number,
   culture: Culture,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   const { percentage } = getCulturePercentage(culture, province, save);
   (yield percentage >= minimum)?.describe(
      $t(
         L.$1HasAtLeast$2TilesWith$3Culture,
         getProvinceName(province, save),
         formatPercent(minimum),
         Culture[culture].name(),
      ),
      { progress: [formatPercent(percentage), formatPercent(minimum)] },
   );
}

export function* minTileUpgradeTimesChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const times = getTileUpgradeTimes(province, save);
   (yield times >= minimum)?.describe($t(L.HaveAtLeast$1TileUpgradeTimes, formatNumber(minimum)), {
      progress: [times, minimum],
   });
}
