import type { Tile } from "@project/shared/src/utils/Helper";
import { EmptyGameAction } from "../game/actions/EmptyGameAction";
import { SettleTileAction } from "../game/actions/SettleTileAction";
import { Terrains } from "../game/definitions/Terrain";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getTileTerrain } from "../game/logic/TileLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { ResourceCostComp } from "./ResourceCostComp";

export function SettleTilePage({ tile }: { tile: Tile }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const action = SettleTileAction(tile, G.save.state.playerProvince, G.save);
   if (action === EmptyGameAction) {
      return null;
   }
   return (
      <SidebarComp
         title={<SidebarImageHeader image={Terrains[getTileTerrain(tile)].image} title={getTileName(tile, G.save)} />}
      >
         <div className="box m10">
            <div className="h1">{$t(L.TheFollowingConditionsMustBeMet)}</div>
            {action.condition && <ConditionBreakdownComp condition={action.condition} />}
            <div className="h1">{$t(L.TheFollowingResourcesWillBeSpent)}</div>
            {action.cost && <ResourceCostComp cost={action.cost} />}
            <div className="h1">{$t(L.TheFollowingEffectsWillBeApplied)}</div>
            <div className="mx10 my5">{$t(L.$1LandTaxTileOutputAndManpowerFor$2Years, "-20%", "5")}</div>
            <div className="mx10 my5">{$t(L.$1LandTaxTileOutputAndManpowerFor$2Years, "-20%", "10")}</div>
            <div className="mx10 my5">{$t(L.$1LandTaxTileOutputAndManpowerFor$2Years, "-20%", "15")}</div>
            <div className="mx10 my5">{$t(L.$1LandTaxTileOutputAndManpowerFor$2Years, "-20%", "20")}</div>
         </div>
         <div className="m10">
            <ActionButton
               className="w100 py2"
               action={() => SettleTileAction(tile, G.save.state.playerProvince, G.save)}
            >
               {$t(L.Settle$1, getTileName(tile, G.save))}
            </ActionButton>
         </div>
      </SidebarComp>
   );
}
