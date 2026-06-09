import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { CrackDownAction } from "../game/actions/CrackDownAction";
import { TimedActions } from "../game/definitions/TimedAction";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { ActionButton } from "./ActionButton";

export function CrackDownButton({ tile, className }: { tile: Tile; className?: string }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) return null;
   return (
      <ActionButton
         className={cls("btn", className)}
         action={CrackDownAction(tile, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="Crackdown" />
               {element}
            </>
         )}
      >
         {TimedActions.Crackdown.name()}
      </ActionButton>
   );
}
