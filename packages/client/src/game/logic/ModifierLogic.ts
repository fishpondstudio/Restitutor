import { filterInPlace, forEach, formatNumber, safePush } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IValueBreakdown } from "../actions/GameAction";
import type { IModifier, Modifier } from "../definitions/Modifier";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import type { EvaluationMode, ValueCalculation } from "./Calculation";

export interface IAddModifier extends IModifier {
   modifier: Modifier;
   province: Province;
   save: SaveGame;
}

export function attachModifier(
   type: Modifier,
   breakdown: IValueBreakdown,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   forEachModifier(
      type,
      (modifier) => {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.$1MonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      },
      province,
      save,
   );
   return breakdown;
}

export function forEachModifier(
   type: Modifier,
   callback: (modifier: IModifier) => void,
   province: Province,
   save: SaveGame,
): void {
   const modifiers = save.state.provinces[province]?.modifiers[type];
   if (modifiers) {
      for (const modifier of modifiers) {
         callback(modifier);
      }
   }
   const dynamicModifiers = save.state.provinces[province]?.dynamicModifiers[type];
   if (dynamicModifiers) {
      for (const modifier of dynamicModifiers) {
         callback(modifier);
      }
   }
}

export function attachModifierToCalculation<M extends EvaluationMode>(
   type: Modifier,
   calc: ValueCalculation<M>,
   province: Province,
   save: SaveGame,
): ValueCalculation<M> {
   const state = save.state.provinces[province];
   attachTileModifierToCalculation(state?.modifiers[type], calc);
   const dynamicModifiers = state?.dynamicModifiers[type];
   if (dynamicModifiers) {
      for (const modifier of dynamicModifiers) {
         calc[modifier.type](modifier.value)?.describe(
            modifier.name,
            Number.isFinite(modifier.duration) ? $t(L.$1MonthsLeft, formatNumber(modifier.duration)) : undefined,
         );
      }
   }
   return calc;
}

export function attachTileModifierToCalculation<M extends EvaluationMode>(
   modifiers: IModifier[] | undefined,
   calc: ValueCalculation<M>,
): ValueCalculation<M> {
   if (modifiers) {
      for (const modifier of modifiers) {
         calc[modifier.type](modifier.value)?.describe(
            modifier.name,
            Number.isFinite(modifier.duration) ? $t(L.$1MonthsLeft, formatNumber(modifier.duration)) : undefined,
         );
      }
   }
   return calc;
}

export function addModifier({ modifier, name, type, value, duration, province, save }: IAddModifier): void {
   if (!Number.isFinite(value)) {
      console.error("Invalid modifier:", { name, type, value, duration, modifier });
      return;
   }
   const state = save.state.provinces[province];
   if (state) {
      safePush(state.modifiers, modifier, { name, type, value, duration });
   }
}

export function attachTileModifier(modifiers: IModifier[] | undefined, breakdown: IValueBreakdown): IValueBreakdown {
   if (modifiers) {
      for (const modifier of modifiers) {
         breakdown[modifier.type].push({
            name: modifier.name,
            desc: Number.isFinite(modifier.duration) ? $t(L.$1MonthsLeft, formatNumber(modifier.duration)) : undefined,
            value: modifier.value,
         });
      }
   }
   return breakdown;
}

export function ensureValidModifiers(save: SaveGame): void {
   forEach(save.state.provinces, (province, state) => {
      forEach(state.modifiers, (type, modifiers) => {
         filterInPlace(modifiers, (modifier) => {
            if (!Number.isFinite(modifier.value)) {
               console.error("Invalid modifier:", modifier);
               return false;
            }
            return true;
         });
      });
      forEach(state.dynamicModifiers, (type, modifiers) => {
         filterInPlace(modifiers, (modifier) => {
            if (!Number.isFinite(modifier.value)) {
               console.error("Invalid modifier:", modifier);
               return false;
            }
            return true;
         });
      });
   });
}
