import { cls, formatNumber } from "@project/shared/src/utils/Helper";
import { playSound } from "../Sound";

export function NumberSelect({
   value,
   canIncrease,
   canDecrease,
   onChange,
}: {
   value: number;
   canIncrease: (value: number) => boolean;
   canDecrease: (value: number) => boolean;
   onChange: (value: number) => void;
}) {
   return (
      <div className="row">
         <div
            className={cls("mi", canDecrease(value) ? null : "text-disabled")}
            onClick={() => {
               if (canDecrease(value)) {
                  onChange(value - 1);
               } else {
                  playSound("error");
               }
            }}
         >
            indeterminate_check_box
         </div>
         <div className="text-center">{formatNumber(value)}</div>
         <div
            className={cls("mi", canIncrease(value) ? null : "text-disabled")}
            onClick={() => {
               if (canIncrease(value)) {
                  onChange(value + 1);
               } else {
                  playSound("error");
               }
            }}
         >
            add_box
         </div>
      </div>
   );
}
