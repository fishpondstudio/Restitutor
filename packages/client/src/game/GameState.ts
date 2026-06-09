import {
   clamp,
   entriesOf,
   forEach,
   fromEntries,
   randomAlphaNumeric,
   range,
   shuffle,
   type Tile,
   uuid4,
} from "@project/shared/src/utils/Helper";
import { $t, L } from "../utils/i18n";
import type { IChronicleEntry } from "./definitions/Chronicle";
import { Goods } from "./definitions/Goods";
import type { Province } from "./definitions/Province";
import { type IProvince, Provinces } from "./definitions/Province";
import { type ITileData, initTiles } from "./definitions/Tile";
import { GameStateUpdated } from "./Events";
import { GameOption } from "./GameOption";
import { addAttitudeModifier, getProvincesWithinDiplomaticRange, getRelation } from "./logic/DiplomacyLogic";
import { tickProduction } from "./logic/ProductionLogic";
import {
   getProvinceIncome,
   getProvinceOverextension,
   getProvinceTileCount,
   initProvince,
   resetProvinceResource,
   rollTradeOffers,
} from "./logic/ProvinceLogic";
import type { IWar } from "./logic/WarLogic";
import { randomMaleName } from "./RomanNames";
import { RomeMap } from "./RomeMap";

export const GameStateFlags = {
   None: 0,
   ShowTutorial: 1 << 0,
} as const;

export type GameStateFlags = (typeof GameStateFlags)[keyof typeof GameStateFlags];

export class GameState {
   id = uuid4();
   tick = 0;
   month = 0;
   seed = randomAlphaNumeric(32);
   offlineTime = 0;
   flags: GameStateFlags = GameStateFlags.None;
   playerProvince: Province = "Lugdunensis";
   provinces: Partial<Record<Province, IProvince>> = fromEntries(
      Provinces.map((province) => [province, initProvince(province)]),
   );
   senate: ISenate = {
      electedConsuls: new Map([
         [randomMaleName().join(" "), []],
         [randomMaleName().join(" "), []],
      ]),
      consulCandidates: range(0, 9).map(() => randomMaleName().join(" ")),
      votes: new Map(),
   };
   completedTutorials: Set<number> = new Set();
   tiles: Map<Tile, ITileData> = initTiles();
   wars: IWar[] = [];
   chronicle: IChronicleEntry[] = [];
}

export interface ISenate {
   electedConsuls: Map<string, Province[]>;
   consulCandidates: string[];
   votes: Map<Province, Set<number>>;
}

export class SaveGame {
   state: GameState = new GameState();
   options: GameOption = new GameOption();
}

export function initSaveGame(save: SaveGame): SaveGame {
   rollTradeOffers(save);
   initTileUpgrades(save);
   initTileProductions(save);
   initPlayerProvince(save);
   initAttitudes(save);
   return save;
}

function initTileProductions(save: SaveGame) {
   forEach(save.state.provinces, (province) => {
      forEach(Goods, (goods) => {
         // We did some `tickProduction` in `initTileUpgrades`  to get correct province income.
         // so here we need to clear those resources first.
         resetProvinceResource(goods, province, save);
      });
      for (let i = 0; i < 12; ++i) {
         tickProduction(province, save);
      }
   });
}

function initAttitudes(save: SaveGame): void {
   forEach(save.state.provinces, (province) => {
      const provinces = getProvincesWithinDiplomaticRange(province, save);
      shuffle(provinces);
      for (let i = 0; i < Math.min(provinces.length, 2); ++i) {
         const otherProvince = provinces[i];
         addAttitudeModifier(
            otherProvince,
            province,
            {
               type: "add",
               name: $t(L.Historical),
               value: 50,
               duration: 12 * 10,
            },
            save,
         );
      }
   });
}

function initPlayerProvince(save: SaveGame): void {
   switch (save.state.playerProvince) {
      case "Lugdunensis": {
         const relation = getRelation(save.state.playerProvince, "Belgica", save);
         if (relation) {
            relation.casusBelli.set("ConquestMission", {
               monthsLeft: 5 * 12,
            });
            relation.truceUntil = 1;
         }
         break;
      }
   }
}

function initTileUpgrades(save: SaveGame): void {
   let maxTileCount = 0;
   for (const [province, data] of entriesOf(save.state.provinces)) {
      maxTileCount = Math.max(maxTileCount, getProvinceTileCount(province, save));
   }
   for (const [province, data] of entriesOf(save.state.provinces)) {
      const tileCount = getProvinceTileCount(province, save);
      let total = Math.min(maxTileCount * 3, 20 * 3 * tileCount);
      while (true) {
         if (total <= 0) break;
         for (const [tile, data] of save.state.tiles) {
            if (data.province !== province) {
               continue;
            }
            ++data.infrastructure;
            --total;
            if (total <= 0) break;

            ++data.population;
            --total;
            if (total <= 0) break;

            ++data.production;
            --total;
            if (total <= 0) break;
         }
      }
      const incomeTarget = 45;
      let maxIteration = 1000;
      while (true) {
         if (--maxIteration <= 0) {
            console.warn(`initTileUpgrades (1st pass): max iteration reached for ${province}`);
            break;
         }
         if (getProvinceIncome(province, save).income < incomeTarget) {
            break;
         }
         let hasReachedMinimum = true;
         for (const [tile, data] of save.state.tiles) {
            if (data.province === province) {
               data.infrastructure = clamp(data.infrastructure - 1, 1, Number.POSITIVE_INFINITY);
               if (getProvinceIncome(province, save).income < incomeTarget) {
                  break;
               }
               data.production = clamp(data.production - 1, 1, Number.POSITIVE_INFINITY);
               if (getProvinceIncome(province, save).income < incomeTarget) {
                  break;
               }
               if (data.infrastructure > 1 || data.production > 1) {
                  hasReachedMinimum = false;
               }
            }
         }
         if (hasReachedMinimum) {
            break;
         }
      }
      maxIteration = 1000;
      while (true) {
         if (--maxIteration <= 0) {
            console.warn(`initTileUpgrades (2nd pass): max iteration reached for ${province}`);
            break;
         }
         if (getProvinceIncome(province, save).income > incomeTarget) {
            break;
         }
         for (const [tile, data] of save.state.tiles) {
            if (data.province === province) {
               ++data.infrastructure;
               if (getProvinceIncome(province, save).income > incomeTarget) {
                  break;
               }
               ++data.production;
               if (getProvinceIncome(province, save).income > incomeTarget) {
                  break;
               }
            }
         }
      }
      GameStateUpdated.emit();
      const overextension = getProvinceOverextension(province, save).value;
      if (overextension > 0) {
         console.error(`initTileUpgrades: ${province} has overextension: ${overextension}`);
      }
   }

   for (const [tile, data] of save.state.tiles) {
      data.population = clamp(data.population, 1, Math.max(data.infrastructure, data.production));
   }
}

export function getOriginalTileCount(province: Province): number {
   let count = 0;
   for (const [tile, data] of RomeMap) {
      if (data.province === province) {
         count++;
      }
   }
   return count;
}
