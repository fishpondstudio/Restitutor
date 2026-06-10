import { Select } from "@mantine/core";
import { filterInPlace, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import Gold from "../assets/images/Gold.svg";
import type { Province } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import {
   canTakeLoan,
   getLoanAmount,
   getLoanBreakdown,
   getMonthlyInterestRate,
   takeLoan,
} from "../game/logic/LoanLogic";
import { getProvinceIncome, getProvinceResource } from "../game/logic/ProvinceLogic";
import { monthToDate } from "../game/logic/TickLogic";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BankruptcyEffectComp } from "./BankruptcyEffectComp";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { SidebarComp } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { DevOnly } from "./components/DevOnly";
import { FloatingTip } from "./components/FloatingTip";

export function TreasuryPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [province, setProvince] = useState(G.save.state.playerProvince);
   const state = G.save.state.provinces[province];
   if (!state) {
      return null;
   }
   const { revenue, expense, income } = getProvinceIncome(province, G.save);
   const isBankrupt = getTimedActionTimeLeft("Bankruptcy", province, G.save) > 0;
   return (
      <SidebarComp title={$t(L.Treasury)}>
         <DevOnly>
            <Select
               className="m10"
               value={province}
               onChange={(value) => {
                  if (value) {
                     setProvince(value as Province);
                  }
               }}
               checkIconPosition="right"
               allowDeselect={false}
               data={Object.keys(G.save.state.provinces)}
            />
         </DevOnly>
         <div className="m10 row">
            <img src={Gold} height={20} />
            <div className="f1">{$t(L.GoldInTreasury)}</div>
            <div>{formatNumber(getProvinceResource("gold", province, G.save))}</div>
         </div>
         <div className="h1">{$t(L.MonthlyRevenue)}</div>
         <BreakdownComp breakdown={revenue} />
         <div className="h1">{$t(L.MonthlyExpense)}</div>
         <BreakdownComp breakdown={expense} />
         <div className="divider"></div>
         <div className="row mx10 my5 text-display text-lg">
            <div className="f1">{$t(L.NetIncome)}</div>
            <div>{colorNumber(income)}</div>
         </div>
         <div className="h1">{$t(L.Loans)}</div>
         {isBankrupt && (
            <FloatingTip w={300} className="p0" label={<BankruptcyEffectComp province={province} />}>
               <div className="row g5 mx10 my5 text-red">
                  <div className="f1">{$t(L.CurrentlyBankrupt)}</div>
                  <div className="mi sm">warning</div>
               </div>
            </FloatingTip>
         )}
         <BreakdownRow
            className="mx10 my5"
            name={$t(L.MonthlyInterestRate)}
            breakdown={getMonthlyInterestRate(province, G.save)}
            formatFunc={formatPercent}
         />
         <div className="divider" />
         <div className="mx10 my10">
            <ActionButton
               className="w100 py2"
               action={{
                  condition: canTakeLoan(province, G.save),
                  effect: () => {
                     takeLoan(province, getLoanAmount(province, G.save), G.save);
                  },
               }}
            >
               {$t(L.TakeALoan$1Gold, formatNumber(getLoanAmount(province, G.save)))}
            </ActionButton>
         </div>
         {state.loans.map((loan, index) => (
            <div className="box row m10 p5" key={index}>
               <div className="text-dimmed text-sm">{monthToDate(loan.month).toLocaleDateString()}</div>
               <BreakdownTooltip breakdown={getLoanBreakdown(loan, province, G.save)}>
                  <div className="f1">
                     {formatNumber(loan.principal + loan.interest)} {$t(L.Gold)}
                  </div>
               </BreakdownTooltip>
               <ActionButton
                  className="TreasuryPage_Repay_Loan"
                  action={{
                     cost: { gold: loan.principal + loan.interest },
                     effect: () => {
                        filterInPlace(state.loans, (l) => l !== loan);
                     },
                  }}
               >
                  {$t(L.Repay)}
               </ActionButton>
            </div>
         ))}
      </SidebarComp>
   );
}
