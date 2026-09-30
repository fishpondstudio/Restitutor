import { numberToRoman, pointToTile, randOne, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { type ITileData, initTileData, TerrainToGoods } from "../definitions/Tile";
import { getNewSettlementTiles } from "../definitions/TileConstants";
import { getTileName } from "../definitions/TileName";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { isLand } from "../Land";
import { MapGrid } from "../MapGrid";
import type { ConditionChecks } from "./Calculation";
import { getTileTerrain, isCoreTile } from "./TileLogic";

export function* settleTileChecks(tile: Tile, province: Province, save: SaveGame): ConditionChecks {
   (yield !save.state.tiles.has(tile))?.describe($t(L.$1IsCurrentlyUnsettled, getTileName(tile, save)));
   (yield isLand(tile) && getNewSettlementTiles(save.state.scenario).has(tile))?.describe(
      $t(L.$1IsEligibleForSettlement, getTileName(tile, save)),
   );
   (yield MapGrid.getNeighbors(tileToPoint(tile)).some((neighbor) =>
      isCoreTile(pointToTile(neighbor), province, save),
   ))?.describe($t(L.$1BordersOneOfOurCoreTiles, getTileName(tile, save)));
}

export function startSettlement(tile: Tile, province: Province, save: SaveGame): void {
   const tileData = settleTile(tile, province, save);
   if (!tileData) {
      return;
   }
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
   RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
}

export function settleTile(tile: Tile, province: Province, save: SaveGame): ITileData | undefined {
   if (save.state.tiles.has(tile)) {
      return undefined;
   }
   if (!isLand(tile)) {
      return undefined;
   }
   const tileData = initTileData(province, randOne(TerrainToGoods[getTileTerrain(tile)]));
   tileData.infrastructure = 1;
   tileData.production = 1;
   tileData.population = 1;
   save.state.tiles.set(tile, tileData);
   return tileData;
}
