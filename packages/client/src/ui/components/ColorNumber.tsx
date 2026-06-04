import { cls, formatDelta } from "@project/shared/src/utils/Helper";

export function colorNumber(value: number, reverse = false, defaultSign = "+"): React.ReactNode {
   let className = "";
   const val = value * (reverse ? -1 : 1);
   if (val > 0) {
      className = "text-green";
   } else if (val < 0) {
      className = "text-red";
   }
   return <span className={cls(className)}>{formatDelta(value, defaultSign)}</span>;
}

export function colorNumberReverse(value: number): React.ReactNode {
   return colorNumber(value, true);
}
