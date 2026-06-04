import { Select } from "@mantine/core";
import { cls, entriesOf, mapSafeAdd, setFlag } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { LegacyUpgrades } from "../game/definitions/LegacyUpgrade";
import { modifierToString } from "../game/definitions/Modifier";
import { type Province, Provinces } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { saveGame } from "../game/LoadSave";
import { getLegacyUpgradeCost, rebirth } from "../game/logic/LegacyUpgradeLogic";
import { getProvinceName, getTilesAnnexedAndCored, provinceResourceOf } from "../game/logic/ProvinceLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { showModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { ConfirmModal } from "./ConfirmModal";
import { SidebarComp } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { ProvinceResourceImages } from "./ProvinceResourceImages";

export function LegacyUpgradePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const [total, used] = provinceResourceOf("legacy", G.save.state.playerProvince, G.save);
   const newTiles = getTilesAnnexedAndCored(G.save.state.playerProvince, G.save);
   const [province, setProvince] = useState(G.save.state.playerProvince);
   return (
      <SidebarComp title={$t(L.LegacyAndRebirth)}>
         <FloatingTip label={$t(L.LegacyPointsAcquiredThroughRebirthTooltip)}>
            <div className="m10 row">
               <img src={ProvinceResourceImages.legacy} height={20} />
               <div className="f1">{$t(L.AvailableTotalLegacyPoint)}</div>
               <div>
                  {total - used}/{total}
               </div>
            </div>
         </FloatingTip>
         <div className="h1">{$t(L.LegacyUpgrades)}</div>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th>{$t(L.Upgrade)}</th>
                     <th>{$t(L.Level)}</th>
                     <th className="text-right"></th>
                  </tr>
               </thead>
               <tbody>
                  {entriesOf(LegacyUpgrades).map(([key, value]) => {
                     const level = state.legacyUpgrades.get(key) ?? 0;
                     const { modifierType, modifierValue } = value;
                     return (
                        <tr key={key}>
                           <td>{modifierToString(key, { type: modifierType, value: modifierValue * level })}</td>
                           <td>{level}</td>
                           <td className="text-right">
                              <ActionButton
                                 action={{
                                    cost: { legacy: getLegacyUpgradeCost(level + 1) },
                                    effect: () => {
                                       mapSafeAdd(state.legacyUpgrades, key, 1);
                                    },
                                 }}
                                 tooltip={(element) => (
                                    <>
                                       <div className="h2">{$t(L.EffectAfterUpgrade)}</div>
                                       <div className="mx10 my5">
                                          {modifierToString(key, {
                                             type: modifierType,
                                             value: modifierValue * (level + 1),
                                          })}
                                       </div>
                                       {element}
                                    </>
                                 )}
                              >
                                 {$t(L.Upgrade)}
                              </ActionButton>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
         <FloatingTip label={$t(L.RebirthEndsCurrentRunTooltip)}>
            <div className="h1">{$t(L.Rebirth)}</div>
         </FloatingTip>
         <div className="mx10 my5 row">
            <div className="f1">{$t(L.TilesAnnexedAndCored)}</div>
            <div>{colorNumber(newTiles)}</div>
         </div>
         <div className="mx10 my5 row">
            <div className="f1">{$t(L.TotalLegacyPointNextRun)}</div>
            <div>{total + newTiles}</div>
         </div>
         <div className="divider my10" />
         <FloatingTip label={$t(L.CurrentlyUnderDevelopmentMoreProvincesWillBeAddedSoon)}>
            <div className="mx10 my5 row">
               <div className="f1">{$t(L.NextRunProvince)}</div>
               <Select
                  size="xs"
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
         <div className="m10">
            <button
               id="LegacyUpgradePage_Rebirth"
               className={cls("btn py2 w100")}
               onClick={() => {
                  showModal(
                     <ConfirmModal
                        title={$t(L.ConfirmRebirth)}
                        message={$t(L.AreYouSureYouWantToRebirthAsTheGovernorOfX, getProvinceName(province, G.save))}
                        confirm={{
                           label: $t(L.Rebirth),
                           onClick: async () => {
                              rebirth(province, G.save);
                              G.save.options.flag = setFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
                              await saveGame(G.save);
                              window.location.reload();
                           },
                        }}
                     />,
                  );
               }}
            >
               {$t(L.Rebirth)}
            </button>
         </div>
      </SidebarComp>
   );
}
