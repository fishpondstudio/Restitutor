import type { Tile } from "@project/shared/src/utils/Helper";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getTileUpgradeCost, tileIsOurCoreCondition } from "../logic/TileLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import type { IGameAction } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function UpgradePopulationAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const upgradeCost = getTileUpgradeCost(tile, "military", save);
   return {
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "UpgradePopulation" }, province, save),
            tileIsOurCoreCondition(tile, province, save),
         ],
      }),
      cost: { military: upgradeCost.value },
      effect: () => {
         ++tileData.upgradeCount;
         ++tileData.population;
      },
   };
}

export function UpgradeProductionAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const upgradeCost = getTileUpgradeCost(tile, "diplomatic", save);
   return {
      cost: { diplomatic: upgradeCost.value },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "UpgradeProduction" }, province, save),
            tileIsOurCoreCondition(tile, province, save),
         ],
      }),
      effect: () => {
         ++tileData.upgradeCount;
         ++tileData.production;
      },
   };
}

export function UpgradeInfrastructureAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      throw new Error(`Tile ${tile} not found`);
   }
   const upgradeCost = getTileUpgradeCost(tile, "administrative", save);
   return {
      cost: { administrative: upgradeCost.value },
      condition: finalizeCondition({
         breakdown: [
            ...timedActionConditions({ action: "UpgradeInfrastructure" }, province, save),
            tileIsOurCoreCondition(tile, province, save),
         ],
      }),
      effect: () => {
         ++tileData.upgradeCount;
         ++tileData.infrastructure;
      },
   };
}
