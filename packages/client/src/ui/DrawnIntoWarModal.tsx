import { EventImage } from "../game/events/EventImages";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import type { IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function DrawnIntoWarModal({ war }: { war: IWar }): React.ReactNode {
   const ourAlly = war.coAttackers.has(G.save.state.playerProvince) ? war.attacker : war.defender;
   return (
      <GenericEventModal
         title={$t(L.$1$2War, getProvinceName(war.attacker, G.save), getProvinceName(war.defender, G.save))}
         content={$t(
            L.DrawnIntoWarDesc$1$2$3,
            getProvinceName(war.attacker, G.save),
            getProvinceName(war.defender, G.save),
            getProvinceName(ourAlly, G.save),
         )}
         image={EventImage.ScipiosClemency2.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.ScipiosClemency2.credit)}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={<div className="m10">{$t(L.WarInfoTooltip)}</div>}
               label={$t(L.WeShallComeToOurFriendsAid)}
               onClick={() => {
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
