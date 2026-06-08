import { entriesOf, forEach, formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IValueBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { Building } from "../definitions/Building";
import type { Province, ProvinceResourceCosts } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import type { SaveGame } from "../GameState";
import { hasEnoughProvinceResources } from "./ProvinceLogic";
import { stringToPosition } from "./StringToPosition";
import { BankruptcyExpenseIncrease } from "./TileLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";

export function getResearchCostBreakdown(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const state = save.state.provinces[province];
   if (!state) {
      return breakdown;
   }
   breakdown.add.push({ name: $t(L.BaseCost), value: 200 });
   breakdown.multiply.push({
      name: $t(L.ResearchedTech),
      desc: $t(
         L.EachTechResearchedRaisesCostByXCompoundedYTechsHaveBeenResearched,
         "10%",
         formatNumber(state.unlockedTech.size),
      ),
      value: 1.1 ** state.unlockedTech.size - 1,
   });
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.XMonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyExpenseIncrease,
      });
   }
   return finalizeBreakdown(breakdown);
}

export function getTechPosition(tech: Tech): { x: number; y: number } {
   const [x, y] = stringToPosition(tech);
   return { x, y };
}

export function makeResearchCost(tech: Tech, cost: number): ProvinceResourceCosts {
   const researchCost: ProvinceResourceCosts = {};
   const position = getTechPosition(tech);
   switch (position.y) {
      case 0:
         researchCost.administrative = cost;
         break;
      case 1:
         researchCost.diplomatic = cost;
         break;
      case 2:
         researchCost.military = cost;
         break;
   }
   return researchCost;
}

// export function requireTechCondition(tech: Tech, province: Province, save: SaveGame): IConditionBreakdownItem {
//    return {
//       name: `${Tech[tech].name()} researched`,
//       value: save.state.provinces[province].unlockedTech.has(tech),
//    };
// }

export function hasResearched(tech: Tech, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   return state.unlockedTech.has(tech);
}

export function getTechsCanBeResearched(province: Province, save: SaveGame): Tech[] {
   const cost = getResearchCostBreakdown(province, save).value;
   const result: Tech[] = [];
   forEach(Tech, (tech, config) => {
      if (hasResearched(tech, province, save)) {
         return;
      }
      if (config.requires.some((t) => !hasResearched(t, province, save))) {
         return;
      }
      if (!hasEnoughProvinceResources(makeResearchCost(tech, cost), province, save)) {
         return;
      }
      result.push(tech);
   });
   return result;
}

export function getCheapestLockedTech(
   type: "administrative" | "diplomatic" | "military",
   province: Province,
   save: SaveGame,
): Tech | undefined {
   const state = save.state.provinces[province];
   if (!state) {
      return undefined;
   }
   for (const [tech, config] of entriesOf(Tech)) {
      if (state.unlockedTech.has(tech)) {
         continue;
      }
      const position = getTechPosition(tech);
      if (type === "administrative" && position.y === 0) {
         return tech;
      }
      if (type === "diplomatic" && position.y === 1) {
         return tech;
      }
      if (type === "military" && position.y === 2) {
         return tech;
      }
   }
   return undefined;
}

export function getBuildingTech(building: Building): Tech | undefined {
   for (const [tech, data] of entriesOf(Tech)) {
      if (data.buildings?.includes(building)) {
         return tech;
      }
   }
   return undefined;
}
