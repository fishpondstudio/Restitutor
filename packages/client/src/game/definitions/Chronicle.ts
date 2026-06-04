import { uuid4 } from "@project/shared/src/utils/Helper";
import type { SaveGame } from "../GameState";
import { showInfo } from "../logic/AlertLogic";

const ChronicleEntryTypes = ["DiplomaticTreaty", "WarStarted", "WarEnded"];
export type ChronicleEntryType = (typeof ChronicleEntryTypes)[number];

export interface IChronicleEntry {
   id: string;
   type: ChronicleEntryType;
   month: number;
   content: string;
}

export function addChronicleEntry(data: Omit<IChronicleEntry, "month" | "id">, save: SaveGame): void {
   save.state.chronicle.unshift({
      id: uuid4(),
      month: save.state.month,
      ...data,
   });
   if (save.options.chronicleALerts.has(data.type)) {
      showInfo(data.content);
   }
}
