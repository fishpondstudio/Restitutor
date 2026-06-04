import { clamp, forEach, hasFlag, mapSafeAdd, monthsBetween, range, setFlag } from "@project/shared/src/utils/Helper";
import { ChronicleModal } from "../../ui/ChronicleModal";
import { G, GameFlags } from "../../utils/Global";
import { showModal } from "../../utils/ModalManager";
import type { Province } from "../definitions/Province";
import { GameStateUpdated, GameTimeUpdated } from "../Events";
import type { SaveGame } from "../GameState";
import { randomMaleName } from "../RomanNames";
import {
   addProvinceResource,
   addProvinceStat,
   ConsulElectionMonths,
   clearProvincePrestigeRankingCache,
   getProvinceStat,
   resetProvinceResource,
   rollTradeOffers,
   setProvinceStat,
   trySpendProvinceResources,
} from "./ProvinceLogic";
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

export function tickMonth(save: SaveGame): void {
   forEach(save.state.provinces, (province) => {
      tickProvince(province, save);
   });
   save.state.wars.forEach((war) => {
      tickWar(war, save);
   });
   if (save.state.month % 12 === 0) {
      tickYear(save);
   }
   tickAI(save);
}

export function tickYear(save: SaveGame): void {
   tickChroniclePopup(save);
   rollTradeOffers(save);
   clearProvincePrestigeRankingCache();
   tickConsulElection(save);
   forEach(save.state.provinces, (province) => {
      const yearly = getProvinceStat("christianityYearly", province, save);
      addProvinceStat("christianity", yearly, province, save);
   });
}

function tickChroniclePopup(save: SaveGame): void {
   if (hasFlag(G.flags, GameFlags.Sandbox)) {
      return;
   }
   if (save.options.chroniclePopupFrequency > 0 && save.state.month % save.options.chroniclePopupFrequency === 0) {
      const currentYear = monthToDate(save.state.month).getFullYear();
      const startYear = currentYear - save.options.chroniclePopupFrequency;
      const endYear = currentYear - 1;
      const entries = save.state.chronicle.filter((entry) => {
         const year = monthToDate(entry.month).getFullYear();
         return year >= startYear && year <= endYear;
      });
      if (entries.length > 0) {
         showModal(<ChronicleModal years={[startYear, endYear]} />);
      }
   }
}

export function monthToNextYear(save: SaveGame): number {
   return Math.ceil(save.state.month / 12) * 12 - save.state.month;
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

   save.state.senate.votes.forEach((votes, province) => {
      let count = 0;
      elected.forEach((idx) => {
         if (votes.has(idx)) {
            count++;
         }
      });
      resetProvinceResource("consulPoint", province, save);
      if (count === 2) {
         addProvinceResource("consulPoint", 3, province, save);
      } else if (count === 1) {
         addProvinceResource("consulPoint", 1, province, save);
      }
      setProvinceStat("consulVotes", 1, province, save);
   });

   save.state.senate.votes.clear();
   save.state.senate.consulCandidates = range(0, 9).map(() => randomMaleName().join(" "));
}

export function tickWar(war: IWar, save: SaveGame): void {
   if (war.actualWarScore >= war.requiredWarScore) {
      return;
   }
   const militaryPoints = getWarMonthlyMilitaryPoint(war);
   const successChance = getWarSuccessChance(war.attacker, war.coAttackers, war.defender, war.coDefenders, save);
   if (trySpendProvinceResources({ military: militaryPoints }, war.attacker, save)) {
      const roll = Math.random();
      const success = roll < successChance;
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
         roll,
         successChance,
         result: success ? "Success" : "Repelled",
         flag: flag,
      });
      war.actualWarScore = clamp(war.actualWarScore, 0, war.requiredWarScore);
   } else {
      war.log.unshift({
         month: save.state.month,
         roll: -1,
         successChance,
         result: "Stalled",
         flag: WarLogFlag.None,
      });
   }
}

const StartDate = getGameDate(0);

export function getGameDate(tick: number): Date {
   return new Date(193, 0, tick, 0, 0, 0, 0);
}

export function tickToMonth(tick: number): number {
   return monthsBetween(StartDate, getGameDate(tick));
}

export function monthToDate(month: number): Date {
   return new Date(193, month - 1, 1, 0, 0, 0, 0);
}
