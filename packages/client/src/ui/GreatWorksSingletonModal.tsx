import { GreatWork } from "../game/definitions/GreatWork";
import { getScenarioGreatWorks } from "../game/logic/GreatWorkLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { GreatWorkComponent } from "./GreatWorkComponent";
import { Grid2 } from "./UIConstant";

export function GreatWorksSingletonModal(): React.ReactNode {
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.GreatWorks)} dismiss />}>
         <div style={Grid2} className="m10">
            {Array.from(getScenarioGreatWorks(G.save.state.scenario))
               .sort((a, b) => GreatWork[a].completionYear - GreatWork[b].completionYear)
               .map((gw) => (
                  <div className="box p10" key={gw}>
                     <GreatWorkComponent greatWork={gw} />
                  </div>
               ))}
         </div>
      </ModalComp>
   );
}
