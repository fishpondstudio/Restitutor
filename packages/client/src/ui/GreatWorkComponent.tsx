import { mapOf } from "@project/shared/src/utils/Helper";
import { GreatWork } from "../game/definitions/GreatWork";
import { modifierToString } from "../game/definitions/Modifier";
import { formatYear } from "../game/logic/GameDateTime";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

export function GreatWorkComponent({ greatWork }: { greatWork: GreatWork }): React.ReactNode {
   const config = GreatWork[greatWork];
   return (
      <FloatingTip
         fixedWidth
         className="p0"
         label={
            <>
               <div className="m10">
                  {html(
                     $t(
                        L.$1IsCompletedIn$2ItsEffectAppliesAfterCompletion,
                        config.name(),
                        formatYear(config.completionYear),
                     ),
                  )}
               </div>
               <div className="h3 row g5">
                  <div className="mi xs">visibility</div>
                  <div className="f1">{$t(L.ClickToPanToTheGreatWorkTile)}</div>
               </div>
               <div className="m10 text-dimmed text-sm">{$t(L.ImageCredit$1, config.image.credit)}</div>
            </>
         }
      >
         <div
            className="row pointer"
            onClick={() => {
               G.scene
                  .getCurrent(WorldScene)
                  ?.lookAt(config.tile, { time: 0.2 })
                  .then((scene) => {
                     scene.drawSelectors(new Set([config.tile]));
                     const tileData = G.save.state.tiles.get(config.tile);
                     if (tileData) {
                        scene.drawProvinceOutline(tileData.province);
                     }
                  });
            }}
         >
            <div>
               <img src={config.image.url} style={{ width: "3rem", height: "3rem" }} className="img-border" />
            </div>

            <div className="f1">
               <div className="row g5">
                  <div className="text-roman text-sm">{config.name()}</div>
                  <div className="f1"></div>
               </div>
               <div className="text-dimmed">
                  {mapOf(config.modifiers, (modifier, data) => modifierToString(modifier, data)).join(", ")}
               </div>
            </div>
            <div className="text-right">
               <div className="mi sm text-yellow">account_balance</div>
               <div className="text-dimmed">{formatYear(config.completionYear)}</div>
            </div>
         </div>
      </FloatingTip>
   );
}
