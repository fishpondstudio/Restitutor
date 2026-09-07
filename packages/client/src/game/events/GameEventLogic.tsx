import { clamp, entriesOf, filterOf, forEach, isNullOrUndefined, sizeOf } from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { type Province, ProvinceNameOverrides } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { Religion } from "../definitions/Religion";
import { Tech } from "../definitions/Tech";
import { applyGameEffect, getGameEffectDesc } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { type ConditionChecks, defineConditionChecks } from "../logic/Calculation";
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

export const getGameEventCondition = defineConditionChecks(function* (
   condition: IGameEventCondition | undefined,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   if (!condition) {
      return;
   }
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (condition.province) {
      (yield condition.province.has(province))?.describe($t(L.OurProvinceIs$1, getProvinceName(province, save)), {
         hidden: true,
      });
   }
   if (condition.playerOnly) {
      (yield province === save.state.playerProvince)?.describe(
         $t(L.$1IsControlledByPlayer, getProvinceName(province, save)),
         { hidden: true },
      );
   }
   if (condition.year) {
      const [startYear, endYear] = condition.year;
      const currentYear = getGameDate(save.state.tick).getFullYear();
      if (startYear === endYear) {
         (yield currentYear === startYear)?.describe($t(L.In$1AD, startYear));
      } else if (startYear <= Number.NEGATIVE_INFINITY) {
         (yield currentYear >= startYear && currentYear <= endYear)?.describe($t(L.Before$1AD, endYear));
      } else if (endYear >= Number.POSITIVE_INFINITY) {
         (yield currentYear >= startYear && currentYear <= endYear)?.describe($t(L.After$1AD, startYear));
      } else {
         (yield currentYear >= startYear && currentYear <= endYear)?.describe($t(L.Between$1$2AD, startYear, endYear));
      }
   }
   if (condition.religion) {
      (yield condition.religion.has(state.religion))?.describe(
         $t(L.OurReligionIs$1, Array.from(condition.religion, (religion) => Religion[religion].name()).join(", ")),
      );
   }
   if (condition.techs) {
      for (const tech of condition.techs) {
         (yield hasResearched(tech, province, save))?.describe($t(L.$1Researched, Tech[tech].name()));
      }
   }
   if (condition.onMap) {
      let targetProvince: Province;
      for (targetProvince in condition.onMap) {
         const shouldBeOnMap = condition.onMap[targetProvince];
         const isOnMap = !isNullOrUndefined(save.state.provinces[targetProvince]);
         (yield shouldBeOnMap ? isOnMap : !isOnMap)?.describe(
            $t(shouldBeOnMap ? L.$1IsOnTheMap : L.$1IsNotOnTheMap, targetProvince),
         );
      }
   }
   if (condition.nameOverride) {
      (yield state.nameOverride === condition.nameOverride)?.describe(
         $t(L.WeHaveFormed$1, ProvinceNameOverrides[condition.nameOverride]()),
      );
   }
   if (condition.provinceUpgrades) {
      for (const upgrade of condition.provinceUpgrades) {
         (yield hasProvinceUpgrade(upgrade, province, save))?.describe(
            $t(L.Enacted$1, ProvinceUpgrades[upgrade].name()),
         );
      }
   }
   if (condition.annexAndCore) {
      for (const [targetProvince, targetCount] of entriesOf(condition.annexAndCore)) {
         const [annexed, total] = getAnnexedTiles(targetProvince, province, save);
         const count = clamp(targetCount, 0, total);
         (yield annexed >= count)?.describe(
            count < total
               ? $t(L.AnnexAndCore$1TilesOf$2, count, getProvinceName(targetProvince, save))
               : $t(L.AnnexAndCoreAllTilesOf$1, getProvinceName(targetProvince, save)),
            { progress: [annexed, count] },
         );
      }
   }
   if (condition.conditions) {
      yield* condition.conditions(province, save);
   }
});

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
      if (config.condition.province && !config.condition.province.has(province)) {
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
