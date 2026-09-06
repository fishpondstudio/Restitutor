import { formatNumber } from "@project/shared/src/utils/Helper";
import type { IFamily, IPerson } from "../game/definitions/Family";
import type { Province } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { EventImage } from "../game/events/EventImages";
import { getGameEffectDesc } from "../game/GameEffect";
import { getRecognizeIllegitimateChildEffect, recognizeIllegitimateChild } from "../game/logic/GovernorEventLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function IllegitimateChildModal({
   province,
   familyId,
   child,
}: {
   province: Province;
   familyId: string;
   child: IFamily;
}): React.ReactNode {
   const effect = getRecognizeIllegitimateChildEffect(province, G.save);
   const person = (child.male ?? child.female) as IPerson;
   return (
      <GenericEventModal
         title={$t(L.AQuestionOfLegitimacy)}
         content={$t(
            L.AQuestionOfLegitimacyDesc$1$2$3$4,
            person.name.join(" "),
            formatNumber(person.administrative),
            formatNumber(person.diplomatic),
            formatNumber(person.military),
         )}
         image={EventImage.RomulusAndRemus.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.RomulusAndRemus.credit)}</div>}
         buttons={[
            <GameEventButton
               key="recognize"
               tooltip={
                  <div className="m10 col-gap-5">
                     {getGameEffectDesc(effect, province, G.save)}
                     <div>{$t(L.$1JoinsTheGovernorsFamily, person.name.join(" "))}</div>
                  </div>
               }
               label={$t(L.WelcomeTheChildIntoOurFamily)}
               onClick={() => {
                  recognizeIllegitimateChild(familyId, child, province, G.save);
                  GameStateUpdated.emit();
                  hideModal();
               }}
            />,
            <GameEventButton
               key="refuse"
               tooltip={<div className="m10">{$t(L.$1DoesNotJoinTheGovernorsFamily, person.name.join(" "))}</div>}
               label={$t(L.RefuseTheChildAndDenyAllClaims)}
               onClick={hideModal}
            />,
         ]}
      />
   );
}
