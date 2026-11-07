import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import type { SaveGame } from "../GameState";
import { addProvinceStat } from "../logic/ProvinceLogic";
import { getTileMakeCoreCost, isCoastal } from "../logic/TileLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import type { IGameAction, IGameEffectWithName } from "./GameAction";
import { finalizeCondition } from "./GameAction";

export function MakeCoreAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   const tileData = save.state.tiles.get(tile);
   if (!tileData) {
      return EmptyGameAction;
   }
   let effect: IGameEffectWithName | undefined;
   if (hasProvinceUpgrade("CoastalMandate", province, save) && isCoastal(tile)) {
      effect = {
         name: ProvinceUpgrades.CoastalMandate.name(),
         resources: { consulPoint: 1 },
      };
   }
   const cost = getTileMakeCoreCost(tile, save);
   return {
      cost: { administrative: cost.value, dominionPoint: 1 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "MakeCore" }, province, save),
         {
            name: $t(L.TileIsOurs),
            value: tileData.province === province,
         },
         {
            name: $t(L.TileIsNotYetOurCore),
            value: !tileData.coreProvinces.has(province),
         },
      ]),
      execute: () => {
         tileData.coreProvinces.add(province);
         addProvinceStat("makeCoreCount", 1, province, save);
      },
      effect,
   };
}
