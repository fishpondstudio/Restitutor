import { formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getMercenaryCost, getProvinceManpower, getProvinceStat, setProvinceStat } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import type { IWar } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function HireMercenariesAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   const actualConscription = getProvinceStat("actualConscription", province, save);
   const targetConscription = getProvinceStat("targetConscription", province, save);
   const manpower = getProvinceManpower(province, save).value;
   const reinforceSize = manpower * (targetConscription - actualConscription) * 0.01;
   return {
      cost: {
         gold: getMercenaryCost(province, save).value,
      },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "HireMercenaries" }, province, save),
            {
               name: $t(L.TargetConscriptionIsGreaterThanActualConscription),
               value: actualConscription < targetConscription,
               desc: $t(
                  L.TargetConscription$1ActualConscription$2ReinforceSize$3,
                  targetConscription,
                  actualConscription,
                  formatNumber(reinforceSize),
               ),
            },
            {
               name: $t(L.WeAreTheLeadAttackerOrDefenderOfTheWar),
               value: war.attacker === province || war.defender === province,
            },
            {
               name: $t(L.WeHaventWonTheWar),
               value: war.actualWarScore < war.requiredWarScore,
            },
         ],
      }),
      effect: () => {
         startTimedAction("HireMercenaries", province, save);
         setProvinceStat("actualConscription", getProvinceStat("targetConscription", province, save), province, save);
      },
   };
}
