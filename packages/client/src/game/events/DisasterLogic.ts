import type { SaveGame } from "../GameState";
import { getGameDate } from "../logic/GameDateTime";
import { getAllEvents } from "./GameEventLogic";
import { type GameEvent, GameEvents } from "./GameEvents";

export interface UpcomingDisaster {
   event: GameEvent;
   year: number;
}

export const LoomingDisasterYears = 10;

export function getUpcomingDisasters(save: SaveGame): UpcomingDisaster[] {
   const state = save.state.provinces[save.state.playerProvince];
   if (!state) {
      return [];
   }
   const date = getGameDate(save.state.tick, save);
   const currentYear = date.getFullYear();
   return Array.from(getAllEvents(save.state.scenario))
      .flatMap((event): UpcomingDisaster[] => {
         const config = GameEvents[event];
         if (
            state.usedEvents.has(event) ||
            !config.condition?.year ||
            !config.buttons.some((button) => button.spawnProvinces?.length || button.spawnHeresies?.length)
         ) {
            return [];
         }
         const [year, endYear] = config.condition.year;
         if (currentYear > endYear) {
            return [];
         }
         return [{ event, year }];
      })
      .sort((a, b) => a.year - b.year);
}

export function getLoomingDisasters(save: SaveGame): UpcomingDisaster[] {
   return getUpcomingDisasters(save).filter(
      (disaster) => disaster.year - getGameDate(save.state.tick, save).getFullYear() <= LoomingDisasterYears,
   );
}
