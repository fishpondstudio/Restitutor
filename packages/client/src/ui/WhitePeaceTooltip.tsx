import { formatNumber } from "@project/shared/src/utils/Helper";
import { getTruceDuration, type IWar } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";

export function WhitePeaceTooltip({ war }: { war: IWar }): React.ReactNode {
   const duration = getTruceDuration(war, G.save);
   return (
      <>
         <div className="m10">
            {$t(L.WhitePeaceTooltip$1$2$3, formatNumber(duration.value), war.attacker, war.defender)}
         </div>
         <div className="h2">{$t(L.TruceDuration)}</div>
         <BreakdownComp breakdown={duration} />
      </>
   );
}
