import type { Tile } from "@project/shared/src/utils/Helper";
import type { Province } from "../definitions/Province";
import { OpenTilePage } from "../Events";
import type { SaveGame } from "../GameState";
import { toConditions } from "../logic/Calculation";
import { settleTileChecks, startSettlement } from "../logic/SettlementLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SettleTileAction(tile: Tile, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { mandate: 1 },
      condition: finalizeCondition([
         ...toConditions(settleTileChecks(tile, province, save)),
         ...timedActionConditions({ action: "SettleTile" }, province, save),
      ]),
      execute: ({ headless }) => {
         startTimedAction("SettleTile", province, save);
         startSettlement(tile, province, save);
         if (!headless) {
            OpenTilePage.emit({ tile });
         }
      },
   };
}
