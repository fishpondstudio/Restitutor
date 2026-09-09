import { numberToRoman, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { showPanel } from "../../ui/common/ShowPanel";
import { TilePage } from "../../ui/TilePage";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { NewSettlementTiles } from "../definitions/TileConstants";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { isLand } from "../Land";
import { isCoreTile, settleTile } from "../logic/TileLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { MapGrid } from "../MapGrid";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SettleTileAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   if (save.state.tiles.has(tile) || !isLand(tile) || !NewSettlementTiles.has(tile)) {
      return EmptyGameAction;
   }
   return {
      cost: { mandate: 1 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "SettleTile" }, province, save),
         {
            name: $t(L.TileBordersOneOfOurCoreTiles),
            value: MapGrid.getNeighbors(tileToPoint(tile)).some((neighbor) =>
               isCoreTile(pointToTile(neighbor), province, save),
            ),
         },
      ]),
      execute: ({ headless }) => {
         const tileData = settleTile(tile, province, save);
         if (tileData) {
            for (let i = 1; i <= 4; i++) {
               const name = $t(L.NewTileSettlementPhase$1, numberToRoman(i));
               tileData.modifiers.TileOutput.push({
                  name,
                  type: "multiply",
                  value: -0.2,
                  duration: i * 5 * 12,
               });
               tileData.modifiers.LandTax.push({
                  name,
                  type: "multiply",
                  value: -0.2,
                  duration: i * 5 * 12,
               });
               tileData.modifiers.Manpower.push({
                  name,
                  type: "multiply",
                  value: -0.2,
                  duration: i * 5 * 12,
               });
            }
            startTimedAction("SettleTile", province, save);
            RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
            if (!headless) {
               showPanel(TilePage, { tile });
            }
         }
      },
   };
}
