import { filterInPlace } from "@project/shared/src/utils/Helper";
import { InvaderSueForWhitePeaceModal } from "../../ui/InvaderSueForWhitePeaceModal";
import { WarEndedModal } from "../../ui/WarEndedModal";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getRelation } from "../logic/DiplomacyLogic";
import { addModifier } from "../logic/ModifierLogic";
import { addProvinceResource } from "../logic/ProvinceLogic";
import { showGameEventModal } from "../logic/TickProvince";
import { getTruceDuration, type IWar, WhitePeaceCostPerTile } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function NegotiateWhitePeaceAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: war.casusBelli === "BarbarianRaid" ? 0 : WhitePeaceCostPerTile * war.tiles.size },
      condition: finalizeCondition([
         {
            name: $t(L.WeAreTheLeadAttackerOfTheWar),
            value: war.attacker === province,
         },
         {
            name: $t(L.WeHaventWonTheWar),
            value: war.actualWarScore < war.requiredWarScore,
         },
         { name: $t(L.WarHasBeenGoingOnForAtLeastAYear), value: war.log.length >= 12 },
      ]),
      effect: ({ headless }) => {
         filterInPlace(save.state.wars, (w) => w !== war);
         const attackerToDefender = getRelation(war.attacker, war.defender, save);
         const truceDuration = getTruceDuration(war, save);
         if (attackerToDefender) {
            attackerToDefender.truceUntil = save.state.month + truceDuration.value;
         }
         const defenderToAttacker = getRelation(war.defender, war.attacker, save);
         if (defenderToAttacker) {
            defenderToAttacker.truceUntil = save.state.month + truceDuration.value;
         }
         if (hasProvinceUpgrade("VeteranGenerals", war.defender, save)) {
            addProvinceResource("generalSkillPoint", 1, war.defender, save);
         }
         if (hasProvinceUpgrade("VictoriousLeadership", war.defender, save)) {
            addModifier({
               modifier: "Prestige",
               type: "multiply",
               name: ProvinceUpgrades.VictoriousLeadership.name(),
               value: 0.1,
               duration: 2 * 12,
               province: war.defender,
               save,
            });
         }
         RefreshTiles.emit({ tiles: war.tiles, options: { indicator: true } });
         if (headless) {
            if (war.defender === save.state.playerProvince) {
               showGameEventModal(<InvaderSueForWhitePeaceModal war={war} />);
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
               content: $t(L.ChronicleWhitePeace$1$2$3, war.attacker, war.defender, truceDuration.value),
            },
            save,
         );
      },
   };
}
