import { monthsBetween } from "@project/shared/src/utils/Helper";
import type { SaveGame } from "../GameState";

const StartDate = getGameDate(0);

export function getGameDate(tick: number): Date {
   return new Date(193, 0, tick, 0, 0, 0, 0);
}

export function tickToMonth(tick: number): number {
   return monthsBetween(StartDate, getGameDate(tick));
}

export function tickToYear(tick: number): number {
   return getGameDate(tick).getFullYear() - StartDate.getFullYear();
}

export function monthToDate(month: number): Date {
   return new Date(193, month - 1, 1, 0, 0, 0, 0);
}
export function monthToNextYear(save: SaveGame): number {
   return Math.ceil(save.state.month / 12) * 12 - save.state.month;
}
