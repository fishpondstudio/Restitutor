import { entriesOf } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { GreatWork } from "../game/definitions/GreatWork";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { GreatWorkComponent } from "./GreatWorkComponent";

export function GreatWorksSingletonModal(): React.ReactNode {
   return (
      <ModalComp size="md" title={<ModalTitleBar title={$t(L.GreatWorks)} dismiss />}>
         {entriesOf(GreatWork)
            .sort((a, b) => a[1].completionYear - b[1].completionYear)
            .map(([gw, config], idx) => (
               <Fragment key={gw}>
                  {idx > 0 && <div className="divider" />}
                  <div className="m10">
                     <GreatWorkComponent greatWork={gw} />
                  </div>
               </Fragment>
            ))}
      </ModalComp>
   );
}
