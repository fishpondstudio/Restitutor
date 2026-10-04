import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { InviteToIslamAction } from "../game/actions/InviteToIslamAction";
import { TimedActions } from "../game/definitions/TimedAction";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { ActionButton } from "./ActionButton";

export function InviteToIslamButton({ tile, className }: { tile: Tile; className?: string }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const state = G.save.state.provinces[tileData.province];
   if (state?.religion !== "Islam") {
      return null;
   }
   return (
      <ActionButton
         action={() => InviteToIslamAction(tile, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="InviteToIslam" />
               {element}
            </>
         )}
         className={cls("btn nowrap", className)}
      >
         {TimedActions.InviteToIslam.name()}
      </ActionButton>
   );
}
