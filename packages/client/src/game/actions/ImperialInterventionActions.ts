import { forEach } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import {
   addAttitudeModifier,
   RequestImperialFavorCost,
   requireInfiltration,
   tryUseInfiltration,
} from "../logic/DiplomacyLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { addProvinceResource } from "../logic/ResourceLogic";
import { requireScenarioFlagCondition } from "../logic/ScenarioLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type ICondition, type IGameAction } from "./GameAction";

export function interventionTargetConditions(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): ICondition[] {
   return [
      {
         name: $t(L.$1IsOnTheMap, getProvinceName(theirProvince, save)),
         value: theirProvince !== ourProvince && !!save.state.provinces[theirProvince],
      },
   ];
}

export function EnlistCourtSupportAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition([
         ...requireScenarioFlagCondition("ImperialCourt", save),
         ...timedActionConditions({ action: "EnlistCourtSupport" }, ourProvince, save),
         requireInfiltration(RequestImperialFavorCost, { consume: true }, ourProvince, theirProvince, save),
      ]),
      execute: () => {
         if (tryUseInfiltration(RequestImperialFavorCost, ourProvince, theirProvince, save)) {
            startTimedAction("EnlistCourtSupport", ourProvince, save);
            addProvinceResource("consulPoint", 1, ourProvince, save);
         }
      },
   };
}

export function RestrictArmsSupplyAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition([
         ...interventionTargetConditions(ourProvince, theirProvince, save),
         ...timedActionConditions({ action: "RestrictArmsSupply" }, ourProvince, save),
      ]),
      execute: () => {
         startTimedAction("RestrictArmsSupply", ourProvince, save);
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

export function OrderAnInquiryAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition([
         ...interventionTargetConditions(ourProvince, theirProvince, save),
         ...timedActionConditions({ action: "OrderAnInquiry" }, ourProvince, save),
      ]),
      execute: () => {
         startTimedAction("OrderAnInquiry", ourProvince, save);
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

export function IssueCensureAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { consulPoint: 1 },
      condition: finalizeCondition([
         ...interventionTargetConditions(ourProvince, theirProvince, save),
         ...timedActionConditions({ action: "IssueCensure" }, ourProvince, save),
      ]),
      execute: () => {
         startTimedAction("IssueCensure", ourProvince, save);
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
