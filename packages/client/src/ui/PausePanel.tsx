import { GameSpeedChanged } from "../game/Events";
import { G, revertSpeed } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";

export function PausePanel(): React.ReactNode {
   refreshOnTypedEvent(GameSpeedChanged);
   if (!G.save) return null;
   if (G.speed !== 0) return null;
   return (
      <div
         className="pause-panel"
         id="PausePanel_Button"
         onClick={() => {
            revertSpeed();
         }}
      >
         <div className="mi">pause_circle</div>
         <div className="mr5">{$t(L.Paused)}</div>
      </div>
   );
}
