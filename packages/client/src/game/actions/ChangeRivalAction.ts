import { formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import {
   addAttitudeModifier,
   getRelation,
   HumiliateRivalCasusBelliMonths,
   RivalAttitudeDuration,
   RivalAttitudeModifier,
} from "../logic/DiplomacyLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { getTimedActionCooldownLeft, startTimedAction } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ChangeRivalAction(
   province: Province,
   index: number,
   selectedProvince: Province,
   save: SaveGame,
): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   const cooldown = getTimedActionCooldownLeft("ChangeRival", province, save);
   return {
      condition: finalizeCondition([
         {
            name: $t(L.WeCannotSelectOurselvesAsARival),
            value: selectedProvince !== province,
         },
         {
            name: $t(L.WeCannotSelectTheSameRivalTwice),
            value: !state.rivals.includes(selectedProvince),
         },
         {
            name: $t(L.WeCannotChangeRivalForAnother$1Months, formatNumber(cooldown)),
            value: state.rivals[index] === null || cooldown <= 0,
         },
      ]),
      effect: () => {
         addAttitudeModifier(
            selectedProvince,
            province,
            {
               type: "add",
               name: $t(
                  L.$1Considers$2ARival,
                  getProvinceName(province, save),
                  getProvinceName(selectedProvince, save),
               ),
               value: RivalAttitudeModifier,
               duration: RivalAttitudeDuration,
            },
            save,
         );
         state.rivals[index] = selectedProvince;
         const relation = getRelation(selectedProvince, province, save);
         if (relation) {
            relation.casusBelli.set("HumiliateRival", { monthsLeft: HumiliateRivalCasusBelliMonths });
         }
         startTimedAction("ChangeRival", province, save);
      },
   };
}
