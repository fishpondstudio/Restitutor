import { clamp, formatNumber } from "@project/shared/src/utils/Helper";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type ICondition, type IGameAction } from "../actions/GameAction";
import type { Province } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import {
   type TimedAction,
   TimedActions,
   type TimedActionWithDuration,
   type TimedActionWithEffect,
} from "../definitions/TimedAction";
import { applyGameEffect, getGameEffectDesc } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { hasResearched } from "./TechLogic";

export function getTimedActionCooldownLeft(timedAction: TimedAction, province: Province, save: SaveGame): number {
   const config = TimedActions[timedAction];
   const state = save.state.provinces[province];
   if (!state) {
      return Number.POSITIVE_INFINITY;
   }
   const lastPerformed = state.timedActions.get(timedAction);
   if (lastPerformed === undefined) {
      return 0;
   }
   return clamp(lastPerformed + config.cooldown - save.state.month, 0, Number.POSITIVE_INFINITY);
}

function isTimedActionWithPositiveDuration(action: TimedAction): action is TimedActionWithDuration {
   const def = TimedActions[action];
   return "duration" in def && def.duration > 0;
}

export function isTimedActionEndingThisMonth(
   action: TimedAction,
   lastPerformed: number,
   month: number,
): action is TimedActionWithDuration {
   return isTimedActionWithPositiveDuration(action) && lastPerformed + TimedActions[action].duration === month;
}

export function getTimedActionTimeLeft(
   timedAction: TimedActionWithDuration,
   province: Province,
   save: SaveGame,
): number {
   const config = TimedActions[timedAction];
   const state = save.state.provinces[province];
   if (!state) {
      return Number.POSITIVE_INFINITY;
   }
   const lastPerformed = state.timedActions.get(timedAction);
   if (lastPerformed === undefined) {
      return 0;
   }
   return clamp(lastPerformed + config.duration - save.state.month, 0, Number.POSITIVE_INFINITY);
}

export function timedActionConditions(
   {
      action,
      label = $t(L.CurrentlyNotOnCooldown),
      ignoreTech = false,
   }: { action: TimedAction; label?: string; ignoreTech?: boolean },
   province: Province,
   save: SaveGame,
): ICondition[] {
   const result: ICondition[] = [];
   if (!ignoreTech) {
      const tech = TimedActions[action].tech;
      if (tech !== undefined) {
         result.push({
            name: $t(L.$1Researched, Tech[tech].name()),
            value: hasResearched(tech, province, save),
         });
      }
   }
   const cooldownLeft = getTimedActionCooldownLeft(action, province, save);
   const def = TimedActions[action];
   if (def.cooldown > 0) {
      result.push({
         name: label,
         desc:
            cooldownLeft > 0
               ? $t(L.$1MonthsLeft, formatNumber(cooldownLeft))
               : $t(L.Cooldown$1Months, formatNumber(TimedActions[action].cooldown)),
         value: cooldownLeft <= 0,
      });
   }
   return result;
}

export function startTimedAction(action: TimedAction, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.timedActions.set(action, save.state.month);
}

export function endTimedActionAndResetCooldown(
   action: TimedActionWithDuration,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.timedActions.delete(action);
}

export function getTimedActionDesc(action: TimedAction, province: Province, save: SaveGame): React.ReactNode {
   const config = TimedActions[action];
   if ("desc" in config) {
      if (config.desc) {
         return html(config.desc());
      }
      return null;
   }
   if ("effect" in config) {
      return getGameEffectDesc(config.effect, province, save);
   }
}

export function makeGameAction(timedAction: TimedActionWithEffect, province: Province, save: SaveGame): IGameAction {
   const config = TimedActions[timedAction];
   const condition = config.costCondition?.(province, save);
   return {
      cost: condition?.cost,
      condition: finalizeCondition([
         ...timedActionConditions({ action: timedAction }, province, save),
         ...(condition?.condition?.breakdown ?? []),
      ]),
      effect: () => {
         startTimedAction(timedAction, province, save);
         applyGameEffect(config.effect, config.name(), province, save);
      },
   };
}
