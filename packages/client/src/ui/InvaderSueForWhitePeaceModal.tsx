import { EventImage } from "../game/events/EventImages";
import type { IWar } from "../game/logic/WarLogic";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { playClick } from "./Sound";
import { WhitePeaceTooltip } from "./WarModal";

export function InvaderSueForWhitePeaceModal({ war }: { war: IWar }): React.ReactNode {
   return (
      <GenericEventModal
         title={$t(L.$1SuedForWhitePeace, war.attacker)}
         content={$t(L.InvaderSuedForWhitePeaceDesc$1$2, war.log.length, war.attacker)}
         image={EventImage.InvaderSueForWhitePeace.url}
         titleTooltip={<div className="m10">Image Credit: {EventImage.InvaderSueForWhitePeace.credit}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={
                  <div className="m10">
                     <WhitePeaceTooltip war={war} />
                  </div>
               }
               label={$t(L.WeHopeTheyveLearnedTheirLesson)}
               onClick={() => {
                  playClick();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
