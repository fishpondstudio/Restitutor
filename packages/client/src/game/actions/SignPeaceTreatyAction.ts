import { clamp, filterInPlace, hasFlag, isNullOrUndefined } from "@project/shared/src/utils/Helper";
import { hideSidebar } from "../../ui/common/SidebarManager";
import { InvaderConqueredWarGoalModal } from "../../ui/InvaderConqueredWarGoalModal";
import { WarEndedModal } from "../../ui/WarEndedModal";
import { $t, L } from "../../utils/i18n";
import { unlockAchievement } from "../Achievement";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { showGameEventModal } from "../events/GameEventLogic";
import type { SaveGame } from "../GameState";
import { getCurrentGeneral } from "../logic/ArmyLogic";
import { getRelation } from "../logic/DiplomacyLogic";
import { annexTiles } from "../logic/MissionLogic";
import { addModifier } from "../logic/ModifierLogic";
import {
   applyPeaceTreatyOption,
   getAvailablePeaceTreatyOptions,
   type PeaceTreatyOption,
} from "../logic/PeaceTreatyLogic";
import { addProvinceStat } from "../logic/ProvinceLogic";
import { addProvinceResource } from "../logic/ResourceLogic";
import { getPlunderedUpgrade, getTruceDuration, type IWar, onWarEnded, WarFlag } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SignPeaceTreatyAction(
   war: IWar,
   province: Province,
   option: PeaceTreatyOption,
   save: SaveGame,
): IGameAction {
   return {
      condition: finalizeCondition([
         {
            name: $t(L.WeAreTheLeadAttackerOfTheWar),
            value: war.attacker === province,
         },
         {
            name: $t(L.WeHaveWonTheWar),
            value: save.state.wars.includes(war) && war.actualWarScore >= war.requiredWarScore,
         },
         {
            name: $t(L.AdditionalPeaceTreatyTerm),
            value: getAvailablePeaceTreatyOptions(war, save).includes(option),
         },
      ]),
      execute: ({ headless }) => {
         applyPeaceTreatyOption(option, war, save);
         let reduction = 0;
         if (option === "Devastation") {
            reduction += 0.1;
         }
         if (hasFlag(war.flag, WarFlag.Plunder)) {
            reduction += 0.2;
         }
         if (reduction > 0) {
            for (const tile of war.tiles) {
               const data = save.state.tiles.get(tile);
               if (data) {
                  const plunderedInfrastructure = getPlunderedUpgrade(data.infrastructure, reduction);
                  const plunderedProduction = getPlunderedUpgrade(data.production, reduction);
                  const plunderedPopulation = getPlunderedUpgrade(data.population, reduction);
                  data.infrastructure -= plunderedInfrastructure;
                  data.production -= plunderedProduction;
                  data.population -= plunderedPopulation;
                  data.upgradeCount = clamp(
                     data.upgradeCount - plunderedInfrastructure - plunderedProduction - plunderedPopulation,
                     0,
                     Number.POSITIVE_INFINITY,
                  );
               }
            }
         }
         if (getCurrentGeneral(war.attacker, save)) {
            addProvinceResource("generalSkillPoint", war.tiles.size, war.attacker, save);
         }
         if (hasProvinceUpgrade("BravestOfTheGauls", war.attacker, save)) {
            addProvinceResource("generalSkillPoint", 1, war.attacker, save);
         }
         if (hasProvinceUpgrade("VictoriousLeadership", war.attacker, save)) {
            addModifier({
               modifier: "Prestige",
               type: "multiply",
               name: ProvinceUpgrades.VictoriousLeadership.name(),
               value: 0.1,
               duration: 2 * 12,
               province: war.attacker,
               save,
            });
         }
         if (hasProvinceUpgrade("TriumphalUnity", war.attacker, save)) {
            addModifier({
               modifier: "Stability",
               type: "add",
               name: ProvinceUpgrades.TriumphalUnity.name(),
               value: 10,
               duration: 2 * 12,
               province: war.attacker,
               save,
            });
         }
         addProvinceStat("victoryCount", 1, war.attacker, save);
         if (war.attacker === save.state.playerProvince && war.tiles.size > 0) {
            if (war.tiles.size >= 2) {
               unlockAchievement("WinWar");
            }
            const defenderCapital = save.state.provinces[war.defender]?.capital;
            if (!isNullOrUndefined(defenderCapital) && war.tiles.has(defenderCapital)) {
               unlockAchievement("CaptureCapital");
            }
         }
         const truceDuration = getTruceDuration(war, save);
         onWarEnded(war, save);
         filterInPlace(save.state.wars, (w) => w !== war);
         const attackerToDefender = getRelation(war.attacker, war.defender, save);
         const defenderToAttacker = getRelation(war.defender, war.attacker, save);
         if (attackerToDefender) {
            attackerToDefender.truceUntil = save.state.month + truceDuration.value;
         }
         if (defenderToAttacker) {
            defenderToAttacker.truceUntil = save.state.month + truceDuration.value;
            defenderToAttacker.casusBelli.set("Reconquista", {
               monthsLeft: 10 * 12,
            });
         }
         const attackerProvince = save.state.provinces[war.attacker];
         if (attackerProvince?.rivals.includes(war.defender)) {
            addModifier({
               modifier: "Prestige",
               type: "multiply",
               name: $t(L.WarWonAgainstRival),
               value: 0.25,
               duration: 12 * 10,
               province: war.attacker,
               save: save,
            });
         }
         annexTiles({ tiles: [...war.tiles], province: war.attacker, save });
         if (headless) {
            if (war.defender === save.state.playerProvince) {
               showGameEventModal(InvaderConqueredWarGoalModal, { war, peaceTreatyOption: option });
            }
            if (war.coAttackers.has(save.state.playerProvince) || war.coDefenders.has(save.state.playerProvince)) {
               showGameEventModal(WarEndedModal, { war });
            }
         } else {
            hideSidebar();
         }
         addChronicleEntry(
            {
               type: "WarEnded",
               content: $t(
                  L.SignedAPeaceTreatyWithCededTilesTruce$1$2$3$4$5$6,
                  war.attacker,
                  war.defender,
                  war.defender,
                  Array.from(war.tiles)
                     .map((tile) => `<Tile>${tile}</Tile>`)
                     .join(", "),
                  war.attacker,
                  truceDuration.value,
               ),
            },
            save,
         );
      },
   };
}
