import { ScrollArea } from "@mantine/core";
import type React from "react";
import ChronicleHeader from "../assets/images/ChronicleHeader.webp";
import { GameStateUpdated } from "../game/Events";
import { monthToDate } from "../game/logic/TickLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { ChronicleEntryComp } from "./ChronicleEntryComp";
import { ChroniclePage } from "./ChroniclePage";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { CloseButtonClass } from "./UIConstant";

export function ChronicleModal({ years }: { years: [number, number] }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [startYear, endYear] = years;
   const filteredChronicle = G.save.state.chronicle.filter((entry) => {
      return monthToDate(entry.month).getFullYear() >= startYear && monthToDate(entry.month).getFullYear() <= endYear;
   });
   return (
      <div className="modal panel md">
         <div className="text-shadow" style={{ position: "relative" }}>
            <div
               style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(to bottom, transparent, rgba(40, 40, 40, 1))",
               }}
            />
            <button
               className="btn text-sm"
               style={{ position: "absolute", right: "0.625rem", bottom: "0.625rem" }}
               onClick={() => {
                  showPanel(<ChroniclePage />);
                  hideModal();
               }}
            >
               {$t(L.FullChronicle)}
            </button>
            <FloatingTip label={$t(L.ImageCredit$1, "Das Forum Romanum, J. Bühlmann (1901)")}>
               <div
                  className="text-display text-xl"
                  style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem" }}
               >
                  {$t(L.ChronicleOf$1Ad, startYear === endYear ? startYear : `${startYear} ~ ${endYear}`)}
               </div>
            </FloatingTip>
            <div
               className={`mi pointer text-white ${CloseButtonClass}`}
               onClick={hideModal}
               style={{ position: "absolute", top: "0.3125rem", right: "0.3125rem" }}
            >
               close
            </div>
            <img className="display-block w100" src={ChronicleHeader} />
         </div>
         <div className="divider" />
         <ScrollArea.Autosize scrollbars="y" type="hover" style={{ maxHeight: "calc(80vh - 12.5rem)" }}>
            {filteredChronicle.map((entry) => (
               <ChronicleEntryComp key={entry.id} entry={entry} />
            ))}
            {filteredChronicle.length === 0 && (
               <div className="box m10 p10 text-dimmed text-center">{$t(L.NoEntriesFound)}</div>
            )}
         </ScrollArea.Autosize>
      </div>
   );
}
