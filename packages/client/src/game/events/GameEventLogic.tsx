import {
   filterOf,
   forEach,
   formatDelta,
   formatNumber,
   formatPercent,
   mapOf,
   sizeOf,
} from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type IConditionBreakdown } from "../actions/GameAction";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../actions/ProvinceUpgrades";
import { CasusBelli } from "../definitions/CasusBelli";
import { Goods } from "../definitions/Goods";
import { modifierDurationToString, modifierToString, modifierValueToString } from "../definitions/Modifier";
import {
   type Province,
   ProvinceNameOverrides,
   ProvinceResourceNames,
   ProvinceStatNames,
} from "../definitions/Province";
import { Religion } from "../definitions/Religion";
import { Tech } from "../definitions/Tech";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { addAttitudeModifier, getRelation } from "../logic/DiplomacyLogic";
import {
   addModifier,
   addProvinceResource,
   addProvinceStat,
   generateTrade,
   getAnnexedTiles,
   getProvinceGoverningCost,
   getProvinceIncome,
   getProvinceManpower,
   getProvinceName,
   getProvinceTileCount,
   getWarPower,
} from "../logic/ProvinceLogic";
import { hasResearched } from "../logic/TechLogic";
import { getGameDate } from "../logic/TickLogic";
import { getAllies } from "../logic/TreatyLogic";
import {
   type GameEvent,
   GameEvents,
   type IEventButton,
   type IGameEventCondition,
   type IGameEventConfig,
   type IGameEventImage,
} from "./GameEvents";

export function getEventButtonDesc(button: IEventButton, province: Province, save: SaveGame): React.ReactNode {
   return (
      <>
         {button.provinceUpgrades?.map((upgrade) => (
            <div key={upgrade}>{$t(L.EnactX, ProvinceUpgrades[upgrade].name())}</div>
         ))}
         {button.resources &&
            mapOf(button.resources, (resource, amount) => (
               <div key={resource}>
                  {formatDelta(amount)} {ProvinceResourceNames[resource]()}
               </div>
            ))}
         {button.stats &&
            mapOf(button.stats, (stat, amount) => (
               <div key={stat}>
                  {formatDelta(amount)} {ProvinceStatNames[stat]()}
               </div>
            ))}
         {button.modifiers &&
            mapOf(button.modifiers, (modifier, data) => <div key={modifier}>{modifierToString(modifier, data)}</div>)}
         {button.attitudes &&
            mapOf(filterProvinces(button.attitudes, province, save), (fromProvince, modifier) => (
               <div key={fromProvince}>
                  {$t(
                     L.XYAttitudeTowardsUsForZ,
                     modifierValueToString(modifier),
                     getProvinceName(fromProvince, save),
                     modifierDurationToString(modifier.duration),
                  )}
               </div>
            ))}
         {button.infiltration &&
            mapOf(filterProvinces(button.infiltration, province, save), (fromProvince, amount) => (
               <div key={fromProvince}>
                  {$t(L.XInfiltrationToY, formatDelta(amount), getProvinceName(fromProvince, save))}
               </div>
            ))}
         {button.casusBelli &&
            mapOf(filterProvinces(button.casusBelli, province, save), (fromProvince, data) => (
               <div key={fromProvince}>
                  {$t(
                     L.GainXCasusBelliAgainstYForZ,
                     CasusBelli[data.casusBelli].name(),
                     getProvinceName(fromProvince, save),
                     modifierDurationToString(data.duration),
                  )}
               </div>
            ))}
         {button.trades &&
            mapOf(filterProvinces(button.trades, province, save), (fromProvince, { offer, extraProfit }) => {
               const { trade, profit } = generateTrade(offer, extraProfit, province, save);
               return (
                  <div key={fromProvince}>
                     {$t(
                        L.ATradeWithXWeOfferYTheyOfferZIsArranged,
                        getProvinceName(fromProvince, save),
                        formatNumber(trade.weOfferAmount),
                        offer.weOffer === "gold" ? ProvinceResourceNames.gold() : Goods[offer.weOffer].name(),
                        formatNumber(trade.theyOfferAmount),
                        offer.theyOffer === "gold" ? ProvinceResourceNames.gold() : Goods[offer.theyOffer].name(),
                        formatPercent(profit),
                     )}
                  </div>
               );
            })}
         {button.effects?.map(
            (effect, index) => effect.desc && <div key={index}>{html(effect.desc(province, save))}</div>,
         )}
      </>
   );
}

export function filterProvinces<T>(
   provinces: Partial<Record<Province, T>>,
   province: Province,
   save: SaveGame,
): Partial<Record<Province, T>> {
   return filterOf(provinces, (otherProvince, value) => {
      if (otherProvince === province) {
         return false;
      }
      if (!save.state.provinces[otherProvince]) {
         return false;
      }
      return true;
   });
}

export function getEventButtons(event: GameEvent, province: Province, save: SaveGame): IEventButton[] {
   return GameEvents[event].buttons.filter((button) => {
      if (button.attitudes) {
         if (sizeOf(filterProvinces(button.attitudes, province, save)) === 0) {
            return false;
         }
      }
      if (button.infiltration) {
         if (sizeOf(filterProvinces(button.infiltration, province, save)) === 0) {
            return false;
         }
      }
      if (button.casusBelli) {
         if (sizeOf(filterProvinces(button.casusBelli, province, save)) === 0) {
            return false;
         }
      }
      if (button.trades) {
         if (sizeOf(filterProvinces(button.trades, province, save)) === 0) {
            return false;
         }
      }
      return true;
   });
}

export function applyEventButton(
   button: IEventButton,
   self: IGameEventConfig,
   province: Province,
   save: SaveGame,
): void {
   forEach(button.modifiers, (modifier, data) => {
      addModifier({
         ...data,
         name: $t(L.XEvent, self.name()),
         modifier: modifier,
         province: province,
         save: save,
      });
   });
   forEach(button.resources, (resource, amount) => {
      addProvinceResource(resource, amount, province, save);
   });
   forEach(button.stats, (stat, amount) => {
      addProvinceStat(stat, amount, province, save);
   });
   forEach(filterProvinces(button.attitudes ?? {}, province, save), (fromProvince, modifier) => {
      addAttitudeModifier(fromProvince, province, { ...modifier, name: $t(L.XEvent, self.name()) }, save);
   });
   forEach(filterProvinces(button.infiltration ?? {}, province, save), (fromProvince, amount) => {
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.infiltrate.value += amount;
      }
   });
   forEach(filterProvinces(button.casusBelli ?? {}, province, save), (fromProvince, data) => {
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.casusBelli.set(data.casusBelli, { monthsLeft: data.duration });
      }
   });
   forEach(filterProvinces(button.trades ?? {}, province, save), (fromProvince, data) => {
      const { trade } = generateTrade(data.offer, data.extraProfit, province, save);
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.trade = {
            ...trade,
            monthsLeft: TimedActions.TradeGoods.duration,
         };
      }
   });
   button.effects?.forEach((effect) => {
      effect.effect?.(province, save);
   });
}

export function getGameEventCondition(
   condition: IGameEventCondition | undefined,
   province: Province,
   save: SaveGame,
): IConditionBreakdown {
   const result: IConditionBreakdown = {
      value: false,
      breakdown: [],
   };
   if (!condition) {
      return result;
   }
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   if (condition.year) {
      const [startYear, endYear] = condition.year;
      const currentYear = getGameDate(save.state.tick).getFullYear();
      if (startYear === endYear) {
         result.breakdown.push({
            name: $t(L.InXAD, condition.year[0]),
            value: currentYear === startYear,
         });
      } else if (startYear <= Number.NEGATIVE_INFINITY) {
         result.breakdown.push({
            name: $t(L.BeforeXAD, condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else if (endYear >= Number.POSITIVE_INFINITY) {
         result.breakdown.push({
            name: $t(L.AfterXAD, condition.year[0]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else {
         result.breakdown.push({
            name: $t(L.BetweenXYAD, condition.year[0], condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      }
   }
   if (condition.monthlyRevenue) {
      const monthlyRevenue = getProvinceIncome(province, save).revenue.value;
      result.breakdown.push({
         name: $t(L.ReachXMonthlyRevenue, formatNumber(condition.monthlyRevenue)),
         value: monthlyRevenue >= condition.monthlyRevenue,
         progress: [monthlyRevenue, condition.monthlyRevenue],
      });
   }
   if (condition.manpower) {
      const manpower = getProvinceManpower(province, save).value;
      result.breakdown.push({
         name: $t(L.ReachXManpower, formatNumber(condition.manpower)),
         value: manpower >= condition.manpower,
         progress: [manpower, condition.manpower],
      });
   }
   if (condition.techCount) {
      const technologies = state.unlockedTech.size;
      result.breakdown.push({
         name: $t(L.ResearchXTechnologies, formatNumber(condition.techCount)),
         value: technologies >= condition.techCount,
         progress: [technologies, condition.techCount],
      });
   }
   if (condition.allyCount) {
      const allies = getAllies(province, save).length;
      result.breakdown.push({
         name: $t(L.HaveAtLeastXAllies, formatNumber(condition.allyCount)),
         value: allies >= condition.allyCount,
         progress: [allies, condition.allyCount],
      });
   }
   if (condition.warPower) {
      const warPower = getWarPower(province, save).value;
      result.breakdown.push({
         name: $t(L.ReachXWarPower, formatNumber(condition.warPower)),
         value: warPower >= condition.warPower,
         progress: [warPower, condition.warPower],
      });
   }
   if (condition.religion) {
      result.breakdown.push({
         name: $t(L.OurReligionIsX, Religion[condition.religion].name()),
         value: state.religion === condition.religion,
      });
   }
   if (condition.techs) {
      condition.techs.forEach((tech) => {
         result.breakdown.push({
            name: $t(L.XResearched, Tech[tech].name()),
            value: hasResearched(tech, province, save),
         });
      });
   }
   if (condition.province) {
      result.breakdown.push({
         name: $t(L.OurProvinceIsX, getProvinceName(province, save)),
         value: condition.province.includes(province),
         hidden: true,
      });
   }
   if (condition.nameOverride) {
      result.breakdown.push({
         name: $t(L.WeHaveFormedX, ProvinceNameOverrides[condition.nameOverride]()),
         value: state.nameOverride === condition.nameOverride,
      });
   }
   if (condition.provinceUpgrades) {
      condition.provinceUpgrades.forEach((upgrade) => {
         result.breakdown.push({
            name: $t(L.EnactedX, ProvinceUpgrades[upgrade].name()),
            value: hasProvinceUpgrade(upgrade, province, save),
         });
      });
   }
   if (condition.coreTiles) {
      condition.coreTiles.forEach((coreTile) => {
         const [annexed, total] = getAnnexedTiles(coreTile.province, province, save);
         const count = coreTile.count ?? total;
         result.breakdown.push({
            name: coreTile.count
               ? $t(L.OccupyAndCoreXTilesOfY, count, getProvinceName(coreTile.province, save))
               : $t(L.OccupyAndCoreAllTilesOfX, getProvinceName(coreTile.province, save)),
            value: annexed >= count,
            progress: [annexed, count],
         });
      });
   }
   if (condition.coreTileCount) {
      const tileCount = getProvinceTileCount(province, save);
      result.breakdown.push({
         name: $t(L.HaveAtLeastXCoreTiles, formatNumber(condition.coreTileCount)),
         value: tileCount >= condition.coreTileCount,
         progress: [tileCount, condition.coreTileCount],
      });
   }
   if (condition.governingCost) {
      const governingCost = getProvinceGoverningCost(province, save).value;
      result.breakdown.push({
         name: $t(L.ReachXGoverningCost, formatNumber(condition.governingCost)),
         value: governingCost >= condition.governingCost,
         progress: [governingCost, condition.governingCost],
      });
   }
   if (condition.conditions) {
      condition.conditions(province, save).forEach((item) => {
         result.breakdown.push(item);
      });
   }
   return finalizeCondition(result);
}

export function getAvailableEvents(province: Province, showAll: boolean, save: SaveGame): GameEvent[] {
   const result: GameEvent[] = [];
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   const usedEvents = state.usedEvents;
   forEach(GameEvents, (key, config) => {
      if (config.type === "manual") {
         return;
      }
      if (config.type === "random") {
         return;
      }
      if (usedEvents.has(key)) {
         return;
      }
      if (!config.condition) {
         return;
      }
      if (config.condition.year) {
         const [startYear, endYear] = config.condition.year;
         if (showAll) {
            if (startYear === endYear && sizeOf(config.condition) === 1) {
               return;
            }
         } else {
            const currentYear = getGameDate(save.state.tick).getFullYear();
            if (currentYear < startYear || currentYear > endYear) {
               return;
            }
         }
      }
      if (config.condition.province && !config.condition.province.includes(province)) {
         return;
      }
      if (config.condition.nameOverride) {
         if (state.nameOverride !== config.condition.nameOverride) {
            return;
         }
      }
      result.push(key);
   });
   return result;
}

export function getGameEventImages(): IGameEventImage[] {
   const result: IGameEventImage[] = [];
   forEach(GameEvents, (_key, config) => {
      if (config.image) {
         result.push(config.image);
      }
   });
   return result;
}
