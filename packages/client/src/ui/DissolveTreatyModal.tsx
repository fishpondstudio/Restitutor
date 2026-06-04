import { Select } from "@mantine/core";
import { keysOf } from "@project/shared/src/utils/Helper";
import { Fragment, useState } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import { type Province, TreatyNames } from "../game/definitions/Province";
import { getRelations } from "../game/logic/DiplomacyLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { startTimedAction, TimedActionDescComp, timedActionConditions } from "../game/logic/TimedActionLogic";
import { dissolveTreaty, requireDefensePactAllyOrPatronCount } from "../game/logic/TreatyLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";

export function DissolveTreatyModal(): React.ReactNode {
   const provinces = keysOf(G.save.state.provinces).filter((province) => province !== G.save.state.playerProvince);
   const [selectedProvince, setSelectedProvince] = useState<Province>(provinces[0]);
   const relations = getRelations(selectedProvince, G.save);
   if (!relations) {
      return null;
   }
   const treaties = Array.from(relations).filter(([_, relation]) => relation.treaty !== undefined);
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={$t(L.DissolveTreaty)} dismiss />}>
         <div className="box m10 text-sm">
            <TimedActionDescComp action="DissolveTreaty" />
         </div>
         <div className="m10">
            <Select
               data={provinces.map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
               value={selectedProvince}
               onChange={(value) => setSelectedProvince(value as Province)}
               allowDeselect={false}
               checkIconPosition="right"
            />
         </div>
         {treaties.map(([otherProvince, relation]) => {
            const treaty = relation.treaty;
            if (!treaty) {
               return null;
            }
            return (
               <Fragment key={otherProvince}>
                  <div className="divider my10" />
                  <div className="row m10">
                     <div className="f1">
                        <div>{getProvinceName(otherProvince, G.save)}</div>
                        <div className="text-sm text-dimmed text-italic">{TreatyNames[treaty.type]()}</div>
                     </div>
                     <ActionButton
                        action={{
                           cost: { consulPoint: 1 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions({ action: "DissolveTreaty" }, selectedProvince, G.save),
                                 requireDefensePactAllyOrPatronCount(selectedProvince, 2, G.save),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("DissolveTreaty", G.save.state.playerProvince, G.save);
                              dissolveTreaty(selectedProvince, otherProvince, G.save);
                           },
                        }}
                     >
                        {$t(L.Dissolve)}
                     </ActionButton>
                  </div>
               </Fragment>
            );
         })}
         {treaties.length === 0 && <div className="m10 text-dimmed text-center">{$t(L.NoTreatiesToDissolve)}</div>}
      </ModalComp>
   );
}
