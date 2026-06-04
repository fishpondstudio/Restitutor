import { entriesOf, type Tile } from "@project/shared/src/utils/Helper";
import { Buildings } from "../game/definitions/Building";
import { Modifiers } from "../game/definitions/Modifier";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getBuildingSlot } from "../game/logic/TileLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { BreakdownTooltip } from "./BreakdownRow";
import { BuildingConstructionButton, DemolishBuildingButton } from "./BuildingConstructionButton";
import { FloatingTip } from "./components/FloatingTip";
import { Grid2 } from "./UIConstant";

export function TileBuildingsModal({ tile }: { tile: Tile }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const buildingSlots = getBuildingSlot(tile, G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.BuildingsInX, getTileName(tile))} dismiss />}>
         <BreakdownTooltip
            breakdown={buildingSlots}
            tooltip={(element) => (
               <>
                  <div className="m10">{Modifiers.BuildingSlot.desc()}</div>
                  {element}
               </>
            )}
         >
            <div className="box row m10 p10">
               <div className="f1">{$t(L.UsedTotalBuildingSlots)}</div>
               <div>
                  {tileData.buildings.size}/{buildingSlots.value}
               </div>
            </div>
         </BreakdownTooltip>
         <div className="m10" style={Grid2}>
            {entriesOf(Buildings).map(([building, config], index) => {
               return (
                  <div key={building} className="box row p10">
                     <FloatingTip label={config.imageCredit}>
                        <div>
                           <img key={building} src={Buildings[building].image} height={50} className="img-border" />
                        </div>
                     </FloatingTip>
                     <div className="f1">
                        <div className="text-display text-lg">{config.name()}</div>
                        <div className="text-sm text-dimmed">{config.desc()}</div>
                     </div>
                     <div>
                        {tileData.buildings.has(building) ? (
                           <DemolishBuildingButton building={building} tile={tile}>
                              {$t(L.Demolish)}
                           </DemolishBuildingButton>
                        ) : (
                           <BuildingConstructionButton building={building} tile={tile}>
                              {$t(L.Build)}
                           </BuildingConstructionButton>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </ModalComp>
   );
}
