import { formatNumber, monthsBetween } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { SaveGame } from "../GameState";
import { Scenarios } from "../scenarios/Scenarios";

export function getGameDate(tick: number, save: SaveGame): Date {
   const date = new Date(Scenarios[save.state.scenario].startDate.getTime());
   date.setDate(date.getDate() + tick);
   return date;
}

export function tickToMonth(tick: number, save: SaveGame): number {
   return monthsBetween(Scenarios[save.state.scenario].startDate, getGameDate(tick, save));
}

export function tickToYear(tick: number, save: SaveGame): number {
   return getGameDate(tick, save).getFullYear() - Scenarios[save.state.scenario].startDate.getFullYear();
}

export function monthToDate(month: number, save: SaveGame): Date {
   const date = new Date(Scenarios[save.state.scenario].startDate.getTime());
   date.setDate(1);
   date.setMonth(date.getMonth() + month);
   return date;
}

export function formatYear(year: number): string {
   if (year >= 0) {
      return $t(L.$1AD, formatNumber(Math.abs(year)));
   }
   return $t(L.$1BC, formatNumber(Math.abs(year)));
}
