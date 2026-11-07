import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import type { GovernorPower } from "../definitions/ProvinceResources";
import { hasProvinceUpgradeCondition } from "../definitions/ProvinceUpgrades";
import type { ITileData } from "../definitions/Tile";
import type { SaveGame } from "../GameState";
import { addProvinceResource } from "../logic/ResourceLogic";
import { getTilePillageRefund } from "../logic/TileLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export type PillageUpgrade = keyof Pick<ITileData, "infrastructure" | "production" | "population">;

export const PillageUpgrades = {
   infrastructure: { name: () => $t(L.PillageInfrastructure), resource: "administrative" },
   production: { name: () => $t(L.PillageProduction), resource: "diplomatic" },
   population: { name: () => $t(L.PillagePopulation), resource: "military" },
} as const satisfies Record<PillageUpgrade, { name: () => string; resource: GovernorPower }>;

export function PillageAction(tile: Tile, upgrade: PillageUpgrade, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData || !save.state.provinces[province]) {
      return EmptyGameAction;
   }
   const config = PillageUpgrades[upgrade];
   return {
      cost: { dominionPoint: 1 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "Pillage" }, province, save),
         hasProvinceUpgradeCondition("RightOfPlunder", province, save),
         {
            name: $t(L.TileIsOurs),
            value: tileData.province === province,
         },
         {
            name: $t(L.TileIsNotYetOurCore),
            value: !tileData.coreProvinces.has(province),
         },
         { name: $t(L.SelectedTileUpgradeIsAtLeast$1, "2"), value: tileData[upgrade] >= 2 },
         { name: $t(L.TileHasBeenUpgradedAtLeast$1Times, "1"), value: tileData.upgradeCount >= 1 },
      ]),
      execute: () => {
         const refund = getTilePillageRefund(tile, config.resource, save);
         --tileData[upgrade];
         --tileData.upgradeCount;
         addProvinceResource(config.resource, refund, province, save);
         tileData.modifiers.Unrest.push({ type: "add", value: 10, duration: 12 * 5, name: config.name() });
      },
   };
}
