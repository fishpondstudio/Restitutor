import { formatNumber, formatPercentDelta, range, type Tile } from "@project/shared/src/utils/Helper";
import type { CasusBelli } from "../game/definitions/CasusBelli";
import { Modifiers } from "../game/definitions/Modifier";
import type { Province } from "../game/definitions/Province";
import {
   calculateWarMonthlyMilitaryPoint,
   calculateWarMonthlyStability,
   type IWarLog,
   MonthlyExtraArmyMaintenancePct,
} from "../game/logic/WarLogic";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";

export function WarMonthlyConsequences({
   war,
}: {
   war: {
      attacker: Province;
      tiles: Set<Tile>;
      casusBelli: CasusBelli;
      log?: IWarLog[];
   };
}): React.ReactNode {
   const { attacker, tiles, casusBelli, log } = war;
   const currentYear = log ? Math.floor((log.length + 1) / 12) : 1;
   return (
      <>
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  <div className="m10">
                     <i>
                        {$t(L.MonthlyMilitaryPointDescription, "1")} {$t(L.IncreasesByXEveryYear, "1")}
                     </i>{" "}
                     {$t(L.EveryMonthMilitaryPointCost, "5")}
                  </div>
                  <div className="m10">
                     <table className="data-table">
                        <thead>
                           <tr>
                              <th>{$t(L.Year)}</th>
                              <th className="text-right">{$t(L.PerMonth)}</th>
                              <th className="text-right">{$t(L.PerYear)}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {range(currentYear, currentYear + 5).map((year) => {
                              const monthly = calculateWarMonthlyMilitaryPoint(year * 12 + 1, tiles.size);
                              return (
                                 <tr key={year}>
                                    <td>{year}</td>
                                    <td className="text-right text-red">{formatNumber(-monthly)}</td>
                                    <td className="text-right text-red">{formatNumber(-monthly * 12)}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </>
            }
         >
            <div className="row mx10 my5">
               <div className="f1">
                  <div>{$t(L.MilitaryPoint)}</div>
                  <div className="text-xs text-dimmed text-italic">
                     {$t(L.MonthlyMilitaryPointDescription, "1")} {$t(L.IncreasesByXEveryYear, "1")}
                  </div>
               </div>
               <div className="text-red">
                  {formatNumber(-calculateWarMonthlyMilitaryPoint(log ? log.length + 1 : 1, tiles.size))}
                  {$t(L.SlashMonth)}
               </div>
            </div>
         </FloatingTip>
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  <div className="m10">
                     <i>{$t(L.IncreasesByXEveryYear, formatNumber(calculateWarMonthlyStability(1, casusBelli)))}</i>{" "}
                     {$t(L.EveryMonthStabilityCost, "5")}
                  </div>
                  <div className="m10">
                     <table className="data-table">
                        <thead>
                           <tr>
                              <th>{$t(L.Year)}</th>
                              <th className="text-right">{$t(L.PerMonth)}</th>
                              <th className="text-right">{$t(L.PerYear)}</th>
                           </tr>
                        </thead>
                        <tbody>
                           {range(currentYear, currentYear + 5).map((year) => {
                              const monthly = calculateWarMonthlyStability(year * 12, casusBelli);
                              return (
                                 <tr key={year}>
                                    <td>{year}</td>
                                    <td className="text-right text-red">{formatNumber(-monthly)}</td>
                                    <td className="text-right text-red">{formatNumber(-monthly * 12)}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </>
            }
         >
            <div className="row mx10 my5">
               <div className="f1">
                  <div>{$t(L.Stability)}</div>
                  <div className="text-xs text-dimmed text-italic">
                     {casusBelli === "None" && $t(L.DueToLackOfCasusBelli)}{" "}
                     {$t(L.IncreasesByXEveryYear, formatNumber(calculateWarMonthlyStability(1, casusBelli)))}
                  </div>
               </div>
               <div className="text-red">
                  {formatNumber(-calculateWarMonthlyStability(log ? log.length + 1 : 1, casusBelli))}
                  {$t(L.SlashMonth)}
               </div>
            </div>
         </FloatingTip>

         <div className="row mx10 my5">
            <div className="f1">
               <div>{Modifiers.ArmyMaintenance.name()}</div>
            </div>
            <div className="text-red">{formatPercentDelta(MonthlyExtraArmyMaintenancePct)}</div>
         </div>
      </>
   );
}
