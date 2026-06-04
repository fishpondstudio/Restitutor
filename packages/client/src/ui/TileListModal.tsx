import { entriesOf, removeSpace, type Tile } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import { type Building, Buildings } from "../game/definitions/Building";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { isCapital } from "../game/logic/TileLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent, refreshOnTypedEventWhen } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { BuildingConstructionButton, DemolishBuildingButton } from "./BuildingConstructionButton";
import { showSidebar } from "./common/Sidebar";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { TilePage } from "./TilePage";
import { UpgradeInfrastructureButton, UpgradePopulationButton, UpgradeProductionButton } from "./UpgradeButtons";

const BuildingConstructionButtonStyle = { width: 30, height: 30, padding: 0 };
const UpgradeButtonStyle = { minWidth: 40 };
export function TileListModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <ModalComp size="xl" scrollbars="xy" title={<ModalTitleBar title={$t(L.TilesAndUpgrades)} dismiss />}>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th></th>
                     <th>{$t(L.Core)}</th>
                     <th>{$t(L.Culture)}</th>
                     <th>{$t(L.Religion)}</th>
                     <th>{$t(L.Infra)}</th>
                     <th>{$t(L.Prod)}</th>
                     <th>{$t(L.Pop)}</th>
                     <th>{$t(L.Upg)}</th>
                     <th></th>
                     {entriesOf(Buildings).map(([building, buildingData]) => (
                        <th key={building}>
                           <FloatingTip label={buildingData.name()}>
                              <img src={buildingData.image} height={30} className="img-border thin" />
                           </FloatingTip>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {Array.from(G.save.state.tiles).map(([tile, tileData]) => {
                     if (tileData.province !== G.save.state.playerProvince) {
                        return null;
                     }
                     return <TileListRow key={tile} tile={tile} />;
                  })}
               </tbody>
            </table>
         </div>
      </ModalComp>
   );
}

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
               {getTileName(tile)}
               {isCapital(tile, G.save) && <div className="mi sm text-yellow">stars</div>}
               <div className="f1" />
            </div>
            <div className="row g5">
               <div className="text-xs text-dimmed text-italic">{tileData.terrain}</div>
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
         <td>{tileData.culture}</td>
         <td>{tileData.religion}</td>
         <UpgradeButtonsColumns tile={tile} />
         <td>
            <button
               className="btn"
               onClick={() => {
                  showSidebar(<TilePage tile={tile} />);
                  G.scene.getCurrent(WorldScene)?.drawSelectors(new Set([tile]));
                  hideModal();
               }}
            >
               {$t(L.View)}
            </button>
         </td>
         {entriesOf(Buildings).map(([building, config]) => {
            return <ConstructionButtonColumn key={building} building={building} tile={tile} />;
         })}
      </tr>
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
               id={`TileListModal_UpgradeInfrastructure_${removeSpace(getTileName(tile))}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.infrastructure}
            </UpgradeInfrastructureButton>
         </td>
         <td>
            <UpgradeProductionButton
               id={`TileListModal_UpgradeProduction_${removeSpace(getTileName(tile))}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.production}
            </UpgradeProductionButton>
         </td>
         <td>
            <UpgradePopulationButton
               id={`TileListModal_UpgradePopulation_${removeSpace(getTileName(tile))}`}
               style={UpgradeButtonStyle}
               tile={tile}
            >
               {tileData.population}
            </UpgradePopulationButton>
         </td>
         <td>
            <FloatingTip label={html($t(L.TotalUpgradesXUpgradeTimesY, totalUpgrades, tileData.upgradeCount))}>
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
      return [data?.buildings.has(building)];
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
