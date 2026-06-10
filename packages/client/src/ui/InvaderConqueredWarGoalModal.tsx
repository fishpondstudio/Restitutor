import { getTileName } from "../game/definitions/TileName";
import { EventImage } from "../game/events/EventImages";
import type { IWar } from "../game/logic/WarLogic";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { playClick } from "./Sound";
import { PeaceTreatyTooltip } from "./WarModal";

export function InvaderConqueredWarGoalModal({ war }: { war: IWar }): React.ReactNode {
   const warGoal = Array.from(war.tiles)
      .map((tile) => getTileName(tile))
      .join(", ");
   return (
      <GenericEventModal
         title={$t(L.$1DefeatedUs, war.attacker)}
         content={html($t(L.InvaderConqueredWarGoalDesc$1$2$3, war.log.length, war.attacker, warGoal))}
         image={EventImage.InvaderConqueredWarGoal.url}
         titleTooltip={<div className="m10">Image Credit: {EventImage.InvaderConqueredWarGoal.credit}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={
                  <div className="m10">
                     <PeaceTreatyTooltip war={war} />
                  </div>
               }
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
