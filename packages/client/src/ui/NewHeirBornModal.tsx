import type { Province } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { EventImage } from "../game/events/EventImages";
import { applyGameEffect, getGameEffectDesc } from "../game/GameEffect";
import { NewHeirBornEffects1, NewHeirBornEffects2 } from "../game/logic/GovernorEventLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { GameEventButton } from "./GameEventModal";
import { GenericEventModal } from "./GenericEventModal";

export function NewHeirBornModal({ province }: { province: Province }): React.ReactNode {
   return (
      <GenericEventModal
         title={$t(L.ANewHeirIsBorn)}
         content={$t(L.ANewHeirIsBornDesc)}
         image={EventImage.RomulusAndRemus.url}
         titleTooltip={<div className="m10">{$t(L.ImageCredit$1, EventImage.RomulusAndRemus.credit)}</div>}
         buttons={[
            <GameEventButton
               key={0}
               tooltip={<div className="m10">{getGameEffectDesc(NewHeirBornEffects1, province, G.save)}</div>}
               label={$t(L.ItIsASignOfGoodFortune)}
               onClick={() => {
                  applyGameEffect(NewHeirBornEffects1, $t(L.$1Event, $t(L.ANewHeirIsBorn)), province, G.save);
                  GameStateUpdated.emit();
                  hideModal();
               }}
            />,
            <GameEventButton
               key={1}
               tooltip={<div className="m10">{getGameEffectDesc(NewHeirBornEffects2, province, G.save)}</div>}
               label={$t(L.ItIsARewardForOurFaith)}
               onClick={() => {
                  applyGameEffect(NewHeirBornEffects2, $t(L.$1Event, $t(L.ANewHeirIsBorn)), province, G.save);
                  GameStateUpdated.emit();
                  hideModal();
               }}
            />,
         ]}
      />
   );
}
