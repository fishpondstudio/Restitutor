import {
   clamp,
   clearFlag,
   fib,
   formatNumber,
   hasFlag,
   pointToTile,
   type Tile,
   tileToPoint,
   type ValueOf,
} from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, finalizeCondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { CasusBelli } from "../definitions/CasusBelli";
import { PersonFlags } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import { isTileBorderingProvince } from "../definitions/Tile";
import { getTileName } from "../definitions/TileName";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import {
   getAttitudeTowards,
   getProvincesThatDeterAggressionOf,
   getProvincesThatGuaranteeDefenseOf,
   getRelation,
   getRelations,
} from "./DiplomacyLogic";
import {
   attachModifiers,
   getProvinceStat,
   getProvinceUpgrade,
   getWarPower,
   resetProvinceResource,
   setProvinceStat,
} from "./ProvinceLogic";
import { getTileDefense } from "./TileLogic";
import { endTimedAction, getTimedActionTimeLeft } from "./TimedActionLogic";

export const WarFlag = {
   None: 0,
   Plunder: 1 << 0,
};

export type WarFlag = ValueOf<typeof WarFlag>;

export interface IWar {
   attacker: Province;
   coAttackers: Map<Province, IConditionBreakdown>;
   defender: Province;
   coDefenders: Map<Province, IConditionBreakdown>;
   tiles: Set<Tile>;
   casusBelli: CasusBelli;
   requiredWarScore: number;
   actualWarScore: number;
   log: IWarLog[];
   flag: WarFlag;
}

type WarResult = "Success" | "Repelled" | "Stalled";

export const WarLogFlag = {
   None: 0,
   ForceAttack: 1 << 0,
} as const;

export type WarLogFlag = ValueOf<typeof WarLogFlag>;

export interface IWarLog {
   month: number;
   roll: number;
   successChance: number;
   result: WarResult;
   flag: WarLogFlag;
}

export const WarResultScore = {
   Success: 1,
   Repelled: -1,
   Stalled: 0,
} as const satisfies Record<WarResult, number>;

export const MaxConscription = 50;
export const MinConscription = 5;

function getCoDefenders(attacker: Province, defender: Province, save: SaveGame): Map<Province, IConditionBreakdown> {
   const result = new Map<Province, IConditionBreakdown>();
   const relations = getRelations(defender, save);
   if (!relations) {
      return result;
   }
   relations.forEach((relation, coDefender) => {
      if (coDefender === attacker) {
         return;
      }
      const treaty = relation.treaty?.type;
      switch (treaty) {
         case "Alliance":
            result.set(
               coDefender,
               finalizeCondition({ breakdown: [{ name: $t(L.TheyAreDefendersAlly), value: true }] }),
            );
            break;
         case "DefensePact":
            result.set(
               coDefender,
               finalizeCondition({
                  breakdown: [{ name: $t(L.TheyHaveADefensePactWithTheDefender), value: true }],
               }),
            );
            break;
         case "Client":
            result.set(
               coDefender,
               finalizeCondition({ breakdown: [{ name: $t(L.TheyAreDefendersPatron), value: true }] }),
            );
            break;
         case "Patron":
            result.set(
               coDefender,
               finalizeCondition({ breakdown: [{ name: $t(L.TheyAreDefendersClient), value: true }] }),
            );
            break;
         case undefined:
            break;
         default:
            treaty satisfies never;
            break;
      }
   });
   getProvincesThatGuaranteeDefenseOf(defender, save).forEach((province) => {
      if (province !== attacker && !result.has(province)) {
         result.set(
            province,
            finalizeCondition({ breakdown: [{ name: $t(L.TheyHaveGuaranteedDefendersDefense), value: true }] }),
         );
      }
   });
   getProvincesThatDeterAggressionOf(attacker, save).forEach((province) => {
      if (province !== defender && !result.has(province)) {
         result.set(
            province,
            finalizeCondition({ breakdown: [{ name: $t(L.TheyHaveDeterredAttackersAggression), value: true }] }),
         );
      }
   });
   return result;
}

function getCoAttackers(attacker: Province, defender: Province, save: SaveGame): Map<Province, IConditionBreakdown> {
   const result = new Map<Province, IConditionBreakdown>();
   const relations = getRelations(attacker, save);
   if (!relations) {
      return result;
   }
   const coDefenders = getCoDefenders(attacker, defender, save);
   relations.forEach((relation, coAttacker) => {
      const treaty = relation.treaty?.type;
      switch (treaty) {
         case "Alliance": {
            const attitudeTowardsAttacker = getAttitudeTowards(coAttacker, attacker, save);
            const attackerTowardsDefender = getAttitudeTowards(coAttacker, defender, save);
            result.set(
               coAttacker,
               finalizeCondition({
                  breakdown: [
                     { name: $t(L.TheyAreAttackersAlly), value: true },
                     {
                        name: $t(L.TheyAreNotADefenderOrCoDefender),
                        value: coAttacker !== defender && !coDefenders.has(coAttacker),
                     },
                     {
                        name: $t(L.TheirAttitudeTowardsUsIsHigherThanTheDefenders),
                        value: attitudeTowardsAttacker.value > attackerTowardsDefender.value,
                        desc: $t(
                           L.AttitudeTowardsUsXAttitudeTowardsDefenderY,
                           formatNumber(attitudeTowardsAttacker.value),
                           formatNumber(attackerTowardsDefender.value),
                        ),
                     },
                  ],
               }),
            );
            break;
         }
         case "Patron":
            result.set(
               coAttacker,
               finalizeCondition({
                  breakdown: [
                     { name: $t(L.TheyAreAttackersClient), value: true },
                     {
                        name: $t(L.TheyAreNotADefenderOrCoDefender),
                        value: coAttacker !== defender && !coDefenders.has(coAttacker),
                     },
                  ],
               }),
            );
            break;
         case "DefensePact":
            break;
         case undefined:
            break;
         case "Client":
            throw new Error("Client cannot declare war");
         default:
            treaty satisfies never;
            break;
      }
   });
   return result;
}

export function getWarParticipants(
   attacker: Province,
   defender: Province,
   save: SaveGame,
): { coAttackers: Map<Province, IConditionBreakdown>; coDefenders: Map<Province, IConditionBreakdown> } {
   return {
      coAttackers: getCoAttackers(attacker, defender, save),
      coDefenders: getCoDefenders(attacker, defender, save),
   };
}

export function getWarScore(
   attacker: Province,
   defender: Province,
   tiles: Set<Tile>,
   casusBelli: CasusBelli,
   save: SaveGame,
): IValueBreakdown {
   const result = makeValueBreakdown();
   const defenderState = save.state.provinces[defender];
   if (!defenderState) {
      return result;
   }
   for (const tile of tiles) {
      const data = save.state.tiles.get(tile);
      if (data) {
         if (defenderState.capital === tile) {
            result.multiply.push({
               name: $t(L.OccupyingCapital),
               value: 0.5,
            });
         }
         const defense = getTileDefense(tile, save);
         result.add.push({
            name: getTileName(tile),
            value: defense.value,
         });
         if (casusBelli === "Reconquista" && data.originalProvince === attacker) {
            result.add.push({
               name: $t(L.ReconquistaX, getTileName(tile)),
               value: -0.5 * defense.value,
            });
         }
      }
   }

   const neighborTiles = filterNeighborTiles(tiles, attacker, save);
   const nonNeighborTileCount = tiles.size - neighborTiles.length;

   if (nonNeighborTileCount > 0) {
      result.multiply.push({
         name: $t(L.RemoteTiles),
         desc: $t(L.XTilesNotBorderingOurProvince, formatNumber(nonNeighborTileCount)),
         value: 0.1 * nonNeighborTileCount,
      });
   }

   const warCount = getProvinceStat("attackCount", attacker, save);
   result.multiply.push({
      name: $t(L.WarmongerPenalty),
      value: 1.05 ** warCount - 1,
      desc: $t(L.EachWarStartedRaisesThePenaltyByXCompoundedCurrentlyYWarsStarted, "5%", formatNumber(warCount)),
   });

   if (!AreTilesContiguous(tiles)) {
      result.multiply.push({
         name: $t(L.DiscontiguousTiles),
         value: 0.25,
      });
   }

   if (casusBelli === "ConquestMission" && tiles.size > 1) {
      result.multiply.push({
         name: $t(L.ConquestMission),
         value: -0.1,
      });
   }

   if (casusBelli === "ReligiousWar" && defenderState.religion !== "Christianity") {
      result.multiply.push({
         name: $t(L.ReligiousWar),
         value: -0.1,
      });
   }

   return finalizeBreakdown(result);
}

export const WarOneTimeDiplomaticPoint = 50;
const MinimumTruceMonths = 12;

export function getTruceMonthsLeft(fromProvince: Province, toProvince: Province, save: SaveGame): number {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return 0;
   }
   const truceUntil = Math.max(fromTo.truceUntil, toFrom.truceUntil);
   return clamp(truceUntil - save.state.month, 0, Number.POSITIVE_INFINITY);
}

export function getTruceLength(war: IWar): number {
   return clamp(war.log.length, MinimumTruceMonths, Number.POSITIVE_INFINITY);
}

export const MonthlyStabilityCostWithCB = 0.25;
export const MonthlyStabilityCostWithoutCB = 0.5;

export const MonthlyExtraArmyMaintenancePct = 0.5;

export function getWarMonthlyMilitaryPoint(war: IWar): number {
   return calculateWarMonthlyMilitaryPoint(war.log.length + 1, war.tiles.size);
}

export function calculateWarMonthlyMilitaryPoint(lengthOfWar: number, tileCount: number): number {
   return Math.ceil(lengthOfWar / 12) * tileCount;
}

function filterNeighborTiles(tiles: Iterable<Tile>, province: Province, save: SaveGame): Tile[] {
   const result: Tile[] = [];
   for (const tile of tiles) {
      if (isTileBorderingProvince(tile, province, save)) {
         result.push(tile);
      }
   }
   return result;
}

function AreTilesContiguous(tiles: Set<Tile>): boolean {
   if (tiles.size === 0) {
      return true;
   }

   const [startTile] = tiles;
   const visited = new Set<Tile>();
   const queue: Tile[] = [startTile];

   while (queue.length > 0) {
      const current = queue.pop();
      if (current && !visited.has(current)) {
         visited.add(current);
         for (let dir = 0; dir < 6; dir++) {
            const neighbor = pointToTile(MapGrid.getNeighbor(tileToPoint(current), dir));
            if (tiles.has(neighbor) && !visited.has(neighbor)) {
               queue.push(neighbor);
            }
         }
      }
   }

   return visited.size === tiles.size;
}

export function getCurrentWars(province: Province, save: SaveGame): IWar[] {
   return save.state.wars.filter(
      (war) =>
         war.attacker === province ||
         war.defender === province ||
         war.coAttackers.has(province) ||
         war.coDefenders.has(province),
   );
}

export function getWarTiles(save: SaveGame): Set<Tile> {
   const result = new Set<Tile>();
   for (const war of save.state.wars) {
      for (const tile of war.tiles) {
         result.add(tile);
      }
   }
   return result;
}

export function getWarForTile(tile: Tile, save: SaveGame): IWar | undefined {
   for (const war of save.state.wars) {
      if (war.tiles.has(tile)) {
         return war;
      }
   }
   return undefined;
}

export function getWarsBetween(province1: Province, province2: Province, save: SaveGame): IWar[] {
   return save.state.wars.filter(
      (war) =>
         (isAttacking(war, province1) && isDefending(war, province2)) ||
         (isAttacking(war, province2) && isDefending(war, province1)),
   );
}

export function isAttacking(war: IWar, province: Province): boolean {
   return war.attacker === province || war.coAttackers.has(province);
}

export function isDefending(war: IWar, province: Province): boolean {
   return war.defender === province || war.coDefenders.has(province);
}

export function getWarSuccessChance(
   attacker: Province,
   coAttackers: Map<Province, IConditionBreakdown>,
   defender: Province,
   coDefenders: Map<Province, IConditionBreakdown>,
   save: SaveGame,
): number {
   const attackerPowers =
      getWarPower(attacker, save).value +
      Array.from(coAttackers).reduce(
         (acc, [province, condition]) => acc + (condition.value ? getWarPower(province, save).value : 0),
         0,
      );
   const defenderPowers =
      getWarPower(defender, save).value +
      Array.from(coDefenders).reduce(
         (acc, [province, condition]) => acc + (condition.value ? getWarPower(province, save).value : 0),
         0,
      );
   return attackerPowers / (attackerPowers + defenderPowers);
}

export function isWarStalled(war: IWar, save: SaveGame): boolean {
   if (war.log.length === 0) {
      return false;
   }
   return war.log[0].result === "Stalled";
}

export const WhitePeaceCostPerTile = 20;

export function getGeneralMonthlyCost(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({ reverse: true });
   const totalUpgrade = getProvinceUpgrade(province, save);
   result.add.push({
      name: $t(L.FromTotalTileUpgrades),
      value: 0.1 * totalUpgrade,
      desc: $t(L.XGoldPerUpgrade, "0.1"),
   });
   return finalizeBreakdown(result);
}

export function getInfantryUnitWarPower(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({
      name: $t(L.BasePower),
      value: 1,
   });
   const infantrySkill = getProvinceStat("infantrySkill", province, save);
   if (infantrySkill > 0) {
      result.add.push({
         name: $t(L.GeneralInfantrySkill),
         value: infantrySkill,
      });
   }
   attachModifiers("InfantryUnitPower", result, province, save);
   return finalizeBreakdown(result);
}

export function getRangedUnitWarPower(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({
      name: $t(L.BasePower),
      value: 2,
   });
   const rangedSkill = getProvinceStat("rangedSkill", province, save);
   if (rangedSkill > 0) {
      result.add.push({
         name: $t(L.GeneralRangedSkill),
         value: rangedSkill,
      });
   }
   attachModifiers("RangedUnitPower", result, province, save);
   return finalizeBreakdown(result);
}

export function getCavalryUnitWarPower(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({
      name: $t(L.BasePower),
      value: 3,
   });
   const cavalrySkill = getProvinceStat("cavalrySkill", province, save);
   if (cavalrySkill > 0) {
      result.add.push({
         name: $t(L.GeneralCavalrySkill),
         value: cavalrySkill,
      });
   }
   attachModifiers("CavalryUnitPower", result, province, save);
   return finalizeBreakdown(result);
}

export type GeneralType = "Recruit" | "Governor";

export function getCurrentGeneral(province: Province, save: SaveGame): GeneralType | undefined {
   const state = save.state.provinces[province];
   if (!state) {
      return undefined;
   }
   if (hasFlag(state.governor.male.flag, PersonFlags.IsGeneral)) {
      return "Governor";
   }
   if (getTimedActionTimeLeft("RecruitAGeneral", province, save) > 0) {
      return "Recruit";
   }
   return undefined;
}

export function resetGeneralUpgrades(province: Province, save: SaveGame): void {
   resetProvinceResource("generalSkillPoint", province, save);
   setProvinceStat("infantrySkill", 0, province, save);
   setProvinceStat("rangedSkill", 0, province, save);
   setProvinceStat("cavalrySkill", 0, province, save);
}

export function hasGeneralCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.CurrentlyHasAGeneral),
      value: getCurrentGeneral(province, save) !== undefined,
   };
}

export function dismissGeneral(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const governor = state.governor.male;
   governor.flag = clearFlag(governor.flag, PersonFlags.IsGeneral);
   endTimedAction("RecruitAGeneral", province, save);
}

export function getGeneralSkillUpgradeCost(level: number): number {
   return fib(level);
}

export function getWarCoalitions(provinces: Province[], save: SaveGame): IWar[] {
   return save.state.wars.filter((war) => {
      return (
         provinces.every((province) => war.coAttackers.has(province)) ||
         provinces.every((province) => war.coDefenders.has(province))
      );
   });
}

export function getWarPlunder(war: IWar, save: SaveGame): { tiles: IValueBreakdown; warScore: IValueBreakdown } {
   const tilesResult = makeValueBreakdown();
   const warScoreResult = makeValueBreakdown();
   for (const tile of war.tiles) {
      const data = save.state.tiles.get(tile);
      if (data) {
         if (data.infrastructure > 1) {
            tilesResult.add.push({
               name: getTileName(tile),
               desc: $t(L.Infrastructure),
               value: -1,
            });
         }
         if (data.production > 1) {
            tilesResult.add.push({
               name: getTileName(tile),
               desc: $t(L.Production),
               value: -1,
            });
         }
         if (data.population > 1) {
            tilesResult.add.push({
               name: getTileName(tile),
               desc: $t(L.Population),
               value: -1,
            });
         }
      }
   }
   finalizeBreakdown(tilesResult);
   warScoreResult.add.push({
      name: $t(L.WarScore),
      value: tilesResult.value / 2,
   });
   return {
      tiles: tilesResult,
      warScore: finalizeBreakdown(warScoreResult),
   };
}
