import type React from "react";
import { Fragment, memo } from "react";
import type { IChronicleEntry } from "../game/definitions/Chronicle";
import { monthToDate } from "../game/logic/TickLogic";
import { FloatingTip } from "./components/FloatingTip";
import { renderMarkup } from "./ParseMarkup";

export const ChronicleEntryComp = memo(_ChronicleEntryComp, (prev, next) => {
   return prev.entry.id === next.entry.id;
});

function _ChronicleEntryComp({ entry }: { entry: IChronicleEntry }): React.ReactNode {
   const date = monthToDate(entry.month);
   return (
      <Fragment>
         <div className="m10 row">
            <FloatingTip label={date.toLocaleDateString()}>
               <div className="box text-sm text-center col stretch" style={{ width: 50, height: 50 }}>
                  <div>{date.getFullYear()}</div>
                  <div className="divider" />
                  <div className="f1 cc text-lg">{date.getMonth() + 1}</div>
               </div>
            </FloatingTip>
            <div className="f1">
               <div>{renderMarkup(entry.content)}</div>
            </div>
         </div>
         <div className="divider"></div>
      </Fragment>
   );
}
