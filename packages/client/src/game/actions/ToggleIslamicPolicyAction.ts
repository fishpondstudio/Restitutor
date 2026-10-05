import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import {
   addProvinceUpgrade,
   hasProvinceUpgrade,
   type IslamicPolicy,
   removeProvinceUpgrade,
} from "../definitions/ProvinceUpgrades";
import type { SaveGame } from "../GameState";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ToggleIslamicPolicyAction(policy: IslamicPolicy, province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ChangeIslamicPolicy" }, province, save),
         {
            name: $t(L.OurProvincesReligionIsIslam),
            value: state.religion === "Islam",
         },
      ]),
      execute: () => {
         if (hasProvinceUpgrade(policy, province, save)) {
            removeProvinceUpgrade(policy, province, save);
         } else {
            addProvinceUpgrade(policy, province, save);
         }
         startTimedAction("ChangeIslamicPolicy", province, save);
      },
   };
}
