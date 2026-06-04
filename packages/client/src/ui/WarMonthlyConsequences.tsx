import { formatNumber, formatPercent, range, type Tile } from "@project/shared/src/utils/Helper";
import type { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { getArmyMaintenanceCost } from "../game/logic/ProvinceLogic";
import {
   calculateWarMonthlyMilitaryPoint,
   type IWarLog,
   MonthlyExtraArmyMaintenancePct,
   MonthlyStabilityCostWithCB,
   MonthlyStabilityCostWithoutCB,
} from "../game/logic/WarLogic";
import { G } from "../utils/Global";
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
   return (
      <>
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  <div className="m10">
                     {$t(L.MonthlyMilitaryPointDescription, "1", "1")}
                     <br />
                     {$t(L.EveryMonthMilitaryPointCost, "10")}
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
                           {range(0, 10).map((year) => {
                              const monthly = calculateWarMonthlyMilitaryPoint(year * 12 + 1, tiles.size);
                              return (
                                 <tr key={year}>
                                    <td>{year + 1}</td>
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
                     {$t(L.MonthlyMilitaryPointDescription, "1", "1")}
                  </div>
               </div>
               <div className="text-red">
                  {formatNumber(-calculateWarMonthlyMilitaryPoint(log ? log.length + 1 : 1, tiles.size))}
               </div>
            </div>
         </FloatingTip>
         <div className="row mx10 my5">
            <div className="f1">
               <div>{$t(L.Gold)}</div>
               <div className="text-xs text-dimmed text-italic">
                  {$t(L.AddsAnExtraXToArmyMaintenanceCostDuringWar, formatPercent(MonthlyExtraArmyMaintenancePct))}
               </div>
            </div>
            <div className="text-red">
               {formatNumber(-getArmyMaintenanceCost(attacker, G.save).value * MonthlyExtraArmyMaintenancePct)}
            </div>
         </div>
         {casusBelli === "None" ? (
            <div className="row mx10 my5">
               <div className="f1">
                  <div>{$t(L.Stability)}</div>
                  <div className="text-xs text-dimmed text-italic">{$t(L.DueToLackOfCasusBelli)}</div>
               </div>
               <div className="text-red">{formatNumber(-MonthlyStabilityCostWithoutCB)}</div>
            </div>
         ) : (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Stability)}</div>
               <div className="text-red">{formatNumber(-MonthlyStabilityCostWithCB)}</div>
            </div>
         )}
      </>
   );
}
