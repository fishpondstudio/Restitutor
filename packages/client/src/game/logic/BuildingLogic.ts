import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { type Building, Buildings } from "../definitions/Building";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import type { SaveGame } from "../GameState";
import { attachModifier } from "./ModifierLogic";
import { isCoastal, isCoreTile } from "./TileLogic";

export function getBuildingConstructionCost(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   const breakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.BaseCost), value: Buildings[building].construction });
   if (
      building === "Harbour" &&
      hasProvinceUpgrade("HarbourInfrastructure", province, save) &&
      isCoreTile(tile, province, save) &&
      isCoastal(tile)
   ) {
      breakdown.multiply.push({ name: ProvinceUpgrades.HarbourInfrastructure.name(), value: -1 });
   }
   attachModifier("BuildingConstructionCost", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function getBuildingMaintenanceCost(
   building: Building,
   tile: Tile,
   province: Province,
   save: SaveGame,
): IValueBreakdown {
   const breakdown = makeValueBreakdown();
   breakdown.add.push({ name: $t(L.BaseCost), value: Buildings[building].maintenance });
   if (
      building === "Harbour" &&
      hasProvinceUpgrade("HarbourInfrastructure", province, save) &&
      isCoreTile(tile, province, save) &&
      isCoastal(tile)
   ) {
      breakdown.multiply.push({ name: ProvinceUpgrades.HarbourInfrastructure.name(), value: -1 });
   }
   attachModifier("BuildingMaintenanceCost", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}
