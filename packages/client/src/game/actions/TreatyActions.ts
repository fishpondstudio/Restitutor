import { $t, L } from "../../utils/i18n";
import { unlockAchievement } from "../Achievement";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { toConditions } from "../logic/Calculation";
import {
   availableDiplomatCondition,
   isClientOfAnyProvince,
   isWithinDiplomaticRange,
   setTreatyBetween,
} from "../logic/DiplomacyLogic";
import { getProvinceName, getProvincesInRange } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import {
   requireHigherPrestige,
   requireMinimumAttitude,
   requireNoTreatyBetween,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function OfferDefensePactAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

         requireNoTreatyBetween(["DefensePact", "Alliance", "Patron"], fromProvince, toProvince, save),

         ...toConditions(requirePeaceBetweenChecks(fromProvince, toProvince, save)),
         requireHigherPrestige(fromProvince, toProvince, 1, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),

         requireMinimumAttitude(toProvince, fromProvince, 0, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
      ]),
      execute: () => {
         if (!setTreatyBetween("DefensePact", fromProvince, toProvince, save)) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.$1And$2FormedADefensePact, fromProvince, toProvince),
            },
            save,
         );
      },
   };
}

export function OfferAllianceAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

         requireNoTreatyBetween(["Alliance", "Patron"], fromProvince, toProvince, save),

         ...toConditions(requirePeaceBetweenChecks(fromProvince, toProvince, save)),
         requireHigherPrestige(fromProvince, toProvince, 1.25, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),

         requireMinimumAttitude(toProvince, fromProvince, 50, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
      ]),
      execute: () => {
         if (!setTreatyBetween("Alliance", fromProvince, toProvince, save)) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.$1And$2FormedAnAlliance, fromProvince, toProvince),
            },
            save,
         );
      },
   };
}

export function OfferPatronageAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

         requireNoTreatyBetween(["Patron"], fromProvince, toProvince, save),

         ...toConditions(requirePeaceBetweenChecks(fromProvince, toProvince, save)),
         requireHigherPrestige(fromProvince, toProvince, 5, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),
         {
            name: $t(
               L.$1SharesALandBorderWith$2,
               getProvinceName(fromProvince, save),
               getProvinceName(toProvince, save),
            ),
            value: getProvincesInRange(1, fromProvince, save).has(toProvince),
         },
         {
            name: $t(L.$1IsNotAClientOfAnyProvince, getProvinceName(toProvince, save)),
            value: !isClientOfAnyProvince(toProvince, save),
         },
         requireMinimumAttitude(toProvince, fromProvince, 100, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
      ]),
      execute: () => {
         if (!setTreatyBetween("Patron", fromProvince, toProvince, save)) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         if (fromProvince === save.state.playerProvince) {
            unlockAchievement("EstablishClient");
         }
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.$1BecameAClientOf$2, toProvince, fromProvince),
            },
            save,
         );
      },
   };
}
