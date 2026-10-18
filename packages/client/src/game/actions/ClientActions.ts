import { keysOf, type Tile } from "@project/shared/src/utils/Helper";
import { hideSidebar } from "../../ui/common/SidebarManager";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import type { CasusBelli } from "../definitions/CasusBelli";
import type { Province } from "../definitions/Province";
import { getBorderingProvinces } from "../definitions/Tile";
import { type TimedAction, TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import { toConditions } from "../logic/Calculation";
import { getAnnexClientCost, getRelation, getRelations } from "../logic/DiplomacyLogic";
import { annexTiles } from "../logic/MissionLogic";
import { addModifier } from "../logic/ModifierLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { addProvinceResource, getProvinceResource, spendProvinceResource } from "../logic/ResourceLogic";
import { requireScenarioFlagCondition } from "../logic/ScenarioLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { getWarForTile } from "../logic/WarLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type ICondition, type IGameAction } from "./GameAction";

export function clientActionConditions(
   action: TimedAction,
   ourProvince: Province,
   clientProvince: Province,
   save: SaveGame,
): ICondition[] {
   return [
      ...timedActionConditions({ action }, ourProvince, save),
      {
         name: $t(L.$1IsOurClient, getProvinceName(clientProvince, save)),
         value:
            !!save.state.provinces[ourProvince] &&
            !!save.state.provinces[clientProvince] &&
            getRelation(ourProvince, clientProvince, save)?.treaty?.type === "Patron" &&
            getRelation(clientProvince, ourProvince, save)?.treaty?.type === "Client",
      },
      ...toConditions(requirePeaceBetweenChecks(ourProvince, clientProvince, save)),
   ];
}

export function getGrantLandTiles(ourProvince: Province, clientProvince: Province, save: SaveGame): Tile[] {
   const capitals = new Set(keysOf(save.state.provinces).map((province) => save.state.provinces[province]?.capital));
   return Array.from(save.state.tiles)
      .filter(
         ([tile, data]) =>
            data.province === ourProvince &&
            data.coreProvinces.has(ourProvince) &&
            !capitals.has(tile) &&
            getWarForTile(tile, save) === undefined &&
            getBorderingProvinces(tile, save).includes(clientProvince),
      )
      .map(([tile]) => tile);
}

export function GrantLandAction(
   ourProvince: Province,
   clientProvince: Province,
   tile: Tile,
   save: SaveGame,
): IGameAction {
   const tiles = getGrantLandTiles(ourProvince, clientProvince, save);
   return {
      condition: finalizeCondition([
         ...clientActionConditions("GrantLand", ourProvince, clientProvince, save),
         {
            name: $t(L.$1HasAvailableTilesToGrant, getProvinceName(ourProvince, save)),
            value: tiles.includes(tile),
         },
      ]),
      execute: ({ headless }) => {
         annexTiles({ tiles: [tile], province: clientProvince, save });
         startTimedAction("GrantLand", ourProvince, save);
         if (!headless) {
            hideSidebar();
         }
      },
      effect: {
         name: TimedActions.GrantLand.name(),
         modifiers: {
            LandTax: {
               type: "multiply",
               value: 0.1,
               duration: TimedActions.GrantLand.duration,
            },
         },
      },
   };
}

type CasusBelliResult = {
   province: Province;
   casusBelli: CasusBelli;
   monthsLeft: number;
};

export function getClientCasusBelli(
   ourProvince: Province,
   clientProvince: Province,
   save: SaveGame,
): CasusBelliResult[] {
   const result: CasusBelliResult[] = [];
   getRelations(clientProvince, save)?.forEach((relation, otherProvince) => {
      if (otherProvince === ourProvince) return;
      relation.casusBelli.forEach((data, casusBelli) => {
         if (data.monthsLeft <= 0) return;
         result.push({ province: otherProvince, casusBelli, monthsLeft: data.monthsLeft });
      });
   });
   return result;
}

export function AdoptClientCauseAction(
   ourProvince: Province,
   clientProvince: Province,
   cb: CasusBelliResult,
   save: SaveGame,
): IGameAction {
   const causes = getClientCasusBelli(ourProvince, clientProvince, save);
   return {
      condition: finalizeCondition([
         ...clientActionConditions("AdoptClientCause", ourProvince, clientProvince, save),
         {
            name: $t(L.$1HasActiveCasusBelli, getProvinceName(clientProvince, save)),
            value: causes.some((entry) => entry.province === cb.province && entry.casusBelli === cb.casusBelli),
         },
      ]),
      execute: ({ headless }) => {
         const source = getRelation(clientProvince, cb.province, save)?.casusBelli.get(cb.casusBelli);
         const relation = getRelation(ourProvince, cb.province, save);
         if (!source || !relation) return;
         relation.casusBelli.set(cb.casusBelli, {
            ...source,
            monthsLeft: Math.max(source.monthsLeft, relation.casusBelli.get(cb.casusBelli)?.monthsLeft ?? 0),
         });
         startTimedAction("AdoptClientCause", ourProvince, save);
         if (!headless) {
            hideModal();
         }
      },
   };
}

export function RequestConsulPointAction(ourProvince: Province, clientProvince: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition([
         ...clientActionConditions("RequestConsulPoint", ourProvince, clientProvince, save),
         ...requireScenarioFlagCondition("Senate", save),
         {
            name: $t(L.$1HasAConsulPoint, getProvinceName(clientProvince, save)),
            value: getProvinceResource("consulPoint", clientProvince, save) >= 1,
         },
      ]),
      execute: () => {
         spendProvinceResource("consulPoint", 1, clientProvince, save);
         addProvinceResource("consulPoint", 1, ourProvince, save);
         startTimedAction("RequestConsulPoint", ourProvince, save);
      },
   };
}

export function SummonGovernorAction(ourProvince: Province, clientProvince: Province, save: SaveGame): IGameAction {
   const usToThem = getRelation(ourProvince, clientProvince, save);
   const themToUs = getRelation(clientProvince, ourProvince, save);
   if (!usToThem || !themToUs) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition(clientActionConditions("SummonGovernor", ourProvince, clientProvince, save)),
      execute: () => {
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
      condition: finalizeCondition(clientActionConditions("RequestMilitaryAid", ourProvince, clientProvince, save)),
      execute: () => {
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
      condition: finalizeCondition(clientActionConditions("AnnexClient", ourProvince, clientProvince, save)),
      execute: () => {
         startTimedAction("AnnexClient", ourProvince, save);
         const tiles: Tile[] = [];
         for (const [tile, data] of save.state.tiles) {
            if (data.province === clientProvince) {
               tiles.push(tile);
            }
         }
         annexTiles({ tiles, province: ourProvince, save });
      },
   };
}
