import {
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
import { Tiles } from "./definitions/TileConstants";
import { GameStateUpdated } from "./Events";
import { GameOption } from "./GameOption";
import { addAttitudeModifier, getProvincesWithinDiplomaticRange, getRelation } from "./logic/DiplomacyLogic";
import { tickProduction } from "./logic/ProductionLogic";
import {
   ConsulCandidatesCount,
   getProvinceOverextension,
   getProvinceTileCount,
   getTotalUpgrades,
   initProvince,
   provinceResourceOf,
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
   flags: GameStateFlags = GameStateFlags.None;
   playerProvince: Province = "Lugdunensis";
   provinces: Partial<Record<Province, IProvince>> = fromEntries(
      Provinces.flatMap((province) => {
         const capital = getOriginalCapital(province);
         if (!capital) {
            return [];
         }
         return [[province, initProvince(province, capital)]];
      }),
   );
   senate: ISenate = {
      electedConsuls: new Map([
         [randomMaleName().join(" "), []],
         [randomMaleName().join(" "), []],
      ]),
      consulCandidates: range(0, ConsulCandidatesCount).map(() => randomMaleName().join(" ")),
      votes: new Map(),
   };
   completedTutorials: Set<string> = new Set();
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

export function initNewPlayerSaveGame(save: SaveGame): SaveGame {
   provinceResourceOf("gold", save.state.playerProvince, save)[0] = 1453;
   save.state.tiles.get(Tiles.Durocortorum)?.modifiers.Defense.push({
      type: "multiply",
      name: $t(L.Tutorial),
      value: -0.5,
      duration: 12 * 10,
   });
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
      for (let i = 0; i < Math.min(provinces.length, 4); ++i) {
         const otherProvince = provinces[i];
         addAttitudeModifier(
            otherProvince,
            province,
            {
               type: "add",
               name: $t(L.Historical),
               value: i < 2 ? 30 : -30,
               duration: 12 * 100,
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
const UpgradeTypes = ["infrastructure", "production", "population"] as const;

function initTileUpgrades(save: SaveGame): void {
   for (const [province, data] of entriesOf(save.state.provinces)) {
      const tileData = save.state.tiles.get(data.capital);
      if (tileData) {
         tileData.infrastructure = 2;
         tileData.production = 2;
         tileData.population = 2;
      }
   }

   for (const [tile, data] of save.state.tiles) {
      data.infrastructure = Math.max(data.infrastructure, 1);
      data.production = Math.max(data.production, 1);
      data.population = Math.max(data.population, 1);
   }

   let maxUpgrades = 0;
   let maxTileCount = 0;
   for (const [province, data] of entriesOf(save.state.provinces)) {
      maxUpgrades = Math.max(maxUpgrades, getTotalUpgrades(province, save));
      maxTileCount = Math.max(maxTileCount, getProvinceTileCount(province, save));
   }

   for (const [province, data] of entriesOf(save.state.provinces)) {
      let total =
         maxUpgrades - getTotalUpgrades(province, save) - (maxTileCount - getProvinceTileCount(province, save));
      const tiles = shuffle(Array.from(save.state.tiles).filter(([tile, data]) => data.province === province));
      while (total > 0) {
         let upgraded = false;
         for (const [tile, data] of tiles) {
            if (data.province !== province) {
               continue;
            }
            for (const upgradeType of UpgradeTypes) {
               if (total <= 0) {
                  break;
               }
               if (data[upgradeType] >= 10) {
                  continue;
               }
               ++data[upgradeType];
               --total;
               upgraded = true;
            }
         }
         if (!upgraded) {
            break;
         }
      }
      const overextension = getProvinceOverextension(province, save).value;
      if (overextension > 0) {
         console.error(`initTileUpgrades: ${province} has overextension: ${overextension}`);
      }
   }

   for (const [tile, data] of save.state.tiles) {
      if (data.infrastructure < 1 || data.infrastructure > 10) {
         console.error(`initTileUpgrades: ${tile} has invalid infrastructure: ${data.infrastructure}`);
      }
      if (data.production < 1 || data.production > 10) {
         console.error(`initTileUpgrades: ${tile} has invalid production: ${data.production}`);
      }
      if (data.population < 1 || data.population > 10) {
         console.error(`initTileUpgrades: ${tile} has invalid population: ${data.population}`);
      }
   }
   GameStateUpdated.emit();
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

export function getOriginalCapital(province: Province): Tile | undefined {
   for (const [tile, data] of RomeMap) {
      if (data.province === province && data.isCapital) {
         return tile;
      }
   }
   return undefined;
}
