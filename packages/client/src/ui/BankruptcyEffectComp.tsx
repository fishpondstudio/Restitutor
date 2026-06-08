import { formatDelta, formatPercentDelta } from "@project/shared/src/utils/Helper";
import type { Province } from "../game/definitions/Province";
import {
   BankruptcyExpenseIncrease,
   BankruptcyRevenueReduction,
   BankruptcyStabilityReduction,
} from "../game/logic/TileLogic";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";

export function BankruptcyEffectComp({ province }: { province: Province }): React.ReactNode {
   return (
      <>
         <div className="m10">
            {$t(
               L.OurBankruptcyHasXMonthsLeftWithTheFollowingEffects,
               getTimedActionTimeLeft("Bankruptcy", province, G.save),
            )}
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.LandTax)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyRevenueReduction)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.TileOutput)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyRevenueReduction)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Manpower)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyRevenueReduction)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Stability)}</div>
            <div className="text-red">{formatDelta(BankruptcyStabilityReduction)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.TileUpgradeCost)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyExpenseIncrease)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.ResearchCost)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyExpenseIncrease)}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.MonthlyInterestRate)}</div>
            <div className="text-red">{formatPercentDelta(BankruptcyExpenseIncrease)}</div>
         </div>
      </>
   );
}
