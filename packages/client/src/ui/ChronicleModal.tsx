import type React from "react";
import { GameStateUpdated } from "../game/Events";
import { monthToDate } from "../game/logic/GameDateTime";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalImageHeader } from "../utils/ModalManager";
import { ChronicleEntryComp } from "./ChronicleEntryComp";
import { ChroniclePage } from "./ChroniclePage";
import { showPanel } from "./common/ShowPanel";
import { HeaderImages } from "./HeaderImages";

export function ChronicleModal({ years }: { years: [number, number] }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [startYear, endYear] = years;
   const filteredChronicle = G.save.state.chronicle.filter((entry) => {
      return monthToDate(entry.month).getFullYear() >= startYear && monthToDate(entry.month).getFullYear() <= endYear;
   });
   return (
      <ModalComp
         size="md"
         title={
            <>
               <ModalImageHeader
                  image={HeaderImages.Chronicle}
                  title={$t(L.ChronicleOf$1Ad, startYear === endYear ? startYear : `${startYear} ~ ${endYear}`)}
               >
                  <button
                     className="btn text-sm"
                     style={{ position: "absolute", right: "0.625rem", bottom: "0.625rem" }}
                     onClick={() => {
                        showPanel(ChroniclePage, {});
                        hideModal();
                     }}
                  >
                     {$t(L.FullChronicle)}
                  </button>
               </ModalImageHeader>
               <div className="divider" />
            </>
         }
      >
         {filteredChronicle.map((entry) => (
            <ChronicleEntryComp key={entry.id} entry={entry} />
         ))}
         {filteredChronicle.length === 0 && (
            <div className="box m10 p10 text-dimmed text-center">{$t(L.NoEntriesFound)}</div>
         )}
      </ModalComp>
   );
}
