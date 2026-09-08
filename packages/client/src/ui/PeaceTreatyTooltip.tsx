import { formatNumber } from "@project/shared/src/utils/Helper";
import { CasusBelli } from "../game/definitions/CasusBelli";
import { getTileName } from "../game/definitions/TileName";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { getTruceDuration, type IWar, isEligibleForMandate } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";
import { html } from "./components/RenderHTMLComp";

export function PeaceTreatyTooltip({ war }: { war: IWar }): React.ReactNode {
   const tileNames = Array.from(war.tiles)
      .map((tile) => getTileName(tile, G.save))
      .join(", ");
   const truceDuration = getTruceDuration(war, G.save);
   return (
      <>
         <ul className="m10">
            {isEligibleForMandate(war, G.save) && (
               <li className="text-yellow">
                  {$t(
                     L.$1WillCeaseToExistWhichWillGrant$2$3Mandate,
                     getProvinceName(war.defender, G.save),
                     getProvinceName(war.attacker, G.save),
                     "1",
                  )}
               </li>
            )}
            <li>
               {html(
                  $t(
                     L.$1ShallCede$2To$3,
                     getProvinceName(war.defender, G.save),
                     tileNames,
                     getProvinceName(war.attacker, G.save),
                  ),
               )}
            </li>
            <li>
               {$t(
                  L.A$1MonthTruceShallBeEnactedBetween$2And$3,
                  formatNumber(truceDuration.value),
                  getProvinceName(war.attacker, G.save),
                  getProvinceName(war.defender, G.save),
               )}
            </li>
            <li>
               {html(
                  $t(
                     L.$1GetsA$2CasusBelliAgainst$3For$4Years,
                     getProvinceName(war.defender, G.save),
                     CasusBelli.Reconquista.name(),
                     getProvinceName(war.attacker, G.save),
                     "10",
                  ),
               )}
            </li>
         </ul>
         <div className="h2">{$t(L.TruceDuration)}</div>
         <BreakdownComp breakdown={truceDuration} />
      </>
   );
}
