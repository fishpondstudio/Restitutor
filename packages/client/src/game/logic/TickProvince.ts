import { clamp } from "@mantine/hooks";
import {
   clearFlag,
   entriesOf,
   filterInPlace,
   forEach,
   hasFlag,
   keysOf,
   numberToRoman,
   randOne,
} from "@project/shared/src/utils/Helper";
import type { ComponentProps, ElementType } from "react";
import type { PanelIdentity } from "../../ui/common/PanelTypes";
import { showPanel } from "../../ui/common/ShowPanel";
import { GameEventModal } from "../../ui/GameEventModal";
import { GovernorWithoutHeirModal } from "../../ui/GovernorWithoutHeirModal";
import { IllegitimateChildModal } from "../../ui/IllegitimateChildModal";
import { NewChildBornModal } from "../../ui/NewChildBornModal";
import { NewGovernorModal } from "../../ui/NewGovernorModal";
import { renderMarkup } from "../../ui/ParseMarkup";
import { RestorationBonusModal } from "../../ui/RestorationBonusModal";
import { playSound } from "../../ui/Sound";
import { G, GameFlags } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { unlockAchievement } from "../Achievement";
import type { IGovernorFamily } from "../definitions/Family";
import { PersonFlags } from "../definitions/Family";
import { type Province, ProvinceFlags } from "../definitions/Province";
import { addProvinceUpgrade, removeProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import { isChristianReligion } from "../definitions/Religion";
import { RestorationBonus } from "../definitions/RestorationBonus";
import { TimedActions } from "../definitions/TimedAction";
import { RefreshTiles } from "../Events";
import { applyGameEventButton, getEventButtons, getGameEventCondition } from "../events/GameEventLogic";
import { type GameEvent, GameEvents } from "../events/GameEvents";
import { applyGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { showWarning } from "./AlertLogic";
import { calculateTilesConnectedToCapital } from "./CacheLogic";
import { cleanUpProvince } from "./CleanupProvince";
import { getImproveRelationsRate, getInfiltrationRate, getRelations, MaxImprovedRelations } from "./DiplomacyLogic";
import { getGameDate } from "./GameDateTime";
import {
   GovernorWithoutHeirEffect,
   NewChildBornEffects1,
   NewChildBornEffects2,
   NewGovernorEffect,
   recognizeIllegitimateChild,
} from "./GovernorEventLogic";
import { ensureHeir, generateRandomGovernor, getSuccessor, tickFamily } from "./GovernorLogic";
import { canTakeLoan, getLoanAmount, getMonthlyInterestRate, takeLoan } from "./LoanLogic";
import { tickProduction } from "./ProductionLogic";
import {
   addProvinceResource,
   addProvinceStat,
   getProvinceGoverningCost,
   getProvinceGovernmentPoint,
   getProvinceIncome,
   getProvinceResource,
   getProvinceStat,
   getProvinceTileCount,
   getRestoration,
   pledgeProvinceConsulVotes,
   setProvinceStat,
   spendProvinceResource,
} from "./ProvinceLogic";
import { TickFamilyMonth } from "./TickLogic";
import { getTileUnrest } from "./TileLogic";
import { getTimedActionCooldownLeft, startTimedAction } from "./TimedActionLogic";
import { ArmyMoraleMonthlyIncrease } from "./WarLogic";

export const PendingGameEventTimeoutMonths = 12;

export function tickProvince(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (getProvinceTileCount(province, save) <= 0) {
      cleanUpProvince(province, save);
      return;
   }
   calculateTilesConnectedToCapital(province, save);
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
      if (config.type === "random") {
         continue;
      }
      if (state.usedEvents.has(key)) {
         continue;
      }
      if (config.condition?.province && !config.condition.province.includes(province)) {
         continue;
      }
      if (config.condition?.playerOnly && province !== save.state.playerProvince) {
         continue;
      }
      if (getGameEventCondition(config.condition, province, save).value) {
         addGameEvent(key, province, save);
         state.usedEvents.add(key);
      }
   }

   state.timedActions.forEach((lastPerformed, action) => {
      const def = TimedActions[action];
      if (def.duration > 0 && lastPerformed + def.duration === save.state.month) {
         def.onEnd?.(province, save);
      }
   });

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

   const monthOfYear = getGameDate(save.state.tick).getMonth();
   if (monthOfYear === TickFamilyMonth) {
      const family = state.governor;
      const result = tickFamily(family, province, save);
      if (!result.family.male) {
         const successor = getSuccessor(province, save);
         if (successor?.male) {
            successor.male.flag = clearFlag(successor.male.flag, PersonFlags.IsHeir);
            state.governor = successor as IGovernorFamily;
            applyGameEffect(NewGovernorEffect, $t(L.$1Event, $t(L.ANewGovernor)), province, save);
            if (province === save.state.playerProvince) {
               showGameEventModal(NewGovernorModal, { province, governor: state.governor });
            }
         } else {
            state.governor = generateRandomGovernor(province, save.state.month);
            applyGameEffect(GovernorWithoutHeirEffect, $t(L.$1Event, $t(L.ANewGovernor)), province, save);
            if (province === save.state.playerProvince) {
               showGameEventModal(GovernorWithoutHeirModal, { province, governor: state.governor });
            }
         }
      } else {
         for (const birth of result.births) {
            if (birth.legitimate) {
               if (province === save.state.playerProvince && !hasFlag(G.flags, GameFlags.Sandbox)) {
                  showGameEventModal(NewChildBornModal, { province, child: birth.child });
               } else {
                  applyGameEffect(
                     randOne([NewChildBornEffects1, NewChildBornEffects2]),
                     $t(L.$1Event, $t(L.AChildIsBorn)),
                     province,
                     save,
                  );
               }
            } else {
               if (province === save.state.playerProvince && !hasFlag(G.flags, GameFlags.Sandbox)) {
                  showGameEventModal(IllegitimateChildModal, {
                     province,
                     familyId: family.id,
                     child: birth.child,
                  });
               } else if (Math.random() > 0.5) {
                  recognizeIllegitimateChild(family.id, birth.child, province, save);
               }
            }
         }
      }
      ensureHeir(province, save);
   }

   for (const [event, data] of state.events) {
      if (save.state.month - data.month >= PendingGameEventTimeoutMonths) {
         const data = GameEvents[event];
         const buttons = getEventButtons(event, province, save);
         if (buttons.length > 0) {
            const button = province === save.state.playerProvince ? buttons[0] : randOne(buttons);
            applyGameEventButton(button, $t(L.$1Event, data.name()), province, save);
         }
         state.events.delete(event);
      }
   }

   const governingCost = getProvinceGoverningCost(province, save).value;
   const christianity = getProvinceResource("christianity", province, save);
   if (
      (christianity > governingCost && !isChristianReligion(state.religion)) ||
      (christianity < governingCost && isChristianReligion(state.religion))
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
         relation.infiltrate.value += getInfiltrationRate(province, save).value;
      } else {
         relation.infiltrate.value = clamp(relation.infiltrate.value - 1, 0, Number.POSITIVE_INFINITY);
      }

      if (relation.improveRelations.active) {
         relation.improveRelations.value = clamp(
            relation.improveRelations.value + getImproveRelationsRate(province, save).value,
            0,
            MaxImprovedRelations,
         );
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
      if (treaty && treaty.type === "Patron") {
         ++relation.patronMonths;
      }
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
   } else {
      setProvinceStat("actualConscription", targetConscription, province, save);
   }

   const morale = getProvinceStat("armyMorale", province, save);
   const maintenance = getProvinceStat("armyMaintenance", province, save);
   if (maintenance > morale) {
      setProvinceStat("armyMorale", clamp(morale + ArmyMoraleMonthlyIncrease, 0, maintenance), province, save);
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
            if (!hasFlag(G.flags, GameFlags.Sandbox) && province === save.state.playerProvince) {
               playSound("shatter");
               showWarning(renderMarkup($t(L.$1IsInRebellion, tile)));
            }
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

   tickRestoration(province, save);
}

export function addGameEvent(event: GameEvent, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.events.set(event, { month: save.state.month });
   startTimedAction("GameEventTimer", province, save);
   if (province === save.state.playerProvince) {
      const achievement = GameEvents[event].achievement;
      if (achievement) {
         unlockAchievement(achievement);
      }
      showGameEventModal(GameEventModal, { event });
   }
}

export function showGameEventModal<Component extends ElementType & PanelIdentity>(
   Component: Component,
   props: NoInfer<ComponentProps<Component>>,
): void {
   if (!hasFlag(G.flags, GameFlags.Sandbox)) {
      showPanel(Component, props);
   }
}

const _restorationShown = new Set<number>();

function tickRestoration(province: Province, save: SaveGame): void {
   const restoration = getRestoration(province, save);
   let used = getProvinceStat("usedRestoration", province, save);
   // In sandbox mode, a random restoration bonus is rolled for everyone, including the player.
   if (!hasFlag(G.flags, GameFlags.Sandbox) && province === save.state.playerProvince) {
      if (restoration > used && !_restorationShown.has(used)) {
         showPanel(RestorationBonusModal, {});
         _restorationShown.add(used);
      }
   } else {
      while (restoration > used) {
         ++used;
         addProvinceStat("usedRestoration", 1, province, save);
         applyGameEffect(
            RestorationBonus[randOne(keysOf(RestorationBonus))].effect,
            $t(L.Restoration$1, numberToRoman(getProvinceStat("usedRestoration", province, save))),
            province,
            save,
         );
      }
   }
}
