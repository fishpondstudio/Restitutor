import { cls } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import {
   areConditionBreakdownsEqual,
   areProvinceCostsEqual,
   type IConditionBreakdown,
   type IGameAction,
} from "../game/actions/GameAction";
import type { ProvinceResourceCosts } from "../game/definitions/Province";
import { type TimedAction, TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { hasEnoughProvinceResources, trySpendProvinceResources } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionLogic";
import { useDebugKey } from "../game/Shortcut";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { ResourceCostComp } from "./ResourceCostComp";
import { playClick, playError } from "./Sound";

export function TimedActionButton({
   timedAction,
   id,
   className,
}: {
   timedAction: TimedAction;
   id?: string;
   className?: string;
}): React.ReactNode {
   const config = TimedActions[timedAction];
   if (!("action" in config)) {
      console.error(`TimedActionButton requires a defined action: ${timedAction}`);
      return null;
   }
   return (
      <ActionButton
         id={id}
         className={className}
         action={config.action(G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action={timedAction} />
               {element}
            </>
         )}
      >
         {config.name()}
      </ActionButton>
   );
}

export function ActionButton({
   action,
   tooltip,
   children,
   className,
   id,
   style,
}: React.PropsWithChildren<{
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   className?: string;
   id?: string;
   style?: React.CSSProperties;
   action: IGameAction;
}>): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const { cost, condition, effect } = action;
   const isConditionMet = condition === undefined || condition.value === true;
   const hasEnoughResources =
      cost === undefined || hasEnoughProvinceResources(cost, G.save.state.playerProvince, G.save);
   const isDebug = useDebugKey();
   return (
      <button
         id={id}
         className={cls("btn", className)}
         style={style}
         disabled={!isDebug && (!isConditionMet || !hasEnoughResources)}
         onClick={() => {
            if (
               isDebug ||
               ((condition === undefined || condition.value === true) &&
                  (cost === undefined || trySpendProvinceResources(cost, G.save.state.playerProvince, G.save)))
            ) {
               playClick();
               effect({ headless: false });
               GameStateUpdated.emit();
            } else {
               playError();
            }
         }}
      >
         <ActionButtonContent condition={condition} cost={cost} tooltip={tooltip}>
            {children}
         </ActionButtonContent>
      </button>
   );
}

const ActionButtonTooltip = memo(_ActionButtonTooltip, (prev, next) => {
   return areConditionBreakdownsEqual(prev.condition, next.condition) && areProvinceCostsEqual(prev.cost, next.cost);
});

function _ActionButtonTooltip({
   condition,
   cost,
}: {
   condition: IConditionBreakdown | undefined;
   cost: ProvinceResourceCosts | undefined;
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
      </>
   );
}

const ActionButtonContent = memo(_ActionButtonContent, (prev, next) => {
   return (
      prev.children === next.children &&
      prev.tooltip === next.tooltip &&
      areConditionBreakdownsEqual(prev.condition, next.condition) &&
      areProvinceCostsEqual(prev.cost, next.cost)
   );
});

function _ActionButtonContent({
   children,
   tooltip,
   condition,
   cost,
}: React.PropsWithChildren<{
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   condition: IConditionBreakdown | undefined;
   cost: ProvinceResourceCosts | undefined;
}>): React.ReactNode {
   const tooltipContent = <ActionButtonTooltip condition={condition} cost={cost} />;
   return (
      <FloatingTip label={tooltip ? tooltip(tooltipContent) : tooltipContent} w={300} className="p0">
         <div>{children}</div>
      </FloatingTip>
   );
}
