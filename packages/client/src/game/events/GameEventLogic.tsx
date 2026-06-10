import { filterOf, forEach, formatNumber, sizeOf } from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type IConditionBreakdown } from "../actions/GameAction";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../actions/ProvinceUpgrades";
import { type Province, ProvinceNameOverrides } from "../definitions/Province";
import { Religion } from "../definitions/Religion";
import { Tech } from "../definitions/Tech";
import { applyGameEffect, getGameEffectDesc } from "../GameEffect";
import type { SaveGame } from "../GameState";
import {
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
   type IGameEventButton,
   type IGameEventCondition,
   type IGameEventImage,
} from "./GameEvents";

export function getGameEventButtonDesc(button: IGameEventButton, province: Province, save: SaveGame): React.ReactNode {
   return (
      <>
         {getGameEffectDesc(button, province, save)}
         {button.custom?.map(
            (effect, index) => effect.desc && <div key={index}>{html(effect.desc(province, save))}</div>,
         )}
      </>
   );
}

export function applyGameEventButton(
   button: IGameEventButton,
   source: string,
   province: Province,
   save: SaveGame,
): void {
   applyGameEffect(button, source, province, save);
   button.custom?.forEach((effect) => {
      effect.effect?.(province, save);
   });
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

export function getEventButtons(event: GameEvent, province: Province, save: SaveGame): IGameEventButton[] {
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
            name: $t(L.In$1AD, condition.year[0]),
            value: currentYear === startYear,
         });
      } else if (startYear <= Number.NEGATIVE_INFINITY) {
         result.breakdown.push({
            name: $t(L.Before$1AD, condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else if (endYear >= Number.POSITIVE_INFINITY) {
         result.breakdown.push({
            name: $t(L.After$1AD, condition.year[0]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else {
         result.breakdown.push({
            name: $t(L.Between$1$2AD, condition.year[0], condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      }
   }
   if (condition.monthlyRevenue) {
      const monthlyRevenue = getProvinceIncome(province, save).revenue.value;
      result.breakdown.push({
         name: $t(L.Reach$1MonthlyRevenue, formatNumber(condition.monthlyRevenue)),
         value: monthlyRevenue >= condition.monthlyRevenue,
         progress: [monthlyRevenue, condition.monthlyRevenue],
      });
   }
   if (condition.manpower) {
      const manpower = getProvinceManpower(province, save).value;
      result.breakdown.push({
         name: $t(L.Reach$1Manpower, formatNumber(condition.manpower)),
         value: manpower >= condition.manpower,
         progress: [manpower, condition.manpower],
      });
   }
   if (condition.techCount) {
      const technologies = state.unlockedTech.size;
      result.breakdown.push({
         name: $t(L.Research$1Technologies, formatNumber(condition.techCount)),
         value: technologies >= condition.techCount,
         progress: [technologies, condition.techCount],
      });
   }
   if (condition.allyCount) {
      const allies = getAllies(province, save).length;
      result.breakdown.push({
         name: $t(L.HaveAtLeast$1Allies, formatNumber(condition.allyCount)),
         value: allies >= condition.allyCount,
         progress: [allies, condition.allyCount],
      });
   }
   if (condition.warPower) {
      const warPower = getWarPower(province, save).value;
      result.breakdown.push({
         name: $t(L.Reach$1WarPower, formatNumber(condition.warPower)),
         value: warPower >= condition.warPower,
         progress: [warPower, condition.warPower],
      });
   }
   if (condition.religion) {
      result.breakdown.push({
         name: $t(L.OurReligionIs$1, Religion[condition.religion].name()),
         value: state.religion === condition.religion,
      });
   }
   if (condition.techs) {
      condition.techs.forEach((tech) => {
         result.breakdown.push({
            name: $t(L.$1Researched, Tech[tech].name()),
            value: hasResearched(tech, province, save),
         });
      });
   }
   if (condition.province) {
      result.breakdown.push({
         name: $t(L.OurProvinceIs$1, getProvinceName(province, save)),
         value: condition.province.includes(province),
         hidden: true,
      });
   }
   if (condition.nameOverride) {
      result.breakdown.push({
         name: $t(L.WeHaveFormed$1, ProvinceNameOverrides[condition.nameOverride]()),
         value: state.nameOverride === condition.nameOverride,
      });
   }
   if (condition.provinceUpgrades) {
      condition.provinceUpgrades.forEach((upgrade) => {
         result.breakdown.push({
            name: $t(L.Enacted$1, ProvinceUpgrades[upgrade].name()),
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
               ? $t(L.OccupyAndCore$1TilesOf$2, count, getProvinceName(coreTile.province, save))
               : $t(L.OccupyAndCoreAllTilesOf$1, getProvinceName(coreTile.province, save)),
            value: annexed >= count,
            progress: [annexed, count],
         });
      });
   }
   if (condition.coreTileCount) {
      const tileCount = getProvinceTileCount(province, save);
      result.breakdown.push({
         name: $t(L.HaveAtLeast$1CoreTiles, formatNumber(condition.coreTileCount)),
         value: tileCount >= condition.coreTileCount,
         progress: [tileCount, condition.coreTileCount],
      });
   }
   if (condition.governingCost) {
      const governingCost = getProvinceGoverningCost(province, save).value;
      result.breakdown.push({
         name: $t(L.Reach$1GoverningCost, formatNumber(condition.governingCost)),
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
