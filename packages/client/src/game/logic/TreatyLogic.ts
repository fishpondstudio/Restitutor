import { clamp, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown, IGameAction } from "../actions/GameAction";
import { finalizeCondition } from "../actions/GameAction";
import { OfferAllianceAction, OfferDefensePactAction, OfferPatronageAction } from "../actions/TreatyActions";
import { type Province, type Treaty, TreatyNames } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import {
   addAttitudeModifier,
   getAttitudeTowards,
   getRelation,
   getRelations,
   requireInfiltration,
   tryUseInfiltration,
} from "./DiplomacyLogic";
import { getProvinceName, getProvincePrestige } from "./ProvinceLogic";
import { startTimedAction } from "./TimedActionLogic";
import { getWarsBetween } from "./WarLogic";

export const CancelTreatyPenalty: Record<Exclude<Treaty, "Client">, { duration: number; attitude: number }> = {
   DefensePact: { duration: 12 * 2, attitude: -10 },
   Alliance: { duration: 12 * 4, attitude: -20 },
   Patron: { duration: 12 * 10, attitude: -50 },
};

export const OfferTreatyAction: Record<
   Exclude<Treaty, "Client">,
   (fromProvince: Province, toProvince: Province, save: SaveGame) => IGameAction
> = {
   DefensePact: OfferDefensePactAction,
   Alliance: OfferAllianceAction,
   Patron: OfferPatronageAction,
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
      name: $t(
         L.$1PrestigeIsAtLeast$2Of$3,
         getProvinceName(us, save),
         formatPercent(percentage),
         getProvinceName(them, save),
      ),
      value: ourPrestige >= theirPrestige * percentage,
      desc: $t(
         L.OurPrestige$1TheirPrestige$2WeNeedAtLeast$3,
         formatNumber(ourPrestige),
         formatNumber(theirPrestige),
         formatNumber(percentage * theirPrestige),
      ),
   };
}

export function requireMinimumAttitudeV2(from: Province, to: Province, attitude: number, save: SaveGame): ICondition {
   const current = getAttitudeTowards(from, to, save);
   return {
      name: $t(
         L.$1HasAtLeast$2AttitudeTowards$3,
         getProvinceName(from, save),
         formatNumber(attitude),
         getProvinceName(to, save),
      ),
      progress: [current.value, attitude],
      value: current.value >= attitude,
   };
}

export function requireMinimumAttitude(us: Province, them: Province, attitude: number, save: SaveGame): ICondition {
   const current = getAttitudeTowards(them, us, save);
   return {
      name: $t(
         L.$1HasAtLeast$2AttitudeTowards$3,
         getProvinceName(them, save),
         formatNumber(attitude),
         getProvinceName(us, save),
      ),
      progress: [current.value, attitude],
      value: current.value >= attitude,
   };
}

export function requirePeaceBetween(ourProvince: Province, theirProvince: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.$1IsNotAtWarWith$2, getProvinceName(ourProvince, save), getProvinceName(theirProvince, save)),
      value: getWarsBetween(ourProvince, theirProvince, save).length === 0,
   };
}

export function requireNoTreatyBetween(
   treaties: Exclude<Treaty, "Client">[],
   fromProvince: Province,
   toProvince: Province,
   save: SaveGame,
): ICondition {
   return {
      name: $t(
         L.$1DoesntHaveAnActive$2With$3,
         getProvinceName(fromProvince, save),
         treaties.map((t) => TreatyNames[t]()).join(", "),
         getProvinceName(toProvince, save),
      ),
      value: treaties.every((t) => !hasTreatyBetween(t, fromProvince, toProvince, save)),
   };
}

export function hasTreatyBetween(
   treaty: Exclude<Treaty, "Client">,
   fromProvince: Province,
   toProvince: Province,
   save: SaveGame,
): boolean {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return false;
   }
   return fromTo.treaty?.type === treaty || toFrom.treaty?.type === treaty;
}

export function cancelTreaty(
   treaty: Exclude<Treaty, "Client">,
   fromProvince: Province,
   toProvince: Province,
   save: SaveGame,
): boolean {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return false;
   }
   if (!hasTreatyBetween(treaty, fromProvince, toProvince, save)) {
      return false;
   }
   fromTo.treaty = undefined;
   toFrom.treaty = undefined;
   addAttitudeModifier(
      toProvince,
      fromProvince,
      {
         type: "add",
         name: $t(L.Cancelled$1, TreatyNames[treaty]()),
         value: CancelTreatyPenalty[treaty].attitude,
         duration: CancelTreatyPenalty[treaty].duration,
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
      name: $t(L.$1HasAtLeast$2DefensePactsAlliesOrPatrons, getProvinceName(province, save), formatNumber(count)),
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
