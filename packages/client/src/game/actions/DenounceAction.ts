import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { getProvinceName } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function DenounceAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const name = $t(L.$1Denounced$2, getProvinceName(ourProvince, save), getProvinceName(theirProvince, save));
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([...timedActionConditions({ action: "Denounce" }, ourProvince, save)]),
      execute: () => {
         startTimedAction("Denounce", ourProvince, save);
      },
      effect: {
         name,
         attitudes: {
            [theirProvince]: {
               type: "add",
               name,
               value: -50,
               duration: TimedActions.Denounce.duration,
            },
         },
         modifiers: {
            Prestige: {
               type: "multiply",
               value: save.state.provinces[ourProvince]?.rivals.includes(theirProvince) ? 0.2 : 0.1,
               duration: TimedActions.Denounce.duration,
            },
         },
      },
   };
}
