import { formatNumber, keysOf } from "@project/shared/src/utils/Helper";
import { Fragment } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { getTruceMonthsLeft, nullifyTruce } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";

export function NullifyTruceModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const playerProvince = G.save.state.playerProvince;
   const activeTruces = keysOf(G.save.state.provinces).filter(
      (province) => province !== playerProvince && getTruceMonthsLeft(playerProvince, province, G.save) > 0,
   );
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={TimedActions.NullifyTruce.name()} dismiss />}>
         <div className="box m10 text-sm">
            <TimedActionDescComp action="NullifyTruce" />
         </div>
         {activeTruces.map((province) => (
            <Fragment key={province}>
               <div className="divider my10" />
               <div className="row m10">
                  <div className="f1">
                     <div>{getProvinceName(province, G.save)}</div>
                     <div className="text-sm text-dimmed text-italic">
                        {$t(L.$1MonthsLeft, formatNumber(getTruceMonthsLeft(playerProvince, province, G.save)))}
                     </div>
                  </div>
                  <ActionButton
                     action={{
                        cost: { consulPoint: 1 },
                        condition: finalizeCondition([
                           ...timedActionConditions({ action: "NullifyTruce" }, playerProvince, G.save),
                        ]),
                        effect: () => {
                           startTimedAction("NullifyTruce", playerProvince, G.save);
                           nullifyTruce(playerProvince, province, G.save);
                           hideModal();
                        },
                     }}
                  >
                     {TimedActions.NullifyTruce.name()}
                  </ActionButton>
               </div>
            </Fragment>
         ))}
         {activeTruces.length === 0 && (
            <div className="m10 text-dimmed text-center">{$t(L.NoActiveTrucesToNullify)}</div>
         )}
      </ModalComp>
   );
}
