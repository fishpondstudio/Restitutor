import { clamp, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown, IValueBreakdownItem } from "../actions/GameAction";
import { finalizeCondition } from "../actions/GameAction";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import {
   addAttitudeModifier,
   availableDiplomatCondition,
   getAttitudeTowards,
   getRelation,
   getRelations,
   isClientOfAnyProvince,
   isWithinDiplomaticRange,
   requireInfiltration,
   tryUseInfiltration,
} from "./DiplomacyLogic";
import { getProvinceName, getProvincePrestige, getProvincesInRange } from "./ProvinceLogic";
import { startTimedAction, timedActionConditions } from "./TimedActionLogic";
import { getWarsBetween } from "./WarLogic";

export const CancelProtectionDurationMonths = 12 * 3;
export const CancelProtectionPenaltyItem: IValueBreakdownItem = {
   name: $t(L.CancelledProtection),
   value: -20,
   desc: $t(L.ForXMonths, formatNumber(CancelProtectionDurationMonths)),
};

export const CancelDefensePactDurationMonths = 12 * 4;
export const CancelDefensePactPenaltyItem: IValueBreakdownItem = {
   name: $t(L.CancelledDefensePact),
   value: -10,
   desc: $t(L.ForXMonths, formatNumber(CancelDefensePactDurationMonths)),
};

export const CancelAllianceDurationMonths = 12 * 5;
export const CancelAlliancePenaltyItem: IValueBreakdownItem = {
   name: $t(L.CancelledAlliance),
   value: -10,
   desc: $t(L.ForXMonths, formatNumber(CancelAllianceDurationMonths)),
};

export const CancelPatronageDurationMonths = 12 * 10;
export const CancelPatronagePenaltyItem: IValueBreakdownItem = {
   name: $t(L.CancelledPatronage),
   value: -50,
   desc: $t(L.ForXMonths, formatNumber(CancelPatronageDurationMonths)),
};

export function getDefensePacts(province: Province, save: SaveGame): Province[] {
   const relations = getRelations(province, save);
   if (!relations) {
      return [];
   }
   return Array.from(relations)
      .filter(([province, relation]) => relation.treaty?.type === "DefensePact")
      .map(([province]) => province);
}

export function getAllies(province: Province, save: SaveGame): Province[] {
   const relations = getRelations(province, save);
   if (!relations) {
      return [];
   }
   return Array.from(relations)
      .filter(([_, relation]) => relation.treaty?.type === "Alliance")
      .map(([province]) => province);
}
export function getPatrons(province: Province, save: SaveGame): Province[] {
   const relations = getRelations(province, save);
   if (!relations) {
      return [];
   }
   return (
      Array.from(relations)
         // We want to get all relations that we are the client (i.e. our patrons)
         .filter(([province, relation]) => relation.treaty?.type === "Client")
         .map(([province]) => province)
   );
}

export function getClients(province: Province, save: SaveGame): Province[] {
   const relations = getRelations(province, save);
   if (!relations) {
      return [];
   }
   return (
      Array.from(relations)
         // We want to get all relations that we are the patron (i.e. our clients)
         .filter(([province, relation]) => relation.treaty?.type === "Patron")
         .map(([province]) => province)
   );
}

export function requireHigherPrestige(us: Province, them: Province, percentage: number, save: SaveGame): ICondition {
   const ourPrestige = getProvincePrestige(us, save).value;
   const theirPrestige = getProvincePrestige(them, save).value;
   return {
      name: $t(L.OurPrestigeIsAtLeastXOfTheirs, formatPercent(percentage)),
      value: ourPrestige >= theirPrestige * percentage,
      desc: $t(
         L.OurPrestigeXTheirPrestigeYWeNeedAtLeastZ,
         formatNumber(ourPrestige),
         formatNumber(theirPrestige),
         formatNumber(percentage * theirPrestige),
      ),
   };
}

export function requireMinimumAttitude(us: Province, them: Province, attitude: number, save: SaveGame): ICondition {
   const current = getAttitudeTowards(them, us, save);
   return {
      name: $t(
         L.XHasAtLeastYAttitudeTowardsZ,
         getProvinceName(them, save),
         formatNumber(attitude),
         getProvinceName(us, save),
      ),
      progress: [current.value, attitude],
      value: current.value >= attitude,
   };
}

export function hasOfferedDefensePact(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   return (
      getRelation(fromProvince, toProvince, save)?.treaty?.type === "DefensePact" &&
      getRelation(toProvince, fromProvince, save)?.treaty?.type === "DefensePact"
   );
}

export function canOfferDefensePact(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),
         { name: $t(L.WeAreNotAtWarWithThem), value: getWarsBetween(fromProvince, toProvince, save).length === 0 },
         requireHigherPrestige(fromProvince, toProvince, 1, save),
         requireMinimumAttitude(fromProvince, toProvince, 25, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),
         {
            name: $t(L.WeDontAlreadyHaveAnActiveDefensePactWithThem),
            value: !hasOfferedDefensePact(fromProvince, toProvince, save),
         },
         {
            name: $t(L.WeDontAlreadyHaveAnActiveAllianceWithThem),
            value: !hasOfferedAlliance(fromProvince, toProvince, save),
         },
         {
            name: $t(L.WeDontAlreadyHaveAnActivePatronageWithThem),
            value: !hasOfferedPatronage(fromProvince, toProvince, save),
         },
      ],
   });
}

export function tryOfferDefensePact(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!canOfferDefensePact(fromProvince, toProvince, save)) {
      return false;
   }
   forceDefensePact(fromProvince, toProvince, save);
   startTimedAction("DiplomaticTreaty", fromProvince, save);
   return true;
}

export function forceDefensePact(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return;
   }
   fromTo.treaty = { type: "DefensePact", month: save.state.month };
   toFrom.treaty = { type: "DefensePact", month: save.state.month };
   addChronicleEntry(
      {
         type: "DiplomaticTreaty",
         content: $t(L.XAndYFormedADefensePact, fromProvince, toProvince),
      },
      save,
   );
}

export function cancelDefensePact(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!hasOfferedDefensePact(fromProvince, toProvince, save)) {
      return false;
   }
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return false;
   }
   fromTo.treaty = undefined;
   toFrom.treaty = undefined;
   addAttitudeModifier(
      fromProvince,
      toProvince,
      {
         type: "add",
         name: CancelDefensePactPenaltyItem.name,
         value: CancelDefensePactPenaltyItem.value,
         duration: CancelDefensePactDurationMonths,
      },
      save,
   );
   return true;
}

export function hasOfferedAlliance(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   return (
      getRelation(fromProvince, toProvince, save)?.treaty?.type === "Alliance" &&
      getRelation(toProvince, fromProvince, save)?.treaty?.type === "Alliance"
   );
}

export function canOfferAlliance(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),
         { name: $t(L.WeAreNotAtWarWithThem), value: getWarsBetween(fromProvince, toProvince, save).length === 0 },
         requireHigherPrestige(fromProvince, toProvince, 1.25, save),
         requireMinimumAttitude(fromProvince, toProvince, 50, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),
         {
            name: $t(L.WeDontAlreadyHaveAnActiveAllianceWithThem),
            value: !hasOfferedAlliance(fromProvince, toProvince, save),
         },
         {
            name: $t(L.WeDontAlreadyHaveAnActivePatronageWithThem),
            value: !hasOfferedPatronage(fromProvince, toProvince, save),
         },
      ],
   });
}

export function tryOfferAlliance(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!canOfferAlliance(fromProvince, toProvince, save)) {
      return false;
   }
   forceAlliance(fromProvince, toProvince, save);
   startTimedAction("DiplomaticTreaty", fromProvince, save);
   return true;
}

export function forceAlliance(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return;
   }
   fromTo.treaty = { type: "Alliance", month: save.state.month };
   toFrom.treaty = { type: "Alliance", month: save.state.month };
   addChronicleEntry(
      {
         type: "DiplomaticTreaty",
         content: $t(L.XAndYFormedAnAlliance, fromProvince, toProvince),
      },
      save,
   );
}

export function cancelAlliance(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!hasOfferedAlliance(fromProvince, toProvince, save)) {
      return false;
   }
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return false;
   }
   fromTo.treaty = undefined;
   toFrom.treaty = undefined;
   addAttitudeModifier(
      fromProvince,
      toProvince,
      {
         type: "add",
         name: CancelAlliancePenaltyItem.name,
         value: CancelAlliancePenaltyItem.value,
         duration: CancelAllianceDurationMonths,
      },
      save,
   );
   return true;
}

export function hasOfferedPatronage(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   return (
      getRelation(fromProvince, toProvince, save)?.treaty?.type === "Patron" &&
      getRelation(toProvince, fromProvince, save)?.treaty?.type === "Client"
   );
}

export function canOfferPatronage(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [
         ...timedActionConditions({ action: "DiplomaticTreaty" }, fromProvince, save),
         { name: $t(L.WeAreNotAtWarWithThem), value: getWarsBetween(fromProvince, toProvince, save).length === 0 },
         requireHigherPrestige(fromProvince, toProvince, 5, save),
         requireMinimumAttitude(fromProvince, toProvince, 150, save),
         availableDiplomatCondition(fromProvince, toProvince, save),
         availableDiplomatCondition(toProvince, fromProvince, save),
         isWithinDiplomaticRange(fromProvince, toProvince, save),
         {
            name: $t(L.WeShareALandBorderWithThem),
            value: getProvincesInRange(1, fromProvince, save).has(toProvince),
         },
         {
            name: $t(L.WeDontAlreadyHaveAnActivePatronageWithThem),
            value: !hasOfferedPatronage(fromProvince, toProvince, save),
         },
         {
            name: $t(L.TheyAreNotAClientOfAnotherProvince),
            value: !isClientOfAnyProvince(toProvince, save),
         },
      ],
   });
}

export function tryOfferPatronage(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!canOfferPatronage(fromProvince, toProvince, save)) {
      return false;
   }
   forcePatronage(fromProvince, toProvince, save);
   startTimedAction("DiplomaticTreaty", fromProvince, save);
   return true;
}

export function forcePatronage(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return;
   }
   fromTo.treaty = { type: "Patron", month: save.state.month };
   toFrom.treaty = { type: "Client", month: save.state.month };
   addChronicleEntry(
      {
         type: "DiplomaticTreaty",
         content: $t(L.XBecameAClientOfY, toProvince, fromProvince),
      },
      save,
   );
}

export function cancelPatronage(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!hasOfferedPatronage(fromProvince, toProvince, save)) {
      return false;
   }
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return false;
   }
   fromTo.treaty = undefined;
   toFrom.treaty = undefined;
   addAttitudeModifier(
      fromProvince,
      toProvince,
      {
         type: "add",
         name: CancelPatronagePenaltyItem.name,
         value: CancelPatronagePenaltyItem.value,
         duration: CancelPatronageDurationMonths,
      },
      save,
   );
   return true;
}

export function getTreatyCount(province: Province, save: SaveGame): number {
   let result = 0;
   const relations = getRelations(province, save);
   if (!relations) {
      return 0;
   }
   for (const [_, relation] of relations) {
      if (relation.treaty) {
         ++result;
      }
   }
   return result;
}

export function getTreatyMonthLeft(fromProvince: Province, toProvince: Province, save: SaveGame): number {
   const treaty = getRelation(fromProvince, toProvince, save)?.treaty;
   if (treaty === undefined) {
      return 0;
   }
   const monthLeft = treaty.month + TimedActions.DiplomaticTreaty.duration - save.state.month;
   return clamp(monthLeft, 0, Number.POSITIVE_INFINITY);
}

export const SabotageCost = TimedActions.TreatySabotaged.duration;

export function requireDefensePactAllyOrPatronCount(province: Province, count: number, save: SaveGame): ICondition {
   const relations = getRelations(province, save);
   let result = 0;
   if (relations) {
      for (const [_, relation] of relations) {
         if (
            relation.treaty?.type === "DefensePact" ||
            relation.treaty?.type === "Alliance" ||
            relation.treaty?.type === "Patron"
         ) {
            ++result;
         }
      }
   }
   return {
      name: $t(L.XHasAtLeastYDefensePactsAlliesOrPatrons, getProvinceName(province, save), formatNumber(count)),
      value: result >= count,
   };
}

export function canSabotage(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [
         requireDefensePactAllyOrPatronCount(fromProvince, 2, save),
         requireInfiltration(SabotageCost, { consume: true }, save.state.playerProvince, fromProvince, save),
      ],
   });
}

export function trySabotage(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   if (!canSabotage(fromProvince, toProvince, save)) {
      return false;
   }
   tryUseInfiltration(SabotageCost, save.state.playerProvince, toProvince, save);
   tryUseInfiltration(SabotageCost, save.state.playerProvince, fromProvince, save);
   dissolveTreaty(fromProvince, toProvince, save);
   return true;
}

export function dissolveTreaty(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return;
   }
   fromTo.treaty = undefined;
   toFrom.treaty = undefined;
   startTimedAction("TreatySabotaged", fromProvince, save);
}

export function dissolveAllTreaties(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const relations = getRelations(province, save);
   if (!relations) {
      return;
   }
   relations.forEach((relation, otherProvince) => {
      if (relation.treaty) {
         const fromTo = getRelation(province, otherProvince, save);
         const toFrom = getRelation(otherProvince, province, save);
         if (!fromTo || !toFrom) {
            return;
         }
         fromTo.treaty = undefined;
         toFrom.treaty = undefined;
      }
   });
}
