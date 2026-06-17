import { filterInPlace } from "@project/shared/src/utils/Helper";
import { InvaderSueForWhitePeaceModal } from "../../ui/InvaderSueForWhitePeaceModal";
import { WarEndedModal } from "../../ui/WarEndedModal";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import { addChronicleEntry } from "../definitions/Chronicle";
import type { Province } from "../definitions/Province";
import { RefreshTiles } from "../Events";
import type { SaveGame } from "../GameState";
import { getRelation } from "../logic/DiplomacyLogic";
import { showGameEventModal } from "../logic/TickProvince";
import { getTruceDuration, type IWar, WhitePeaceCostPerTile } from "../logic/WarLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function NegotiateWhitePeaceAction(war: IWar, province: Province, save: SaveGame): IGameAction {
   return {
      cost: { diplomatic: WhitePeaceCostPerTile * war.tiles.size },
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
