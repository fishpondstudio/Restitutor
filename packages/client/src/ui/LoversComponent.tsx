import type React from "react";
import { Fragment } from "react";
import { TakeLoverAction } from "../game/actions/SpouseActions";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FloatingTip } from "./components/FloatingTip";
import { PersonTooltip } from "./PersonTooltip";

export function LoversComponent(): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <>
         <div className="m10">
            <ActionButton className="w100" action={() => TakeLoverAction(G.save.state.playerProvince, G.save)}>
               {$t(L.TakeALover)}
            </ActionButton>
         </div>
         {state.governor.concubines.map((concubine, idx) => (
            <Fragment key={idx}>
               <div className="divider" />
               <FloatingTip
                  fixedWidth
                  className="p0"
                  label={() => <PersonTooltip person={concubine} family={state.governor} />}
               >
                  <div className="row m10 g5">
                     <div className="mi">female</div>
                     <div className="f1">
                        <div className="text-display">{concubine.name.join(" ")}</div>
                        <div className="text-xs">
                           {$t(
                              L.Age$1Skill$2,
                              concubine.age,
                              `${concubine.administrative}/${concubine.diplomatic}/${concubine.military}`,
                           )}
                        </div>
                     </div>
                  </div>
               </FloatingTip>
            </Fragment>
         ))}
      </>
   );
}
