import { GreatWork } from "../game/definitions/GreatWork";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { renderMarkup } from "./ParseMarkup";
import { playClick } from "./Sound";

export function GreatWorkCompletedModal({ greatWork }: { greatWork: GreatWork }): React.ReactNode {
   const config = GreatWork[greatWork];
   return (
      <GenericEventModal
         dismiss={true}
         title={`${config.name()}`}
         content={renderMarkup($t(L.GreatWorkCompletedDesc$1$2, config.name(), config.tile))}
         image={config.image.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, config.image.credit)}</div>}
         buttons={[
            <GameEventButton
               key="1"
               label={$t(L.LetItsGloryEndureThroughTheAges)}
               onClick={() => {
                  playClick();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
