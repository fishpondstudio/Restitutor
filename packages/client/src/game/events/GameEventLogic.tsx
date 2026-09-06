import { clamp, entriesOf, filterOf, forEach, isNullOrUndefined, sizeOf } from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type ICondition, type IConditionBreakdown } from "../actions/GameAction";
import { type Province, ProvinceNameOverrides } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { Religion } from "../definitions/Religion";
import { Tech } from "../definitions/Tech";
import { applyGameEffect, getGameEffectDesc } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { getGameDate } from "../logic/GameDateTime";
import { getAnnexedTiles, getProvinceName } from "../logic/ProvinceLogic";
import { hasResearched } from "../logic/TechLogic";
import { type GameEvent, GameEvents, type IGameEventButton, type IGameEventCondition } from "./GameEvents";
import type { ImageWithCredit } from "./ImageWithCredit";

export function getGameEventButtonDesc(button: IGameEventButton, province: Province, save: SaveGame): React.ReactNode {
   return (
      <div className="col-gap-5">
         {getGameEffectDesc(button, province, save)}
         {button.custom?.map(
            (effect, index) => effect.desc && <div key={index}>{html(effect.desc(province, save))}</div>,
         )}
      </div>
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
   return GameEvents[event].buttons.flatMap((_button) => {
      const button = cloneGameEventButton(_button);
      if (button.attitudes) {
         button.attitudes = filterProvinces(button.attitudes, province, save);
         if (sizeOf(button.attitudes) === 0) {
            // biome-ignore lint/performance/noDelete: Ignore
            delete button.attitudes;
         }
      }
      if (button.infiltration) {
         button.infiltration = filterProvinces(button.infiltration, province, save);
         if (sizeOf(button.infiltration) === 0) {
            // biome-ignore lint/performance/noDelete: Ignore
            delete button.infiltration;
         }
      }
      if (button.casusBelli) {
         button.casusBelli = filterProvinces(button.casusBelli, province, save);
         if (sizeOf(button.casusBelli) === 0) {
            // biome-ignore lint/performance/noDelete: Ignore
            delete button.casusBelli;
         }
      }
      if (button.trades) {
         button.trades = filterProvinces(button.trades, province, save);
         if (sizeOf(button.trades) === 0) {
            // biome-ignore lint/performance/noDelete: Ignore
            delete button.trades;
         }
      }
      if (sizeOf(button) > 1) {
         return [button];
      }
      return [];
   });
}

export function getGameEventCondition(
   condition: IGameEventCondition | undefined,
   province: Province,
   save: SaveGame,
): IConditionBreakdown {
   const result: ICondition[] = [];
   if (!condition) {
      return finalizeCondition(result);
   }
   const state = save.state.provinces[province];
   if (!state) {
      return finalizeCondition(result);
   }
   if (condition.province) {
      result.push({
         name: $t(L.OurProvinceIs$1, getProvinceName(province, save)),
         value: condition.province.includes(province),
         hidden: true,
      });
   }
   if (condition.playerOnly) {
      result.push({
         name: $t(L.$1IsControlledByPlayer, getProvinceName(province, save)),
         value: province === save.state.playerProvince,
         hidden: true,
      });
   }
   if (condition.year) {
      const [startYear, endYear] = condition.year;
      const currentYear = getGameDate(save.state.tick).getFullYear();
      if (startYear === endYear) {
         result.push({
            name: $t(L.In$1AD, condition.year[0]),
            value: currentYear === startYear,
         });
      } else if (startYear <= Number.NEGATIVE_INFINITY) {
         result.push({
            name: $t(L.Before$1AD, condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else if (endYear >= Number.POSITIVE_INFINITY) {
         result.push({
            name: $t(L.After$1AD, condition.year[0]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      } else {
         result.push({
            name: $t(L.Between$1$2AD, condition.year[0], condition.year[1]),
            value: currentYear >= startYear && currentYear <= endYear,
         });
      }
   }
   if (condition.religion) {
      result.push({
         name: $t(L.OurReligionIs$1, condition.religion.map((religion) => Religion[religion].name()).join(", ")),
         value: condition.religion.includes(state.religion),
      });
   }
   if (condition.techs) {
      condition.techs.forEach((tech) => {
         result.push({
            name: $t(L.$1Researched, Tech[tech].name()),
            value: hasResearched(tech, province, save),
         });
      });
   }
   if (condition.onMap) {
      forEach(condition.onMap, (province, value) => {
         result.push(
            value
               ? {
                    name: $t(L.$1IsOnTheMap, province),
                    value: !isNullOrUndefined(save.state.provinces[province]),
                 }
               : {
                    name: $t(L.$1IsNotOnTheMap, province),
                    value: isNullOrUndefined(save.state.provinces[province]),
                 },
         );
      });
   }
   if (condition.nameOverride) {
      result.push({
         name: $t(L.WeHaveFormed$1, ProvinceNameOverrides[condition.nameOverride]()),
         value: state.nameOverride === condition.nameOverride,
      });
   }
   if (condition.provinceUpgrades) {
      condition.provinceUpgrades.forEach((upgrade) => {
         result.push({
            name: $t(L.Enacted$1, ProvinceUpgrades[upgrade].name()),
            value: hasProvinceUpgrade(upgrade, province, save),
         });
      });
   }
   if (condition.annexAndCore) {
      forEach(condition.annexAndCore, (targetProvince, _count) => {
         const [annexed, total] = getAnnexedTiles(targetProvince, province, save);
         const count = clamp(_count, 0, total);
         result.push({
            name:
               count < total
                  ? $t(L.AnnexAndCore$1TilesOf$2, count, getProvinceName(targetProvince, save))
                  : $t(L.AnnexAndCoreAllTilesOf$1, getProvinceName(targetProvince, save)),
            value: annexed >= count,
            progress: [annexed, count],
         });
      });
   }
   if (condition.conditions) {
      condition.conditions(province, save).forEach((item) => {
         result.push(item);
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
      if (config.condition.onMap) {
         for (const [province, value] of entriesOf(config.condition.onMap)) {
            if (value === true && isNullOrUndefined(save.state.provinces[province])) {
               return;
            }
            if (value === false && !isNullOrUndefined(save.state.provinces[province])) {
               return;
            }
         }
      }
      if (config.condition.playerOnly && province !== save.state.playerProvince) {
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

export function getGameEventImages(): ImageWithCredit[] {
   const result: ImageWithCredit[] = [];
   forEach(GameEvents, (_key, config) => {
      if (config.image) {
         result.push(config.image);
      }
   });
   return result;
}

export function cloneGameEventButton(button: IGameEventButton): IGameEventButton {
   const cloned = JSON.parse(JSON.stringify(button)) as IGameEventButton;
   if (button.label) {
      cloned.label = button.label;
   }
   if (button.custom) {
      cloned.custom = button.custom;
   }
   return cloned;
}
