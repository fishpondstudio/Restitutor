import type { IValueBreakdown } from "../actions/GameAction";
import type { Province } from "../definitions/Province";
import { GameStateUpdated } from "../Events";
import type { SaveGame } from "../GameState";

const _cache = new Map<string, { tick: number; value: IValueBreakdown }>();

GameStateUpdated.on(() => {
   _cache.clear();
});

export interface IProvinceCacheKey {
   name: string;
   province: Province;
}

type ProvinceBreakdownFunc = (province: Province, save: SaveGame) => IValueBreakdown;

export function makeCached(func: ProvinceBreakdownFunc): ProvinceBreakdownFunc {
   return (province, save) => {
      const key = `${func.name}-${province}`;
      const cached = _cache.get(key);
      if (cached && cached.tick === save.state.tick) {
         return cached.value;
      }
      const breakdown = func(province, save);
      _cache.set(key, { tick: save.state.tick, value: breakdown });
      return breakdown;
   };
}
