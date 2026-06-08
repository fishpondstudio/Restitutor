import { formatNumber, range, shuffle } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { attachModifiers } from "../logic/ModifierLogic";
import { randomMaleName } from "../RomanNames";
import { AdvisorTraits, getProvinceTraits, type PersonTrait } from "./PersonTrait";
import type { Province } from "./Province";

export interface IAdvisor {
   name: string;
   level: number;
   traits: Set<PersonTrait>;
}

export function initAdvisors(): { selected: IAdvisor | null; candidates: IAdvisor[] } {
   return {
      selected: null,
      candidates: range(1, 4).map((i) => {
         const traits = shuffle(AdvisorTraits.slice(0)).slice(0, i);
         return { name: randomMaleName().join(" "), level: i, traits: new Set(traits) };
      }),
   };
}

export function getAdvisorMonthlyCost(level: number, province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   if (level <= 0) {
      breakdown.add.push({ name: $t(L.NoAdvisor), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   breakdown.add.push({
      name: $t(L.BaseCost),
      desc: $t(L.ForLevelXAdvisor, formatNumber(level)),
      value: 4 ** level * 3,
   });
   attachModifiers("AdvisorCost", breakdown, province, save);
   getProvinceTraits("Thrifty", province, save).forEach((trait) => {
      breakdown.multiply.push({ ...trait, value: -0.02 });
   });
   return finalizeBreakdown(breakdown);
}

export function getAdvisorInitialCost(level: number, province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   if (level <= 0) {
      breakdown.add.push({ name: $t(L.NoAdvisor), value: 0 });
      return finalizeBreakdown(breakdown);
   }
   breakdown.add.push({
      name: $t(L.BaseCost),
      desc: $t(L.ForLevelXAdvisor, formatNumber(level)),
      value: 6 * getAdvisorMonthlyCost(level, province, save).value,
   });
   return finalizeBreakdown(breakdown);
}
