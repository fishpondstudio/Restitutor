import type React from "react";
import { Fragment, memo } from "react";
import type { IChronicleEntry } from "../game/definitions/Chronicle";
import { monthToDate } from "../game/logic/GameDateTime";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";
import { renderMarkup } from "./ParseMarkup";

export const ChronicleEntryComp = memo(_ChronicleEntryComp, (prev, next) => {
   return prev.entry.id === next.entry.id;
});

function _ChronicleEntryComp({ entry }: { entry: IChronicleEntry }): React.ReactNode {
   const date = monthToDate(entry.month, G.save);
   return (
      <Fragment>
         <div className="m10 row">
            <FloatingTip label={() => date.toLocaleDateString()}>
               <div
                  className="frame frame-thin text-sm text-center col stretch"
                  style={{ width: "5rem", height: "5rem" }}
               >
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
