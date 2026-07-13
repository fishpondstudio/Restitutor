import type { Tile } from "@project/shared/src/utils/Helper";
import type { Province } from "../definitions/Province";
import { GameStateUpdated } from "../Events";
import type { SaveGame } from "../GameState";

const _provinceCache = new Map<string, unknown>();
const _tileCache = new Map<string, unknown>();

GameStateUpdated.on(() => {
   _provinceCache.clear();
   _tileCache.clear();
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
