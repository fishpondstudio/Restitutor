import type { Province } from "../definitions/Province";
import type { TimedAction } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { onGeneralEnded } from "./WarLogic";

export function onTimedActionEnded(action: TimedAction, province: Province, save: SaveGame): void {
   if (action === "RecruitAGeneral") {
      onGeneralEnded(province, save);
   }
}
