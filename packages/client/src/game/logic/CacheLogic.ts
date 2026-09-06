import { mapSafePush, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import type { Province } from "../definitions/Province";
import { GameStateUpdated, RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";

const _provinceCache = new Map<string, unknown>();
const _tileCache = new Map<string, unknown>();

export const _cachedProvinceTiles = new Map<Province, Tile[]>();
export const _cachedProvinceCoreTiles = new Map<Province, Tile[]>();

function _populateProvinceTileCache(save: SaveGame): void {
   _cachedProvinceTiles.clear();
   _cachedProvinceCoreTiles.clear();
   for (const [tile, data] of save.state.tiles) {
      if (data.province) {
         mapSafePush(_cachedProvinceTiles, data.province, tile);
      }
      if (data.coreProvinces.has(data.province)) {
         mapSafePush(_cachedProvinceCoreTiles, data.province, tile);
      }
   }
}

GameStateUpdated.on(() => {
   _provinceCache.clear();
   _tileCache.clear();
   _populateProvinceTileCache(G.save);
});

type ProvinceBreakdownFunc<T> = (province: Province, save: SaveGame) => T;
type TileBreakdownFunc<T> = (province: Tile, save: SaveGame) => T;

export function cacheProvince<T>(func: ProvinceBreakdownFunc<T>): ProvinceBreakdownFunc<T> {
   return (province, save): T => {
      const key = `${func.name}-${province}`;
      const cached = _provinceCache.get(key);
      if (cached) {
         return cached as T;
      }
      const breakdown = func(province, save);
      _provinceCache.set(key, breakdown);
      return breakdown;
   };
}

export function cacheTile<T>(func: TileBreakdownFunc<T>): TileBreakdownFunc<T> {
   return (tile, save): T => {
      const key = `${func.name}-${tile}`;
      const cached = _tileCache.get(key);
      if (cached) {
         return cached as T;
      }
      const breakdown = func(tile, save);
      _tileCache.set(key, breakdown);
      return breakdown;
   };
}

const _tilesConnectedToCapital = new Map<Province, Set<Tile>>();

RefreshTiles.on(({ tiles }) => {
   const provinces = new Set<Province>();
   for (const tile of tiles) {
      const province = G.save.state.tiles.get(tile)?.province;
      if (province) {
         provinces.add(province);
      }
   }
   for (const province of provinces) {
      calculateTilesConnectedToCapital(province, G.save);
   }
});

export function calculateTilesConnectedToCapital(province: Province, save: SaveGame): void {
   const connectedTiles = new Set<Tile>();
   _tilesConnectedToCapital.set(province, connectedTiles);

   const capital = save.state.provinces[province]?.capital;
   if (capital === undefined || save.state.tiles.get(capital)?.province !== province) {
      return;
   }

   connectedTiles.add(capital);
   const queue: Tile[] = [capital];
   for (let i = 0; i < queue.length; i++) {
      for (const neighborPoint of MapGrid.getNeighbors(tileToPoint(queue[i]))) {
         const neighbor = pointToTile(neighborPoint);
         if (!connectedTiles.has(neighbor) && save.state.tiles.get(neighbor)?.province === province) {
            connectedTiles.add(neighbor);
            queue.push(neighbor);
         }
      }
   }
}

export function isConnectedToCapital(tile: Tile, save: SaveGame): boolean {
   const province = save.state.tiles.get(tile)?.province;
   if (province === undefined) {
      return false;
   }
   let cache = _tilesConnectedToCapital.get(province);
   if (cache === undefined) {
      calculateTilesConnectedToCapital(province, save);
   }
   cache = _tilesConnectedToCapital.get(province);
   if (cache === undefined) {
      return false;
   }
   return cache.has(tile);
}

export function getProvinceTilesCached(province: Province): Tile[] {
   return _cachedProvinceTiles.get(province) ?? [];
}

export function getProvinceCoreTilesCached(province: Province): Tile[] {
   return _cachedProvinceCoreTiles.get(province) ?? [];
}
