import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import { RefreshTechTree } from "../Events";
import type { SaveGame } from "../GameState";
import { getResearchCostBreakdown, makeResearchCost } from "../logic/TechLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function ResearchTechAction(tech: Tech, province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   const cost = getResearchCostBreakdown(tech, province, save, "value");
   const allPrerequisitesUnlocked = Tech[tech].requires.reduce((acc, t) => acc && state.unlockedTech.has(t), true);
   return {
      cost: makeResearchCost(tech, cost),
      condition: finalizeCondition([
         { name: $t(L.AllPrerequisitesAreResearched), value: allPrerequisitesUnlocked },
         { name: $t(L.NotResearchedYet), value: !state.unlockedTech.has(tech) },
      ]),
      execute: ({ headless }) => {
         state.unlockedTech.add(tech);
         if (!headless) {
            RefreshTechTree.emit();
         }
      },
   };
}
