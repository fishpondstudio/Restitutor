import { cls, type Tile } from "@project/shared/src/utils/Helper";
import { finalizeCondition } from "../game/actions/GameAction";
import { isChristianReligion } from "../game/definitions/Religion";
import { TimedActions } from "../game/definitions/TimedAction";
import { tileIsOurCoreCondition } from "../game/logic/MissionLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";

export function EvangelizeTileButton({ tile, className }: { tile: Tile; className?: string }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   const state = tileData && G.save.state.provinces[tileData.province];
   if (!tileData || !state) {
      return null;
   }
   const totalUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   return (
      <ActionButton
         action={() => ({
            cost: { christianity: totalUpgrades },
            condition: finalizeCondition([
               ...timedActionConditions({ action: "EvangelizeTile" }, G.save.state.playerProvince, G.save),
               tileIsOurCoreCondition(tile, G.save.state.playerProvince, G.save),
               {
                  name: $t(L.OurProvinceReligionIsChristian),
                  value: isChristianReligion(state.religion),
               },
               {
                  name: $t(L.TileReligionIsNotChristian),
                  value: !isChristianReligion(tileData.religion),
               },
            ]),
            execute: () => {
               startTimedAction("EvangelizeTile", G.save.state.playerProvince, G.save);
               tileData.religion = state.religion;
            },
         })}
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
