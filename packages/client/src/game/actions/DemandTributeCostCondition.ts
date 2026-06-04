import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { isGreatPowerCondition, isNorGreatPowerCondition } from "../logic/ProvinceLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameCostCondition } from "./GameAction";

export function DemandTributeCostCondition(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameCostCondition {
   return {
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "DemandTribute" }, ourProvince, save),
            isGreatPowerCondition(ourProvince, save),
            isNorGreatPowerCondition(theirProvince, save),
         ],
      }),
   };
}
