import type { Tile } from "@project/shared/src/utils/Helper";
import { PillageAction, type PillageUpgrade, PillageUpgrades } from "../game/actions/PillageActions";
import { ProvinceResourceNames } from "../game/definitions/ProvinceResources";
import { hasProvinceUpgrade } from "../game/definitions/ProvinceUpgrades";
import { getTilePillageRefund } from "../game/logic/TileLogic";
import { getTimedActionDesc } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { colorNumber } from "./components/ColorNumber";
import { ProvinceResourceImages } from "./ProvinceResourceImages";

export function PillageButton({ tile, upgrade }: { tile: Tile; upgrade: PillageUpgrade }): React.ReactNode {
   if (!hasProvinceUpgrade("RightOfPlunder", G.save.state.playerProvince, G.save)) {
      return null;
   }
   if (G.save.state.tiles.get(tile)?.province !== G.save.state.playerProvince) {
      return null;
   }
   const config = PillageUpgrades[upgrade];
   return (
      <ActionButton
         className="w100 text-red"
         action={() => PillageAction(tile, upgrade, G.save.state.playerProvince, G.save)}
         tooltip={(element: React.ReactNode) => {
            const refund = getTilePillageRefund(tile, config.resource, G.save);
            return (
               <>
                  <div className="h2">{config.name()}</div>
                  <div className="mx10 my5">{getTimedActionDesc("Pillage", G.save.state.playerProvince, G.save)}</div>
                  <div className="divider" />
                  <div className="row mx10 my5 g5">
                     <img src={ProvinceResourceImages[config.resource]} className="icon-block" />
                     <div>{ProvinceResourceNames[config.resource]()}</div>
                     <div className="f1" />
                     <div>{colorNumber(refund)}</div>
                  </div>
                  <div className="divider" />
                  {element}
               </>
            );
         }}
      >
         {$t(L.Pillage)}
      </ActionButton>
   );
}
