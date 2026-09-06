import { formatNumber } from "@project/shared/src/utils/Helper";
import type { IFamily, IPerson } from "../game/definitions/Family";
import type { Province } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { EventImage } from "../game/events/EventImages";
import { applyGameEffect, getGameEffectDesc } from "../game/GameEffect";
import { NewChildBornEffects1, NewChildBornEffects2 } from "../game/logic/GovernorEventLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function NewChildBornModal({ province, child }: { province: Province; child: IFamily }): React.ReactNode {
   const person = (child.male ?? child.female) as IPerson;
   return (
      <GenericEventModal
         title={$t(L.AChildIsBorn)}
         content={$t(
            L.AChildIsBornDesc$1$2$3$4,
            person.name.join(" "),
            formatNumber(person.administrative),
            formatNumber(person.diplomatic),
            formatNumber(person.military),
         )}
         image={EventImage.RomulusAndRemus.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.RomulusAndRemus.credit)}</div>}
         buttons={[
            <GameEventButton
               key={0}
               tooltip={<div className="m10">{getGameEffectDesc(NewChildBornEffects1, province, G.save)}</div>}
               label={$t(L.ItIsASignOfGoodFortune)}
               onClick={() => {
                  applyGameEffect(NewChildBornEffects1, $t(L.$1Event, $t(L.AChildIsBorn)), province, G.save);
                  GameStateUpdated.emit();
                  hideModal();
               }}
            />,
            <GameEventButton
               key={1}
               tooltip={<div className="m10">{getGameEffectDesc(NewChildBornEffects2, province, G.save)}</div>}
               label={$t(L.ItIsARewardForOurFaith)}
               onClick={() => {
                  applyGameEffect(NewChildBornEffects2, $t(L.$1Event, $t(L.AChildIsBorn)), province, G.save);
                  GameStateUpdated.emit();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
