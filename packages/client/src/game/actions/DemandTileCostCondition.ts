import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { getBorderingProvinces } from "../definitions/Tile";
import { getTileName } from "../definitions/TileName";
import type { SaveGame } from "../GameState";
import { getRelation, isWithinDiplomaticRange } from "../logic/DiplomacyLogic";
import { isGreatPowerCondition, isNorGreatPowerCondition } from "../logic/ProvinceLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { getTruceMonthsLeft, getWarForTile, getWarsBetween } from "../logic/WarLogic";
import { finalizeCondition, type ICondition, type IGameCostCondition } from "./GameAction";

export function DemandTileCostCondition(
   ourProvince: Province,
   theirProvince: Province,
   additionalConditions: ICondition[],
   save: SaveGame,
): IGameCostCondition {
   return {
      cost: { diplomatic: 50 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "DemandTile" }, ourProvince, save),
         isGreatPowerCondition(ourProvince, save),
         isNorGreatPowerCondition(theirProvince, save),
         isWithinDiplomaticRange(ourProvince, theirProvince, save),
         {
            name: $t(L.WeHaveNoTreatyWithThem),
            value: getRelation(ourProvince, theirProvince, save)?.treaty === undefined,
         },
         {
            name: $t(L.WeHaventGuaranteedTheirDefense),
            value: getRelation(ourProvince, theirProvince, save)?.guaranteeDefense === undefined,
         },
         {
            name: $t(L.WeAreNotAlreadyAtWarWithThem),
            value: getWarsBetween(ourProvince, theirProvince, save).length === 0,
         },
         {
            name: $t(L.WeAreNotInATruceWithThem),
            value: getTruceMonthsLeft(ourProvince, theirProvince, save) <= 0,
         },
         ...additionalConditions,
      ]),
   };
}

export function canDemandTile(tile: Tile, ourProvince: Province, save: SaveGame): ICondition[] {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      return [];
   }
   return [
      {
         name: $t(L.$1IsNotContestedInAWar, getTileName(tile, save)),
         value: getWarForTile(tile, save) === undefined,
      },
      {
         name: $t(L.$1IsNotTheirCapital, getTileName(tile, save)),
         value: save.state.provinces[tileData.province]?.capital !== tile,
      },
      {
         name: $t(L.$1BordersOurProvince, getTileName(tile, save)),
         value: getBorderingProvinces(tile, save).includes(ourProvince),
      },
   ];
}
