import { createTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import Land from "../data/Land.json";
import { Province } from "./definitions/Province";
import type { SaveGame } from "./GameState";

const LandTiles = new Set<Tile>(Land);
const UnassignedLandCode = "XX";
const OceanCode = "..";

export interface IMapViewport {
   minX: number;
   maxX: number;
   minY: number;
   maxY: number;
}

export function getViewport(save: SaveGame): IMapViewport {
   let minX = Number.POSITIVE_INFINITY;
   let maxX = Number.NEGATIVE_INFINITY;
   let minY = Number.POSITIVE_INFINITY;
   let maxY = Number.NEGATIVE_INFINITY;

   for (const tile of save.state.tiles.keys()) {
      const { x, y } = tileToPoint(tile);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
   }

   return { minX, maxX, minY, maxY };
}

export function getTileCode(x: number, y: number, save: SaveGame): string {
   const tile = createTile(x, y);
   const tileData = save.state.tiles.get(tile);
   if (tileData) {
      return Province[tileData.province].code;
   }
   return LandTiles.has(tile) ? UnassignedLandCode : OceanCode;
}

export function renderMap(save: SaveGame, staggerOddRows: boolean): string {
   const viewport = getViewport(save);
   const rows: string[] = [];
   for (let y = viewport.minY; y <= viewport.maxY; y++) {
      const tiles: string[] = [];
      for (let x = viewport.minX; x <= viewport.maxX; x++) {
         tiles.push(getTileCode(x, y, save));
      }
      const indent = staggerOddRows && y % 2 !== 0 ? "  " : "";
      rows.push(`${y.toString().padStart(3, "0")}|${indent}${tiles.join(" ")}`);
   }
   return rows.join("\n");
}
