import { clamp } from "@mantine/hooks";
import { forEach, sizeOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import {
   type Province,
   type ProvinceResource,
   type ProvinceResourceCosts,
   ProvinceResourceNames,
} from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { hasEnoughProvinceResources } from "../logic/ProvinceLogic";

export interface IGameCostCondition {
   cost?: ProvinceResourceCosts;
   condition?: IConditionBreakdown;
}

export interface IGameAction extends IGameCostCondition {
   effect: (options: { headless: boolean }) => void;
}

export interface ICondition {
   name: string;
   desc?: string;
   progress?: [number, number];
   hidden?: boolean;
   value: boolean;
}

export interface IConditionBreakdown {
   value: boolean;
   breakdown: ICondition[];
}

export function finalizeCondition(condition: Omit<IConditionBreakdown, "value">): IConditionBreakdown {
   let value = true;
   for (const item of condition.breakdown) {
      if (!item.value) {
         value = false;
         break;
      }
   }
   return { value, breakdown: condition.breakdown };
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
      totalMultiply: 0,
      add: [],
      multiplyBase,
      multiply: [],
      reverse,
   };
}

export function finalizeBreakdown(breakdown: IValueBreakdown): IValueBreakdown {
   let totalAdd = 0;
   for (const item of breakdown.add) {
      totalAdd += item.value;
   }
   let totalMultiply = breakdown.multiplyBase.value;
   for (const item of breakdown.multiply) {
      totalMultiply += item.value;
   }
   totalMultiply = clamp(totalMultiply, 0, Number.POSITIVE_INFINITY);
   breakdown.value = totalAdd * totalMultiply;
   breakdown.totalAdd = totalAdd;
   breakdown.totalMultiply = totalMultiply;
   return breakdown;
}

export function areValueBreakdownsEqual(a: IValueBreakdown | undefined, b: IValueBreakdown | undefined): boolean {
   if (a === undefined && b === undefined) {
      return true;
   }
   if (a === undefined || b === undefined) {
      return false;
   }
   if (a.value !== b.value) {
      return false;
   }
   if (a.totalAdd !== b.totalAdd) {
      return false;
   }
   if (a.totalMultiply !== b.totalMultiply) {
      return false;
   }
   if (a.add.length !== b.add.length) {
      return false;
   }
   for (let i = 0; i < a.add.length; i++) {
      if (a.add[i].name !== b.add[i].name || a.add[i].desc !== b.add[i].desc || a.add[i].value !== b.add[i].value) {
         return false;
      }
   }
   if (a.multiply.length !== b.multiply.length) {
      return false;
   }
   for (let i = 0; i < a.multiply.length; i++) {
      if (
         a.multiply[i].name !== b.multiply[i].name ||
         a.multiply[i].desc !== b.multiply[i].desc ||
         a.multiply[i].value !== b.multiply[i].value
      ) {
         return false;
      }
   }
   if (a.reverse !== b.reverse) {
      return false;
   }
   return true;
}

export function areProvinceCostsEqual(
   a: ProvinceResourceCosts | undefined,
   b: ProvinceResourceCosts | undefined,
): boolean {
   if (a === undefined && b === undefined) {
      return true;
   }
   if (a === undefined || b === undefined) {
      return false;
   }
   if (sizeOf(a) !== sizeOf(b)) {
      return false;
   }
   let resource: ProvinceResource;
   for (resource in a) {
      if (a[resource] !== b[resource]) {
         return false;
      }
   }
   return true;
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
