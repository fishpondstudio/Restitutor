import { cls, entriesOf, type Tile } from "@project/shared/src/utils/Helper";
import { useCallback } from "react";
import { ConstructBuildingAction, DemolishBuildingAction } from "../game/actions/BuildingActions";
import { type Building, Buildings } from "../game/definitions/Building";
import { ProvinceResourceNames } from "../game/definitions/Province";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";

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
   const maintenance = entriesOf(config.maintenance);
   const tooltip = useCallback(
      (element: React.ReactNode) => (
         <>
            <div className="h2">{config.name()}</div>
            <div className="mx10 my5">{config.desc()}</div>
            {element}
            {maintenance.length > 0 && (
               <>
                  <div className="h2">{$t(L.MonthlyMaintenanceCost)}</div>
                  {maintenance.map(([resource, cost]) => (
                     <div className="row mx10 my5" key={resource}>
                        <div className="f1">{ProvinceResourceNames[resource]()}</div>
                        <div>
                           {cost}
                           <span className="text-dimmed text-xs">{$t(L.Month)}</span>
                        </div>
                     </div>
                  ))}
               </>
            )}
         </>
      ),
      [config, maintenance],
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
         action={ConstructBuildingAction(building, tile, G.save.state.playerProvince, G.save)}
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
         action={DemolishBuildingAction(building, tile, G.save.state.playerProvince, G.save)}
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
