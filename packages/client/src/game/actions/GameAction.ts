import { clamp, forEach } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type Province, type ProvinceResourceCosts, ProvinceResourceNames } from "../definitions/Province";
import type { IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { hasEnoughProvinceResources } from "../logic/ResourceLogic";

export interface IGameCostCondition {
   cost?: ProvinceResourceCosts;
   condition?: IConditionBreakdown;
}

export interface IGameEffectWithName extends IGameEffect {
   name: string;
}

export interface IGameAction extends IGameCostCondition {
   execute: (options: { headless: boolean }) => void;
   effect?: IGameEffectWithName;
}

export interface ICondition {
   name: string;
   desc?: string;
   progress?: [number, number] | [string, string];
   hidden?: boolean;
   value: boolean;
}

export interface IConditionBreakdown {
   value: boolean;
   breakdown: ICondition[];
}

export function finalizeCondition(condition: ICondition[]): IConditionBreakdown {
   let value = true;
   for (const item of condition) {
      if (!item.value) {
         value = false;
         break;
      }
   }
   return { value, breakdown: condition };
}

export function areConditionBreakdownsEqual(
   a: IConditionBreakdown | undefined,
   b: IConditionBreakdown | undefined,
): boolean {
   if (a === undefined && b === undefined) {
      return true;
   }
   if (a === undefined || b === undefined) {
      return false;
   }
   if (a.value !== b.value) {
      return false;
   }
   if (a.breakdown.length !== b.breakdown.length) {
      return false;
   }
   for (let i = 0; i < a.breakdown.length; i++) {
      if (
         a.breakdown[i].name !== b.breakdown[i].name ||
         a.breakdown[i].desc !== b.breakdown[i].desc ||
         a.breakdown[i].value !== b.breakdown[i].value ||
         a.breakdown[i].hidden !== b.breakdown[i].hidden
      ) {
         return false;
      }
      const aProgress = a.breakdown[i].progress;
      const bProgress = b.breakdown[i].progress;
      if (aProgress === undefined && bProgress === undefined) {
         continue;
      }
      if (aProgress === undefined || bProgress === undefined) {
         return false;
      }
      if (aProgress[0] !== bProgress[0] || aProgress[1] !== bProgress[1]) {
         return false;
      }
   }
   return true;
}

export interface IValueBreakdownItem {
   name: string;
   desc?: string;
   value: number;
}

export interface IValueBreakdownTooltip extends IValueBreakdownItem {
   tooltip?: string;
}

export interface IValueBreakdown {
   value: number;
   totalAdd: number;
   totalMultiply: number;
   add: IValueBreakdownItem[];
   multiplyBase: IValueBreakdownItem;
   multiply: IValueBreakdownItem[];
   reverse?: boolean;
}

export function makeValueBreakdown({
   multiplyBase = { name: $t(L.BaseValue), value: 1 },
   reverse,
}: {
   multiplyBase?: IValueBreakdownItem;
   reverse?: boolean;
} = {}): IValueBreakdown {
   return {
      value: 0,
      totalAdd: 0,
      totalMultiply: multiplyBase.value,
      add: [],
      multiplyBase,
      multiply: [],
      reverse,
   };
}

export function finalizeBreakdown(breakdown: IValueBreakdown, round?: (value: number) => number): IValueBreakdown {
   let totalAdd = 0;
   for (const item of breakdown.add) {
      totalAdd += item.value;
   }
   let totalMultiply = breakdown.multiplyBase.value;
   for (const item of breakdown.multiply) {
      totalMultiply += item.value;
   }
   totalMultiply = clamp(totalMultiply, 0, Number.POSITIVE_INFINITY);
   breakdown.totalAdd = totalAdd;
   breakdown.totalMultiply = totalMultiply;
   breakdown.value = totalAdd * totalMultiply;
   if (round) {
      breakdown.value = round(breakdown.value);
   }
   return breakdown;
}

export function canDoAction(action: IGameCostCondition, province: Province, save: SaveGame): boolean {
   const condition = action.condition === undefined || action.condition.value === true;
   const cost = action.cost === undefined || hasEnoughProvinceResources(action.cost, province, save);
   return condition && cost;
}

export function printAction(action: IGameAction, province: Province, save: SaveGame): string {
   const result: string[] = [];
   if (action.condition) {
      result.push(`# Condition ${action.condition.value ? "✅" : "❌"}`);
      action.condition.breakdown.forEach((item) => {
         result.push(`- ${item.name} ${item.value ? "✅" : "❌"}`);
      });
   }
   if (action.cost) {
      result.push(`# Cost ${hasEnoughProvinceResources(action.cost, province, save) ? "✅" : "❌"}`);
      forEach(action.cost, (resource, value) => {
         result.push(
            `- ${ProvinceResourceNames[resource]()}: ${value} ${hasEnoughProvinceResources({ [resource]: value }, province, save) ? "✅" : "❌"}`,
         );
      });
   }
   return result.join("\n");
}
