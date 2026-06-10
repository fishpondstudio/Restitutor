import { Select } from "@mantine/core";
import { forEach } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import { type Province, Provinces } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { getRelation } from "../game/logic/DiplomacyLogic";
import { addModifier } from "../game/logic/ModifierLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";

export function NamePublicEnemyModal(): React.ReactNode {
   const provinces = Array.from(Provinces).filter((province) => province !== G.save.state.playerProvince);
   const [selectedProvince, setSelectedProvince] = useState<Province>(provinces[0]);
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={$t(L.NamePublicEnemy)} dismiss />}>
         <div className="box m10 text-sm">
            <TimedActionDescComp action="PublicEnemy" />
         </div>
         <div className="m10">
            <Select
               data={provinces.map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
               value={selectedProvince}
               onChange={(value) => setSelectedProvince(value as Province)}
               allowDeselect={false}
               checkIconPosition="right"
            />
            <ActionButton
               className="py2 mt10 w100"
               action={{
                  cost: { consulPoint: 1 },
                  condition: finalizeCondition({
                     breakdown: [
                        ...timedActionConditions(
                           {
                              action: "PublicEnemy",
                              label: $t(L.$1IsNotAlreadyNamedAsPublicEnemy, getProvinceName(selectedProvince, G.save)),
                           },
                           selectedProvince,
                           G.save,
                        ),
                     ],
                  }),
                  effect: () => {
                     startTimedAction("PublicEnemy", selectedProvince, G.save);
                     addModifier({
                        modifier: "Prestige",
                        name: $t(L.PublicEnemy),
                        value: -0.1,
                        duration: TimedActions.PublicEnemy.duration,
                        type: "multiply",
                        province: selectedProvince,
                        save: G.save,
                     });
                     addModifier({
                        modifier: "WarPower",
                        name: $t(L.PublicEnemy),
                        value: -0.1,
                        duration: TimedActions.PublicEnemy.duration,
                        type: "multiply",
                        province: selectedProvince,
                        save: G.save,
                     });
                     forEach(G.save.state.provinces, (province) => {
                        if (province === selectedProvince) {
                           return;
                        }
                        const relation = getRelation(province, selectedProvince, G.save);
                        if (relation) {
                           relation.casusBelli.set("PublicEnemy", {
                              monthsLeft: TimedActions.PublicEnemy.duration,
                           });
                        }
                     });
                  },
               }}
            >
               {$t(L.NamePublicEnemy)}
            </ActionButton>
         </div>
      </ModalComp>
   );
}
