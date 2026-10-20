import { forEach } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { getRelation } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function NamePublicEnemyAction(theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition([...timedActionConditions({ action: "PublicEnemy" }, theirProvince, save)]),
      execute: () => {
         startTimedAction("PublicEnemy", theirProvince, save);
         addModifier({
            modifier: "Prestige",
            name: $t(L.PublicEnemy),
            value: -0.1,
            duration: TimedActions.PublicEnemy.duration,
            type: "multiply",
            province: theirProvince,
            save,
         });
         forEach(save.state.provinces, (province) => {
            if (province === theirProvince) {
               return;
            }
            const relation = getRelation(province, theirProvince, save);
            if (relation) {
               relation.casusBelli.set("PublicEnemy", {
                  monthsLeft: TimedActions.PublicEnemy.duration,
               });
            }
         });
      },
   };
}
