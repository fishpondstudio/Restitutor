import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { EvangelizeTileAction } from "../game/actions/EvangelizeTileAction";
import { TimedActions } from "../game/definitions/TimedAction";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { ActionButton } from "./ActionButton";

export function EvangelizeTileButton({ tile, className }: { tile: Tile; className?: string }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   const state = tileData && G.save.state.provinces[tileData.province];
   if (!tileData || !state) {
      return null;
   }
   return (
      <ActionButton
         action={() => EvangelizeTileAction(tile, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="EvangelizeTile" />
               {element}
            </>
         )}
         className={cls("btn", className)}
      >
         {TimedActions.EvangelizeTile.name()}
      </ActionButton>
   );
}
