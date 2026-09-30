import { forEach, round, type Tile } from "@project/shared/src/utils/Helper";
import { hideSidebar } from "../../ui/common/SidebarManager";
import { DeclareWarOnUsModal } from "../../ui/DeclareWarOnUsModal";
import { DrawnIntoWarModal } from "../../ui/DrawnIntoWarModal";
import { $t, L } from "../../utils/i18n";
import { unlockAchievement } from "../Achievement";
import { CasusBelli } from "../definitions/CasusBelli";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { RefreshTiles } from "../Events";
import { showGameEventModal } from "../events/GameEventLogic";
import type { SaveGame } from "../GameState";
import { toConditions } from "../logic/Calculation";
import {
   addAttitudeModifier,
   getRelation,
   isClientOfAnyProvince,
   isWithinDiplomaticRange,
} from "../logic/DiplomacyLogic";
import { hasLegacyUpgrade } from "../logic/LegacyUpgradeLogic";
import { addModifier } from "../logic/ModifierLogic";
import { addProvinceStat, getProvinceName } from "../logic/ProvinceLogic";
import { requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import {
   getWarCoalitions,
   getWarScore,
   getWarTiles,
   requireNoTruceBetweenChecks,
   WarFlag,
   WarOneTimeDiplomaticPoint,
} from "../logic/WarLogic";
import { finalizeCondition, type IConditionBreakdown, type IGameAction, type IValueBreakdownItem } from "./GameAction";

export function DeclareWarAction(
   attacker: Province,
   coAttackers: Map<Province, IConditionBreakdown>,
   defender: Province,
   coDefenders: Map<Province, IConditionBreakdown>,
   tiles: Set<Tile>,
   casusBelli: CasusBelli,
   save: SaveGame,
): IGameAction {
   const warScore = getWarScore(attacker, defender, tiles, casusBelli, save);
   const warTiles = getWarTiles(save);
   const warCoalitions = getWarCoalitions([attacker, defender], save);
   return {
      cost: {
         diplomatic: casusBelli === "BarbarianRaid" ? 0 : WarOneTimeDiplomaticPoint,
      },
      condition: finalizeCondition([
         {
            name: $t(L.WeHaveNoTreatyWithThem),
            value: getRelation(attacker, defender, save)?.treaty === undefined,
         },
         {
            name: $t(L.WeAreNotAClientOfAnotherProvince),
            value: !isClientOfAnyProvince(attacker, save),
         },
         {
            name: $t(L.OurSelectedCasusBelliIsStillValid),
            value: casusBelli === "None" || !!getRelation(attacker, defender, save)?.casusBelli.has(casusBelli),
         },
         {
            name: $t(L.WeHaveSelectedAtLeastOneTileAsWarGoal),
            value: tiles.size > 0,
         },
         {
            name: $t(L.WeHaveNotSelectedAnyTilesThatAreAlreadyInAWar),
            value: Array.from(tiles).every((tile) => !warTiles.has(tile)),
         },
         ...toConditions(
            requirePeaceBetweenChecks(attacker, defender, save),
            requireNoTruceBetweenChecks(attacker, defender, save),
         ),
         {
            name: $t(L.WeHaventGuaranteedTheirDefense),
            value: getRelation(attacker, defender, save)?.guaranteeDefense === undefined,
         },
         {
            name: $t(L.WeAreNotInTheSameWarCoalition),
            value: warCoalitions.length === 0,
            desc:
               warCoalitions.length > 0
                  ? $t(
                       L.WeAreInTheFollowingWarCoalitions$1,
                       warCoalitions
                          .map((w) =>
                             $t(L.$1$2War, getProvinceName(w.attacker, save), getProvinceName(w.defender, save)),
                          )
                          .join(", "),
                    )
                  : undefined,
         },
         ...(casusBelli === "BarbarianRaid" ? [] : [isWithinDiplomaticRange(attacker, defender, save)]),
      ]),
      execute: ({ headless }: { headless: boolean }) => {
         const war = {
            attacker: attacker,
            coAttackers: new Map(
               Array.from(coAttackers)
                  .filter(([_, condition]) => condition.value)
                  .map(([province]) => [province, { value: true, breakdown: [] }]),
            ),
            defender: defender,
            coDefenders: new Map(
               Array.from(coDefenders)
                  .filter(([_, condition]) => condition.value)
                  .map(([province]) => [province, { value: true, breakdown: [] }]),
            ),
            tiles: tiles,
            casusBelli: casusBelli,
            requiredWarScore: round(warScore.value, 2),
            actualWarScore: 0,
            log: [],
            flag: WarFlag.None,
         };
         save.state.wars.push(war);
         doOneTimeConsequences(attacker, defender, tiles, casusBelli, save);
         addProvinceStat("attackCount", 1, attacker, save);
         addProvinceStat("defendCount", 1, defender, save);
         const attackerToDefender = getRelation(attacker, defender, save);
         if (attackerToDefender) {
            attackerToDefender.trade = undefined;
            if (hasLegacyUpgrade("InfiltrationOnDeclaringWar", attacker, save)) {
               attackerToDefender.infiltrate.value += 25;
            }
         }
         const defenderToAttacker = getRelation(defender, attacker, save);
         if (defenderToAttacker) {
            defenderToAttacker.trade = undefined;
         }

         RefreshTiles.emit({ tiles: tiles, options: { indicator: true } });
         if (headless) {
            if (war.defender === save.state.playerProvince) {
               showGameEventModal(DeclareWarOnUsModal, { war });
            }
            if (war.coAttackers.has(save.state.playerProvince) || war.coDefenders.has(save.state.playerProvince)) {
               showGameEventModal(DrawnIntoWarModal, { war });
            }
         } else {
            hideSidebar();
         }

         if (attacker === save.state.playerProvince && casusBelli !== "None" && casusBelli !== "ConquestMission") {
            unlockAchievement("DeclareWar");
         }

         addChronicleEntry(
            {
               type: "WarStarted",
               content: $t(
                  L.$1DeclaredWarOn$2WithTheGoalOfOccupying$3,
                  attacker,
                  defender,
                  Array.from(war.tiles)
                     .map((tile) => `<Tile>${tile}</Tile>`)
                     .join(", "),
               ),
            },
            save,
         );
      },
   };
}

export function getOneTimeConsequences(
   attacker: Province,
   defender: Province,
   tiles: Set<Tile>,
   casusBelli: CasusBelli,
   save: SaveGame,
): IValueBreakdownItem[] {
   const result: IValueBreakdownItem[] = [];
   result.push({
      name: $t(L.DiplomaticPoint),
      desc: $t(L.TheFixedCostOfDeclaringWar),
      value: -WarOneTimeDiplomaticPoint,
   });
   result.push({
      name: $t(L.$1sAttitude, getProvinceName(defender, save)),
      desc: $t(L.For$1YearsBecauseWeAreAttackingThem, "50"),
      value: -100,
   });
   if (casusBelli === "None") {
      result.push({
         name: $t(L.AllProvincesAttitude),
         desc: $t(L.For$1YearsDueToLackOfCasusBelli, "10"),
         value: -50,
      });
      result.push({
         name: $t(L.Stability),
         desc: $t(L.For$1YearsDueToLackOfCasusBelli, "10"),
         value: -20,
      });
   }
   return result;
}

export function doOneTimeConsequences(
   attacker: Province,
   defender: Province,
   tiles: Set<Tile>,
   casusBelli: CasusBelli,
   save: SaveGame,
): void {
   addAttitudeModifier(
      defender,
      attacker,
      {
         type: "add",
         name: $t(L.$1DeclaredWarOn$2, getProvinceName(attacker, save), getProvinceName(defender, save)),
         value: -100,
         duration: 12 * 50,
      },
      save,
   );
   if (casusBelli === "None") {
      forEach(save.state.provinces, (otherProvince) => {
         if (otherProvince === attacker) {
            return;
         }
         addAttitudeModifier(
            otherProvince,
            attacker,
            {
               type: "add",
               name: $t(L.$1DeclaredWarWithoutCasusBelli, getProvinceName(attacker, save)),
               value: -50,
               duration: 12 * 10,
            },
            save,
         );
      });
      addModifier({
         modifier: "Stability",
         type: "add",
         name: $t(L.DeclaredWarWithoutCasusBelli),
         value: -20,
         duration: 12 * 10,
         province: attacker,
         save: save,
      });
   }
   if (hasProvinceUpgrade("CampaignRequisitions", attacker, save)) {
      for (const modifier of ["LandTax", "TileOutput"] as const) {
         addModifier({
            modifier,
            type: "multiply",
            name: ProvinceUpgrades.CampaignRequisitions.name(),
            value: 0.1,
            duration: 12,
            province: attacker,
            save,
         });
      }
   }
   if (casusBelli === "HumiliateRival") {
      addModifier({
         modifier: "WarPower",
         type: "multiply",
         name: $t(L.$1CasusBelli, CasusBelli.HumiliateRival.name()),
         value: 0.1,
         duration: 12 * 5,
         province: attacker,
         save: save,
      });
   }
   if (casusBelli === "PublicEnemy") {
      addModifier({
         modifier: "WarPower",
         type: "multiply",
         name: $t(L.$1CasusBelli, CasusBelli.PublicEnemy.name()),
         value: 0.2,
         duration: 12 * 2,
         province: attacker,
         save: save,
      });
   }
   if (casusBelli === "DiplomaticDispute") {
      addModifier({
         modifier: "Prestige",
         type: "multiply",
         name: $t(L.$1CasusBelli, CasusBelli.DiplomaticDispute.name()),
         value: -0.1,
         duration: 12 * 5,
         province: attacker,
         save: save,
      });
   }
   if (casusBelli === "DemandRejected") {
      addModifier({
         modifier: "Prestige",
         type: "multiply",
         name: $t(L.$1CasusBelli, CasusBelli.DemandRejected.name()),
         value: 0.1,
         duration: 12 * 5,
         province: attacker,
         save: save,
      });
   }
}
