import { MultiSelect, ScrollArea } from "@mantine/core";
import { range } from "@project/shared/src/utils/Helper";
import type React from "react";
import { useState } from "react";
import { GameStateUpdated } from "../game/Events";
import { monthToDate } from "../game/logic/TickLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ChronicleEntryComp } from "./ChronicleEntryComp";
import { SidebarContainer } from "./common/SidebarComp";

export function ChroniclePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [selectedYears, setSelectedYears] = useState<number[]>([]);
   const filteredChronicle = G.save.state.chronicle.filter((entry) => {
      if (selectedYears.length > 0 && !selectedYears.includes(monthToDate(entry.month).getFullYear())) {
         return false;
      }
      return true;
   });
   return (
      <SidebarContainer title={$t(L.Chronicle)}>
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
         <ScrollArea className="f1" scrollbars="y">
            {filteredChronicle.map((entry) => (
               <ChronicleEntryComp key={entry.id} entry={entry} />
            ))}
            {filteredChronicle.length === 0 && (
               <div className="box m10 p10 text-dimmed text-center">{$t(L.NoEntriesFound)}</div>
            )}
         </ScrollArea>
      </SidebarContainer>
   );
}
