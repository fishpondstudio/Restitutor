import { mapSafePush, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import type { Province } from "../definitions/Province";
import { GameStateUpdated, RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import type { EvaluationBreakdown, EvaluationFunction, EvaluationImplementation, EvaluationMode } from "./Calculation";

let _keyedCaches = new WeakMap<object, Map<unknown, unknown>>();

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
   _keyedCaches = new WeakMap();
   _populateProvinceTileCache(G.save);
});

type KeyedFunc<Key, T> = (key: Key, save: SaveGame) => T;

function createKeyedCache<Key, T>() {
   // An opaque namespace isolates wrappers without keeping discarded wrappers alive.
   const namespace = {};
   return {
      get(key: Key): T | undefined {
         return _keyedCaches.get(namespace)?.get(key) as T | undefined;
      },
      has(key: Key): boolean {
         return _keyedCaches.get(namespace)?.has(key) ?? false;
      },
      set(key: Key, value: T): void {
         let cache = _keyedCaches.get(namespace);
         if (cache === undefined) {
            cache = new Map();
            _keyedCaches.set(namespace, cache);
         }
         cache.set(key, value);
      },
   };
}

export function cacheProvince<T>(func: KeyedFunc<Province, T>): KeyedFunc<Province, T> {
   return cacheResult(func);
}

export function cacheTile<T>(func: KeyedFunc<Tile, T>): KeyedFunc<Tile, T> {
   return cacheResult(func);
}

function cacheResult<Key, T>(func: KeyedFunc<Key, T>): KeyedFunc<Key, T> {
   const cache = createKeyedCache<Key, T>();
   return (key, save): T => {
      const cached = cache.get(key);
      // Undefined can be a cached result, not just a cache miss.
      if (cached !== undefined || cache.has(key)) {
         return cached as T;
      }
      const result = func(key, save);
      cache.set(key, result);
      return result;
   };
}

export function cacheProvinceEvaluation<B extends EvaluationBreakdown>(
   func: EvaluationImplementation<Province, B>,
): EvaluationFunction<Province, B> {
   return cacheEvaluation(func);
}

export function cacheTileEvaluation<B extends EvaluationBreakdown>(
   func: EvaluationImplementation<Tile, B>,
): EvaluationFunction<Tile, B> {
   return cacheEvaluation(func);
}

function cacheEvaluation<Key, B extends EvaluationBreakdown>(
   func: EvaluationImplementation<Key, B>,
): EvaluationFunction<Key, B> {
   const cache = createKeyedCache<Key, B>();

   function evaluate(key: Key, save: SaveGame, mode: EvaluationMode = "breakdown"): B | B["value"] {
      const breakdown = cache.get(key);
      if (breakdown !== undefined) {
         return mode === "value" ? breakdown.value : breakdown;
      }
      if (mode === "value") {
         return func(key, save, "value");
      }
      const result = func(key, save, "breakdown");
      cache.set(key, result);
      return result;
   }

   // The implementation accepts both modes; expose the mode-specific public overloads.
   return evaluate as EvaluationFunction<Key, B>;
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
