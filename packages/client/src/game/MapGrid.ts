import { HexGrid } from "@project/shared/src/utils/HexGrid";

export const TileSize = 64;
export const TileHeight = TileSize * 2;
export const MapGrid = new HexGrid(289, 185, TileSize);
