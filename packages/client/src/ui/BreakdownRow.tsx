import { cls, formatDelta, formatNumber, formatPercent, formatPercentDelta } from "@project/shared/src/utils/Helper";
import type { IValueBreakdown } from "../game/actions/GameAction";
import { BreakdownComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";

export function BreakdownRow({
   name,
   tooltip,
   breakdown,
   className,
   formatFunc = formatNumber,
}: {
   name: React.ReactNode;
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   breakdown: IValueBreakdown;
   className?: string;
   formatFunc?: (value: number) => React.ReactNode;
}): React.ReactNode {
   return (
      <BreakdownTooltip breakdown={breakdown} tooltip={tooltip} formatFunc={formatFunc}>
         <div className={cls("row", className)}>
            <div className="f1">{name}</div>
            <div>{formatFunc(breakdown.value)}</div>
         </div>
      </BreakdownTooltip>
   );
}

export function BreakdownTooltip({
   breakdown,
   tooltip,
   children,
   formatFunc = formatDelta,
}: React.PropsWithChildren<{
   breakdown: IValueBreakdown;
   tooltip?: (element: React.ReactNode) => React.ReactNode;
   formatFunc?: (value: number) => React.ReactNode;
}>): React.ReactNode {
   let formatDeltaFunc = formatFunc;
   if (formatFunc === formatPercent) {
      formatDeltaFunc = formatPercentDelta;
   }
   if (formatFunc === formatNumber) {
      formatDeltaFunc = formatDelta;
   }
   return (
      <FloatingTip
         label={
            tooltip ? (
               tooltip(<BreakdownComp breakdown={breakdown} formatFunc={formatDeltaFunc} />)
            ) : (
               <BreakdownComp breakdown={breakdown} formatFunc={formatDeltaFunc} />
            )
         }
         w={300}
         className="p0"
      >
         {children}
      </FloatingTip>
   );
}
