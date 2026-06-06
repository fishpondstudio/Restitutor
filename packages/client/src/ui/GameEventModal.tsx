import { formatNumber, randOne } from "@project/shared/src/utils/Helper";
import { GameStateUpdated } from "../game/Events";
import { getEventButtons, getGameEventCondition, getGameEventImages } from "../game/events/GameEventLogic";
import { type GameEvent, GameEvents } from "../game/events/GameEvents";
import { applyGameEffect, getGameEffectDesc } from "../game/GameEffect";
import { PendingGameEventTimeoutMonths } from "../game/logic/TickProvince";
import { G } from "../utils/Global";
import { useTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { GenericEventModal } from "./GenericEventModal";
import { playClick } from "./Sound";

export function GameEventModal({ event }: { event: GameEvent }): React.ReactNode {
   const data = GameEvents[event];
   useTypedEvent(GameStateUpdated, () => {
      if (!G.save.state.provinces[G.save.state.playerProvince]?.events.has(event)) {
         hideModal();
      }
   });

   const image = data.image ?? randOne(getGameEventImages());
   const condition = getGameEventCondition(data.condition, G.save.state.playerProvince, G.save);

   const buttons = getEventButtons(event, G.save.state.playerProvince, G.save).map((button, index) => (
      <GameEventButton
         key={index}
         tooltip={
            <>
               <div className="m10">{getGameEffectDesc(button, G.save.state.playerProvince, G.save)}</div>
               <div className="divider" />
               <div className="text-xs text-dimmed m10">
                  {$t(L.GameEventDecisionTimeoutWarning, formatNumber(PendingGameEventTimeoutMonths))}
               </div>
            </>
         }
         onClick={() => {
            playClick();
            const state = G.save.state.provinces[G.save.state.playerProvince];
            if (!state) {
               return;
            }
            if (state.events.has(event)) {
               applyGameEffect(button, $t(L.XEvent, data.name()), G.save.state.playerProvince, G.save);
               state.events.delete(event);
               GameStateUpdated.emit();
            }
            hideModal();
         }}
         label={button.label()}
      />
   ));

   return (
      <GenericEventModal
         title={data.name()}
         content={data.desc()}
         image={image.url}
         titleTooltip={
            <>
               {condition.breakdown.length > 0 && (
                  <>
                     <div className="h2">{$t(L.EventCondition)}</div>
                     <ConditionBreakdownComp condition={condition} />
                  </>
               )}
               <div className="divider"></div>
               <div className="m10 text-xs text-dimmed">Image Credit: {image.credit}</div>
            </>
         }
         buttons={buttons}
         dismiss={true}
      />
   );
}

export function GameEventButton({
   tooltip,
   onClick,
   label,
}: {
   tooltip: React.ReactNode;
   onClick: () => void;
   label: React.ReactNode;
}): React.ReactNode {
   return (
      <FloatingTip w={300} className="p0" label={tooltip}>
         <div className="modal-transparent-button" onClick={onClick}>
            {label}
         </div>
      </FloatingTip>
   );
}
