import type { Tile } from "@project/shared/src/utils/Helper";
import { MakeCoreAction } from "../game/actions/MakeCoreAction";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { getTileMakeCoreCost } from "../game/logic/TileLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { html } from "./components/RenderHTMLComp";

export function MakeCoreButton({ tile, id }: { tile: Tile; id?: string }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   // Is not our province
   if (tileData.province !== G.save.state.playerProvince) {
      return null;
   }
   // Is already our core
   if (tileData.coreProvinces.has(tileData.province) && tileData.province === G.save.state.playerProvince) {
      return null;
   }
   const cost = getTileMakeCoreCost(tile, G.save);
   return (
      <ActionButton
         id={id}
         tooltip={(element) => (
            <>
               <div className="m10">{html($t(L.MakeXOurCoreTile, getTileName(tile)))}</div>
               <TimedActionDescComp action="MakeCore" />
               {element}
               <div className="divider"></div>
               <div className="m10">{$t(L.TheCostIsCalculatedAsFollows)}</div>
               <BreakdownComp breakdown={cost} />
            </>
         )}
         className="btn text-sm"
         action={MakeCoreAction(tile, G.save.state.playerProvince, G.save)}
      >
         {TimedActions.MakeCore.name()}
      </ActionButton>
   );
}
