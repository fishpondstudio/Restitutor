import { clamp, type Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { timedActionConditions } from "../logic/TimedActionLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function AppeaseAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const totalUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   return {
      cost: { administrative: totalUpgrades * 3, diplomatic: totalUpgrades * 3, gold: totalUpgrades * 3 * 6 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "Appease" }, province, save),
            { name: $t(L.CurrentlyNotInRebellion), value: tileData.rebellion < 10 },
            { name: $t(L.RebellionIsAtLeastX, "5"), value: tileData.rebellion >= 5 },
         ],
      }),
      effect: () => {
         tileData.rebellion = clamp(tileData.rebellion - 5, 0, 10);
         RefreshTiles.emit({ tiles: [tile], options: { indicator: true } });
      },
   };
}
