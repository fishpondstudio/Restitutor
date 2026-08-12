import { clamp, forEach, hasFlag, mapSafeAdd, range, setFlag } from "@project/shared/src/utils/Helper";
import { ChronicleModal } from "../../ui/ChronicleModal";
import { showPanel } from "../../ui/common/ShowPanel";
import { G, GameFlags } from "../../utils/Global";
import { unlockAchievement } from "../Achievement";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import { GameStateUpdated, GameTimeUpdated } from "../Events";
import type { SaveGame } from "../GameState";
import { randomMaleName } from "../RomanNames";
import { fixRelations } from "./DiplomacyLogic";
import { getGameDate, monthToDate, tickToMonth, tickToYear } from "./GameDateTime";
import {
   addProvinceResource,
   ConsulCandidatesCount,
   ConsulElectionMonths,
   clearProvincePrestigeRankingCache,
   getChristianityYearly,
   getProvinceStat,
   isProvinceGreatPower,
   resetProvinceResource,
   rollTradeOffers,
   setProvinceStat,
   trySpendProvinceResources,
} from "./ProvinceLogic";
import { addSocialClassInfluence, SocialClassInfluenceYearly } from "./SocialClassLogic";
import { tickAI } from "./TickAI";
import { tickProvince } from "./TickProvince";
import { getTimedActionTimeLeft } from "./TimedActionLogic";
import { getWarMonthlyMilitaryPoint, getWarSuccessChance, type IWar, WarLogFlag } from "./WarLogic";

export function tickLogic(save: SaveGame, dt: number, unscaled: number): void {
   save.state.tick++;
   GameTimeUpdated.emit();
   const month = tickToMonth(save.state.tick);
   let updated = false;
   while (month > save.state.month) {
      tickMonth(save);
      updated = true;
      save.state.month++;
   }
   if (updated) {
      GameStateUpdated.emit();
   }
}

// 1 Jan
export const GameEventMonth = 0;
// 1 Apr
export const TickChronicleMonth = 3;
// 1 Jul
export const TickFamilyMonth = 6;

export function tickMonth(save: SaveGame): void {
   forEach(save.state.provinces, (province) => {
      tickProvince(province, save);
   });
   fixRelations(save);
   save.state.wars.forEach((war) => {
      tickWar(war, save);
   });
   const currentMonth = getGameDate(save.state.tick).getMonth();
   if (currentMonth === 0) {
      tickYear(save);
   }
   if (currentMonth === TickChronicleMonth) {
      tickChroniclePopup(save);
   }
   tickAI(save);
}

export function tickYear(save: SaveGame): void {
   rollTradeOffers(save);
   clearProvincePrestigeRankingCache();
   if (isProvinceGreatPower(save.state.playerProvince, save)) {
      unlockAchievement("BecomeGreatPower");
   }
   tickConsulElection(save);
   forEach(save.state.provinces, (province) => {
      addProvinceResource("christianity", getChristianityYearly(province, save).value, province, save);
      forEach(SocialClassInfluenceYearly, (socialClass, func) => {
         addSocialClassInfluence(socialClass, func(province, save).value, province, save);
      });
   });
}

function tickChroniclePopup(save: SaveGame): void {
   if (hasFlag(G.flags, GameFlags.Sandbox)) {
      return;
   }
   const frequency = save.options.chroniclePopupFrequency;
   if (frequency > 0 && tickToYear(save.state.tick) % frequency === 0) {
      const currentYear = monthToDate(save.state.month).getFullYear();
      const startYear = currentYear - frequency;
      const endYear = currentYear - 1;
      const entries = save.state.chronicle.filter((entry) => {
         const year = monthToDate(entry.month).getFullYear();
         return year >= startYear && year <= endYear;
      });
      if (entries.length > 0) {
         showPanel(<ChronicleModal years={[startYear, endYear]} />);
      }
   }
}

function tickConsulElection(save: SaveGame) {
   // We don't tick the first election as it will result in vacant consuls. Instead we set up two consuls as part of the initialization.
   if (save.state.month === 0) {
      return;
   }
   if (save.state.month % ConsulElectionMonths !== 0) {
      return;
   }
   const result = new Map<number, number>();
   save.state.senate.votes.forEach((votes, province) => {
      votes.forEach((idx) => {
         mapSafeAdd(result, idx, getProvinceStat("consulVotes", province, save));
      });
   });

   const elected = Array.from(result)
      .sort((a, b) => b[1] - a[1])
      .map(([idx]) => idx)
      .slice(0, 2);

   save.state.senate.electedConsuls.clear();
   elected.forEach((idx) => {
      const consul = save.state.senate.consulCandidates[idx];
      const provinces: Province[] = [];
      save.state.senate.votes.forEach((votes, province) => {
         if (votes.has(idx)) {
            provinces.push(province);
         }
      });
      save.state.senate.electedConsuls.set(consul, provinces);
   });

   forEach(save.state.provinces, (province) => {
      resetProvinceResource("consulPoint", province, save);
      if (hasProvinceUpgrade("SenatorialAuthority", province, save)) {
         addProvinceResource("consulPoint", 1, province, save);
      }
   });

   save.state.senate.votes.forEach((votes, province) => {
      let count = 0;
      elected.forEach((idx) => {
         if (votes.has(idx)) {
            count++;
         }
      });
      if (count === 2) {
         addProvinceResource("consulPoint", 3, province, save);
      } else if (count === 1) {
         addProvinceResource("consulPoint", 1, province, save);
      }
      setProvinceStat("consulVotes", 1, province, save);
   });

   save.state.senate.votes.clear();
   save.state.senate.consulCandidates = range(0, ConsulCandidatesCount).map(() => randomMaleName().join(" "));
}

export function tickWar(war: IWar, save: SaveGame): void {
   if (war.actualWarScore >= war.requiredWarScore) {
      return;
   }
   const militaryPoints = getWarMonthlyMilitaryPoint(war);
   const successChance = getWarSuccessChance(war.attacker, war.coAttackers, war.defender, war.coDefenders, save);
   if (trySpendProvinceResources({ military: militaryPoints }, war.attacker, save)) {
      const rolls = [Math.random(), Math.random(), Math.random()];
      const success = rolls.filter((roll) => roll < successChance).length >= Math.ceil(rolls.length / 2);
      let flag: WarLogFlag = WarLogFlag.None;
      if (success) {
         ++war.actualWarScore;
      } else {
         const forceAttack = getTimedActionTimeLeft("ForceAttack", war.attacker, save);
         if (forceAttack > 0) {
            setProvinceStat(
               "actualConscription",
               getProvinceStat("actualConscription", war.attacker, save) * 0.9,
               war.attacker,
               save,
            );
            flag = setFlag(flag, WarLogFlag.ForceAttack);
         } else {
            --war.actualWarScore;
         }
      }
      war.log.unshift({
         month: save.state.month,
         rolls,
         successChance,
         result: success ? "Success" : "Repelled",
         flag: flag,
      });
      war.actualWarScore = clamp(war.actualWarScore, 0, war.requiredWarScore);
   } else {
      war.log.unshift({
         month: save.state.month,
         rolls: [],
         successChance,
         result: "Stalled",
         flag: WarLogFlag.None,
      });
   }
}
