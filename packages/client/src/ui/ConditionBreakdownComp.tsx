import { formatNumber } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import { areConditionBreakdownsEqual, type ICondition, type IConditionBreakdown } from "../game/actions/GameAction";

export const ConditionBreakdownComp = memo(_ConditionBreakdownComp, (prev, next) => {
   return areConditionBreakdownsEqual(prev.condition, next.condition);
});

function _ConditionBreakdownComp({ condition }: { condition: IConditionBreakdown }): React.ReactNode {
   return condition.breakdown.map((item) => {
      return <ConditionBreakdownRow {...item} key={item.name} />;
   });
}

const ConditionBreakdownRow = memo(_ConditionBreakdownRow, (prev, next) => {
   return (
      prev.name === next.name &&
      prev.value === next.value &&
      prev.desc === next.desc &&
      prev.hidden === next.hidden &&
      prev.progress === next.progress
   );
});

function _ConditionBreakdownRow({ name, value, desc, progress, hidden }: ICondition): React.ReactNode {
   if (hidden) {
      return null;
   }
   return (
      <div className="row ml10 my5 mr5" key={name}>
         <div className="f1">
            <div>{name}</div>
            {desc && <div className="text-xs text-dimmed text-italic">{desc}</div>}
         </div>
         {progress && (
            <div className="text-dimmed">
               {formatNumber(progress[0])}/{formatNumber(progress[1])}
            </div>
         )}
         {value ? <div className="mi xs text-green">check_circle</div> : <div className="mi xs text-red">cancel</div>}
      </div>
   );
}
