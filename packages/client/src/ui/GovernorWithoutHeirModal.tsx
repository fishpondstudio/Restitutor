import { formatNumber } from "@project/shared/src/utils/Helper";
import type { IGovernorFamily } from "../game/definitions/Family";
import type { Province } from "../game/definitions/Province";
import { EventImage } from "../game/events/EventImages";
import { getGameEffectDesc } from "../game/GameEffect";
import { GovernorWithoutHeirEffect } from "../game/logic/GovernorEventLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function GovernorWithoutHeirModal({
   province,
   governor,
}: {
   province: Province;
   governor: IGovernorFamily;
}): React.ReactNode {
   return (
      <GenericEventModal
         title={$t(L.ANewGovernor)}
         content={$t(
            L.TheGovernorDiesWithoutAnHeirAndForAMomentNoOneRulesDesc$1$2$3$4$5$6,
            governor.male.name.join(" "),
            formatNumber(governor.male.administrative),
            formatNumber(governor.male.diplomatic),
            formatNumber(governor.male.military),
            formatNumber(governor.male.age),
            formatNumber(governor.children.length),
         )}
         image={EventImage.SenecaDeath.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.SenecaDeath.credit)}</div>}
         buttons={[
            <GameEventButton
               key="0"
               tooltip={<div className="m10">{getGameEffectDesc(GovernorWithoutHeirEffect, province, G.save)}</div>}
               label={$t(L.WeShallManageButAtACost)}
               onClick={hideModal}
            />,
         ]}
      />
   );
}
