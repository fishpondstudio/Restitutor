import { formatNumber } from "@project/shared/src/utils/Helper";
import type React from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import { modifierDurationToString } from "../game/definitions/Modifier";
import { type Province, type Treaty, TreatyNames } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { CancelTreatyPenalty, cancelTreaty, hasTreatyBetween, OfferTreatyAction } from "../game/logic/TreatyLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";

export function TreatyActionButton({
   ourProvince,
   theirProvince,
   treaty,
}: {
   ourProvince: Province;
   theirProvince: Province;
   treaty: Exclude<Treaty, "Client">;
}): React.ReactNode {
   if (hasTreatyBetween(treaty, ourProvince, theirProvince, G.save)) {
      return (
         <ActionButton
            action={{
               condition: finalizeCondition({
                  breakdown: [
                     {
                        name: $t(
                           L.XHasAnActiveYWithZ,
                           getProvinceName(ourProvince, G.save),
                           TreatyNames[treaty](),
                           getProvinceName(theirProvince, G.save),
                        ),
                        value: true,
                     },
                  ],
               }),
               effect: () => {
                  cancelTreaty(treaty, ourProvince, theirProvince, G.save);
               },
            }}
            tooltip={(element) => (
               <>
                  <div className="row m10">
                     {$t(
                        L.CancellingXWillResultInYAttitudeTowardsZ,
                        TreatyNames[treaty](),
                        formatNumber(CancelTreatyPenalty[treaty].attitude),
                        getProvinceName(theirProvince, G.save),
                        getProvinceName(ourProvince, G.save),
                     )}{" "}
                     ({modifierDurationToString(CancelTreatyPenalty[treaty].duration)})
                  </div>
                  {element}
               </>
            )}
            className="btn py2 red"
         >
            {$t(L.CancelX, TreatyNames[treaty]())}
         </ActionButton>
      );
   }
   return (
      <ActionButton
         action={OfferTreatyAction[treaty](ourProvince, theirProvince, G.save)}
         tooltip={(element) => (
            <>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Duration)}</div>
                  <div className="text-dimmed">{modifierDurationToString(TimedActions.DiplomaticTreaty.duration)}</div>
               </div>
               {element}
            </>
         )}
         className="btn py2"
      >
         {$t(L.OfferX, TreatyNames[treaty]())}
      </ActionButton>
   );
}
