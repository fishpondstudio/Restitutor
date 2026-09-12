import { formatNumber } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { GameStateUpdated } from "../game/Events";
import { monthToDate } from "../game/logic/GameDateTime";
import {
   getProvinceIncome,
   getProvinceName,
   getProvincePrestige,
   getProvincePrestigeRanking,
   getProvinceStability,
   getProvinceTileCount,
   getWarPower,
} from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { Table } from "./components/Table";
import { WarPowerTooltip } from "./WarPowerTooltip";

export function ProvinceListSingletonModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [scrollViewport, setScrollViewport] = useState<HTMLDivElement | null>(null);
   const rows = Array.from(getProvincePrestigeRanking(G.save), ([province, rank]) => ({
      province,
      rank,
      name: getProvinceName(province, G.save),
      prestige: getProvincePrestige(province, G.save),
      tiles: getProvinceTileCount(province, G.save),
      income: getProvinceIncome(province, G.save).income,
      stability: getProvinceStability(province, G.save),
      warPower: getWarPower(province, G.save),
   }));
   return (
      <ModalComp
         size="lg"
         title={<ModalTitleBar title={$t(L.Prestige)} dismiss />}
         scrollViewportRef={setScrollViewport}
      >
         <FloatingTip label={() => $t(L.PrestigeRankingOfAllProvinces)}>
            <div className="box row m10 text-display text-lg px10 py5">
               <div className="f1">{$t(L.MostPrestigiousProvinces)}</div>
               <div>{monthToDate(G.save.state.month).getFullYear()} A.D.</div>
            </div>
         </FloatingTip>
         <div className="m10">
            {scrollViewport && (
               <Table
                  rows={rows}
                  rowKey={(row) => row.province}
                  virtualize={{ scrollParent: scrollViewport }}
                  defaultSort={{ columnId: "prestige", direction: "desc" }}
                  columns={[
                     { id: "greatPower", header: null, headerProps: { style: { width: 0 } } },
                     {
                        id: "rank",
                        header: null,
                        headerProps: { style: { width: 0 }, "aria-label": $t(L.PrestigeRankingOfAllProvinces) },
                        compare: (a, b) => a.rank - b.rank,
                     },
                     { id: "province", header: $t(L.Province), compare: (a, b) => a.name.localeCompare(b.name) },
                     { id: "prestige", header: $t(L.Prestige), compare: (a, b) => a.prestige.value - b.prestige.value },
                     { id: "tiles", header: $t(L.Tiles), compare: (a, b) => a.tiles - b.tiles },
                     { id: "income", header: $t(L.Income), compare: (a, b) => a.income - b.income },
                     {
                        id: "stability",
                        header: $t(L.Stability),
                        compare: (a, b) => a.stability.value - b.stability.value,
                     },
                     {
                        id: "warPower",
                        header: $t(L.WarPower),
                        compare: (a, b) => a.warPower.total.value - b.warPower.total.value,
                     },
                  ]}
                  rowProps={(row) => ({
                     className: row.province === G.save.state.playerProvince ? "text-yellow text-bold" : "",
                  })}
                  renderCells={(row) => (
                     <>
                        <td>
                           <FloatingTip label={() => $t(L.GreatPower)}>
                              <div className="mi sm" style={{ visibility: row.rank <= 5 ? "visible" : "hidden" }}>
                                 stars
                              </div>
                           </FloatingTip>
                        </td>
                        <td>{row.rank}</td>
                        <td>{row.name}</td>
                        <td>
                           <BreakdownTooltip breakdown={row.prestige}>
                              <div>{formatNumber(row.prestige.value)}</div>
                           </BreakdownTooltip>
                        </td>
                        <td>{row.tiles}</td>
                        <td>{colorNumber(row.income)}</td>
                        <td>
                           <BreakdownTooltip breakdown={row.stability}>
                              <div>{colorNumber(row.stability.value)}</div>
                           </BreakdownTooltip>
                        </td>
                        <td>
                           <WarPowerTooltip breakdown={row.warPower}>
                              <div>{formatNumber(row.warPower.total.value)}</div>
                           </WarPowerTooltip>
                        </td>
                     </>
                  )}
               />
            )}
         </div>
      </ModalComp>
   );
}
