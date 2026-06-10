import { filterInPlace, hasFlag } from "@project/shared/src/utils/Helper";
import { InvaderConqueredWarGoalModal } from "../../ui/InvaderConqueredWarGoalModal";
import { WarEndedModal } from "../../ui/WarEndedModal";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getRelation } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { addProvinceResource, ensureProvinceCapital } from "../logic/ProvinceLogic";
import { showGameEventModal } from "../logic/TickProvince";
import { getCurrentGeneral, getTruceLength, type IWar, WarFlag } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function SignPeaceTreatyAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: $t(L.WeAreTheLeadAttackerOfTheWar),
               value: war.attacker === province,
            },
            {
               name: $t(L.WeHaveWonTheWar),
               value: war.actualWarScore >= war.requiredWarScore,
            },
         ],
      }),
      effect: ({ headless }) => {
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
         ensureProvinceCapital(war.defender, save);
         filterInPlace(save.state.wars, (w) => w !== war);
         const attackerToDefender = getRelation(war.attacker, war.defender, save);
         const defenderToAttacker = getRelation(war.defender, war.attacker, save);
         if (attackerToDefender) {
            attackerToDefender.truceUntil = save.state.month + getTruceLength(war);
         }
         if (defenderToAttacker) {
            defenderToAttacker.truceUntil = save.state.month + getTruceLength(war);
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
         RefreshTiles.emit({ tiles: war.tiles, options: { indicator: true, visual: true } });
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
                  getTruceLength(war),
               ),
            },
            save,
         );
      },
   };
}
