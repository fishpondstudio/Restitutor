import type { Tile } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getAnnexClientCost, getRelation } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { getWarsBetween } from "../logic/WarLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SummonGovernorAction(ourProvince: Province, clientProvince: Province, save: SaveGame): IGameAction {
   const usToThem = getRelation(ourProvince, clientProvince, save);
   const themToUs = getRelation(clientProvince, ourProvince, save);
   if (!usToThem || !themToUs) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "SummonGovernor" }, ourProvince, save),
         {
            name: $t(L.TheyAreOurClient),
            value: usToThem.treaty?.type === "Patron" && themToUs.treaty?.type === "Client",
         },
         {
            name: $t(L.WeAreNotAtWarWithThem),
            value: getWarsBetween(ourProvince, clientProvince, save).length === 0,
         },
      ]),
      effect: () => {
         startTimedAction("SummonGovernor", ourProvince, save);
         addModifier({
            modifier: "Prestige",
            type: "multiply",
            name: $t(
               L.$1Summoned$2sGovernor,
               getProvinceName(ourProvince, save),
               getProvinceName(clientProvince, save),
            ),
            value: 0.1,
            duration: TimedActions.SummonGovernor.duration,
            province: ourProvince,
            save,
         });
         addModifier({
            modifier: "Prestige",
            type: "multiply",
            name: $t(
               L.$1Summoned$2sGovernor,
               getProvinceName(clientProvince, save),
               getProvinceName(ourProvince, save),
            ),
            value: -0.1,
            duration: TimedActions.SummonGovernor.duration,
            province: clientProvince,
            save,
         });
      },
   };
}

export function RequestMilitaryAidAction(ourProvince: Province, clientProvince: Province, save: SaveGame): IGameAction {
   const usToThem = getRelation(ourProvince, clientProvince, save);
   const themToUs = getRelation(clientProvince, ourProvince, save);
   if (!usToThem || !themToUs) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "RequestMilitaryAid" }, ourProvince, save),
         {
            name: $t(L.TheyAreOurClient),
            value: usToThem.treaty?.type === "Patron" && themToUs.treaty?.type === "Client",
         },
         {
            name: $t(L.WeAreNotAtWarWithThem),
            value: getWarsBetween(ourProvince, clientProvince, save).length === 0,
         },
      ]),
      effect: () => {
         startTimedAction("RequestMilitaryAid", ourProvince, save);
         const name = $t(
            L.$1RequestedMilitaryAidFrom$2,
            getProvinceName(ourProvince, save),
            getProvinceName(clientProvince, save),
         );
         addModifier({
            modifier: "WarPower",
            type: "multiply",
            name,
            value: 0.1,
            duration: TimedActions.RequestMilitaryAid.duration,
            province: ourProvince,
            save,
         });
         addModifier({
            modifier: "WarPower",
            type: "multiply",
            name,
            value: -0.1,
            duration: TimedActions.RequestMilitaryAid.duration,
            province: clientProvince,
            save,
         });
      },
   };
}

export function AnnexClientAction(ourProvince: Province, clientProvince: Province, save: SaveGame): IGameAction {
   const usToThem = getRelation(ourProvince, clientProvince, save);
   const themToUs = getRelation(clientProvince, ourProvince, save);
   if (!usToThem || !themToUs) {
      return EmptyGameAction;
   }
   return {
      cost: getAnnexClientCost(ourProvince, clientProvince, save),
      condition: finalizeCondition([
         ...timedActionConditions({ action: "AnnexClient" }, ourProvince, save),
         {
            name: $t(L.TheyAreOurClient),
            value: usToThem.treaty?.type === "Patron" && themToUs.treaty?.type === "Client",
         },
         {
            name: $t(L.WeAreNotAtWarWithThem),
            value: getWarsBetween(ourProvince, clientProvince, save).length === 0,
         },
      ]),
      effect: () => {
         startTimedAction("AnnexClient", ourProvince, save);
         const tiles = new Set<Tile>();
         for (const [tile, data] of save.state.tiles) {
            if (data.province === clientProvince) {
               data.province = ourProvince;
               tiles.add(tile);
            }
         }
         RefreshTiles.emit({ tiles, options: { indicator: true, visual: true } });
      },
   };
}
