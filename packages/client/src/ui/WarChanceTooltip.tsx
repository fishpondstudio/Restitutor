import { formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { $t, L } from "../utils/i18n";

export function WarChanceTooltip({
   successChance,
   requiredWarScore,
}: {
   successChance: number;
   requiredWarScore: number;
}): React.ReactNode {
   return (
      <>
         {$t(L.WarMonthlyAttackExplanation$1$2, "3", formatPercent(successChance))}
         <div className="h10" />
         {$t(L.WarScoreGainExplanation$1$1$2, "1", formatNumber(requiredWarScore))}
         <div className="h10" />
         {$t(L.WarChanceEstimateOnly)}
      </>
   );
}
