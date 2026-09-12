import { cls, formatDelta, formatNumber, formatPercent, formatPercentDelta } from "@project/shared/src/utils/Helper";
import { ArmyUnitNames, ArmyUnits, type IWarPowerBreakdown } from "../game/logic/ArmyLogic";
import { $t, L } from "../utils/i18n";
import { BreakdownComp, ValueListComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";

export function WarPowerRow({
   name,
   breakdown,
   className,
}: {
   name: React.ReactNode;
   breakdown: IWarPowerBreakdown;
   className?: string;
}): React.ReactNode {
   return (
      <WarPowerTooltip breakdown={breakdown}>
         <div className={cls("row", className)}>
            <div className="f1">{name}</div>
            <div>{formatNumber(breakdown.total.value)}</div>
         </div>
      </WarPowerTooltip>
   );
}

export function WarPowerTooltip({
   breakdown,
   tooltip,
   children,
}: React.PropsWithChildren<{
   breakdown: IWarPowerBreakdown;
   tooltip?: (element: React.ReactNode) => React.ReactNode;
}>): React.ReactNode {
   return (
      <FloatingTip
         className="p0"
         fixedWidth
         label={() => {
            const content = <WarPowerDetails breakdown={breakdown} />;
            return tooltip ? tooltip(content) : content;
         }}
      >
         {children}
      </FloatingTip>
   );
}

function WarPowerDetails({ breakdown }: { breakdown: IWarPowerBreakdown }): React.ReactNode {
   return (
      <>
         {ArmyUnits.map((unit) => (
            <div className="box my10 mx5" key={unit}>
               <div className="h2 row">
                  <div>{ArmyUnitNames[unit]()}</div>
                  <div className="f1" />
                  <div>{formatDelta(breakdown[unit].value)}</div>
               </div>
               <ValueListComp items={breakdown[unit].add} reverse={breakdown[unit].reverse} formatFunc={formatDelta} />
               <div className="h3 row">
                  <div>{$t(L.Effectiveness)}</div>
                  <div className="f1" />
                  <div>{formatPercent(breakdown[unit].totalMultiply)}</div>
               </div>
               <ValueListComp
                  items={breakdown[unit].multiply}
                  reverse={breakdown[unit].reverse}
                  formatFunc={formatPercentDelta}
               />
            </div>
         ))}
         <BreakdownComp breakdown={breakdown.total} options={{ hideAdditiveHeader: true }} />
      </>
   );
}
