import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type Building, Buildings } from "../definitions/Building";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getTileBuildingCondition, tileIsOurCoreCondition } from "../logic/TileLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function ConstructBuildingAction(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IGameAction {
   const config = Buildings[building];
   return {
      cost: config.construction,
      condition: getTileBuildingCondition(building, tile, province, save),
      effect: () => {
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
      condition: finalizeCondition({
         breakdown: [
            tileIsOurCoreCondition(tile, province, save),
            {
               name: $t(L.$1IsBuilt, Buildings[building].name()),
               value: save.state.tiles.get(tile)?.buildings.has(building) ?? false,
            },
         ],
      }),
      effect: () => {
         const tileData = save.state.tiles.get(tile);
         if (tileData) {
            tileData.buildings.delete(building);
         }
      },
   };
}
