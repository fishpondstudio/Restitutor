import { type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { MapGrid, MapWidth, TileWidth } from "../MapGrid";

export interface LatLong {
   latitude: number;
   longitude: number;
}

// The rendered map spans 360 degrees between its first and last horizontal hex centers.
const LongitudeDegreesPerColumn = 360 / (MapWidth - 1);
const PixelsPerLongitudeDegree = TileWidth / LongitudeDegreesPerColumn;
const MercatorPixelsPerRadian = PixelsPerLongitudeDegree * (180 / Math.PI);

// Geographic registration of the map. The odd-row center at (135, 1) lies on the prime meridian,
// while row 120 lies on the equator. gridToPosition includes the pointy-hex odd-row offset.
const PrimeMeridianX = MapGrid.gridToPosition({ x: 135, y: 1 }).x;
const EquatorY = MapGrid.gridToPosition({ x: 0, y: 120 }).y;

/**
 * Converts a tile to the latitude and longitude at the rendered center of its hex.
 */
export function tileToLatLong(tile: Tile): LatLong {
   const grid = tileToPoint(tile);
   if (!MapGrid.isValid(grid)) {
      throw new RangeError(`Tile ${tile} is outside the map`);
   }

   const position = MapGrid.gridToPosition(grid);
   const mercatorY = (EquatorY - position.y) / MercatorPixelsPerRadian;

   return {
      latitude: Math.atan(Math.sinh(mercatorY)) * (180 / Math.PI),
      longitude: (position.x - PrimeMeridianX) / PixelsPerLongitudeDegree,
   };
}
