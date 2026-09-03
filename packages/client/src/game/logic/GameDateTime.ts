import { formatNumber, monthsBetween } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";

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

export function formatYear(year: number): string {
   if (year >= 0) {
      return $t(L.$1AD, formatNumber(Math.abs(year)));
   }
   return $t(L.$1BC, formatNumber(Math.abs(year)));
}
