import { clamp, formatNumber } from "@project/shared/src/utils/Helper";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type ICondition, type IGameAction } from "../actions/GameAction";
import type { Province, ProvinceResourceCosts } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import { type TimedAction, TimedActions } from "../definitions/TimedAction";
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

export function getTimedActionTimeLeft(timedAction: TimedAction, province: Province, save: SaveGame): number {
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
            name: $t(L.XResearched, Tech[tech].name()),
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
               ? $t(L.XMonthsLeft, formatNumber(cooldownLeft))
               : $t(L.CooldownXMonths, formatNumber(TimedActions[action].cooldown)),
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

export function endTimedAction(action: TimedAction, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const timeLeft = getTimedActionTimeLeft(action, province, save);
   if (timeLeft > 0) {
      state.timedActions.set(action, save.state.month - TimedActions[action].duration);
   }
}

export function TimedActionDescComp({ action }: { action: TimedAction }): React.ReactNode {
   const def = TimedActions[action];
   return (
      <>
         {def.desc && <div className="m10">{html(def.desc())}</div>}
         {def.duration > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Duration)}</div>
               <div className="text-sm text-dimmed">{$t(L.XMonths, formatNumber(def.duration))}</div>
            </div>
         )}
         {def.cooldown > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Cooldown)}</div>
               <div className="text-sm text-dimmed">{$t(L.XMonths, formatNumber(def.cooldown))}</div>
            </div>
         )}
      </>
   );
}

export function createGameAction({
   timedAction,
   cost,
   conditions,
   effect,
   province,
   save,
}: {
   timedAction: TimedAction;
   cost?: ProvinceResourceCosts;
   conditions?: ICondition[];
   effect?: () => void;
   province: Province;
   save: SaveGame;
}): IGameAction {
   return {
      cost: cost,
      condition: finalizeCondition({
         breakdown: [...timedActionConditions({ action: timedAction }, province, save), ...(conditions ?? [])],
      }),
      effect: () => {
         startTimedAction(timedAction, province, save);
         effect?.();
      },
   };
}
