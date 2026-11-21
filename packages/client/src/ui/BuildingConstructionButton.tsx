import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { useCallback } from "react";
import { ConstructBuildingAction, DemolishBuildingAction } from "../game/actions/BuildingActions";
import { type Building, Buildings } from "../game/definitions/Building";
import { getResourceName } from "../game/definitions/ProvinceResources";
import { getBuildingConstructionCost, getBuildingMaintenanceCost } from "../game/logic/BuildingLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { ProvinceResourceImages } from "./ProvinceResourceImages";

export function BuildingConstructionButton({
   building,
   tile,
   children,
   className,
   style,
}: React.PropsWithChildren<{
   building: Building;
   tile: Tile;
   className?: string;
   style?: React.CSSProperties;
}>): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   const config = Buildings[building];
   const tooltip = useCallback(
      (element: React.ReactNode) => {
         const maintenanceCost = getBuildingMaintenanceCost(building, tile, G.save.state.playerProvince, G.save);
         return (
            <>
               <div className="h2">{config.name()}</div>
               <div className="mx10 my5">{config.desc()}</div>
               {element}
               <div className="box m5">
                  <div className="h2">{$t(L.TheCostIsCalculatedAsFollows)}</div>
                  <BreakdownComp
                     breakdown={getBuildingConstructionCost(building, tile, G.save.state.playerProvince, G.save)}
                  />
               </div>
               <div className="h2">{$t(L.MonthlyMaintenanceCost)}</div>
               <div className="row mx10 my5 g5">
                  <img src={ProvinceResourceImages.gold} className="icon-block" />
                  <div className="f1">{getResourceName("gold", G.save.state.scenario)}</div>
                  <div>
                     {maintenanceCost.value}
                     <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                  </div>
               </div>
               <div className="box m5">
                  <div className="h2">{$t(L.TheCostIsCalculatedAsFollows)}</div>
                  <BreakdownComp breakdown={maintenanceCost} />
               </div>
            </>
         );
      },
      [config, building, tile],
   );

   if (!tileData) {
      return null;
   }
   if (tileData.buildings.has(building)) {
      return null;
   }
   return (
      <ActionButton
         className={className}
         style={style}
         action={() => ConstructBuildingAction(building, tile, G.save.state.playerProvince, G.save)}
         tooltip={tooltip}
      >
         {children}
      </ActionButton>
   );
}

export function DemolishBuildingButton({
   building,
   tile,
   children,
   className,
   style,
}: React.PropsWithChildren<{
   building: Building;
   tile: Tile;
   className?: string;
   style?: React.CSSProperties;
}>): React.ReactNode {
   return (
      <ActionButton
         className={cls("red", className)}
         style={style}
         action={() => DemolishBuildingAction(building, tile, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <div className="m10">{$t(L.AreYouSureYouWantToDemolishThisBuilding)}</div>
               {element}
            </>
         )}
      >
         {children}
      </ActionButton>
   );
}
