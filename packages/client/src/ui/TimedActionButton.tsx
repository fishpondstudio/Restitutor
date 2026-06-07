import { type TimedAction, TimedActions } from "../game/definitions/TimedAction";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { makeGameAction } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { ActionButton } from "./ActionButton";

export function TimedActionButton({
   timedAction,
   id,
   className,
}: {
   timedAction: TimedAction;
   id?: string;
   className?: string;
}): React.ReactNode {
   const action = makeGameAction(timedAction, G.save.state.playerProvince, G.save);
   if (action) {
      return (
         <ActionButton
            id={id}
            className={className}
            action={action}
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
   console.error(`TimedAction ${timedAction} missing "action" or "effect" property!`);
   return null;
}
