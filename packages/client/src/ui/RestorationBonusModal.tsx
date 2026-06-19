import { keysOf, numberToRoman, shuffle } from "@project/shared/src/utils/Helper";
import { srand } from "@project/shared/src/utils/Random";
import { RestorationBonus } from "../game/definitions/RestorationBonus";
import { GameStateUpdated } from "../game/Events";
import { applyGameEffect, getGameEffectDesc } from "../game/GameEffect";
import { addProvinceStat, getProvinceStat } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { FloatingTip } from "./components/FloatingTip";
import { playClick } from "./Sound";
import { Grid3 } from "./UIConstant";

export function RestorationBonusModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const usedRestoration = getProvinceStat("usedRestoration", G.save.state.playerProvince, G.save);
   const candidates = shuffle(
      keysOf(RestorationBonus),
      srand(`${G.save.state.seed},UsedRestoration:${usedRestoration}`),
   ).slice(0, 3);
   return (
      <div className="modal xl">
         <div className="text-center text-roman text-lg text-white text-shadow">{$t(L.PickYourRestorationBonus)}</div>
         <div className="h5" />
         <div className="m10" style={Grid3}>
            {candidates.map((bonus) => (
               <ModifierComp key={bonus} bonus={bonus} />
            ))}
         </div>
      </div>
   );
}

function ModifierComp({ bonus }: { bonus: RestorationBonus }): React.ReactNode {
   const def = RestorationBonus[bonus];
   return (
      <div className="panel panel-hover" style={{ position: "relative", overflow: "hidden", maxHeight: "70vh" }}>
         <img src={def.image.url} className="display-block w100" />
         <div
            style={{
               position: "absolute",
               top: "50%",
               bottom: 0,
               left: 0,
               right: 0,
               background: "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.75))",
            }}
         />
         <FloatingTip label={$t(L.ImageCredit$1, def.image.credit)}>
            <div
               className="mi text-white sm"
               style={{ position: "absolute", top: "0.3125rem", right: "0.3125rem", opacity: 0.5 }}
            >
               copyright
            </div>
         </FloatingTip>
         <div
            style={{ position: "absolute", bottom: "1em", left: "0.625rem", right: "0.625rem" }}
            className="text-center text-roman pointer text-hover"
            onClick={() => {
               hideModal();
               playClick();
               addProvinceStat("usedRestoration", 1, G.save.state.playerProvince, G.save);
               const currentUsed = getProvinceStat("usedRestoration", G.save.state.playerProvince, G.save);
               applyGameEffect(
                  def.effect,
                  $t(L.Restoration$1, numberToRoman(currentUsed)),
                  G.save.state.playerProvince,
                  G.save,
               );
               GameStateUpdated.emit();
            }}
         >
            {getGameEffectDesc(def.effect, G.save.state.playerProvince, G.save)}
         </div>
      </div>
   );
}
