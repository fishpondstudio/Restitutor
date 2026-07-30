import { Select } from "@mantine/core";
import { cls, entriesOf, setFlag } from "@project/shared/src/utils/Helper";
import { Fragment, useState } from "react";
import { Culture } from "../game/definitions/Culture";
import { EnabledProvinces, Province } from "../game/definitions/Province";
import { getProvinceUpgradeDesc, ProvinceUpgrades } from "../game/definitions/ProvinceUpgrades";
import { Religion } from "../game/definitions/Religion";
import { GameEvents } from "../game/events/GameEvents";
import { GameOptionFlag } from "../game/GameOption";
import { getOriginalTileCount } from "../game/GameState";
import { saveGame } from "../game/LoadSave";
import { rebirth } from "../game/logic/LegacyUpgradeLogic";
import { getProvinceName, getTilesAnnexedAndCored, provinceResourceOf } from "../game/logic/ProvinceLogic";
import { RomeMap } from "../game/RomeMap";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { renderMarkup } from "./ParseMarkup";

export function RebirthPage(): React.ReactNode {
   const [total, used] = provinceResourceOf("legacy", G.save.state.playerProvince, G.save);
   const newTiles = getTilesAnnexedAndCored(G.save.state.playerProvince, G.save);
   const [province, setProvince] = useState(G.save.state.playerProvince);
   const provincialEvents = entriesOf(GameEvents).filter(([k, v]) => v.condition?.province?.includes(province));
   return (
      <SidebarComp title={<SidebarHeader title={$t(L.Rebirth)} />}>
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
                  data={EnabledProvinces.map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
               />
            </div>
         </FloatingTip>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.Culture)}</div>
               <div>{Culture[Province[province].culture].name()}</div>
            </div>
            <div className="row my5">
               <div className="f1">{$t(L.Religion)}</div>
               <div>{Religion[Province[province].religion].name()}</div>
            </div>
            <FloatingTip
               label={
                  <>
                     {provincialEvents.map(([k, v]) => (
                        <div key={k}>
                           {v.name()}
                           {(v.condition?.province?.length ?? 0) > 1 && "*"}
                        </div>
                     ))}
                     <div className="text-sm text-dimmed text-italic mt5">{$t(L.InheritedRegionalEvents)}</div>
                  </>
               }
            >
               <div className="row my5">
                  <div className="f1">{$t(L.ProvincialEvents)}</div>
                  <div>{provincialEvents.length}</div>
               </div>
            </FloatingTip>
         </div>
         <div className="box m10">
            <div className="h3 row">
               <div className="f1">{$t(L.Tiles)}</div>
               <div>{getOriginalTileCount(province)}</div>
            </div>
            <div className="m10">
               {Array.from(RomeMap)
                  .filter(([tile, tileData]) => tileData.province === province)
                  .map(([tile, tileData], idx) => (
                     <span key={tile}>
                        {idx > 0 && ", "}
                        {renderMarkup(`<Tile>${tile}</Tile>`)}
                        {tileData.isCapital && "*"}
                     </span>
                  ))}
            </div>
         </div>
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
      </SidebarComp>
   );
}
