import { clamp, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type ICondition } from "../actions/GameAction";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getTileUnrest } from "./TileLogic";
import { startTimedAction, timedActionConditions } from "./TimedActionLogic";

export function autonomyAdjustmentConditions(tile: Tile, province: Province, save: SaveGame): ICondition[] {
   return [
      ...timedActionConditions({ action: "AdjustAutonomy" }, province, save),
      {
         name: $t(L.TileIsOurs),
         value: save.state.tiles.get(tile)?.province === province,
      },
   ];
}

export function getSettledTileAutonomy(tile: Tile, save: SaveGame): number {
   const data = save.state.tiles.get(tile);
   if (!data) {
      return 0;
   }
   return clamp(data.autonomy + Math.ceil(getTileUnrest(tile, save).value), 0, 100);
}

export function setTileAutonomy(tile: Tile, value: number, province: Province, save: SaveGame): boolean {
   const data = save.state.tiles.get(tile);
   if (
      !data ||
      !Number.isFinite(value) ||
      !finalizeCondition(autonomyAdjustmentConditions(tile, province, save)).value
   ) {
      return false;
   }
   value = clamp(value, 0, 100);
   if (data.autonomy === value) {
      return false;
   }
   data.autonomy = value;
   startTimedAction("AdjustAutonomy", province, save);
   return true;
}
