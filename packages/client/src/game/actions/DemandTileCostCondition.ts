import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getRelation, isWithinDiplomaticRange } from "../logic/DiplomacyLogic";
import { isGreatPowerCondition, isNorGreatPowerCondition } from "../logic/ProvinceLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { getTruceMonthsLeft, getWarsBetween } from "../logic/WarLogic";
import { finalizeCondition, type IGameCostCondition } from "./GameAction";

export function DemandTileCostCondition(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameCostCondition {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "DemandTile" }, ourProvince, save),
            isGreatPowerCondition(ourProvince, save),
            isNorGreatPowerCondition(theirProvince, save),
            isWithinDiplomaticRange(ourProvince, theirProvince, save),
            {
               name: $t(L.WeHaveNoTreatyWithThem),
               value: getRelation(ourProvince, theirProvince, save)?.treaty === undefined,
            },
            {
               name: $t(L.WeHaventGuaranteedTheirDefense),
               value: getRelation(ourProvince, theirProvince, save)?.guaranteeDefense === undefined,
            },
            {
               name: $t(L.WeAreNotAlreadyAtWarWithThem),
               value: getWarsBetween(ourProvince, theirProvince, save).length === 0,
            },
            {
               name: $t(L.WeAreNotInATruceWithThem),
               value: getTruceMonthsLeft(ourProvince, theirProvince, save) <= 0,
            },
         ],
      }),
   };
}
