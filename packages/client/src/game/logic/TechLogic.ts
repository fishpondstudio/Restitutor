import { entriesOf, forEach, formatNumber, mapSafeAdd, sizeOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Building } from "../definitions/Building";
import type { Province, ProvinceResourceCosts } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import type { SaveGame } from "../GameState";
import { defineValueGetter, type EvaluationMode, ValueCalculation } from "./Calculation";
import { attachModifiersToCalculation } from "./ModifierLogic";
import { hasEnoughProvinceResources } from "./ResourceLogic";
import { stringToPosition } from "./StringToPosition";

export const getResearchCostBreakdown = defineValueGetter(
   (tech: Tech, province: Province, save: SaveGame, mode: EvaluationMode = "breakdown") => {
      const calc = new ValueCalculation({ mode, reverse: true });
      const state = save.state.provinces[province];
      if (!state) {
         return calc.finish();
      }
      calc.add(200)?.describe($t(L.BaseCost));
      calc
         .multiply(0.15 * state.unlockedTech.size)
         ?.describe(
            $t(L.ResearchedTech),
            $t(L.EachTechResearchedAdds$1OfTheBaseCost$2, "15%", formatNumber(state.unlockedTech.size)),
         );
      let researchedProvinceCount = 0;
      forEach(save.state.provinces, (_, provinceState) => {
         if (provinceState.unlockedTech.has(tech)) {
            researchedProvinceCount++;
         }
      });
      calc
         .multiply(-0.01 * researchedProvinceCount)
         ?.describe(
            $t(L.FromOtherProvinces),
            $t(L.ResearchedProvinceDiscount$1$2, "1%", formatNumber(researchedProvinceCount)),
         );
      attachModifiersToCalculation("ResearchCost", calc, province, save);
      return calc.finish();
   },
);

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
   const result: Tech[] = [];
   forEach(Tech, (tech, config) => {
      if (hasResearched(tech, province, save)) {
         return;
      }
      if (config.requires.some((t) => !hasResearched(t, province, save))) {
         return;
      }
      const cost = getResearchCostBreakdown(tech, province, save, "value");
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

export function getBaselineTechs(save: SaveGame): Tech[] {
   const threshold = sizeOf(save.state.provinces) / 2;
   const techs = new Map<Tech, number>();
   forEach(save.state.provinces, (province, state) => {
      if (province === save.state.playerProvince) {
         return;
      }
      state.unlockedTech.forEach((tech) => {
         mapSafeAdd(techs, tech, 1);
      });
   });
   const result: Tech[] = [];
   techs.forEach((count, tech) => {
      if (count >= threshold) {
         result.push(tech);
      }
   });
   return result;
}
