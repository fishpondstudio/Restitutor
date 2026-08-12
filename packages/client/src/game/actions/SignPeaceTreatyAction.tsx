import { filterInPlace, hasFlag } from "@project/shared/src/utils/Helper";
import { InvaderConqueredWarGoalModal } from "../../ui/InvaderConqueredWarGoalModal";
import { WarEndedModal } from "../../ui/WarEndedModal";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import { unlockAchievement } from "../Achievement";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getRelation } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { addProvinceResource, addProvinceStat, ensureProvinceCapitals } from "../logic/ProvinceLogic";
import { showGameEventModal } from "../logic/TickProvince";
import { getCurrentGeneral, getTruceDuration, type IWar, WarFlag } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SignPeaceTreatyAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition([
         {
            name: $t(L.WeAreTheLeadAttackerOfTheWar),
            value: war.attacker === province,
         },
         {
            name: $t(L.WeHaveWonTheWar),
            value: war.actualWarScore >= war.requiredWarScore,
         },
      ]),
      effect: ({ headless }) => {
         const defenderCapital = save.state.provinces[war.defender]?.capital;
         const capturedCapital = defenderCapital !== undefined && war.tiles.has(defenderCapital);
         for (const tile of war.tiles) {
            const data = save.state.tiles.get(tile);
            if (data) {
               data.province = war.attacker;
               if (hasFlag(war.flag, WarFlag.Plunder)) {
                  data.infrastructure = Math.max(1, data.infrastructure - 1);
                  data.production = Math.max(1, data.production - 1);
                  data.population = Math.max(1, data.population - 1);
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
         addProvinceStat("victoryCount", 1, war.attacker, save);
         if (war.attacker === save.state.playerProvince && war.tiles.size > 0) {
            unlockAchievement("WinWar");
            if (capturedCapital) {
               unlockAchievement("CaptureCapital");
            }
         }
         const truceDuration = getTruceDuration(war, save);
         const changedCapitals = ensureProvinceCapitals(save);
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
         RefreshTiles.emit({ tiles: [...war.tiles, ...changedCapitals], options: { indicator: true, visual: true } });
         if (headless) {
            if (war.defender === save.state.playerProvince) {
               showGameEventModal(<InvaderConqueredWarGoalModal war={war} />);
            }
            if (war.coAttackers.has(save.state.playerProvince) || war.coDefenders.has(save.state.playerProvince)) {
               showGameEventModal(<WarEndedModal war={war} />);
            }
         } else {
            hideModal();
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
