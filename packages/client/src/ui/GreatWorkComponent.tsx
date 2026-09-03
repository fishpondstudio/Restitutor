import { mapOf } from "@project/shared/src/utils/Helper";
import { GreatWork } from "../game/definitions/GreatWork";
import { modifierToString } from "../game/definitions/Modifier";
import { formatYear } from "../game/logic/GameDateTime";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";

export function GreatWorkComponent({ greatWork }: { greatWork: GreatWork }): React.ReactNode {
   const config = GreatWork[greatWork];
   return (
      <div className="row">
         <FloatingTip label={$t(L.ImageCredit$1, config.image.credit)}>
            <div>
               <img src={config.image.url} style={{ width: "3rem", height: "3rem" }} className="img-border" />
            </div>
         </FloatingTip>
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
   );
}
