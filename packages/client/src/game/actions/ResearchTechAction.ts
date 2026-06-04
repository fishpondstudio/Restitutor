import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import { RefreshTechTree } from "../Events";
import type { SaveGame } from "../GameState";
import { getResearchCost, getResearchCostBreakdown } from "../logic/TechLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function ResearchTechAction(tech: Tech, province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   const breakdown = getResearchCostBreakdown(province, save);
   const allPrerequisitesUnlocked = Tech[tech].requires.reduce((acc, t) => acc && state.unlockedTech.has(t), true);
   return {
      cost: getResearchCost(tech, breakdown.value),
      condition: finalizeCondition({
         breakdown: [
            { name: $t(L.AllPrerequisitesAreResearched), value: allPrerequisitesUnlocked },
            { name: $t(L.NotResearchedYet), value: !state.unlockedTech.has(tech) },
         ],
      }),
      effect: ({ headless }) => {
         state.unlockedTech.add(tech);
         if (!headless) {
            RefreshTechTree.emit();
         }
      },
   };
}
