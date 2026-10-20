import { forEach } from "@project/shared/src/utils/Helper";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { addAttitudeModifier } from "../logic/DiplomacyLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function RestrictArmsSupplyAction(theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition(timedActionConditions({ action: "RestrictArmsSupply" }, theirProvince, save)),
      execute: () => {
         startTimedAction("RestrictArmsSupply", theirProvince, save);
      },
      effect: {
         name: TimedActions.RestrictArmsSupply.name(),
         provinceModifiers: [
            {
               modifier: "WarPower",
               value: -0.1,
               duration: TimedActions.RestrictArmsSupply.duration,
               type: "multiply",
               province: theirProvince,
            },
         ],
      },
   };
}

export function OrderAnInquiryAction(theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition(timedActionConditions({ action: "OrderAnInquiry" }, theirProvince, save)),
      execute: () => {
         startTimedAction("OrderAnInquiry", theirProvince, save);
      },
      effect: {
         name: TimedActions.OrderAnInquiry.name(),
         provinceModifiers: [
            {
               modifier: "Stability",
               value: -10,
               duration: TimedActions.OrderAnInquiry.duration,
               type: "add",
               province: theirProvince,
            },
         ],
      },
   };
}

export function IssueCensureAction(theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition(timedActionConditions({ action: "IssueCensure" }, theirProvince, save)),
      execute: () => {
         startTimedAction("IssueCensure", theirProvince, save);
         forEach(save.state.provinces, (province) => {
            if (province === theirProvince) {
               return;
            }
            addAttitudeModifier(
               province,
               theirProvince,
               {
                  name: TimedActions.IssueCensure.name(),
                  value: -20,
                  duration: TimedActions.IssueCensure.duration,
                  type: "add",
               },
               save,
            );
         });
      },
   };
}
