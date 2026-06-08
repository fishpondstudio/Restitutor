import { formatNumber, safePush } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IValueBreakdown } from "../actions/GameAction";
import type { IModifier, Modifier } from "../definitions/Modifier";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";

export interface IAddModifier extends IModifier {
   modifier: Modifier;
   province: Province;
   save: SaveGame;
}

export function attachModifiers(
   type: Modifier,
   breakdown: IValueBreakdown,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   const modifiers = save.state.provinces[province]?.modifiers[type];
   if (modifiers) {
      for (const modifier of modifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.XMonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      }
   }
   const dynamicModifiers = save.state.provinces[province]?.dynamicModifiers[type];
   if (dynamicModifiers) {
      for (const modifier of dynamicModifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            value: modifier.value,
         });
      }
   }
   return breakdown;
}

export function addModifier({ modifier, name, type, value, duration, province, save }: IAddModifier): void {
   const state = save.state.provinces[province];
   if (state) {
      safePush(state.modifiers, modifier, { name, type, value, duration });
   }
}

export function addMonthlyModifier(type: Modifier, value: IModifier, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (state) {
      safePush(state.dynamicModifiers, type, value);
   }
}

export function attachTileModifiers(modifiers: IModifier[] | undefined, breakdown: IValueBreakdown): IValueBreakdown {
   if (modifiers) {
      for (const modifier of modifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.XMonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      }
   }
   return breakdown;
}
