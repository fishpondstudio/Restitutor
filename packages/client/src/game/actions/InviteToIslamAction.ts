import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { tileIsOurCoreCondition } from "../logic/MissionLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function InviteToIslamAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   const state = save.state.provinces[province];
   if (!tileData || !state) {
      return EmptyGameAction;
   }
   return {
      cost: {
         islam: tileData.infrastructure + tileData.production + tileData.population,
      },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "InviteToIslam" }, province, save),
         tileIsOurCoreCondition(tile, province, save),
         {
            name: $t(L.OurProvincesReligionIsIslam),
            value: state.religion === "Islam",
         },
         {
            name: $t(L.TheTilesReligionIsNotIslam),
            value: tileData.religion !== "Islam",
         },
      ]),
      execute: () => {
         startTimedAction("InviteToIslam", province, save);
         tileData.religion = "Islam";
      },
   };
}
