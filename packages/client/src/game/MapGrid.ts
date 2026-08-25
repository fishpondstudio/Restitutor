import { HexGrid } from "@project/shared/src/utils/HexGrid";

export const TileSize = 64;
export const TileHeight = TileSize * 2;
export const TileWidth = Math.sqrt(3) * TileSize;
export const MapWidth = 289;
export const MapHeight = 185;
export const MapGrid = new HexGrid(MapWidth, MapHeight, TileSize);
