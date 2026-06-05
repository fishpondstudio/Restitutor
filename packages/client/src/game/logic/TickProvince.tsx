import { clamp } from "@mantine/hooks";
import { entriesOf, filterInPlace, forEach, hasFlag, randOne } from "@project/shared/src/utils/Helper";
import { GameEventModal } from "../../ui/GameEventModal";
import { G, GameFlags } from "../../utils/Global";
import { showModal } from "../../utils/ModalManager";
import { addProvinceUpgrade, removeProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { IGovernorFamily } from "../definitions/Family";
import { type Province, ProvinceFlags } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import { RefreshTiles } from "../Events";
import { applyEventButton, getEventButtons, getGameEventCondition } from "../events/GameEventLogic";
import { type GameEvent, GameEvents } from "../events/GameEvents";
import type { SaveGame } from "../GameState";
import { getRelations, MaxImprovedRelations } from "./DiplomacyLogic";
import { generateRandomGovernor, tickFamily } from "./GovernorLogic";
import { canTakeLoan, getLoanAmount, getMonthlyInterestRate, takeLoan } from "./LoanLogic";
import { tickProduction } from "./ProductionLogic";
import {
   addProvinceResource,
   cleanUpProvince,
   getProvinceGoverningCost,
   getProvinceGovernmentPoint,
   getProvinceIncome,
   getProvinceResource,
   getProvinceStat,
   getProvinceTileCount,
   pledgeProvinceConsulVotes,
   setProvinceStat,
   spendProvinceResource,
} from "./ProvinceLogic";
import { tickSocialClasses } from "./SocialClassLogic";
import { getGameDate } from "./TickLogic";
import { getTileUnrest } from "./TileLogic";
import { getTimedActionCooldownLeft, startTimedAction } from "./TimedActionLogic";
import { getCurrentGeneral, resetGeneralUpgrades } from "./WarLogic";

export const PendingGameEventTimeoutMonths = 3;

export function tickProvince(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (getProvinceTileCount(province, save) <= 0) {
      cleanUpProvince(province, save);
      return;
   }
   addProvinceResource(
      "administrative",
      getProvinceGovernmentPoint("administrative", province, save).value,
      province,
      save,
   );
   addProvinceResource("diplomatic", getProvinceGovernmentPoint("diplomatic", province, save).value, province, save);
   addProvinceResource("military", getProvinceGovernmentPoint("military", province, save).value, province, save);

   const modifiers = state.modifiers;
   forEach(modifiers, (type, modifier) => {
      filterInPlace(modifier, (modifier) => {
         if (!modifier.duration) {
            return true;
         }
         --modifier.duration;
         return modifier.duration > 0;
      });
   });

   for (const [key, config] of entriesOf(GameEvents)) {
      if (config.type === "manual" || config.type === "random") {
         continue;
      }
      if (state.usedEvents.has(key)) {
         continue;
      }
      if (getGameEventCondition(config.condition, province, save).value) {
         addGameEvent(key, province, save);
         state.usedEvents.add(key);
      }
   }

   if (getTimedActionCooldownLeft("GameEventTimer", province, save) <= 0) {
      const candidates: GameEvent[] = [];
      forEach(GameEvents, (key, config) => {
         if (config.type === "random") {
            candidates.push(key);
         }
      });
      let filtered = candidates.filter((event) => {
         const config = GameEvents[event].condition;
         return !state.usedEvents.has(event) && getGameEventCondition(config, province, save).value;
      });
      if (filtered.length === 0) {
         candidates.forEach((event) => {
            state.usedEvents.delete(event);
         });
         filtered = candidates.filter((event) => {
            const config = GameEvents[event].condition;
            return !state.usedEvents.has(event) && getGameEventCondition(config, province, save).value;
         });
      }
      if (filtered.length > 0) {
         const event = randOne(filtered);
         addGameEvent(event, province, save);
         state.usedEvents.add(event);
      }
   }

   const month = getGameDate(save.state.tick).getMonth();
   if (month === 6) {
      const oldOffspringCount = state.governor.children.length;
      const result = tickFamily(state.governor, province, save);
      const newOffspringCount = state.governor.children.length;
      if (!result.male) {
         let hasHeir = false;
         for (const child of state.governor.children) {
            if (child.male) {
               state.governor = child as IGovernorFamily;
               addGameEvent("Manual1", province, save);
               hasHeir = true;
               break;
            }
         }
         if (!hasHeir) {
            state.governor = generateRandomGovernor(province);
            addGameEvent("Manual2", province, save);
         }
      } else if (oldOffspringCount === 0 && newOffspringCount > 0) {
         addGameEvent("Manual3", province, save);
      }
   }

   if (!getCurrentGeneral(province, save)) {
      resetGeneralUpgrades(province, save);
   }

   for (const [event, data] of state.events) {
      if (save.state.month - data.month >= PendingGameEventTimeoutMonths) {
         const data = GameEvents[event];
         const buttons = getEventButtons(event, province, save);
         if (buttons.length > 0) {
            const button = province === save.state.playerProvince ? buttons[0] : randOne(buttons);
            applyEventButton(button, data, province, save);
         }
         state.events.delete(event);
      }
   }

   tickSocialClasses(province, save);

   const governingCost = getProvinceGoverningCost(province, save).value;
   const christianity = getProvinceResource("christianity", province, save);
   if (
      (christianity > governingCost && state.religion !== "Christianity") ||
      (christianity < governingCost && state.religion === "Christianity")
   ) {
      addProvinceUpgrade("ReligiousUnrest", province, save);
   } else {
      removeProvinceUpgrade("ReligiousUnrest", province, save);
   }

   getRelations(province, save)?.forEach((relation, otherProvince) => {
      filterInPlace(relation.attitudeModifier, (modifier) => {
         if (!modifier.duration) {
            return true;
         }
         --modifier.duration;
         return modifier.duration > 0;
      });

      if (relation.infiltrate.active) {
         ++relation.infiltrate.value;
      } else {
         relation.infiltrate.value = clamp(relation.infiltrate.value - 1, 0, Number.POSITIVE_INFINITY);
      }

      if (relation.improveRelations.active) {
         relation.improveRelations.value = clamp(relation.improveRelations.value + 1, 0, MaxImprovedRelations);
      } else {
         relation.improveRelations.value = clamp(relation.improveRelations.value - 1, 0, MaxImprovedRelations);
      }

      relation.casusBelli.forEach((month, casusBelli) => {
         --month.monthsLeft;
         if (month.monthsLeft <= 0) {
            relation.casusBelli.delete(casusBelli);
         }
      });
      const treaty = relation.treaty;
      if (treaty && treaty.month + TimedActions.DiplomaticTreaty.duration <= save.state.month) {
         relation.treaty = undefined;
      }
      if (
         relation.guaranteeDefense !== undefined &&
         relation.guaranteeDefense + TimedActions.GuaranteeDefense.duration <= save.state.month
      ) {
         relation.guaranteeDefense = undefined;
      }
      if (
         relation.deterAggression !== undefined &&
         relation.deterAggression + TimedActions.DeterAggression.duration <= save.state.month
      ) {
         relation.deterAggression = undefined;
      }
      if (
         relation.revealElectionBacking !== undefined &&
         relation.revealElectionBacking + TimedActions.RevealElectionBacking.duration <= save.state.month
      ) {
         relation.revealElectionBacking = undefined;
      }
   });

   const targetConscription = getProvinceStat("targetConscription", province, save);
   const actualConscription = getProvinceStat("actualConscription", province, save);
   if (targetConscription > actualConscription) {
      setProvinceStat("actualConscription", clamp(actualConscription + 1, 0, targetConscription), province, save);
   }

   const morale = getProvinceStat("armyMorale", province, save);
   const maintenance = getProvinceStat("armyMaintenance", province, save);
   if (maintenance > morale) {
      setProvinceStat("armyMorale", clamp(morale + 1, 0, maintenance), province, save);
   }

   const income = getProvinceIncome(province, save).income;
   if (income >= 0) {
      addProvinceResource("gold", income, province, save);
   } else {
      spendProvinceResource("gold", Math.abs(income), province, save);
   }

   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         forEach(data.modifiers, (type, modifier) => {
            filterInPlace(modifier, (modifier) => {
               if (!modifier.duration) {
                  return true;
               }
               --modifier.duration;
               return modifier.duration > 0;
            });
         });

         const unrest = getTileUnrest(tile, save).value;
         if (hasFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest)) {
            data.autonomy = clamp(data.autonomy + Math.ceil(unrest), 0, 100);
         }
         const oldRebellion = data.rebellion;
         if (oldRebellion < 10 && Math.random() < Math.abs(unrest) / 100) {
            data.rebellion = clamp(data.rebellion + Math.sign(unrest), 0, 10);
         }
         if (oldRebellion < 10 && data.rebellion >= 10) {
            RefreshTiles.emit({ tiles: [tile], options: { indicator: true } });
         }
      }
   }

   tickProduction(province, save);

   const interestRate = getMonthlyInterestRate(province, save).value;
   for (const loan of state.loans) {
      loan.interest += loan.principal * interestRate;
   }

   while (getProvinceResource("gold", province, save) < 0 && canTakeLoan(province, save).value) {
      takeLoan(province, getLoanAmount(province, save), save);
   }

   if (getProvinceResource("gold", province, save) < 0) {
      startTimedAction("Bankruptcy", province, save);
      state.loans.length = 0;
      while (getProvinceResource("gold", province, save) < 0 && canTakeLoan(province, save).value) {
         takeLoan(province, getLoanAmount(province, save), save);
      }
   }

   if (hasFlag(state.flags, ProvinceFlags.AutomaticallyPledgeSupport)) {
      pledgeProvinceConsulVotes(province, save);
   }
}

export function addGameEvent(event: GameEvent, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.events.set(event, { month: save.state.month });
   startTimedAction("GameEventTimer", province, save);
   if (province === save.state.playerProvince) {
      showGameEventModal(<GameEventModal event={event} />);
   }
}

export function showGameEventModal(modal: React.ReactElement): void {
   if (!hasFlag(G.flags, GameFlags.Sandbox)) {
      showModal(modal);
   }
}
