import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { tileIsOurCoreCondition } from "../logic/MissionLogic";
import { addProvinceStat } from "../logic/ProvinceLogic";
import { getTileConvertCultureCost } from "../logic/TileLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ConvertCultureAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   const state = save.state.provinces[province];
   if (!tileData || !state) {
      return EmptyGameAction;
   }
   return {
      cost: { diplomatic: getTileConvertCultureCost(tile, save).value, dominionPoint: 1 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ConvertCulture" }, province, save),
         tileIsOurCoreCondition(tile, province, save),
         {
            name: $t(L.TileCultureIsNotOurDominantCulture),
            value: tileData.culture !== state.culture,
         },
      ]),
      execute: () => {
         tileData.culture = state.culture;
         addProvinceStat("convertCultureCount", 1, province, save);
      },
   };
}
