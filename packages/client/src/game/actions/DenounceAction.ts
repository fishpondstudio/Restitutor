import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { addAttitudeModifier } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { getProvinceName, isGreatPowerCondition, isNorGreatPowerCondition } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function DenounceAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "Denounce" }, ourProvince, save),
         isGreatPowerCondition(ourProvince, save),
         isNorGreatPowerCondition(theirProvince, save),
      ]),
      effect: () => {
         startTimedAction("Denounce", ourProvince, save);
         const name = $t(L.$1Denounced$2, getProvinceName(ourProvince, save), getProvinceName(theirProvince, save));
         addAttitudeModifier(
            theirProvince,
            ourProvince,
            {
               type: "add",
               name,
               value: -50,
               duration: TimedActions.Denounce.duration,
            },
            save,
         );
         addModifier({
            modifier: "Prestige",
            type: "multiply",
            name,
            value: save.state.provinces[ourProvince]?.rivals.includes(theirProvince) ? 0.2 : 0.1,
            duration: TimedActions.Denounce.duration,
            province: ourProvince,
            save,
         });
      },
   };
}
