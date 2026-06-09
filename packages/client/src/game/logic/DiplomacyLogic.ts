import { forEach, formatNumber, mapSafePush } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import {
   finalizeBreakdown,
   finalizeCondition,
   type ICondition,
   type IConditionBreakdown,
   type IValueBreakdown,
   makeValueBreakdown,
} from "../actions/GameAction";
import type { IFullFamily } from "../definitions/Family";
import type { IModifier } from "../definitions/Modifier";
import type { IRelation, Province, ProvinceResourceCosts } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { getFamilyMemberFrom } from "./GovernorLogic";
import { attachModifiers } from "./ModifierLogic";
import { getProvinceName } from "./ProvinceLogic";

export const MaxImprovedRelations = 50;
export const RivalAttitudeModifier = -20;
export const RivalAttitudeDuration = 5 * 12;

export function getAttitudeTowards(fromProvince: Province, toProvince: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   const fromProvinceData = save.state.provinces[fromProvince];
   const toProvinceData = save.state.provinces[toProvince];
   if (!fromProvinceData || !toProvinceData) {
      return breakdown;
   }
   if (fromProvinceData.culture === toProvinceData.culture) {
      breakdown.add.push({ name: $t(L.SameCulture), value: 10 });
   } else {
      breakdown.add.push({ name: $t(L.DifferentCulture), value: -10 });
   }
   if (fromProvinceData.religion === toProvinceData.religion) {
      breakdown.add.push({ name: $t(L.SameReligion), value: 10 });
   } else {
      breakdown.add.push({ name: $t(L.DifferentReligions), value: -10 });
   }
   const sharedRivals = fromProvinceData.rivals.filter((r) => r !== null && toProvinceData.rivals.includes(r));
   if (sharedRivals.length > 0) {
      breakdown.add.push({
         name: $t(L.XSharedRivals, formatNumber(sharedRivals.length)),
         value: sharedRivals.length * 10,
      });
   }

   getMarriageAlliance(fromProvince, toProvince, save).forEach((family) => {
      breakdown.add.push({
         name: $t(L.MarriageAlliance),
         desc: $t(
            L.XYAndZP,
            family.male.name.join(" "),
            getProvinceName(family.male.province, save),
            family.female.name.join(" "),
            getProvinceName(family.female.province, save),
         ),
         value: 50,
      });
   });

   const improveRelations = getRelation(toProvince, fromProvince, save)?.improveRelations.value ?? 0;
   if (improveRelations > 0) {
      breakdown.add.push({
         name: $t(L.ImprovedRelations),
         value: improveRelations,
      });
   }

   getAttitudeModifier(fromProvince, toProvince, save).forEach((modifier) => {
      breakdown[modifier.type].push({
         name: modifier.name,
         desc: $t(L.XMonthsLeft, formatNumber(modifier.duration)),
         value: modifier.value,
      });
   });
   return finalizeBreakdown(breakdown);
}

function getAttitudeModifier(fromProvince: Province, toProvince: Province, save: SaveGame): IModifier[] {
   return getRelation(fromProvince, toProvince, save)?.attitudeModifier ?? [];
}

export function getMarriageAlliance(province1: Province, province2: Province, save: SaveGame): IFullFamily[] {
   const state1 = save.state.provinces[province1];
   const state2 = save.state.provinces[province2];
   if (!state1 || !state2) {
      return [];
   }
   return [
      ...getFamilyMemberFrom(state1.governor, province2, save),
      ...getFamilyMemberFrom(state2.governor, province1, save),
   ];
}

export function addAttitudeModifier(
   fromProvince: Province,
   toProvince: Province,
   modifier: IModifier,
   save: SaveGame,
): void {
   const relation = getRelation(fromProvince, toProvince, save);
   if (relation) {
      relation.attitudeModifier.push(modifier);
   }
}

export const HumiliateRivalCasusBelliMonths = 10 * 12;

export function getRelations(province: Province, save: SaveGame): Map<Province, IRelation> | undefined {
   const relations = save.state.provinces[province]?._relations;
   if (!relations) {
      return undefined;
   }
   for (const [otherProvince] of [...relations]) {
      if (otherProvince === province || !save.state.provinces[otherProvince]) {
         relations.delete(otherProvince);
      }
   }
   return relations;
}

export function getRelation(fromProvince: Province, toProvince: Province, save: SaveGame): IRelation | undefined {
   const fromState = save.state.provinces[fromProvince];
   const toState = save.state.provinces[toProvince];
   if (!fromState) {
      if (toState) {
         toState._relations.delete(fromProvince);
      }
      return undefined;
   }
   if (!toState) {
      if (fromState) {
         fromState._relations.delete(toProvince);
      }
      return undefined;
   }
   let relations = fromState._relations.get(toProvince);
   if (!relations) {
      relations = {
         guaranteeDefense: undefined,
         deterAggression: undefined,
         revealElectionBacking: undefined,
         improveRelations: { active: false, value: 0 },
         infiltrate: { active: false, value: 0 },
         truceUntil: 0,
         casusBelli: new Map(),
         attitudeModifier: [],
         trade: undefined,
      };
      fromState._relations.set(toProvince, relations);
   }
   return relations;
}

export function getCurrentRelations(province: Province, save: SaveGame): Set<Province> {
   const result = new Set<Province>();
   const relations = getRelations(province, save);
   if (!relations) {
      return result;
   }
   for (const [_province, relation] of relations) {
      if (relation.treaty) {
         result.add(_province);
         continue;
      }
      if (relation.improveRelations.active) {
         result.add(_province);
         continue;
      }
      if (relation.infiltrate.active) {
         result.add(_province);
      }
   }
   return result;
}

export function getDiplomats(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.BaseValue), value: 2 });
   attachModifiers("Diplomat", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function availableDiplomatCondition(fromProvince: Province, toProvince: Province, save: SaveGame): ICondition {
   const currentRelations = getCurrentRelations(fromProvince, save);
   return {
      name: $t(L.XHasAnAvailableDiplomat, getProvinceName(fromProvince, save)),
      value: currentRelations.has(toProvince) || currentRelations.size < getDiplomats(fromProvince, save).value,
   };
}

export function canImproveRelations(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [availableDiplomatCondition(fromProvince, toProvince, save)],
   });
}

export function isImprovingRelations(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   return getRelation(fromProvince, toProvince, save)?.improveRelations.active ?? false;
}

export function improveRelations(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const relation = getRelation(fromProvince, toProvince, save);
   if (relation) {
      relation.improveRelations.active = true;
   }
}

export function isClientOfAnyProvince(province: Province, save: SaveGame): boolean {
   const relations = getRelations(province, save);
   if (!relations) {
      return false;
   }
   return Array.from(relations).some(([_, relation]) => relation.treaty?.type === "Client");
}

export function cancelImproveRelations(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const relation = getRelation(fromProvince, toProvince, save);
   if (relation) {
      relation.improveRelations.active = false;
   }
}

export function isInfiltrating(fromProvince: Province, toProvince: Province, save: SaveGame): boolean {
   return getRelation(fromProvince, toProvince, save)?.infiltrate.active ?? false;
}

export function infiltrate(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const relation = getRelation(fromProvince, toProvince, save);
   if (relation) {
      relation.infiltrate.active = true;
   }
}

export function canInfiltrate(fromProvince: Province, toProvince: Province, save: SaveGame): IConditionBreakdown {
   return finalizeCondition({
      breakdown: [availableDiplomatCondition(fromProvince, toProvince, save)],
   });
}

export function cancelInfiltration(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const relation = getRelation(fromProvince, toProvince, save);
   if (relation) {
      relation.infiltrate.active = false;
   }
}

export const FabricateCasusBelliCost = 50;

export function tryUseInfiltration(
   cost: number,
   fromProvince: Province,
   toProvince: Province,
   save: SaveGame,
): boolean {
   const infiltrate = getRelation(fromProvince, toProvince, save)?.infiltrate;
   if (infiltrate && infiltrate.value >= cost) {
      infiltrate.value -= cost;
      return true;
   }
   return false;
}

export function requireInfiltration(
   value: number,
   { consume = true }: { consume: boolean },
   fromProvince: Province,
   toProvince: Province,
   save: SaveGame,
): ICondition {
   const infiltration = getRelation(fromProvince, toProvince, save)?.infiltrate?.value ?? 0;
   return {
      name: $t(L.AtLeastXInfiltrationToY, formatNumber(value), getProvinceName(toProvince, save)),
      desc: consume
         ? $t(L.XInfiltrationWillBeConsumedCurrentInfiltrationY, formatNumber(value), formatNumber(infiltration))
         : $t(L.NoInfiltrationWillBeConsumedCurrentInfiltrationX, formatNumber(infiltration)),
      value: infiltration >= value,
   };
}

export const UndermineArmyCost = 50;
export const SubvertGarrisonCost = 50;
export const InciteUnrestCost = 50;
export const RevealElectionSupportCost = 10;

export function getDiplomaticAnnexationCost(province: Province, save: SaveGame): ProvinceResourceCosts {
   let administrative = 0;
   let diplomatic = 0;
   let military = 0;
   let gold = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         administrative += data.infrastructure * 50;
         diplomatic += data.production * 50;
         military += data.population * 50;
         let upgradeCost = 0;
         for (let i = 0; i < data.upgradeCount; i++) {
            upgradeCost += 50 * (1.25 ** i - 1);
         }
         administrative += upgradeCost / 3;
         diplomatic += upgradeCost / 3;
         military += upgradeCost / 3;
      }
   }
   gold = (administrative + diplomatic + military) * 5;
   return {
      gold,
      administrative,
      diplomatic,
      military,
   };
}

export function getDiplomaticDistance(ourProvince: Province, theirProvince: Province, save: SaveGame): number {
   const theirCapital = save.state.provinces[theirProvince]?.capital;
   if (!theirCapital) {
      return 0;
   }
   let distance = Number.POSITIVE_INFINITY;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === ourProvince) {
         distance = Math.min(distance, MapGrid.distanceTile(tile, theirCapital));
      }
      // Exit early as the minimum distance is 1
      if (distance === 1) {
         break;
      }
   }
   return distance;
}

export function getDiplomaticRange(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.BaseValue), value: 10 });
   attachModifiers("DiplomaticRange", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function isWithinDiplomaticRange(ourProvince: Province, theirProvince: Province, save: SaveGame): ICondition {
   const diplomaticDistance = getDiplomaticDistance(ourProvince, theirProvince, save);
   const diplomaticRange = getDiplomaticRange(ourProvince, save);
   return {
      name: $t(L.XIsWithinOurDiplomaticRange, getProvinceName(theirProvince, save)),
      value: diplomaticDistance <= diplomaticRange.value,
      desc: $t(L.DiplomaticDistanceXRangeY, formatNumber(diplomaticDistance), formatNumber(diplomaticRange.value)),
   };
}

export function getProvincesWithinDiplomaticRange(province: Province, save: SaveGame): Province[] {
   const result: Province[] = [];
   forEach(save.state.provinces, (otherProvince) => {
      if (otherProvince === province) return;
      const diplomaticDistance = getDiplomaticDistance(province, otherProvince, save);
      const diplomaticRange = getDiplomaticRange(province, save);
      if (diplomaticDistance <= diplomaticRange.value) {
         result.push(otherProvince);
      }
   });
   return result;
}

export function getProvincesThatGuaranteeDefenseOf(province: Province, save: SaveGame): Province[] {
   const result: Province[] = [];
   forEach(save.state.provinces, (otherProvince) => {
      if (otherProvince !== province && getRelation(otherProvince, province, save)?.guaranteeDefense !== undefined) {
         result.push(otherProvince);
      }
   });
   return result;
}

export function getProvincesThatDeterAggressionOf(province: Province, save: SaveGame): Province[] {
   const result: Province[] = [];
   forEach(save.state.provinces, (otherProvince, data) => {
      if (otherProvince !== province && getRelation(otherProvince, province, save)?.deterAggression !== undefined) {
         result.push(otherProvince);
      }
   });
   return result;
}

export function getRevealedConsulVotes(province: Province, save: SaveGame): Map<number, Province[]> {
   const result = new Map<number, Province[]>();
   const relations = getRelations(province, save);
   if (!relations) {
      return result;
   }
   for (const [otherProvince, relation] of relations) {
      if (relation.revealElectionBacking !== undefined) {
         const votes = save.state.senate.votes.get(otherProvince);
         if (votes) {
            votes.forEach((vote) => {
               mapSafePush(result, vote, otherProvince);
            });
         }
      }
   }
   return result;
}
