import { $t, L } from "../../utils/i18n";
import type { GovernorPower, Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SetGovernmentFocusAction(type: GovernorPower, province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "SetGovernmentFocus" }, province, save),
         { name: $t(L.NotCurrentFocus), value: state.focus !== type },
      ]),
      effect: () => {
         startTimedAction("SetGovernmentFocus", province, save);
         state.focus = type;
      },
   };
}
