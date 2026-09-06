import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import {
   addProvinceStat,
   getProvinceName,
   getProvinceStat,
   isGreatPowerCondition,
   isNorGreatPowerCondition,
} from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function DemandElectionBackingAction(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DemandElectionBacking" }, ourProvince, save),
         isGreatPowerCondition(ourProvince, save),
         isNorGreatPowerCondition(theirProvince, save),
         {
            name: $t(L.$1HasNotAlreadyPledgedWithOtherProvinces, getProvinceName(theirProvince, save)),
            value: getProvinceStat("consulVotes", theirProvince, save) >= 1,
         },
      ]),
      effect: () => {
         addProvinceStat("consulVotes", -1, theirProvince, save);
         addProvinceStat("consulVotes", 1, ourProvince, save);
         startTimedAction("DemandElectionBacking", ourProvince, save);
      },
   };
}
