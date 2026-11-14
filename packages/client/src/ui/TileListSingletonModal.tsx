import { Loader, Popover, Switch } from "@mantine/core";
import { cls, entriesOf, round, type Tile } from "@project/shared/src/utils/Helper";
import { memo, useCallback, useLayoutEffect, useState } from "react";
import { type Building, Buildings } from "../game/definitions/Building";
import { Culture } from "../game/definitions/Culture";
import { Religion } from "../game/definitions/Religion";
import { Terrains } from "../game/definitions/Terrain";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated, OpenTilePage } from "../game/Events";
import { getProvinceTilesCached } from "../game/logic/CacheLogic";
import { getTileGoverningCost, getTileTerrain, isCapital } from "../game/logic/TileLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent, refreshOnTypedEventWhen } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar, useModalTransitionPhase } from "../utils/ModalManager";
import { BreakdownTooltip } from "./BreakdownRow";
import { BuildingConstructionButton, DemolishBuildingButton } from "./BuildingConstructionButton";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { UpgradeInfrastructureButton, UpgradePopulationButton, UpgradeProductionButton } from "./UpgradeButtons";

const BuildingConstructionButtonStyle = { width: 30, height: 30, padding: 0 };
const UpgradeButtonStyle = { minWidth: 40 };
const BuildingEntries = entriesOf(Buildings);
const TileSortColumns = {
   name: () => $t(L.TileName),
   core: () => $t(L.Core),
   culture: () => $t(L.Culture),
   religion: () => $t(L.Religion),
   infrastructure: () => $t(L.Infrastructure),
   production: () => $t(L.Production),
   population: () => $t(L.Population),
   totalUpgrades: () => $t(L.TotalUpgrades),
   upgradeCount: () => $t(L.UpgradeCount),
   governingCost: () => $t(L.GoverningCost),
};
type TileSortColumn = keyof typeof TileSortColumns;
type TileSortOrder = "asc" | "desc";
const savedTileSort: { column: TileSortColumn; order: TileSortOrder } = {
   column: "name",
   order: "asc",
};

function getTileSortValue(tile: Tile, column: TileSortColumn): string | number {
   const data = G.save.state.tiles.get(tile);
   if (!data) {
      return "";
   }
   switch (column) {
      case "name":
         return getTileName(tile, G.save);
      case "core":
         return Number(data.coreProvinces.has(data.province));
      case "culture":
         return Culture[data.culture].name();
      case "religion":
         return Religion[data.religion].name();
      case "totalUpgrades":
         return data.infrastructure + data.production + data.population;
      case "governingCost":
         return getTileGoverningCost(tile, G.save).value;
      default:
         return data[column];
   }
}

export function TileListSingletonModal(): React.ReactNode {
   const phase = useModalTransitionPhase();
   const [tableMounted, setTableMounted] = useState(false);
   useLayoutEffect(() => {
      if (phase !== "opened" || tableMounted) {
         return;
      }
      // Give the fully opened shell a paint opportunity before mounting the table.
      let frame = requestAnimationFrame(() => {
         frame = requestAnimationFrame(() => setTableMounted(true));
      });
      return () => cancelAnimationFrame(frame);
   }, [phase, tableMounted]);

   return (
      <ModalComp size="xl" scrollbars="xy" title={<ModalTitleBar title={$t(L.TilesAndUpgrades)} dismiss />}>
         {tableMounted ? (
            <TileListTable />
         ) : (
            <div className="cc" style={{ height: "50vh" }}>
               <Loader size="xl" color="dark.5" />
            </div>
         )}
      </ModalComp>
   );
}

const TileListTable = memo(function TileListTable() {
   refreshOnTypedEvent(GameStateUpdated);
   const [sortColumn, setSortColumn] = useState<TileSortColumn>(savedTileSort.column);
   const [sortOrder, setSortOrder] = useState<TileSortOrder>(savedTileSort.order);
   const onSortColumnChange = useCallback((column: TileSortColumn) => {
      setSortColumn(column);
      savedTileSort.column = column;
   }, []);
   const onSortOrderChange = useCallback((order: TileSortOrder) => {
      setSortOrder(order);
      savedTileSort.order = order;
   }, []);
   const tiles = getProvinceTilesCached(G.save.state.playerProvince, G.save)
      .map((tile) => ({
         tile,
         name: getTileName(tile, G.save),
         value: getTileSortValue(tile, sortColumn),
      }))
      .sort((a, b) => {
         const comparison =
            typeof a.value === "number" && typeof b.value === "number"
               ? a.value - b.value
               : String(a.value).localeCompare(String(b.value));
         return comparison * (sortOrder === "asc" ? 1 : -1) || a.name.localeCompare(b.name);
      })
      .map(({ tile }) => tile);
   return (
      <table className="data-table">
         <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <TileListHeader
               sortColumn={sortColumn}
               sortOrder={sortOrder}
               onSortColumnChange={onSortColumnChange}
               onSortOrderChange={onSortOrderChange}
            />
         </thead>
         <tbody>
            {tiles.map((tile) => (
               <TileListRow key={tile} tile={tile} />
            ))}
         </tbody>
      </table>
   );
});

const TileListHeader = memo(function TileListHeader({
   sortColumn,
   sortOrder,
   onSortColumnChange,
   onSortOrderChange,
}: {
   sortColumn: TileSortColumn;
   sortOrder: TileSortOrder;
   onSortColumnChange: (column: TileSortColumn) => void;
   onSortOrderChange: (order: TileSortOrder) => void;
}) {
   const sortIcon = (
      <FloatingTip
         label={() => (
            <>
               {TileSortColumns[sortColumn]()} ({sortOrder === "asc" ? $t(L.Ascending) : $t(L.Descending)})
            </>
         )}
      >
         <span className="mi sm">{sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}</span>
      </FloatingTip>
   );
   const columnLabel = (label: string, ...columns: TileSortColumn[]) => {
      const active = columns.includes(sortColumn);
      return (
         <div className={cls("row g0", active ? "text-primary" : null)}>
            {label}
            {active ? sortIcon : null}
         </div>
      );
   };
   return (
      <tr>
         <th>
            <Popover width={250} position="bottom-start" withOverlay>
               <Popover.Target>
                  <button className="btn p2">
                     <div className="mi sm">sort</div>
                  </button>
               </Popover.Target>
               <Popover.Dropdown className="panel p0">
                  <div className="h3">{$t(L.SortBy)}</div>
                  {entriesOf(TileSortColumns).map(([value, label]) => {
                     return (
                        <div
                           className={cls(
                              "row px10 py5 pointer hover-highlight",
                              value === sortColumn ? "text-primary" : null,
                           )}
                           key={value}
                           onClick={() => onSortColumnChange(value)}
                        >
                           <div className="f1">{label()}</div>
                           {value === sortColumn ? sortIcon : null}
                        </div>
                     );
                  })}
                  <div className="h3">{$t(L.SortOrder)}</div>
                  <div className="row px10 py5">
                     <div className="f1">{$t(L.Ascending)}</div>
                     <Switch
                        size="xs"
                        checked={sortOrder === "asc"}
                        onChange={(event) => onSortOrderChange(event.currentTarget.checked ? "asc" : "desc")}
                     />
                  </div>
                  <div className="h5" />
               </Popover.Dropdown>{" "}
               {sortColumn === "name" ? sortIcon : null}
            </Popover>
         </th>
         <th>{columnLabel($t(L.Core), "core")}</th>
         <th>{columnLabel($t(L.Culture), "culture")}</th>
         <th>{columnLabel($t(L.Religion), "religion")}</th>
         <th>{columnLabel($t(L.Infra), "infrastructure")}</th>
         <th>{columnLabel($t(L.Prod), "production")}</th>
         <th>{columnLabel($t(L.Pop), "population")}</th>
         <th>{columnLabel($t(L.Upg), "totalUpgrades", "upgradeCount")}</th>
         <th>{columnLabel($t(L.GoverningCostAbbr), "governingCost")}</th>
         <th></th>
         {BuildingEntries.map(([building, buildingData]) => (
            <th key={building}>
               <FloatingTip label={() => buildingData.name()}>
                  <img src={buildingData.image} height={30} className="img-border thin" />
               </FloatingTip>
            </th>
         ))}
      </tr>
   );
});

const ConstructionButton = <div className="mi sm">construction</div>;
const DemolishButton = <div className="mi sm">delete</div>;

const TileListRow = memo(_TileListRow, (prev, next) => {
   return prev.tile === next.tile;
});

function _TileListRow({ tile }: { tile: Tile }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   return (
      <tr>
         <td>
            <div className="row g5">
               {getTileName(tile, G.save)}
               {isCapital(tile, G.save) && <div className="mi sm text-yellow">stars</div>}
               <div className="f1" />
            </div>
            <div className="row g5">
               <div className="text-xs text-dimmed text-italic">{Terrains[getTileTerrain(tile)].name()}</div>
               <div className="f1" />
            </div>
         </td>
         <td>
            {tileData.coreProvinces.has(tileData.province) ? (
               <div className="mi sm text-green">check_circle</div>
            ) : (
               <div className="mi sm text-red">cancel</div>
            )}
         </td>
         <td>{Culture[tileData.culture].name()}</td>
         <td>{Religion[tileData.religion].name()}</td>
         <UpgradeButtonsColumns tile={tile} />
         <GoverningCostColumn tile={tile} />
         <td>
            <button
               className="btn"
               onClick={() => {
                  OpenTilePage.emit({ tile });
                  G.scene.getCurrent(WorldScene)?.drawSelectors(new Set([tile]));
                  hideModal();
               }}
            >
               {$t(L.View)}
            </button>
         </td>
         {BuildingEntries.map(([building]) => {
            return <ConstructionButtonColumn key={building} building={building} tile={tile} />;
         })}
      </tr>
   );
}

function GoverningCostColumn({ tile }: { tile: Tile }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const breakdown = getTileGoverningCost(tile, G.save);
   return (
      <td>
         <BreakdownTooltip
            breakdown={breakdown}
            tooltip={(element) => (
               <>
                  <div className="h2">{$t(L.GoverningCost)}</div>
                  {element}
               </>
            )}
         >
            <div>{round(breakdown.value, 1)}</div>
         </BreakdownTooltip>
      </td>
   );
}

function UpgradeButtonsColumns({ tile }: { tile: Tile }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   refreshOnTypedEventWhen(GameStateUpdated, () => {
      const data = G.save.state.tiles.get(tile);
      return [data?.infrastructure, data?.production, data?.population, data?.upgradeCount];
   });
   if (!tileData) {
      return null;
   }
   const totalUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   return (
      <>
         <td>
            <UpgradeInfrastructureButton
               className="text-roman"
               id={`TileListModal_UpgradeInfrastructure_${tile}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.infrastructure}
            </UpgradeInfrastructureButton>
         </td>
         <td>
            <UpgradeProductionButton
               className="text-roman"
               id={`TileListModal_UpgradeProduction_${tile}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.production}
            </UpgradeProductionButton>
         </td>
         <td>
            <UpgradePopulationButton
               className="text-roman"
               id={`TileListModal_UpgradePopulation_${tile}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.population}
            </UpgradePopulationButton>
         </td>
         <td>
            <FloatingTip label={() => html($t(L.TotalUpgrades$1UpgradeTimes$2, totalUpgrades, tileData.upgradeCount))}>
               <div>
                  {totalUpgrades}/{tileData.upgradeCount}
               </div>
            </FloatingTip>
         </td>
      </>
   );
}

function ConstructionButtonColumn({ building, tile }: { building: Building; tile: Tile }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   refreshOnTypedEventWhen(GameStateUpdated, () => {
      const data = G.save.state.tiles.get(tile);
      return [data?.buildings.has(building), data?.buildings.size];
   });
   if (!tileData) {
      return null;
   }
   return (
      <td key={building}>
         {tileData.buildings.has(building) ? (
            <DemolishBuildingButton style={BuildingConstructionButtonStyle} building={building} tile={tile}>
               {DemolishButton}
            </DemolishBuildingButton>
         ) : (
            <BuildingConstructionButton style={BuildingConstructionButtonStyle} building={building} tile={tile}>
               {ConstructionButton}
            </BuildingConstructionButton>
         )}
      </td>
   );
}
