import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getGameDate } from "../logic/TickLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function CrackDownAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const totalUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   return {
      cost: { military: totalUpgrades * 6 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "Crackdown" }, province, save),
            { name: $t(L.CurrentlyInRebellion), value: tileData.rebellion >= 10 },
         ],
      }),
      effect: () => {
         tileData.rebellion = 0;
         tileData.modifiers.Unrest.push({
            type: "add",
            name: $t(L.Crackdown$1, getGameDate(save.state.month).toLocaleDateString()),
            value: 10,
            duration: 5 * 12,
         });
         RefreshTiles.emit({ tiles: [tile], options: { indicator: true } });
      },
   };
}
