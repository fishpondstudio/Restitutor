import { GreatWork } from "../definitions/GreatWork";
import type { SaveGame } from "../GameState";
import { getGameDate } from "./GameDateTime";

export function isGreatWorkCompleted(greatWork: GreatWork, save: SaveGame): boolean {
   return getGameDate(save.state.tick, save).getFullYear() >= GreatWork[greatWork].completionYear;
}
