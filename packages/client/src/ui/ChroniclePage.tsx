import { MultiSelect } from "@mantine/core";
import { range } from "@project/shared/src/utils/Helper";
import type React from "react";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { GameStateUpdated } from "../game/Events";
import { monthToDate } from "../game/logic/GameDateTime";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ChronicleEntryComp } from "./ChronicleEntryComp";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";

export function ChroniclePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [selectedYears, setSelectedYears] = useState<number[]>([]);
   const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);
   const filteredChronicle = G.save.state.chronicle.filter((entry) => {
      if (selectedYears.length > 0 && !selectedYears.includes(monthToDate(entry.month).getFullYear())) {
         return false;
      }
      return true;
   });
   return (
      <SidebarComp
         title={
            <>
               <SidebarHeader title={$t(L.Chronicle)} />
               <div className="m10">
                  <MultiSelect
                     placeholder={$t(L.Years)}
                     checkIconPosition="right"
                     data={range(monthToDate(0).getFullYear(), monthToDate(G.save.state.month).getFullYear() + 1)}
                     value={selectedYears}
                     onChange={setSelectedYears}
                     searchable
                  />
               </div>
               <div className="divider" />
            </>
         }
         scrollViewportRef={setScrollViewport}
      >
         {scrollViewport && filteredChronicle.length > 0 && (
            <Virtuoso
               customScrollParent={scrollViewport}
               data={filteredChronicle}
               computeItemKey={(_, entry) => entry.id}
               itemContent={(_, entry) => <ChronicleEntryComp entry={entry} />}
            />
         )}
         {filteredChronicle.length === 0 && <div className="m20 text-dimmed text-center">{$t(L.NoEntriesFound)}</div>}
      </SidebarComp>
   );
}
