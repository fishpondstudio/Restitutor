import { EventImage } from "../game/events/EventImages";
import type { IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { playClick } from "./Sound";

export function WarEndedModal({ war }: { war: IWar }): React.ReactNode {
   const ourAlly = war.coAttackers.has(G.save.state.playerProvince) ? war.attacker : war.defender;
   const victor = war.actualWarScore >= war.requiredWarScore ? war.attacker : war.defender;
   return (
      <GenericEventModal
         title={$t(L.$1$2WarEnded, war.attacker, war.defender)}
         content={$t(L.WarEndedDesc$1$2$3$4$5, war.log.length, war.attacker, war.defender, victor, ourAlly)}
         image={EventImage.WarEnded.url}
         titleTooltip={<div className="m10">Image Credit: {EventImage.WarEnded.credit}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={<div className="m10">{$t(L.OneLessWarTooltip)}</div>}
               label={$t(L.WeAreGladThatPeaceIsRestored)}
               onClick={() => {
                  playClick();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
