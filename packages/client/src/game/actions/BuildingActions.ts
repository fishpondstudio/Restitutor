import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type Building, Buildings } from "../definitions/Building";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getBuildingConstructionCost } from "../logic/BuildingLogic";
import { tileIsOurCoreCondition } from "../logic/MissionLogic";
import { getTileBuildingCondition } from "../logic/TileLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function ConstructBuildingAction(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IGameAction {
   return {
      cost: { gold: getBuildingConstructionCost(building, tile, province, save).value },
      condition: getTileBuildingCondition(building, tile, province, save),
      execute: () => {
         const tileData = save.state.tiles.get(tile);
         if (tileData) {
            tileData.buildings.add(building);
         }
      },
   };
}

export function DemolishBuildingAction(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IGameAction {
   return {
      condition: finalizeCondition([
         tileIsOurCoreCondition(tile, province, save),
         {
            name: $t(L.$1IsBuilt, Buildings[building].name()),
            value: save.state.tiles.get(tile)?.buildings.has(building) ?? false,
         },
      ]),
      execute: () => {
         const tileData = save.state.tiles.get(tile);
         if (tileData) {
            tileData.buildings.delete(building);
         }
      },
   };
}
