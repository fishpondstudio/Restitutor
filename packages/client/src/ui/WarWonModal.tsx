import { EventImage } from "../game/events/EventImages";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import type { IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { showPanel } from "./common/ShowPanel";
import { html } from "./components/RenderHTMLComp";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";
import { PeaceTreatyPage } from "./PeaceTreatyPage";
import { PeaceTreatyTooltip } from "./PeaceTreatyTooltip";
import { WarModal } from "./WarModal";

export function WarWonModal({ war }: { war: IWar }): React.ReactNode {
   return (
      <GenericEventModal
         title={$t(L.VictoryIsOurs)}
         content={$t(L.VictoryIsOursDesc)}
         image={EventImage.VercingetorixSurrenders.url}
         titleTooltip={() => (
            <div className="m10">{$t(L.ImageCredit$1, EventImage.VercingetorixSurrenders.credit)}</div>
         )}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={
                  <div className="m10">
                     {html(
                        $t(
                           L.ReviewTheDetailsOfThe$1$2Campaign,
                           getProvinceName(war.attacker, G.save),
                           getProvinceName(war.defender, G.save),
                        ),
                     )}
                  </div>
               }
               label={$t(L.LetUsReviewTheCampaign)}
               onClick={() => {
                  hideModal();
                  showPanel(WarModal, { war });
               }}
            />,
            <GameEventButton
               key="1"
               tooltip={<PeaceTreatyTooltip war={war} />}
               label={$t(L.LetUsSetTheTermsOfPeace)}
               onClick={() => {
                  hideModal();
                  showPanel(PeaceTreatyPage, { war, province: G.save.state.playerProvince });
               }}
            />,
         ]}
      />
   );
}
