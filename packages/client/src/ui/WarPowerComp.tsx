import { Progress } from "@mantine/core";
import { formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import type { IConditionBreakdown } from "../game/actions/GameAction";
import type { Province } from "../game/definitions/Province";
import { getWarPower } from "../game/logic/ArmyLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import type { IWarPowerComparison, IWarPowerSide } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { WarPowerRow, WarPowerTooltip } from "./WarPowerTooltip";

export function WarPowerComp({
   attacker,
   coAttackers,
   defender,
   coDefenders,
   comparison,
}: {
   attacker: Province;
   coAttackers: Map<Province, IConditionBreakdown>;
   coDefenders: Map<Province, IConditionBreakdown>;
   defender: Province;
   comparison: IWarPowerComparison;
}): React.ReactNode {
   return (
      <>
         <div className="row m10">
            <WarPowerColComp
               label={$t(L.Attacker)}
               leader={attacker}
               followers={coAttackers}
               side={comparison.attack}
            />
            <WarPowerColComp
               label={$t(L.Defender)}
               leader={defender}
               followers={coDefenders}
               side={comparison.defense}
            />
         </div>
         <div className="h5" />
         <div className="mx10">
            <WarChanceComp successChance={comparison.successChance} />
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
   side,
}: {
   label: React.ReactNode;
   leader: Province;
   followers: Map<Province, IConditionBreakdown>;
   side: IWarPowerSide;
}): React.ReactNode {
   const leaderWarPower = side.powers.get(leader)!;
   return (
      <div className="box f1 stretch">
         <div className="h1 row">
            <div className="f1">{label}</div>
            <div>{formatNumber(side.value)}</div>
         </div>
         <div className="text-sm">
            <WarPowerRow name={getProvinceName(leader, G.save)} className="mx10 my5" breakdown={leaderWarPower} />
            {followers.size > 0 && <div className="divider" />}
            {Array.from(followers).map(([province, condition]) => {
               const warPower = side.powers.get(province) ?? getWarPower(province, G.save, side.enemy);
               return (
                  <WarPowerTooltip
                     key={province}
                     breakdown={warPower}
                     tooltip={(element) => (
                        <>
                           {condition.breakdown.length > 0 && (
                              <>
                                 <div className="h2">{$t(L.WarParticipation)}</div>
                                 <ConditionBreakdownComp condition={condition} />
                                 <div className="divider" />
                              </>
                           )}
                           {element}
                        </>
                     )}
                  >
                     <div className="row g5 mx10 my5">
                        {condition.value ? (
                           <div className="mi xs text-green">check_circle</div>
                        ) : (
                           <div className="mi xs text-red">cancel</div>
                        )}
                        <div>{getProvinceName(province, G.save)}</div>
                        <div className="f1" />
                        <div>{formatNumber(warPower.total.value)}</div>
                     </div>
                  </WarPowerTooltip>
               );
            })}
         </div>
      </div>
   );
}
