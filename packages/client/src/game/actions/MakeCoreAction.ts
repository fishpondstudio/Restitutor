import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { addProvinceStat } from "../logic/ProvinceLogic";
import { getTileMakeCoreCost } from "../logic/TileLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function MakeCoreAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const cost = getTileMakeCoreCost(tile, save);
   return {
      cost: { administrative: cost.value },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "MakeCore" }, province, save),
            {
               name: $t(L.TileIsOurs),
               value: tileData.province === province,
            },
            {
               name: $t(L.TileIsNotYetOurCore),
               value: !tileData.coreProvinces.has(province),
            },
         ],
      }),
      effect: () => {
         tileData.coreProvinces.add(province);
         addProvinceStat("makeCoreCount", 1, province, save);
         startTimedAction("MakeCore", province, save);
      },
   };
}
