import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { getBorderingProvinces } from "../definitions/Tile";
import { TimedActions } from "../definitions/TimedAction";
import type { SaveGame } from "../GameState";
import {
   FabricateCasusBelliCost,
   getRelation,
   InciteUnrestCost,
   RevealElectionSupportCost,
   requireInfiltration,
   SubvertGarrisonCost,
   tryUseInfiltration,
   UndermineArmyCost,
} from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { getProvinceName, getProvincesInRange, getTotalUpgrades } from "../logic/ProvinceLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { canSabotage, trySabotage } from "../logic/TreatyLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function FabricateCasusBelliAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * 3 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "FabricateCasusBelli" }, ourProvince, save),
         requireInfiltration(FabricateCasusBelliCost, { consume: true }, ourProvince, theirProvince, save),
         {
            name: $t(L.NoDiplomaticDisputeCasusBelliYet),
            value: !relation.casusBelli.has("DiplomaticDispute"),
         },
      ]),
      effect: () => {
         if (tryUseInfiltration(FabricateCasusBelliCost, ourProvince, theirProvince, save)) {
            startTimedAction("FabricateCasusBelli", ourProvince, save);
            relation.casusBelli.set("DiplomaticDispute", {
               monthsLeft: TimedActions.FabricateCasusBelli.duration,
            });
         }
      },
   };
}

export function UndermineTheirArmyAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * 6 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "UndermineTheirArmy" }, ourProvince, save),
         requireInfiltration(UndermineArmyCost, { consume: true }, ourProvince, theirProvince, save),
      ]),
      effect: () => {
         if (tryUseInfiltration(UndermineArmyCost, ourProvince, theirProvince, save)) {
            addModifier({
               modifier: "WarPower",
               type: "multiply",
               name: $t(L.UnderminedBy$1, getProvinceName(ourProvince, save)),
               value: -0.1,
               duration: TimedActions.UndermineTheirArmy.duration,
               province: theirProvince,
               save,
            });
            startTimedAction("UndermineTheirArmy", ourProvince, save);
         }
      },
   };
}

export function CorruptOfficialsAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * 12 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "CorruptOfficials" }, ourProvince, save),
         requireInfiltration(25, { consume: false }, ourProvince, theirProvince, save),
      ]),
      effect: () => {
         startTimedAction("CorruptOfficials", ourProvince, save);
         relation.infiltrate.value += 50;
      },
   };
}

export function SubvertGarrisonAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * 6 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "SubvertGarrison" }, ourProvince, save),
         requireInfiltration(SubvertGarrisonCost, { consume: true }, ourProvince, theirProvince, save),
         {
            name: $t(L.WeShareALandBorderWithThem),
            value: getProvincesInRange(1, ourProvince, save).has(theirProvince),
         },
      ]),
      effect: () => {
         if (tryUseInfiltration(SubvertGarrisonCost, ourProvince, theirProvince, save)) {
            for (const [tile, tileData] of save.state.tiles) {
               if (tileData.province === theirProvince && getBorderingProvinces(tile, save).includes(ourProvince)) {
                  tileData.modifiers.Defense.push({
                     type: "multiply",
                     name: $t(L.SubvertedBy$1, getProvinceName(ourProvince, save)),
                     value: -0.2,
                     duration: TimedActions.SubvertGarrison.duration,
                  });
               }
            }
            startTimedAction("SubvertGarrison", ourProvince, save);
         }
      },
   };
}

export function InciteUnrestAction(ourProvince: Province, theirProvince: Province, save: SaveGame): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: getTotalUpgrades(theirProvince, save) * 6 },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "InciteUnrest" }, ourProvince, save),
         requireInfiltration(InciteUnrestCost, { consume: true }, ourProvince, theirProvince, save),
         {
            name: $t(L.WeShareALandBorderWithThem),
            value: getProvincesInRange(1, ourProvince, save).has(theirProvince),
         },
      ]),
      effect: () => {
         if (tryUseInfiltration(InciteUnrestCost, ourProvince, theirProvince, save)) {
            for (const [tile, tileData] of save.state.tiles) {
               if (tileData.province === theirProvince && getBorderingProvinces(tile, save).includes(ourProvince)) {
                  tileData.modifiers.Unrest.push({
                     type: "add",
                     name: $t(L.IncitedBy$1, getProvinceName(ourProvince, save)),
                     value: 20,
                     duration: TimedActions.InciteUnrest.duration,
                  });
               }
            }
            startTimedAction("InciteUnrest", ourProvince, save);
         }
      },
   };
}

export function RevealElectionBackingAction(
   ourProvince: Province,
   theirProvince: Province,
   save: SaveGame,
): IGameAction {
   const relation = getRelation(ourProvince, theirProvince, save);
   if (!relation) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "RevealElectionBacking" }, ourProvince, save),
         requireInfiltration(RevealElectionSupportCost, { consume: true }, ourProvince, theirProvince, save),
      ]),
      effect: () => {
         if (tryUseInfiltration(RevealElectionSupportCost, ourProvince, theirProvince, save)) {
            startTimedAction("RevealElectionBacking", ourProvince, save);
            relation.revealElectionBacking = save.state.month;
         }
      },
   };
}

export function SabotageAction(fromProvince: Province, toProvince: Province, save: SaveGame): IGameAction {
   return {
      cost: { gold: 1000 },
      condition: canSabotage(fromProvince, toProvince, save),
      effect: () => {
         trySabotage(fromProvince, toProvince, save);
      },
   };
}
