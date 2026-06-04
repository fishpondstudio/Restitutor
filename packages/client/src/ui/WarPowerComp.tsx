import { Progress } from "@mantine/core";
import { formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import type { IConditionBreakdown } from "../game/actions/GameAction";
import type { Province, Province as ProvinceId } from "../game/definitions/Province";
import { getProvinceName, getWarPower } from "../game/logic/ProvinceLogic";
import { getWarSuccessChance } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownRow } from "./BreakdownRow";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { FloatingTip } from "./components/FloatingTip";

export function WarPowerComp({
   attacker,
   coAttackers,
   defender,
   coDefenders,
}: {
   attacker: ProvinceId;
   coAttackers: Map<ProvinceId, IConditionBreakdown>;
   coDefenders: Map<ProvinceId, IConditionBreakdown>;
   defender: ProvinceId;
}): React.ReactNode {
   return (
      <>
         <div className="row m10">
            <WarPowerColComp label={$t(L.Attacker)} leader={attacker} followers={coAttackers} />
            <WarPowerColComp label={$t(L.Defender)} leader={defender} followers={coDefenders} />
         </div>
         <div className="h5" />
         <div className="mx10">
            <WarChanceComp successChance={getWarSuccessChance(attacker, coAttackers, defender, coDefenders, G.save)} />
         </div>
      </>
   );
}

export function WarChanceComp({ successChance }: { successChance: number }): React.ReactNode {
   return (
      <>
         <Progress value={successChance * 100} />
         <div className="h10" />
         <div className="row">
            <div>
               <div>{formatPercent(successChance)}</div>
               <div className="text-xs text-dimmed text-italic">{$t(L.SuccessfulAttack)}</div>
            </div>
            <div className="f1"></div>
            <div className="text-right">
               <div>{formatPercent(1 - successChance)}</div>
               <div className="text-xs text-dimmed text-italic">{$t(L.RepelledAttack)}</div>
            </div>
         </div>
      </>
   );
}

function WarPowerColComp({
   label,
   leader,
   followers,
}: {
   label: React.ReactNode;
   leader: Province;
   followers: Map<Province, IConditionBreakdown>;
}): React.ReactNode {
   const leaderWarPower = getWarPower(leader, G.save);
   const followersWarPower = Array.from(followers).reduce(
      (acc, [province, condition]) => acc + (condition.value ? getWarPower(province, G.save).value : 0),
      0,
   );
   const allWarPower = leaderWarPower.value + followersWarPower;
   return (
      <div className="box f1 stretch">
         <div className="h1 row">
            <div className="f1">{label}</div>
            <div>{formatNumber(allWarPower)}</div>
         </div>
         <div className="text-sm">
            <BreakdownRow name={leader} className="mx10 my5" breakdown={leaderWarPower} />
            {followers.size > 0 && <div className="divider" />}
            {Array.from(followers).map(([province, condition]) => {
               const warPower = getWarPower(province, G.save);
               return (
                  <FloatingTip
                     key={province.toString()}
                     w={300}
                     className="p0"
                     label={
                        <>
                           {condition.breakdown.length > 0 && (
                              <>
                                 <div className="h2">{$t(L.WarParticipation)}</div>
                                 <ConditionBreakdownComp condition={condition} />
                                 <div className="divider" />
                              </>
                           )}
                           <div className="h2">{$t(L.WarPower)}</div>
                           <BreakdownComp breakdown={warPower} />
                        </>
                     }
                  >
                     <div className="row g5 mx10 my5">
                        {condition &&
                           (condition.value ? (
                              <div className="mi xs text-green">check_circle</div>
                           ) : (
                              <div className="mi xs text-red">cancel</div>
                           ))}
                        <div>{getProvinceName(province, G.save)}</div>
                        <div className="f1" />
                        <div>{formatNumber(warPower.value)}</div>
                     </div>
                  </FloatingTip>
               );
            })}
         </div>
      </div>
   );
}
