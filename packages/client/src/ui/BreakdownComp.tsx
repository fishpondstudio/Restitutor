import { cls, formatDelta, formatPercent, formatPercentDelta } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import { areValueBreakdownsEqual, type IValueBreakdown, type IValueBreakdownItem } from "../game/actions/GameAction";
import { $t, L } from "../utils/i18n";

export const BreakdownComp = memo(_BreakdownComp, (prev, next) => {
   return areValueBreakdownsEqual(prev.breakdown, next.breakdown);
});

function _BreakdownComp({
   breakdown,
   formatFunc = formatDelta,
}: {
   breakdown: IValueBreakdown;
   formatFunc?: (value: number) => React.ReactNode;
}): React.ReactNode {
   const hasMultiply = breakdown.multiply.length > 0 || breakdown.multiplyBase.value !== 1;
   return (
      <>
         {hasMultiply && (
            <div className="h3 row g0">
               <div className="f1">{$t(L.Additive)}</div>
               <div>{formatFunc(breakdown.totalAdd)}</div>
            </div>
         )}
         <ValueListComp items={breakdown.add} reverse={breakdown.reverse} formatFunc={formatFunc} />
         {hasMultiply && (
            <>
               <div className="h3 row g0">
                  <div className="f1">{$t(L.Multiplicative)}</div>
                  <div>{formatPercent(breakdown.totalMultiply)}</div>
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{breakdown.multiplyBase.name}</div>
                  <div>{formatPercent(breakdown.multiplyBase.value)}</div>
               </div>
               <ValueListComp items={breakdown.multiply} reverse={breakdown.reverse} formatFunc={formatPercentDelta} />
            </>
         )}
         <div className="h3 row">
            <div className="mi xs">equal</div>
            <div className="f1" />
            <div>{formatFunc(breakdown.value)}</div>
         </div>
      </>
   );
}

export function ValueListComp({
   items,
   reverse = false,
   formatFunc = formatDelta,
}: {
   items: IValueBreakdownItem[];
   reverse?: boolean;
   formatFunc?: (value: number) => React.ReactNode;
}): React.ReactNode {
   return items.map((item, i) => {
      return <ValueBreakdownItemComp item={item} index={i} reverse={reverse} formatFunc={formatFunc} key={i} />;
   });
}

function _ValueBreakdownItemComp({
   item,
   index,
   reverse = false,
   formatFunc,
}: {
   item: IValueBreakdownItem;
   index: number;
   reverse: boolean;
   formatFunc: (value: number) => React.ReactNode;
}): React.ReactNode {
   return (
      <div className="row mx10 my5">
         <div className="f1">
            <div>{item.name}</div>
            {item.desc && <div className="text-xs text-dimmed text-italic">{item.desc}</div>}
         </div>
         <div className={cls(item.value * (reverse ? -1 : 1) > 0 ? "text-green" : "text-red")}>
            {formatFunc(item.value)}
         </div>
      </div>
   );
}

const ValueBreakdownItemComp = memo(_ValueBreakdownItemComp, (prev, next) => {
   return (
      prev.item.name === next.item.name &&
      prev.item.value === next.item.value &&
      prev.item.desc === next.item.desc &&
      prev.reverse === next.reverse
   );
});
