import { TimedActions, type TimedActionWithEffect } from "../game/definitions/TimedAction";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { makeGameAction } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { ActionButton } from "./ActionButton";

export function TimedActionButton({
   timedAction,
   id,
   className,
}: {
   timedAction: TimedActionWithEffect;
   id?: string;
   className?: string;
}): React.ReactNode {
   return (
      <ActionButton
         id={id}
         className={className}
         action={makeGameAction(timedAction, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action={timedAction} />
               {element}
            </>
         )}
      >
         {TimedActions[timedAction].name()}
      </ActionButton>
   );
}
