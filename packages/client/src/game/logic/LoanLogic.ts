import { formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IConditionBreakdown } from "../actions/GameAction";
import { finalizeBreakdown, finalizeCondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { ILoan, Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { attachModifiers } from "./ModifierLogic";
import { addProvinceResource, getProvinceIncome } from "./ProvinceLogic";
import { BankruptcyExpenseIncreasePct } from "./TileLogic";
import { getTimedActionTimeLeft } from "./TimedActionLogic";

export function getLoanAmount(province: Province, save: SaveGame): number {
   let result = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         result += data.infrastructure;
         result += data.production;
         result += data.population;
      }
   }
   result *= 6;
   return result;
}

export function getMonthlyInterestRate(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   breakdown.add.push({ name: $t(L.BaseValue), value: 0.01 });
   const bankruptcy = getTimedActionTimeLeft("Bankruptcy", province, save);
   if (bankruptcy > 0) {
      breakdown.multiply.push({
         name: $t(L.Bankruptcy),
         desc: $t(L.$1MonthsLeft, formatNumber(bankruptcy)),
         value: BankruptcyExpenseIncreasePct,
      });
   }
   attachModifiers("MonthlyInterestRate", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function takeLoan(province: Province, amount: number, save: SaveGame): void {
   const data = save.state.provinces[province];
   if (!data) {
      return;
   }
   data.loans.push({ principal: amount, interest: 0, month: save.state.month });
   addProvinceResource("gold", amount, province, save);
}

export function getLoanBreakdown(loan: ILoan, province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown({ reverse: true });
   breakdown.add.push({ name: $t(L.Principal), value: loan.principal });
   breakdown.add.push({ name: $t(L.Interest), value: loan.interest });
   return finalizeBreakdown(breakdown);
}

export function canTakeLoan(province: Province, save: SaveGame): IConditionBreakdown {
   const revenue = getProvinceIncome(province, save).revenue.value;
   const totalInterest = getMonthlyInterestCost(province, save);
   return finalizeCondition({
      breakdown: [
         {
            name: $t(L.WeHaveEnoughRevenueToCoverTheInterestCost),
            desc: $t(L.Revenue$1InterestCost$2, formatNumber(revenue), formatNumber(totalInterest)),
            value: revenue >= totalInterest,
         },
      ],
   });
}

export function getMonthlyInterestCost(province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   const interest = getMonthlyInterestRate(province, save).value;
   const outstandingLoans = state.loans.reduce((acc, loan) => acc + loan.principal + loan.interest, 0);
   return outstandingLoans * interest;
}
