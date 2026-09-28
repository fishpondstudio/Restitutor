import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { isChristianReligion } from "../definitions/Religion";
import type { SaveGame } from "../GameState";
import { tileIsOurCoreCondition } from "../logic/MissionLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function EvangelizeTileAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   const state = save.state.provinces[province];
   if (!tileData || !state) {
      return EmptyGameAction;
   }
   return {
      cost: { christianity: tileData.infrastructure + tileData.production + tileData.population },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "EvangelizeTile" }, province, save),
         tileIsOurCoreCondition(tile, province, save),
         {
            name: $t(L.OurProvinceReligionIsChristian),
            value: isChristianReligion(state.religion),
         },
         {
            name: $t(L.TileReligionIsNotChristian),
            value: !isChristianReligion(tileData.religion),
         },
      ]),
      execute: () => {
         startTimedAction("EvangelizeTile", province, save);
         tileData.religion = state.religion;
      },
   };
}
