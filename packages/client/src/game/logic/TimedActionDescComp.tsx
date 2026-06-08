import { G } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { modifierDurationToString } from "../definitions/Modifier";
import { type TimedAction, TimedActions } from "../definitions/TimedAction";
import { getTimedActionDesc } from "./TimedActionLogic";

export function TimedActionDescComp({ action }: { action: TimedAction }): React.ReactNode {
   const def = TimedActions[action];
   return (
      <>
         <div className="h2">{def.name()}</div>
         <div className="mx10 my5">{getTimedActionDesc(action, G.save.state.playerProvince, G.save)}</div>
         <div className="divider" />
         {"duration" in def && def.duration > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Duration)}</div>
               <div className="text-sm text-dimmed">{modifierDurationToString(def.duration)}</div>
            </div>
         )}
         {def.cooldown > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Cooldown)}</div>
               <div className="text-sm text-dimmed">{modifierDurationToString(def.cooldown)}</div>
            </div>
         )}
      </>
   );
}
