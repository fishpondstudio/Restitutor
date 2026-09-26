import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { ConvertCultureAction } from "../game/actions/ConvertCultureAction";
import { TimedActions } from "../game/definitions/TimedAction";
import { getTileConvertCultureCost } from "../game/logic/TileLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";

export function ConvertCultureButton({ tile, className }: { tile: Tile; className?: string }): React.ReactNode {
   return (
      <ActionButton
         className={cls("btn", className)}
         action={() => ConvertCultureAction(tile, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="ConvertCulture" />
               {element}
               <div className="box m5">
                  <div className="h2">{$t(L.TheCostIsCalculatedAsFollows)}</div>
                  <BreakdownComp breakdown={getTileConvertCultureCost(tile, G.save)} />
               </div>
            </>
         )}
      >
         {TimedActions.ConvertCulture.name()}
      </ActionButton>
   );
}
