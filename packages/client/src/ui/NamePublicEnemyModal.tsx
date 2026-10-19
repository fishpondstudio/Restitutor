import { Select } from "@mantine/core";
import { useState } from "react";
import { NamePublicEnemyAction } from "../game/actions/NamePublicEnemyAction";
import { type Province, Provinces } from "../game/definitions/Province";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
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
            <ActionButton className="py2 mt10 w100" action={() => NamePublicEnemyAction(selectedProvince, G.save)}>
               {$t(L.NamePublicEnemy)}
            </ActionButton>
         </div>
      </ModalComp>
   );
}
