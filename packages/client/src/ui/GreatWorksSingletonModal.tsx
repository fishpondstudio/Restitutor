import { entriesOf } from "@project/shared/src/utils/Helper";
import { GreatWork } from "../game/definitions/GreatWork";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { GreatWorkComponent } from "./GreatWorkComponent";
import { Grid2 } from "./UIConstant";

export function GreatWorksSingletonModal(): React.ReactNode {
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.GreatWorks)} dismiss />}>
         <div style={Grid2} className="m10">
            {entriesOf(GreatWork)
               .sort((a, b) => a[1].completionYear - b[1].completionYear)
               .map(([gw, config], idx) => (
                  <div className="box p10" key={gw}>
                     <GreatWorkComponent greatWork={gw} />
                  </div>
               ))}
         </div>
      </ModalComp>
   );
}
