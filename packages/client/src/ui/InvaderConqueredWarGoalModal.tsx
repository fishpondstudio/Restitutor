import { getTileName } from "../game/definitions/TileName";
import { EventImage } from "../game/events/EventImages";
import type { IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { PeaceTreatyTooltip } from "./PeaceTreatyTooltip";
import { playClick } from "./Sound";

export function InvaderConqueredWarGoalModal({ war }: { war: IWar }): React.ReactNode {
   const warGoal = Array.from(war.tiles)
      .map((tile) => getTileName(tile, G.save))
      .join(", ");
   return (
      <GenericEventModal
         title={$t(L.$1DefeatedUs, war.attacker)}
         content={html($t(L.InvaderConqueredWarGoalDesc$1$2$3, war.log.length, war.attacker, warGoal))}
         image={EventImage.CarthageCaptured.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.CarthageCaptured.credit)}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={<PeaceTreatyTooltip war={war} />}
               label={$t(L.ATerribleLossIndeed)}
               onClick={() => {
                  playClick();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
