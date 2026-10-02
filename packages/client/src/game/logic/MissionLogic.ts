import { filterInPlace, formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Culture } from "../definitions/Culture";
import { durationToString } from "../definitions/Modifier";
import type { Province } from "../definitions/Province";
import { type ProvinceNameOverride, ProvinceNameOverrides } from "../definitions/ProvinceNameOverrides";
import { type ProvinceResource, ProvinceResourceNames } from "../definitions/ProvinceResources";
import { Religion } from "../definitions/Religion";
import { SpawnedProvinces } from "../definitions/SpawnedProvince";
import { getTileName } from "../definitions/TileName";
import type { TileNameOverride } from "../definitions/TileNameOverrides";
import { TileNameOverrides } from "../definitions/TileNameOverrides";
import { type TimedAction, TimedActions } from "../definitions/TimedAction";
import { RefreshTiles } from "../Events";
import type { ICustomEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { getProvinceManpower, getWarPower } from "./ArmyLogic";
import {
   calculateTilesConnectedToCapital,
   clearAllCaches,
   getProvinceCoreTilesCached,
   getProvinceTilesCached,
} from "./CacheLogic";
import type { ConditionChecks } from "./Calculation";
import { cleanUpProvince } from "./CleanupProvince";
import { getMarriageAlliance, getRelation } from "./DiplomacyLogic";
import { getApostolicSeeTiles, getCulturePercentage } from "./InternalAffairsLogic";
import {
   addProvinceStat,
   ensureProvinceCapitals,
   getBlackSeaCoastalTiles,
   getMediterraneanCoastalTiles,
   getProvinceCoreCoastalTileCount,
   getProvinceIncome,
   getProvinceName,
   getProvinceStat,
   getTileUpgradeTimes,
   setProvinceNameOverride,
   setProvinceStat,
} from "./ProvinceLogic";
import { addProvinceResource, getProvinceResource, provinceResourceOf } from "./ResourceLogic";
import { isCoreTile, setTileNameOverride } from "./TileLogic";
import { getTimedActionTimeLeft, startTimedAction } from "./TimedActionLogic";
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
}): Tile[] {
   const affectedProvinces = new Set<Province>([province]);
   const refreshedTiles = new Set<Tile>();
   for (const tile of tiles) {
      const tileData = save.state.tiles.get(tile);
      if (tileData) {
         affectedProvinces.add(tileData.province);
         refreshedTiles.add(tile);
         tileData.province = province;
         if (core) {
            tileData.coreProvinces.add(province);
         }
      }
   }
   clearAllCaches();
   for (const affectedProvince of affectedProvinces) {
      if (affectedProvince !== province && getProvinceTilesCached(affectedProvince).length === 0) {
         onProvinceFullyAnnexed(affectedProvince, province, save);
      }
   }
   for (const tile of ensureProvinceCapitals(save)) {
      refreshedTiles.add(tile);
      const owner = save.state.tiles.get(tile)?.province;
      if (owner) {
         affectedProvinces.add(owner);
      }
   }
   for (const affectedProvince of affectedProvinces) {
      calculateTilesConnectedToCapital(affectedProvince, save);
   }
   RefreshTiles.emit({ tiles: refreshedTiles, options: { indicator: true, visual: true } });
   return [...refreshedTiles];
}

function onProvinceFullyAnnexed(annexedProvince: Province, province: Province, save: SaveGame): void {
   cleanUpProvince(annexedProvince, save);
   addProvinceResource("mandate", 1, province, save);
   if (annexedProvince in SpawnedProvinces) {
      addProvinceStat("eliminatedBarbarians", 1, province, save);
   }
}

export function tileIsOurCoreCondition(tile: Tile, province: Province, save: SaveGame): ICondition {
   const tileData = save.state.tiles.get(tile);
   return {
      name: $t(L.TileIsCurrentlyOurCore),
      value: !!tileData && tileData.coreProvinces.has(province) && tileData.province === province,
   };
}

export function provinceOnMapCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsOnTheMap, getProvinceName(province, save)),
      value: !!save.state.provinces[province],
   };
}

export function activeTimedActionCondition(action: TimedAction, province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsOngoing, TimedActions[action].name()),
      value: getTimedActionTimeLeft(action, province, save) > 0,
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

export function resetWarmongerPenaltyEffect(): ICustomEffect {
   return {
      execute: (province, save) => {
         setProvinceStat("attackCountOffset", -getProvinceStat("attackCount", province, save), province, save);
      },
      desc: () => $t(L.ResetOurWarmongerPenalty),
   };
}

export function setProvinceNameOverrideEffect(nameOverride: ProvinceNameOverride): ICustomEffect {
   return {
      execute: (province, save) => {
         setProvinceNameOverride(province, nameOverride, save);
      },
      desc: (province, save) => {
         return $t(L.OurProvinceIsNowKnownAs$1, ProvinceNameOverrides[nameOverride]());
      },
   };
}

export function setTileNameOverrideEffect(tile: Tile, nameOverride: TileNameOverride): ICustomEffect {
   return {
      execute: (province, save) => {
         setTileNameOverride(tile, nameOverride, save);
      },
      desc: (province, save) => {
         return $t(L.$1IsNowKnownAs$2, getTileName(tile, save), TileNameOverrides[nameOverride]());
      },
   };
}

export function startTimedActionEffect(action: TimedAction): ICustomEffect {
   return {
      desc: (province, save) => {
         const config = TimedActions[action];
         return $t(L.$1StartsAndLastsFor$2, config.name(), durationToString(config.duration));
      },
      execute: (province, save) => startTimedAction(action, province, save),
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

export function* religionChecks(religion: Religion, province: Province, save: SaveGame): ConditionChecks {
   (yield save.state.provinces[province]?.religion === religion)?.describe(
      $t(L.$1sReligionIs$2, getProvinceName(province, save), Religion[religion].name()),
   );
}

export function* coreTileReligionCountChecks(
   religion: Religion,
   minimum: number,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   const coreTiles = getProvinceCoreTilesCached(province);
   const coreTileReligionCount = coreTiles.filter((tile) => save.state.tiles.get(tile)?.religion === religion).length;
   (yield coreTileReligionCount >= minimum)?.describe(
      $t(
         L.$1HasAtLeast$2CoreTilesWithThe$3Religion,
         getProvinceName(province, save),
         formatNumber(minimum),
         Religion[religion].name(),
      ),
      { progress: [coreTileReligionCount, minimum] },
   );
}

export function* apostolicSeeCountChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const apostolicSee = getApostolicSeeTiles(save);
   const provinceApostolicSee = Array.from(apostolicSee).filter(
      (tile) => save.state.tiles.get(tile)?.province === province,
   );
   (yield provinceApostolicSee.length >= minimum)?.describe($t(L.Annex$1ApostolicSees, formatNumber(minimum)), {
      progress: [provinceApostolicSee.length, minimum],
   });
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
   const warPower = getWarPower({}, province, save).total.value;
   (yield warPower >= minimum)?.describe($t(L.Reach$1WarPower, formatNumber(minimum)), {
      progress: [warPower, minimum],
   });
}

export function* eliminatedBarbariansChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const eliminated = getProvinceStat("eliminatedBarbarians", province, save);
   (yield eliminated >= minimum)?.describe($t(L.EliminateAtLeast$1BarbarianPolities, formatNumber(minimum)), {
      progress: [eliminated, minimum],
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

export function* blackSeaCoastChecks(minimum: number, province: Province, save: SaveGame): ConditionChecks {
   const coast = getBlackSeaCoastalTiles(true, province, save);
   (yield coast.length >= minimum)?.describe($t(L.AnnexAndCore$1BlackSeaCoastalTiles, formatNumber(minimum)), {
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
