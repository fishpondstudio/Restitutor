import { formatNumber } from "@project/shared/src/utils/Helper";
import type { IGovernorFamily } from "../game/definitions/Family";
import type { Province } from "../game/definitions/Province";
import { EventImage } from "../game/events/EventImages";
import { getGameEffectDesc } from "../game/GameEffect";
import { NewGovernorEffect } from "../game/logic/GovernorEventLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function NewGovernorModal({
   province,
   governor,
}: {
   province: Province;
   governor: IGovernorFamily;
}): React.ReactNode {
   return (
      <GenericEventModal
         title={$t(L.ANewGovernor)}
         content={$t(L.ANewGovernorDesc)}
         image={EventImage.MarcusAureliusDeath.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.MarcusAureliusDeath.credit)}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={
                  <div className="m10 col-gap-5">
                     {getGameEffectDesc(NewGovernorEffect, province, G.save)}
                     <div>
                        {html(
                           $t(
                              L.OldGovernorHeir$1$2$3$4$5$6,
                              governor.male.name.join(" "),
                              formatNumber(governor.male.administrative),
                              formatNumber(governor.male.diplomatic),
                              formatNumber(governor.male.military),
                              formatNumber(governor.male.age),
                              formatNumber(governor.children.length),
                           ),
                        )}
                     </div>
                  </div>
               }
               label={$t(L.AllHailTheNewGovernor)}
               onClick={hideModal}
            />,
         ]}
      />
   );
}
