import { mapOf } from "@project/shared/src/utils/Helper";
import { GreatWork } from "../game/definitions/GreatWork";
import { modifierToString } from "../game/definitions/Modifier";
import { getTileName } from "../game/definitions/TileName";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { IconCatalog } from "./IconCatalog";
import { renderMarkup } from "./ParseMarkup";
import { playClick } from "./Sound";

export function GreatWorkCompletedModal({ greatWork }: { greatWork: GreatWork }): React.ReactNode {
   const config = GreatWork[greatWork];
   return (
      <GenericEventModal
         dismiss={true}
         title={
            <div className="row">
               <div>${config.name()}</div>
               <img
                  src={IconCatalog.Wikipedia}
                  style={{ height: "1rem", opacity: 0.7 }}
                  className="pointer"
                  onClick={() => {
                     openUrl(`https://en.qrwp.org/${config.wikipedia}`);
                  }}
               />
               <div className="f1" />
            </div>
         }
         content={renderMarkup($t(L.GreatWorkCompletedDesc$1$2, config.name(), config.tile))}
         image={config.image.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, config.image.credit)}</div>}
         buttons={[
            <GameEventButton
               key="1"
               tooltip={
                  <div className="m10">
                     {html(
                        $t(
                           L.GreatWorkCompletedEffectsActive$1$2$3,
                           config.name(),
                           mapOf(config.modifiers, (modifier, data) => modifierToString(modifier, data)).join(", "),
                           getTileName(config.tile, G.save),
                        ),
                     )}
                  </div>
               }
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
