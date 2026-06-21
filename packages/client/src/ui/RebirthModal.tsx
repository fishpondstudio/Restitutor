import { Select } from "@mantine/core";
import { cls, setFlag } from "@project/shared/src/utils/Helper";
import { Fragment, useState } from "react";
import { Province, Provinces } from "../game/definitions/Province";
import { getProvinceUpgradeDesc, ProvinceUpgrades } from "../game/definitions/ProvinceUpgrades";
import { GameOptionFlag } from "../game/GameOption";
import { saveGame } from "../game/LoadSave";
import { rebirth } from "../game/logic/LegacyUpgradeLogic";
import { getProvinceName, getTilesAnnexedAndCored, provinceResourceOf } from "../game/logic/ProvinceLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";

export function RebirthModal(): React.ReactNode {
   const [total, used] = provinceResourceOf("legacy", G.save.state.playerProvince, G.save);
   const newTiles = getTilesAnnexedAndCored(G.save.state.playerProvince, G.save);
   const [province, setProvince] = useState(G.save.state.playerProvince);
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={$t(L.Rebirth)} dismiss />}>
         <div className="h1">{$t(L.LegacyPoint)}</div>
         <div className="mx10 my5 row">
            <div className="f1">{$t(L.TilesAnnexedAndCored)}</div>
            <div>{colorNumber(newTiles)}</div>
         </div>
         <div className="mx10 my5 row">
            <div className="f1">{$t(L.TotalLegacyPointNextRun)}</div>
            <div>{total + newTiles}</div>
         </div>
         <div className="h1">{$t(L.NextRunProvince)}</div>
         <FloatingTip label={$t(L.CurrentlyUnderDevelopmentMoreProvincesWillBeAddedSoon)}>
            <div className="mx10 my5">
               <Select
                  className="w100"
                  value={province}
                  onChange={(value) => {
                     if (value) {
                        const province = value as Province;
                        setProvince(province);
                        const capital = G.save.state.provinces[province]?.capital;
                        if (capital) {
                           G.scene
                              .getCurrent(WorldScene)
                              ?.lookAt(capital, { time: 0.2 })
                              .then((scene) => scene.drawProvinceOutline(province));
                        }
                     }
                  }}
                  checkIconPosition="right"
                  allowDeselect={false}
                  data={Provinces.map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
                  disabled
               />
            </div>
         </FloatingTip>
         <div className="box m10">
            <div className="h3">{$t(L.ProvincialSpirits)}</div>
            {Province[province].upgrades.map((upgrade, idx) => (
               <Fragment key={upgrade}>
                  {idx > 0 && <div className="divider" />}
                  <div className="mx10 my5">
                     <div>{ProvinceUpgrades[upgrade].name()}</div>
                     <div className="text-dimmed text-sm">{getProvinceUpgradeDesc(upgrade)}</div>
                  </div>
               </Fragment>
            ))}
         </div>
         <div className="m10">
            <button
               className={cls("btn py2 w100")}
               onClick={async () => {
                  rebirth(province, G.save);
                  G.save.options.flag = setFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
                  await saveGame(G.save);
                  window.location.reload();
               }}
            >
               {$t(L.Rebirth)}
            </button>
         </div>
      </ModalComp>
   );
}
