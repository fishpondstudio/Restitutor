import {
   clamp,
   entriesOf,
   filterInPlace,
   forEach,
   hasFlag,
   keysOf,
   randOne,
   shuffle,
   type Tile,
} from "@project/shared/src/utils/Helper";
import { G, GameFlags } from "../../utils/Global";
import { RecruitGeneralAction, UpgradeGeneralSkillAction } from "../actions/ArmyGeneralAction";
import { ConstructBuildingAction } from "../actions/BuildingActions";
import { ConvertToChristianityAction } from "../actions/ConvertToChristianityAction";
import { CrackDownAction } from "../actions/CrackDownAction";
import { DeclareWarAction } from "../actions/DeclareWarAction";
import { canDoAction, type IGameAction, printAction } from "../actions/GameAction";
import { MakeCoreAction } from "../actions/MakeCoreAction";
import { NegotiateWhitePeaceAction } from "../actions/NegotiateWhitePeaceAction";
import { ResearchTechAction } from "../actions/ResearchTechAction";
import { SignPeaceTreatyAction } from "../actions/SignPeaceTreatyAction";
import { LookForLocalSpouseAction } from "../actions/SpouseActions";
import { TradeWithAction } from "../actions/TradeActions";
import {
   UpgradeInfrastructureAction,
   UpgradePopulationAction,
   UpgradeProductionAction,
} from "../actions/UpgradeActions";
import { getAdvisorInitialCost, getAdvisorMonthlyCost } from "../definitions/Advisor";
import { type Building, Buildings } from "../definitions/Building";
import type { IFamily } from "../definitions/Family";
import {
   type AIAction,
   type BlackboardResource,
   DefaultConscription,
   type Province,
   type ProvinceResource,
   type ProvinceResourceCosts,
   Provinces,
} from "../definitions/Province";
import { SocialClasses } from "../definitions/SocialClass";
import type { SaveGame } from "../GameState";
import { getDiplomats, getRelation, HumiliateRivalCasusBelliMonths } from "./DiplomacyLogic";
import { optimizeProduction } from "./ProductionLogic";
import {
   getProvinceGoverningCapacity,
   getProvinceGoverningCost,
   getProvinceIncome,
   getProvincePrestige,
   getProvinceProductionCapacity,
   getProvinceResource,
   getProvinceStat,
   getProvincesByDistance,
   getProvincesInRange,
   getProvinceUsedProductionCapacity,
   hasEnoughProvinceResources,
   pledgeProvinceConsulVotes,
   setProvinceStat,
   trySpendProvinceResources,
} from "./ProvinceLogic";
import { getCheapestLockedTech } from "./TechLogic";
import { getBuildingSlot, getTileUnrest } from "./TileLogic";
import {
   getTimedActionCooldownLeft,
   getTimedActionTimeLeft,
   makeGameAction,
   startTimedAction,
} from "./TimedActionLogic";
import { forceAlliance, forceDefensePact, getTreatyCount } from "./TreatyLogic";
import {
   getCurrentWars,
   getWarMonthlyMilitaryPoint,
   getWarParticipants,
   getWarScore,
   getWarSuccessChance,
   getWarTiles,
   MinConscription,
   MonthlyStabilityCostWithCB,
} from "./WarLogic";

const AIDeclareWarChance = 0.2;
const AIWarMaxUnrest = 10;
const EnableAILogging = import.meta.env.DEV;

export function tickAI(save: SaveGame): void {
   forEach(save.state.provinces, (province, state) => {
      if (!hasFlag(G.flags, GameFlags.Sandbox) && province === save.state.playerProvince) {
         return;
      }
      const tiles = Array.from(save.state.tiles.entries()).filter(([_, tileData]) => tileData.province === province);
      tiles.sort(([tileA, tileDataA], [tileB, tileDataB]) => {
         return tileDataA.upgradeCount - tileDataB.upgradeCount;
      });

      let remainingCapacity =
         getProvinceGoverningCapacity(province, save).value - getProvinceGoverningCost(province, save).value;

      ////////// Administrative //////////
      const administrativeActions = new Set<AIAction>([]);
      if (remainingCapacity > 0) {
         administrativeActions.add("Upgrade");
      }
      const administrativeTech = getCheapestLockedTech("administrative", province, save);
      if (administrativeTech) {
         administrativeActions.add("Research");
      } else {
         administrativeActions.delete("Research");
      }
      for (const [tile, tileData] of tiles) {
         if (tileData.province === province && !tileData.coreProvinces.has(province)) {
            const action = MakeCoreAction(tile, province, save);
            if (action.cost && !hasEnoughProvinceResources(action.cost, province, save)) {
               administrativeActions.clear();
            }
            tryDoHeadless(action, "MakeCore", province, save);
         }
      }
      const administrative = getPreferredActionForResource(
         "administrative",
         administrativeActions,
         state.blackboard.resources,
      );
      switch (administrative) {
         case "Research":
            if (administrativeTech) {
               tryDoHeadless(ResearchTechAction(administrativeTech, province, save), "Research", province, save);
            }
            break;
         case "Upgrade":
            for (const [tile, tileData] of tiles) {
               if (remainingCapacity <= 1) {
                  break;
               }
               if (tryDoHeadless(UpgradeInfrastructureAction(tile, province, save), "Upgrade", province, save)) {
                  --remainingCapacity;
               }
            }
            break;
      }

      ////////// Diplomatic //////////
      const diplomaticActions = new Set<AIAction>([]);
      if (remainingCapacity > 0) {
         diplomaticActions.add("Upgrade");
      }
      const diplomaticTech = getCheapestLockedTech("diplomatic", province, save);
      if (diplomaticTech) {
         diplomaticActions.add("Research");
      } else {
         diplomaticActions.delete("Research");
      }
      switch (getPreferredActionForResource("diplomatic", diplomaticActions, state.blackboard.resources)) {
         case "Research":
            if (diplomaticTech) {
               tryDoHeadless(ResearchTechAction(diplomaticTech, province, save), "Research", province, save);
            }
            break;
         case "Upgrade":
            for (const [tile, tileData] of tiles) {
               if (remainingCapacity <= 1) {
                  break;
               }
               if (tryDoHeadless(UpgradeProductionAction(tile, province, save), "Upgrade", province, save)) {
                  --remainingCapacity;
               }
            }
            break;
      }

      ////////// Military //////////
      const militaryActions = new Set<AIAction>([]);
      if (remainingCapacity > 0) {
         militaryActions.add("Upgrade");
      }
      const militaryTech = getCheapestLockedTech("military", province, save);
      if (militaryTech) {
         militaryActions.add("Research");
      } else {
         militaryActions.delete("Research");
      }
      const warMilitaryPointCost = getCurrentWars(province, save)
         .filter((war) => war.attacker === province)
         .reduce((acc, war) => acc + getWarMonthlyMilitaryPoint(war), 0);
      if (!hasEnoughProvinceResources({ military: warMilitaryPointCost }, province, save)) {
         militaryActions.clear();
      }
      for (const [tile, tileData] of tiles) {
         if (tileData.rebellion >= 10) {
            const action = CrackDownAction(tile, province, save);
            if (action.cost && !hasEnoughProvinceResources(action.cost, province, save)) {
               militaryActions.clear();
            }
            tryDoHeadless(action, "CrackDown", province, save);
         }
      }
      switch (getPreferredActionForResource("military", militaryActions, state.blackboard.resources)) {
         case "Research":
            if (militaryTech) {
               tryDoHeadless(ResearchTechAction(militaryTech, province, save), "Research", province, save);
            }
            break;
         case "Upgrade":
            for (const [tile, tileData] of tiles) {
               if (getTileUnrest(tile, save).value > -3) {
                  continue;
               }
               if (remainingCapacity <= 1) {
                  break;
               }
               if (tryDoHeadless(UpgradePopulationAction(tile, province, save), "Upgrade", province, save)) {
                  --remainingCapacity;
               }
            }
            break;
      }

      if (state.loans.length > 0) {
         setProvinceStat("targetConscription", MinConscription, province, save);
         filterInPlace(state.loans, (loan) => {
            if (trySpendProvinceResources({ gold: loan.principal + loan.interest }, province, save)) {
               return false;
            }
            return true;
         });
      }

      if (state.loans.length <= 0) {
         if (getCurrentWars(province, save).length <= 0) {
            const averageUnrest = getAverageUnrest(province, save);
            const targetConscription = clamp(
               DefaultConscription + getProvinceStat("defendCount", province, save) * MinConscription,
               MinConscription,
               getProvinceStat("actualConscription", province, save) - averageUnrest,
            );
            setProvinceStat("targetConscription", targetConscription, province, save);
         }
         constructBuildings(province, save);
         tryDoHeadless(RecruitGeneralAction(province, save), "RecruitGeneral", province, save);
      }
      selectAdvisor(province, save);
      doProduction(province, save);
      doTrade(province, save);
      doSenateVote(province, save);
      doDiplomacy(province, save);
      doGeneralUpgrade(province, save);
      lookForSpouse(state.governor, province, save);
      doWar(province, save);
      tryDoHeadless(ConvertToChristianityAction(province, save), "ConvertToChristianity", province, save);
      tryDoHeadless(makeGameAction("AppointPontiff", province, save), "AppointPontiffEnvoyArmyStaff", province, save);
      tryDoHeadless(makeGameAction("AppointEnvoy", province, save), "AppointPontiffEnvoyArmyStaff", province, save);
      tryDoHeadless(makeGameAction("AppointArmyStaff", province, save), "AppointPontiffEnvoyArmyStaff", province, save);
   });
}

function doGeneralUpgrade(province: Province, save: SaveGame): void {
   for (const skill of ["infantrySkill", "rangedSkill", "cavalrySkill"] as const) {
      tryDoHeadless(UpgradeGeneralSkillAction(skill, province, save), "UpgradeGeneralSkill", province, save);
   }
}

function doProduction(province: Province, save: SaveGame): void {
   if (getProvinceUsedProductionCapacity(province, save) < getProvinceProductionCapacity(province, save).value) {
      optimizeProduction(province, save);
   }
}

function doTrade(province: Province, save: SaveGame): void {
   if (getTimedActionCooldownLeft("TradeGoods", province, save) > 0) {
      return;
   }
   for (const [otherProvince, otherState] of entriesOf(save.state.provinces)) {
      if (otherProvince === province) {
         continue;
      }
      for (const offer of otherState.tradeOffers) {
         if (offer.theyOffer !== "gold") {
            continue;
         }
         const success = tryDoHeadless(
            TradeWithAction(province, otherProvince, offer, save),
            "TradeGoods",
            province,
            save,
         );
         if (success) {
            return;
         }
      }
   }
}

function doWar(province: Province, save: SaveGame): void {
   const currentWars = getCurrentWars(province, save);
   if (currentWars.length > 0) {
      for (const currentWar of currentWars) {
         if (currentWar.attacker !== province) {
            continue;
         }
         if (currentWar.actualWarScore >= currentWar.requiredWarScore) {
            logAI(`${province} signs peace treaty with ${currentWar.defender}`);
            tryDoHeadless(SignPeaceTreatyAction(currentWar, province, save), "SignPeaceTreaty", province, save);
            continue;
         }
         if (getAverageUnrest(province, save) > AIWarMaxUnrest) {
            logAI(`${province} negotiates white peace with ${currentWar.defender} due to unrest`);
            tryDoHeadless(NegotiateWhitePeaceAction(currentWar, province, save), "NegotiateWhitePeace", province, save);
            continue;
         }
         if (
            getWarSuccessChance(
               currentWar.attacker,
               currentWar.coAttackers,
               currentWar.defender,
               currentWar.coDefenders,
               save,
            ) < 0.5
         ) {
            const action = NegotiateWhitePeaceAction(currentWar, province, save);
            logAI(`${province} negotiates white peace with ${currentWar.defender} due to low success chance`);
            tryDoHeadless(action, "NegotiateWhitePeace", province, save);
         }
      }
      return;
   }
   if (Math.random() > AIDeclareWarChance || save.state.month % 12 !== Provinces.indexOf(province) % 12) {
      return;
   }
   const warGoal = findWarGoal(province, save);
   if (!warGoal) {
      return;
   }
   const { tile, estimatedMonth } = warGoal;
   const tileData = save.state.tiles.get(tile);
   const maxWarMonths = getMaxWarMonths(province, save);
   if (estimatedMonth > maxWarMonths) {
      if (tileData) {
         logAI(
            `${province} skips declaring war on ${tileData.province} because it takes too long (${estimatedMonth} > ${maxWarMonths})`,
         );
      }
      return;
   }
   if (tileData) {
      const relation = getRelation(province, tileData.province, save);
      if (relation) {
         relation.casusBelli.set("ConquestMission", {
            monthsLeft: 12,
         });
      }
      const { coAttackers, coDefenders } = getWarParticipants(province, tileData.province, save);
      const action = DeclareWarAction(
         province,
         coAttackers,
         tileData.province,
         coDefenders,
         new Set([tile]),
         "ConquestMission",
         save,
      );
      logAI(`${province} declares war on ${tileData.province}\n${printAction(action, province, save)}`);
      tryDoHeadless(action, "DeclareWar", province, save);
   }
}

function getDesiredTreatyCount(province: Province, save: SaveGame): number {
   return clamp(getProvinceStat("defendCount", province, save), 1, getDiplomats(province, save).value);
}

function doSenateVote(province: Province, save: SaveGame): void {
   pledgeProvinceConsulVotes(province, save);
   if (getProvinceResource("consulPoint", province, save) > 0) {
      tryDoHeadless(makeGameAction("RequestFunding", province, save), "RequestFunding", province, save);
   }
}

function doDiplomacy(province: Province, save: SaveGame): void {
   if (save.state.month % 12 !== Provinces.indexOf(province) % 12) {
      return;
   }
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const sortedProvinces = getProvincesByDistance(province, save);
   const part1 = sortedProvinces.slice(0, 5);
   const part2 = sortedProvinces.slice(5, 10);
   const part3 = sortedProvinces.slice(10);
   const candidates = [...shuffle(part1), ...shuffle(part2), ...shuffle(part3)];
   doTreaties(province, candidates, save);
   if (getTimedActionCooldownLeft("ChangeRival", province, save) <= 0) {
      startTimedAction("ChangeRival", province, save);
      const rivals = state.rivals;
      const newRivals = candidates
         .filter((candidate) => getRelation(province, candidate, save)?.treaty === undefined)
         .slice(0, 2);
      for (const newRival of newRivals) {
         if (!rivals.includes(newRival)) {
            const relation = getRelation(newRival, province, save);
            if (relation) {
               relation.casusBelli.set("HumiliateRival", {
                  monthsLeft: HumiliateRivalCasusBelliMonths,
               });
            }
         }
      }
      for (let i = 0; i < rivals.length; i++) {
         rivals[i] = newRivals[i] ?? null;
      }
   }
}

function doTreaties(province: Province, candidates: Province[], save: SaveGame): void {
   const desiredTreatyCount = getDesiredTreatyCount(province, save);
   const ourState = save.state.provinces[province];
   if (!ourState) {
      return;
   }
   for (const candidate of candidates) {
      // Conditions for treaty initiator
      const theirState = save.state.provinces[candidate];
      if (!theirState) {
         continue;
      }
      if (!hasFlag(G.flags, GameFlags.Sandbox) && province === save.state.playerProvince) {
         break;
      }
      if (!ourState.unlockedTech.has("B2")) {
         break;
      }
      if (getTimedActionTimeLeft("TreatySabotaged", province, save) > 0) {
         break;
      }
      if (getTimedActionCooldownLeft("DiplomaticTreaty", province, save) > 0) {
         break;
      }
      if (getTreatyCount(province, save) >= desiredTreatyCount) {
         break;
      }
      // Conditions for treaty recipient
      if (!hasFlag(G.flags, GameFlags.Sandbox) && candidate === save.state.playerProvince) {
         continue;
      }
      if (theirState.rivals.includes(province)) {
         continue;
      }
      if (ourState.rivals.includes(candidate)) {
         continue;
      }
      if (getTimedActionTimeLeft("TreatySabotaged", candidate, save) > 0) {
         continue;
      }
      if (getTimedActionCooldownLeft("DiplomaticTreaty", candidate, save) > 0) {
         continue;
      }
      if (getTreatyCount(candidate, save) >= getDesiredTreatyCount(candidate, save)) {
         continue;
      }

      if (getProvincePrestige(province, save).value >= 1.25 * getProvincePrestige(candidate, save).value) {
         forceAlliance(province, candidate, save);
      } else {
         forceDefensePact(province, candidate, save);
      }

      break;
   }
}

const PreferredBuildings = new Set<Building>(["TownSquare", "Forum"]);

function constructBuildings(province: Province, save: SaveGame): void {
   const tiles = Array.from(save.state.tiles.entries())
      .filter(([_, tileData]) => tileData.province === province)
      .sort(([tileA, tileDataA], [tileB, tileDataB]) => {
         return tileDataA.buildings.size - tileDataB.buildings.size;
      });
   const income = getProvinceIncome(province, save).income;
   if (income < 0) {
      return;
   }
   for (const [tile, tileData] of tiles) {
      if (tileData.buildings.size >= getBuildingSlot(tile, save).value) {
         continue;
      }
      const buildings = keysOf(Buildings).sort((a, b) => {
         if (PreferredBuildings.has(a)) {
            return -1;
         }
         if (PreferredBuildings.has(b)) {
            return 1;
         }
         return (Buildings[a].construction.gold ?? 0) - (Buildings[b].construction.gold ?? 0);
      });
      for (const building of buildings) {
         if (tileData.buildings.has(building)) {
            continue;
         }
         if (income < (Buildings[building].maintenance.gold ?? 0)) {
            continue;
         }
         const action = ConstructBuildingAction(building, tile, province, save);
         if (action.cost && !hasEnoughProvinceResources(action.cost, province, save)) {
            return;
         }
         tryDoHeadless(action, "Construct", province, save);
      }
   }
}

function selectAdvisor(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   let income = getProvinceIncome(province, save).income;
   for (let i = 1; i <= 3; i++) {
      const cost = getAdvisorMonthlyCost(i, province, save).value;
      for (const [type, data] of entriesOf(state.advisors)) {
         if (income < 0 || state.loans.length > 0) {
            data.selected = null;
            continue;
         }
         if (income < cost) {
            continue;
         }
         if (data.selected && data.selected.level >= i) {
            continue;
         }
         if (trySpendProvinceResources({ gold: getAdvisorInitialCost(i, province, save).value }, province, save)) {
            income -= cost;
            data.selected = data.candidates[i - 1];
         }
      }
   }
}

function tryDoHeadless(action: IGameAction, aiAction: AIAction, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   const isConditionMet = action.condition === undefined || action.condition.value === true;
   if (isConditionMet && (action.cost === undefined || trySpendProvinceResources(action.cost, province, save))) {
      action.effect({ headless: true });
      if (action.cost) {
         tabulateCost(action.cost, aiAction, state.blackboard.resources);
      }
      return true;
   }
   return false;
}

function tabulateCost(cost: ProvinceResourceCosts, action: AIAction, resources: BlackboardResource): void {
   forEach(cost, (resource, value) => {
      if (!resources[resource]) {
         resources[resource] = {};
      }
      if (!resources[resource][action]) {
         resources[resource][action] = 0;
      }
      resources[resource][action] += value;
   });
}

function getPreferredActionForResource(
   resource: ProvinceResource,
   candidates: Set<AIAction>,
   resources: BlackboardResource,
): AIAction | undefined {
   const actions = resources[resource];
   let preferred = candidates.values().next().value;
   if (!actions || !preferred) {
      return preferred;
   }
   for (const candidate of candidates) {
      if ((actions[candidate] ?? 0) < (actions[preferred] ?? 0)) {
         preferred = candidate;
      }
   }
   return preferred;
}

function lookForSpouse(family: IFamily, province: Province, save: SaveGame): void {
   // AI should until the age of 15 to look for spouse. Otherwise the player will never have
   // a chance to offer marriage to other provinces since all their children will be married immediately.
   if (
      (family.male && family.male.age > 15 && !family.female) ||
      (family.female && family.female.age > 15 && !family.male)
   ) {
      tryDoHeadless(
         LookForLocalSpouseAction(randOne(SocialClasses.slice(0)), family, province, save),
         "LookForSpouse",
         province,
         save,
      );
   }
   family.children.forEach((child) => {
      lookForSpouse(child, province, save);
   });
}

function findWarGoal(province: Province, save: SaveGame): { tile: Tile; estimatedMonth: number } | undefined {
   let neighbors = getProvincesInRange(1, province, save);
   if (neighbors.size <= 0) {
      neighbors = getProvincesInRange(2, province, save);
   }
   let bestTile: Tile | undefined;
   let bestIsOriginalTile = false;
   let bestEstimatedTime = Number.POSITIVE_INFINITY;
   const warTiles = getWarTiles(save);
   for (const [otherProvince, otherTiles] of neighbors) {
      const { coAttackers, coDefenders } = getWarParticipants(province, otherProvince, save);
      const action = DeclareWarAction(
         province,
         coAttackers,
         otherProvince,
         coDefenders,
         new Set(otherTiles),
         "ConquestMission",
         save,
      );
      if (!canDoAction(action, province, save)) {
         continue;
      }
      const successChance = getWarSuccessChance(province, coAttackers, otherProvince, coDefenders, save);
      const failChance = 1 - successChance;
      const denominator = successChance - failChance;
      if (denominator <= 0) {
         continue;
      }
      for (const otherTile of shuffle(otherTiles)) {
         if (warTiles.has(otherTile)) {
            continue;
         }
         const otherTileData = save.state.tiles.get(otherTile);
         const warScore = getWarScore(province, otherProvince, new Set([otherTile]), "ConquestMission", save).value;
         const estimatedTime = Math.ceil(warScore / denominator);
         const isOriginalTile = otherTileData?.originalProvince === province;
         if (estimatedTime < bestEstimatedTime && (!bestIsOriginalTile || isOriginalTile)) {
            bestEstimatedTime = estimatedTime;
            bestTile = otherTile;
            bestIsOriginalTile = isOriginalTile;
         }
      }
   }
   if (bestTile) {
      return { tile: bestTile, estimatedMonth: bestEstimatedTime };
   }
   return undefined;
}

function getAverageUnrest(province: Province, save: SaveGame): number {
   let unrest = 0;
   let count = 0;
   for (const [tile, tileData] of save.state.tiles) {
      if (tileData.province === province) {
         unrest += getTileUnrest(tile, save).value;
         ++count;
      }
   }
   return unrest / count;
}

function getMaxWarMonths(province: Province, save: SaveGame): number {
   const averageUnrest = getAverageUnrest(province, save);
   return clamp((AIWarMaxUnrest - averageUnrest) / MonthlyStabilityCostWithCB, 0, Number.POSITIVE_INFINITY);
}

function logAI(message?: any, ...optionalParams: any[]): void {
   if (!EnableAILogging) {
      return;
   }
   console.log(message, ...optionalParams);
}
