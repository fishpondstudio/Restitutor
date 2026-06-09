import { $t, L } from "../../utils/i18n";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import {
   availableDiplomatCondition,
   getRelation,
   isClientOfAnyProvince,
   isWithinDiplomaticRange,
} from "../logic/DiplomacyLogic";
import { getProvinceName, getProvincesInRange } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import {
   requireHigherPrestige,
   requireMinimumAttitudeV2,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function OfferDefensePactAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

            requireNoTreatyBetween(["DefensePact", "Alliance", "Patron"], fromProvince, toProvince, save),

            requirePeaceBetween(fromProvince, toProvince, save),
            requireHigherPrestige(fromProvince, toProvince, 1, save),
            availableDiplomatCondition(fromProvince, toProvince, save),
            isWithinDiplomaticRange(fromProvince, toProvince, save),

            requireMinimumAttitudeV2(toProvince, fromProvince, 0, save),
            availableDiplomatCondition(toProvince, fromProvince, save),
         ],
      }),
      effect: () => {
         const fromTo = getRelation(fromProvince, toProvince, save);
         const toFrom = getRelation(toProvince, fromProvince, save);
         if (!fromTo || !toFrom) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         fromTo.treaty = { type: "DefensePact", month: save.state.month };
         toFrom.treaty = { type: "DefensePact", month: save.state.month };
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.XAndYFormedADefensePact, fromProvince, toProvince),
            },
            save,
         );
      },
   };
}

export function OfferAllianceAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

            requireNoTreatyBetween(["Alliance", "Patron"], fromProvince, toProvince, save),

            requirePeaceBetween(fromProvince, toProvince, save),
            requireHigherPrestige(fromProvince, toProvince, 1.25, save),
            availableDiplomatCondition(fromProvince, toProvince, save),
            isWithinDiplomaticRange(fromProvince, toProvince, save),

            requireMinimumAttitudeV2(toProvince, fromProvince, 50, save),
            availableDiplomatCondition(toProvince, fromProvince, save),
         ],
      }),
      effect: () => {
         const fromTo = getRelation(fromProvince, toProvince, save);
         const toFrom = getRelation(toProvince, fromProvince, save);
         if (!fromTo || !toFrom) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         fromTo.treaty = { type: "Alliance", month: save.state.month };
         toFrom.treaty = { type: "Alliance", month: save.state.month };
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.XAndYFormedAnAlliance, fromProvince, toProvince),
            },
            save,
         );
      },
   };
}

export function OfferPatronageAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),

            requireNoTreatyBetween(["Patron"], fromProvince, toProvince, save),

            requirePeaceBetween(fromProvince, toProvince, save),
            requireHigherPrestige(fromProvince, toProvince, 5, save),
            availableDiplomatCondition(fromProvince, toProvince, save),
            isWithinDiplomaticRange(fromProvince, toProvince, save),
            {
               name: $t(
                  L.XSharesALandBorderWithY,
                  getProvinceName(fromProvince, save),
                  getProvinceName(toProvince, save),
               ),
               value: getProvincesInRange(1, fromProvince, save).has(toProvince),
            },
            {
               name: $t(L.XIsNotAClientOfAnyProvince, getProvinceName(toProvince, save)),
               value: !isClientOfAnyProvince(toProvince, save),
            },
            requireMinimumAttitudeV2(toProvince, fromProvince, 100, save),
            availableDiplomatCondition(toProvince, fromProvince, save),
         ],
      }),
      effect: () => {
         const fromTo = getRelation(fromProvince, toProvince, save);
         const toFrom = getRelation(toProvince, fromProvince, save);
         if (!fromTo || !toFrom) {
            return;
         }
         startTimedAction("DiplomaticTreaty", fromProvince, save);
         fromTo.treaty = { type: "Patron", month: save.state.month };
         toFrom.treaty = { type: "Client", month: save.state.month };
         addChronicleEntry(
            {
               type: "DiplomaticTreaty",
               content: $t(L.XBecameAClientOfY, toProvince, fromProvince),
            },
            save,
         );
      },
   };
}
