import {
   clamp,
   formatNumber,
   pointToTile,
   type Tile,
   tileToPoint,
   type ValueOf,
} from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ICondition, IConditionBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, finalizeCondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { CasusBelli } from "../definitions/CasusBelli";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { getBorderingProvinces } from "../definitions/Tile";
import { getTileName } from "../definitions/TileName";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { type ArmyUnitPowers, ArmyUnits, getArmyUnitPowers, getWarPower, type IWarPowerBreakdown } from "./ArmyLogic";
import {
   getAttitudeTowards,
   getDiplomaticDistance,
   getProvincesThatDeterAggressionOf,
   getProvincesThatGuaranteeDefenseOf,
   getRelation,
   getRelations,
} from "./DiplomacyLogic";
import { attachModifiers } from "./ModifierLogic";
import {
   getProvinceName,
   getProvincePrestige,
   getProvinceStat,
   isLandlocked,
   isTileConnectedBySea,
} from "./ProvinceLogic";
import { getTileDefense, getTileTerrain } from "./TileLogic";

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

export type WarResult = keyof typeof WarResult;

export const WarLogFlag = {
   None: 0,
   ForceAttack: 1 << 0,
} as const;

export type WarLogFlag = ValueOf<typeof WarLogFlag>;

export interface IWarLog {
   month: number;
   rolls: number[];
   successChance: number;
   result: WarResult;
   flag: WarLogFlag;
}

export const WarResult = {
   Success: { name: () => $t(L.Success), score: 1, color: 0x288a51 },
   Repelled: { name: () => $t(L.Repelled), score: -1, color: 0xc0392b },
   Stalled: { name: () => $t(L.Stalled), score: 0, color: 0x34495e },
} as const;

export const BreachOfThePeaceDurationYear = 5;

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
            result.set(coDefender, finalizeCondition([{ name: $t(L.TheyAreDefendersAlly), value: true }]));
            break;
         case "DefensePact":
            result.set(
               coDefender,
               finalizeCondition([{ name: $t(L.TheyHaveADefensePactWithTheDefender), value: true }]),
            );
            break;
         case "Client":
            result.set(coDefender, finalizeCondition([{ name: $t(L.TheyAreDefendersPatron), value: true }]));
            break;
         case "Patron":
            result.set(coDefender, finalizeCondition([{ name: $t(L.TheyAreDefendersClient), value: true }]));
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
         result.set(province, finalizeCondition([{ name: $t(L.TheyHaveGuaranteedDefendersDefense), value: true }]));
      }
   });
   getProvincesThatDeterAggressionOf(attacker, save).forEach((province) => {
      if (province !== defender && !result.has(province)) {
         result.set(province, finalizeCondition([{ name: $t(L.TheyHaveDeterredAttackersAggression), value: true }]));
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
               finalizeCondition([
                  { name: $t(L.TheyAreAttackersAlly), value: true },
                  {
                     name: $t(L.TheyAreNotADefenderOrCoDefender),
                     value: coAttacker !== defender && !coDefenders.has(coAttacker),
                  },
                  {
                     name: $t(L.TheirAttitudeTowardsUsIsHigherThanTheDefenders),
                     value: attitudeTowardsAttacker.value > attackerTowardsDefender.value,
                     desc: $t(
                        L.AttitudeTowardsUs$1AttitudeTowardsDefender$2,
                        formatNumber(attitudeTowardsAttacker.value),
                        formatNumber(attackerTowardsDefender.value),
                     ),
                  },
               ]),
            );
            break;
         }
         case "Patron":
            result.set(
               coAttacker,
               finalizeCondition([
                  { name: $t(L.TheyAreAttackersClient), value: true },
                  {
                     name: $t(L.TheyAreNotADefenderOrCoDefender),
                     value: coAttacker !== defender && !coDefenders.has(coAttacker),
                  },
               ]),
            );
            break;
         case "DefensePact":
            break;
         case undefined:
            break;
         case "Client":
            break;
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
   const attackerState = save.state.provinces[attacker];
   if (!attackerState) {
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
            name: getTileName(tile, save),
            value: defense.value,
         });
         if (hasProvinceUpgrade("MaritimeAmbition", attacker, save) && isTileConnectedBySea(tile, attacker, save)) {
            result.add.push({
               name: `${ProvinceUpgrades.MaritimeAmbition.name()}: ${getTileName(tile, save)}`,
               value: -0.2 * defense.value,
            });
         }
         const terrain = getTileTerrain(tile);
         if (
            hasProvinceUpgrade("MastersOfThePasses", attacker, save) &&
            (terrain === "Hill" || terrain === "Mountain")
         ) {
            result.add.push({
               name: `${ProvinceUpgrades.MastersOfThePasses.name()}: ${getTileName(tile, save)}`,
               value: -0.2 * defense.value,
            });
         }
         if (casusBelli === "Reconquista" && data.originalProvince === attacker) {
            result.add.push({
               name: $t(L.Reconquista$1, getTileName(tile, save)),
               value: -0.2 * defense.value,
            });
         }
         if (data.coreProvinces.has(attacker)) {
            result.add.push({
               name: $t(L.$1IsOurCoreTile, getTileName(tile, save)),
               value: -0.2 * defense.value,
            });
         }
      }
   }

   const neighborTiles = filterNeighborTiles(tiles, attacker, save);
   const nonNeighborTileCount = tiles.size - neighborTiles.length;

   if (nonNeighborTileCount > 0) {
      result.multiply.push({
         name: $t(L.RemoteTiles),
         desc: $t(L.$1TilesNotBorderingOurProvince, formatNumber(nonNeighborTileCount)),
         value: 0.1 * nonNeighborTileCount,
      });
   }

   const warCount = getProvinceStat("attackCount", attacker, save);
   result.multiply.push({
      name: $t(L.WarmongerPenalty),
      value: 0.01 * warCount,
      desc: $t(L.EachWarStartedAdds$1OfTheBaseCost$2, "1%", formatNumber(warCount)),
   });

   if (!AreTilesContiguous(tiles)) {
      result.multiply.push({
         name: $t(L.DiscontiguousTiles),
         value: 0.25,
      });
   }

   if (casusBelli === "ConquestMission" && tiles.size > 1) {
      result.multiply.push({
         name: CasusBelli.ConquestMission.name(),
         value: -0.1,
      });
   }

   if (casusBelli === "ReligiousWar" && defenderState.religion !== attackerState.religion) {
      result.multiply.push({
         name: CasusBelli.ReligiousWar.name(),
         value: -0.1,
      });
   }

   if (
      casusBelli === "BreachOfThePeace" &&
      getProvincePrestige(attacker, save).value > getProvincePrestige(defender, save).value
   ) {
      result.multiply.push({
         name: CasusBelli.BreachOfThePeace.name(),
         value: -0.1,
      });
   }

   if (
      hasProvinceUpgrade("MediterraneanAmbition", attacker, save) &&
      getDiplomaticDistance(attacker, defender, save) <= 10
   ) {
      result.multiply.push({ name: ProvinceUpgrades.MediterraneanAmbition.name(), value: -0.2 });
   }
   if (hasProvinceUpgrade("InlandAmbition", attacker, save) && isLandlocked(defender, save)) {
      result.multiply.push({ name: ProvinceUpgrades.InlandAmbition.name(), value: -0.2 });
   }

   attachModifiers("WarScore", result, attacker, save);

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

export function nullifyTruce(fromProvince: Province, toProvince: Province, save: SaveGame): void {
   const fromTo = getRelation(fromProvince, toProvince, save);
   const toFrom = getRelation(toProvince, fromProvince, save);
   if (!fromTo || !toFrom) {
      return;
   }
   fromTo.truceUntil = 0;
   toFrom.truceUntil = 0;
}

export function getTruceDuration(war: IWar, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({
      name: $t(L.MinimumTruceDuration),
      value: MinimumTruceMonths,
   });
   const extraTruceMonths = war.log.length - MinimumTruceMonths;
   if (extraTruceMonths > 0) {
      result.add.push({
         name: $t(L.FromDurationOfTheWar),
         value: extraTruceMonths,
      });
   }
   attachModifiers("TruceDuration", result, war.attacker, save);
   return finalizeBreakdown(result, Math.ceil);
}

const MonthlyStabilityCostWithCB = 0.1;
const MonthlyStabilityCostWithoutCB = 0.2;
export const MonthlyExtraArmyMaintenancePct = 0.5;

export function getWarMonthlyMilitaryPoint(war: IWar): number {
   return calculateWarMonthlyMilitaryPoint(war.log.length + 1, war.tiles.size);
}

export function calculateWarMonthlyMilitaryPoint(lengthOfWar: number, tileCount: number): number {
   return Math.ceil(lengthOfWar / 12) * tileCount;
}

export function calculateWarMonthlyStability(lengthOfWar: number, casusBelli: CasusBelli): number {
   const cost = casusBelli === "None" ? MonthlyStabilityCostWithoutCB : MonthlyStabilityCostWithCB;
   return Math.ceil(lengthOfWar / 12) * cost;
}

export function calculateWarTotalStability(lengthOfWar: number, casusBelli: CasusBelli): number {
   let result = 0;
   for (let i = 1; i <= lengthOfWar; i++) {
      result += calculateWarMonthlyStability(i, casusBelli);
   }
   return result;
}

export function calculateWarLengthForStability(stability: number, casusBelli: CasusBelli): number {
   let warLength = 1;
   let currentStability = 0;
   while (currentStability < stability) {
      currentStability += calculateWarMonthlyStability(warLength, casusBelli);
      warLength++;
   }
   return warLength;
}

function filterNeighborTiles(tiles: Iterable<Tile>, province: Province, save: SaveGame): Tile[] {
   const result: Tile[] = [];
   for (const tile of tiles) {
      if (getBorderingProvinces(tile, save).includes(province)) {
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

export function getWarEstimatedTime(warScore: number, successChance: number): number {
   const p = successChance;
   const eSuccess = p ** 2 * (3 - 2 * p);
   const eFail = 1 - eSuccess;
   return Math.ceil(warScore / (eSuccess - eFail));
}

export function isWarStalled(war: IWar, save: SaveGame): boolean {
   if (war.log.length === 0) {
      return false;
   }
   return war.log[0].result === "Stalled";
}

export const WhitePeaceCostPerTile = 20;

function getCoalitionUnitPowers(
   leader: Province,
   followers: Map<Province, IConditionBreakdown>,
   save: SaveGame,
): ArmyUnitPowers {
   const powers = getArmyUnitPowers(leader, save);
   for (const [province, condition] of followers) {
      if (!condition.value || province === leader) {
         continue;
      }
      const contribution = getArmyUnitPowers(province, save);
      for (const unit of ArmyUnits) {
         powers[unit] += contribution[unit];
      }
   }
   return powers;
}

export interface IWarPowerSide {
   powers: Map<Province, IWarPowerBreakdown>;
   value: number;
   enemy: ArmyUnitPowers;
}

export interface IWarPowerComparison {
   attack: IWarPowerSide;
   defense: IWarPowerSide;
   successChance: number;
}

export function getWarPowerComparison(
   attacker: Province,
   coAttackers: Map<Province, IConditionBreakdown>,
   defender: Province,
   coDefenders: Map<Province, IConditionBreakdown>,
   save: SaveGame,
): IWarPowerComparison {
   const attackerUnits = getCoalitionUnitPowers(attacker, coAttackers, save);
   const defenderUnits = getCoalitionUnitPowers(defender, coDefenders, save);
   const makeSide = (leader: Province, followers: Map<Province, IConditionBreakdown>, enemy: ArmyUnitPowers) => {
      const powers = new Map<Province, IWarPowerBreakdown>();
      powers.set(leader, getWarPower(leader, save, enemy));
      for (const [province, condition] of followers) {
         if (condition.value && province !== leader) {
            powers.set(province, getWarPower(province, save, enemy));
         }
      }
      const value = Array.from(powers.values()).reduce((total, power) => total + power.total.value, 0);
      return { powers, value, enemy };
   };
   const attack = makeSide(attacker, coAttackers, defenderUnits);
   const defense = makeSide(defender, coDefenders, attackerUnits);
   const total = attack.value + defense.value;
   return { attack, defense, successChance: total > 0 ? attack.value / total : 0.5 };
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
               name: getTileName(tile, save),
               desc: $t(L.Infrastructure),
               value: -1,
            });
         }
         if (data.production > 1) {
            tilesResult.add.push({
               name: getTileName(tile, save),
               desc: $t(L.Production),
               value: -1,
            });
         }
         if (data.population > 1) {
            tilesResult.add.push({
               name: getTileName(tile, save),
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

export function isWarOngoing(war: IWar, save: SaveGame): boolean {
   return save.state.wars.includes(war) && war.actualWarScore < war.requiredWarScore;
}

export function warIsOngoingCondition(war: IWar, save: SaveGame): ICondition {
   return {
      name: $t(L.$1$2WarIsOngoing, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
      value: isWarOngoing(war, save),
   };
}

export function isEligibleForMandate(war: IWar, save: SaveGame): boolean {
   for (const [tile, tileData] of save.state.tiles) {
      if (tileData.province === war.defender && !war.tiles.has(tile)) {
         return false;
      }
   }
   return true;
}
