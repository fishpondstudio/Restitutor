import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { isChristianReligion } from "../definitions/Religion";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import {
   addAttitudeModifier,
   cancelImproveRelations,
   cancelInfiltration,
   canImproveRelations,
   canInfiltrate,
   getRelation,
   improveRelations,
   infiltrate,
   isClientOfAnyProvince,
   isWithinDiplomaticRange,
} from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { getProvinceName, getTotalUpgrades } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { requireHigherPrestige } from "../logic/TreatyLogic";
import { getWarsBetween } from "../logic/WarLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ImproveRelationsAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      condition: canImproveRelations(ourProvince, theirProvince, save),
      effect: () => {
         improveRelations(ourProvince, theirProvince, save);
      },
   };
}

export function CancelImproveRelationsAction(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameAction {
   return {
      effect: () => {
         cancelImproveRelations(ourProvince, theirProvince, save);
      },
   };
}

export function InfiltrateAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      condition: canInfiltrate(ourProvince, theirProvince, save),
      effect: () => {
         infiltrate(ourProvince, theirProvince, save);
      },
   };
}

export function CancelInfiltrationAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      effect: () => {
         cancelInfiltration(ourProvince, theirProvince, save);
      },
   };
}

export function GuaranteeDefenseAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "GuaranteeDefense" }, ourProvince, save),
         isWithinDiplomaticRange(ourProvince, theirProvince, save),
         {
            name: $t(L.WeAreNotAtWarWithThem),
            value: getWarsBetween(ourProvince, theirProvince, save).length === 0,
         },
         {
            name: $t(L.WeHaventGuaranteedTheirDefense),
            value: relation.guaranteeDefense === undefined,
         },
         {
            name: $t(L.WeHaveNoTreatyWithThem),
            value: relation.treaty === undefined,
         },
         requireHigherPrestige(ourProvince, theirProvince, 1, save),
      ]),
      effect: () => {
         startTimedAction("GuaranteeDefense", ourProvince, save);
         relation.guaranteeDefense = save.state.month;
         addAttitudeModifier(
            theirProvince,
            ourProvince,
            {
               type: "add",
               name: $t(L.GuaranteedDefenseBy$1, getProvinceName(ourProvince, save)),
               value: 50,
               duration: TimedActions.GuaranteeDefense.duration,
            },
            save,
         );
      },
   };
}

export function DeterAggressionAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   const ourState = save.state.provinces[ourProvince];
   if (!relation || !ourState) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DeterAggression" }, ourProvince, save),
         isWithinDiplomaticRange(ourProvince, theirProvince, save),
         {
            name: $t(L.WeHaventAlreadyDeterredTheirAggression),
            value: relation.deterAggression === undefined,
         },
         requireHigherPrestige(ourProvince, theirProvince, 1, save),
         {
            name: $t(L.TheyAreNotAClientOfAnotherProvince),
            value: !isClientOfAnyProvince(theirProvince, save),
         },
      ]),
      effect: () => {
         startTimedAction("DeterAggression", ourProvince, save);
         relation.deterAggression = save.state.month;
         addModifier({
            modifier: "Prestige",
            type: "multiply",
            name: $t(L.Deterred$1sAggression, getProvinceName(theirProvince, save)),
            value: ourState.rivals.includes(theirProvince) ? 0.2 : 0.1,
            duration: TimedActions.DeterAggression.duration,
            province: ourProvince,
            save,
         });
      },
   };
}

export function SendAGiftAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * TimedActions.SendAGift.duration },
      condition: finalizeCondition([...timedActionConditions({ action: "SendAGift" }, ourProvince, save)]),
      effect: () => {
         startTimedAction("SendAGift", ourProvince, save);
         addAttitudeModifier(
            theirProvince,
            ourProvince,
            {
               type: "add",
               name: $t(L.ReceivedAGiftFrom$1, getProvinceName(ourProvince, save)),
               value: 25,
               duration: TimedActions.SendAGift.duration,
            },
            save,
         );
      },
   };
}

export function ProclaimCrusadeAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const ourState = save.state.provinces[ourProvince];
   const theirState = save.state.provinces[theirProvince];
   if (!ourState || !theirState) {
      return EmptyGameAction;
   }
   return {
      cost: { diplomatic: 25 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ProclaimCrusade" }, ourProvince, save),
         {
            name: $t(L.OurReligionIsChristian),
            value: isChristianReligion(ourState.religion),
         },
         {
            name: $t(L.TheirReligionIsNotChristian),
            value: !isChristianReligion(theirState.religion),
         },
      ]),
      effect: () => {
         const relation = getRelation(ourProvince, theirProvince, save);
         if (relation) {
            relation.casusBelli.set("ReligiousWar", { monthsLeft: TimedActions.ProclaimCrusade.duration });
         }
         startTimedAction("ProclaimCrusade", ourProvince, save);
      },
   };
}
