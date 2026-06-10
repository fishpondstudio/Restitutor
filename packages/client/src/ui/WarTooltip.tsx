import { Progress } from "@mantine/core";
import { formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { getWarSuccessChance, type IWar, isWarStalled } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { WarChanceComp } from "./WarPowerComp";

export function WarTooltip({ war }: { war: IWar }): React.ReactNode {
   const successChance = getWarSuccessChance(war.attacker, war.coAttackers, war.defender, war.coDefenders, G.save);
   const failChance = 1 - successChance;
   const estimatedTimeLeft = Math.ceil((war.requiredWarScore - war.actualWarScore) / (successChance - failChance));
   return (
      <>
         <div className="h2">{$t(L.$1$2War, war.attacker, war.defender)}</div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Attacker)}</div>
            <div>
               {war.attacker}
               {war.attacker === G.save.state.playerProvince && <span className="text-yellow"> {$t(L.Us)}</span>}
            </div>
         </div>
         {war.coAttackers.size > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.CoAttackers)}</div>
               <div>{Array.from(war.coAttackers.keys()).join(", ")}</div>
            </div>
         )}
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Defender)}</div>
            <div>
               {war.defender}
               {war.defender === G.save.state.playerProvince && <span className="text-yellow"> {$t(L.Us)}</span>}
            </div>
         </div>
         {war.coDefenders.size > 0 && (
            <div className="row mx10 my5">
               <div className="f1">{$t(L.CoDefenders)}</div>
               <div>{Array.from(war.coDefenders.keys()).join(", ")}</div>
            </div>
         )}
         <div className="divider my10" />
         <div className="mx10">
            <WarChanceComp successChance={successChance} />
         </div>
         <div className="divider my10" />
         <Progress className="mx10" value={(war.actualWarScore / war.requiredWarScore) * 100} />
         <div className="h10" />
         <div className="row mx10">
            <div className="f1">{$t(L.WarScore)}</div>
            <div>
               {war.actualWarScore}/{war.requiredWarScore} ({formatPercent(war.actualWarScore / war.requiredWarScore)})
            </div>
         </div>
         <div className="divider my10" />
         <div className="row mx10 my5">
            <div className="f1">{$t(L.LengthOfTheWar)}</div>
            <div>{$t(L.$1Months, formatNumber(war.log.length))}</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.EstTimeLeft)}</div>
            <div>
               {successChance - failChance <= 0 ? (
                  <span className="text-red">{$t(L.Never)}</span>
               ) : (
                  <>{$t(L.$1Months, formatNumber(estimatedTimeLeft))}</>
               )}
            </div>
         </div>
         {war.actualWarScore >= war.requiredWarScore && (
            <div className="mx10 my5 text-green">
               {$t(L.$1HasWonTheWarAfter$2Months, war.attacker, formatNumber(war.log.length))}
            </div>
         )}
         {successChance < 0.5 && (
            <div className="mx10 my5 text-red">
               {$t(L.$1IsNotExpectedToWinDueToLessThanA50ChanceOfASuccessfulAttack, war.attacker)}
            </div>
         )}
         {isWarStalled(war, G.save) && (
            <div className="mx10 my5 text-yellow">
               {$t(L.WarIsStalledDueToInsufficientMilitaryPointsFrom$1, war.attacker)}
            </div>
         )}
      </>
   );
}
