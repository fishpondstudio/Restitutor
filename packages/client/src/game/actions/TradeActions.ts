import { $t, L } from "../../utils/i18n";
import type { Province, TradeOffer } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { getRelation, isWithinDiplomaticRange } from "../logic/DiplomacyLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { requireMinimumAttitude } from "../logic/TreatyLogic";
import { getWarsBetween } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction, type IGameCostCondition } from "./GameAction";

export const MinimumTradeAttitude = -10;

export function CanTradeCostCondition(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameCostCondition {
   return {
      cost: { diplomatic: 10 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "TradeGoods" }, ourProvince, save),
         isWithinDiplomaticRange(ourProvince, theirProvince, save),
         {
            name: $t(L.WeAreNotAtWarWithThem),
            value: getWarsBetween(ourProvince, theirProvince, save).length === 0,
         },
         requireMinimumAttitude(theirProvince, ourProvince, MinimumTradeAttitude, save),
         {
            name: $t(L.WeDontAlreadyHaveAnActiveTradeWithThem),
            value: getRelation(ourProvince, theirProvince, save)?.trade === undefined,
         },
      ]),
   };
}

export function TradeWithAction(
   ourProvince: Province,
   theirProvince: Province,
   offer: TradeOffer,
   save: SaveGame,
): IGameAction {
   return {
      ...CanTradeCostCondition(ourProvince, theirProvince, save),
      execute: () => {
         startTimedAction("TradeGoods", ourProvince, save);
         const relation = getRelation(ourProvince, theirProvince, save);
         if (relation) {
            relation.trade = {
               ...offer,
               monthsLeft: TimedActions.TradeGoods.duration,
            };
         }
      },
   };
}
