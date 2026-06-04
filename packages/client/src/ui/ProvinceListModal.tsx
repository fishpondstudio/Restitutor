import { formatNumber } from "@project/shared/src/utils/Helper";
import { GameStateUpdated } from "../game/Events";
import {
   getProvinceIncome,
   getProvinceName,
   getProvincePrestige,
   getProvincePrestigeRanking,
   getProvinceStability,
   getProvinceTileCount,
   getWarPower,
} from "../game/logic/ProvinceLogic";
import { monthToDate } from "../game/logic/TickLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";

export function ProvinceListModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const ranking = getProvincePrestigeRanking(G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.Prestige)} dismiss />}>
         <FloatingTip label={$t(L.PrestigeRankingOfAllProvinces)}>
            <div className="h1 row">
               <div className="f1">{$t(L.MostPrestigiousProvinces)}</div>
               <div>{monthToDate(G.save.state.month).getFullYear()} A.D.</div>
            </div>
         </FloatingTip>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th style={{ width: 0 }}></th>
                     <th style={{ width: 0 }}></th>
                     <th></th>
                     <th>{$t(L.Prestige)}</th>
                     <th>{$t(L.Tiles)}</th>
                     <th>{$t(L.Income)}</th>
                     <th>{$t(L.Stability)}</th>
                     <th>{$t(L.WarPower)}</th>
                  </tr>
               </thead>
               <tbody>
                  {Array.from(ranking).map(([province], index) => {
                     const stability = getProvinceStability(province, G.save);
                     const prestige = getProvincePrestige(province, G.save);
                     const warPower = getWarPower(province, G.save);
                     return (
                        <tr
                           key={province}
                           className={province === G.save.state.playerProvince ? "text-yellow text-bold" : ""}
                        >
                           <td>
                              {index < 5 ? (
                                 <FloatingTip label={$t(L.GreatPower)}>
                                    <div className="mi sm">stars</div>
                                 </FloatingTip>
                              ) : null}
                           </td>
                           <td>{index + 1}</td>
                           <td>{getProvinceName(province, G.save)}</td>
                           <td>
                              <BreakdownTooltip breakdown={prestige}>
                                 <div>{formatNumber(prestige.value)}</div>
                              </BreakdownTooltip>
                           </td>
                           <td>{getProvinceTileCount(province, G.save)}</td>
                           <td>{colorNumber(getProvinceIncome(province, G.save).income)}</td>
                           <td>
                              <BreakdownTooltip breakdown={stability}>
                                 <div>{colorNumber(stability.value)}</div>
                              </BreakdownTooltip>
                           </td>
                           <td>
                              <BreakdownTooltip breakdown={warPower}>
                                 <div>{colorNumber(warPower.value)}</div>
                              </BreakdownTooltip>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </ModalComp>
   );
}
