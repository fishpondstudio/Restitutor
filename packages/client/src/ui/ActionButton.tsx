import { cls } from "@project/shared/src/utils/Helper";
import { deepEqual } from "fast-equals";
import { memo } from "react";
import type { IConditionBreakdown, IGameAction } from "../game/actions/GameAction";
import type { ProvinceResourceCosts } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { applyGameEffect, getGameEffectDesc, type IGameEffect } from "../game/GameEffect";
import { hasEnoughProvinceResources, trySpendProvinceResources } from "../game/logic/ProvinceLogic";
import { useDebugKey } from "../game/Shortcut";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { ResourceCostComp } from "./ResourceCostComp";
import { playSound, type SoundClip } from "./Sound";

export function ActionButton({
   action,
   tooltip,
   children,
   className,
   id,
   style,
   sound = "click",
}: React.PropsWithChildren<{
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   className?: string;
   id?: string;
   style?: React.CSSProperties;
   sound?: SoundClip;
   action: () => IGameAction;
}>): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const { cost, condition, effect } = action();
   const isConditionMet = condition === undefined || condition.value === true;
   const hasEnoughResources =
      cost === undefined || hasEnoughProvinceResources(cost, G.save.state.playerProvince, G.save);
   const isDebug = useDebugKey();
   return (
      <button
         id={id}
         data-skip-sound={true}
         className={cls("btn", className)}
         style={style}
         disabled={!isDebug && (!isConditionMet || !hasEnoughResources)}
         onClick={() => {
            const { cost, condition, effect, execute } = action();
            if (
               isDebug ||
               ((condition === undefined || condition.value === true) &&
                  (cost === undefined || trySpendProvinceResources(cost, G.save.state.playerProvince, G.save)))
            ) {
               execute({ headless: false });
               if (effect) {
                  applyGameEffect(effect, effect.name, G.save.state.playerProvince, G.save);
               }
               GameStateUpdated.emit();
               playSound(sound);
            } else {
               playSound("error");
            }
         }}
      >
         <ActionButtonContent condition={condition} cost={cost} effect={effect} tooltip={tooltip}>
            {children}
         </ActionButtonContent>
      </button>
   );
}

const ActionButtonTooltip = memo(_ActionButtonTooltip, (prev, next) => {
   return (
      deepEqual(prev.condition, next.condition) &&
      deepEqual(prev.cost, next.cost) &&
      deepEqual(prev.effect, next.effect)
   );
});

function _ActionButtonTooltip({
   condition,
   cost,
   effect,
}: {
   condition: IConditionBreakdown | undefined;
   cost: ProvinceResourceCosts | undefined;
   effect: IGameEffect | undefined;
}): React.ReactNode {
   return (
      <>
         {condition && (
            <>
               <div className="h2">{$t(L.TheFollowingConditionsMustBeMet)}</div>
               <ConditionBreakdownComp condition={condition} />
            </>
         )}
         {cost && (
            <>
               <div className="h2">{$t(L.TheFollowingResourcesWillBeSpent)}</div>
               <ResourceCostComp cost={cost} />
            </>
         )}
         {effect && (
            <>
               <div className="h2">{$t(L.TheFollowingEffectsWillBeApplied)}</div>
               <div className="m10">{getGameEffectDesc(effect, G.save.state.playerProvince, G.save)}</div>
            </>
         )}
      </>
   );
}

const ActionButtonContent = memo(_ActionButtonContent, (prev, next) => {
   return (
      prev.children === next.children &&
      prev.tooltip === next.tooltip &&
      deepEqual(prev.condition, next.condition) &&
      deepEqual(prev.cost, next.cost) &&
      deepEqual(prev.effect, next.effect)
   );
});

function _ActionButtonContent({
   children,
   tooltip,
   condition,
   cost,
   effect,
}: React.PropsWithChildren<{
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   condition: IConditionBreakdown | undefined;
   cost: ProvinceResourceCosts | undefined;
   effect: IGameEffect | undefined;
}>): React.ReactNode {
   return (
      <FloatingTip
         label={() => {
            const tooltipContent = <ActionButtonTooltip condition={condition} cost={cost} effect={effect} />;
            return tooltip ? tooltip(tooltipContent) : tooltipContent;
         }}
         fixedWidth
         className="p0"
      >
         <div data-skip-sound={true}>{children}</div>
      </FloatingTip>
   );
}
