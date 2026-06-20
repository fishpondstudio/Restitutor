import { mapOf } from "@project/shared/src/utils/Helper";
import { modifierToString } from "../game/definitions/Modifier";
import type { Province } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";

export function BankruptcyEffectComp({ province }: { province: Province }): React.ReactNode {
   return (
      <div className="m10">
         {$t(
            L.OurBankruptcyHas$1MonthsLeftWithTheFollowingEffects,
            getTimedActionTimeLeft("Bankruptcy", province, G.save),
         )}
         <div className="h5" />
         {mapOf(TimedActions.Bankruptcy.modifiers, (modifier, data) => {
            return <div key={modifier}>{modifierToString(modifier, data)}</div>;
         })}
      </div>
   );
}
