import { formatNumber, range } from "@project/shared/src/utils/Helper";
import Administrative from "../assets/images/Administrative.svg";
import Army from "../assets/images/Army.svg";
import Chronicle from "../assets/images/Chronicle.svg";
import Diplomat from "../assets/images/Diplomat.svg";
import Diplomatic from "../assets/images/Diplomatic.svg";
import FamilyTree from "../assets/images/FamilyTree.svg";
import Gold from "../assets/images/Gold.svg";
import Legacy from "../assets/images/Legacy.svg";
import MenuIcon from "../assets/images/Menu.svg";
import Military from "../assets/images/Military.svg";
import Mission from "../assets/images/Mission.svg";
import Prestige from "../assets/images/Prestige.svg";
import Production from "../assets/images/Production.svg";
import ProvinceImage from "../assets/images/Province.svg";
import Senate from "../assets/images/Senate.svg";
import SocialClass from "../assets/images/SocialClass.svg";
import Stability from "../assets/images/Stability.svg";
import Trade from "../assets/images/Trade.svg";
import { Modifiers } from "../game/definitions/Modifier";
import { ProvinceResourceNames } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { getCurrentRelations, getDiplomats } from "../game/logic/DiplomacyLogic";
import { MapBackgroundColors } from "../game/logic/MapLogic";
import {
   getProvinceGoverningCapacity,
   getProvinceGoverningCost,
   getProvinceGovernmentPoint,
   getProvinceIncome,
   getProvinceName,
   getProvinceOverextension,
   getProvincePrestige,
   getProvinceResource,
   getProvinceStability,
   getWarPower,
} from "../game/logic/ProvinceLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ArmyModal } from "./ArmyModal";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { ChroniclePage } from "./ChroniclePage";
import { showPanel } from "./common/ShowPanel";
import { colorNumber, colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { DiplomacyPage } from "./DiplomacyPage";
import { FamilyTreeModal } from "./FamilyModal";
import { GovernmentModal } from "./GovernmentModal";
import { InternalAffairsPage } from "./InternalAffairsPage";
import { LeftPanel } from "./LeftPanel";
import { LegacyUpgradeModal } from "./LegacyUpgradeModal";
import { MissionPage } from "./MissionPage";
import { PausePanel } from "./PausePanel";
import { ProductionModal } from "./ProductionModal";
import { ProvinceListModal } from "./ProvinceListModal";
import { SenateModal } from "./SenateModal";
import { SettingsModal } from "./SettingsModal";
import { SocialClassModal } from "./SocialClassModal";
import { TileListModal } from "./TileListModal";
import { TopRightPanel } from "./TopRightPanel";
import { TradeModal } from "./TradeModal";
import { TreasuryPage } from "./TreasuryPage";

export function TopPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <>
         <TopLeftPanel />
         <TopRightPanel />
         <LeftPanel />
         <PausePanel />
      </>
   );
}

const FirstColumnWidth = 8.75;
const ColumnWidth = 5.625;
const IconWidth = 1.25;
const IconRowStyle = { flex: "1", display: "flex", justifyContent: "space-between", alignItems: "center" };

export function TopLeftPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   if (!G.save) return null;
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const warPower = getWarPower(G.save.state.playerProvince, G.save);
   const prestige = getProvincePrestige(G.save.state.playerProvince, G.save);
   const administrativePoint = getProvinceGovernmentPoint("administrative", G.save.state.playerProvince, G.save);
   const diplomaticPoint = getProvinceGovernmentPoint("diplomatic", G.save.state.playerProvince, G.save);
   const militaryPoint = getProvinceGovernmentPoint("military", G.save.state.playerProvince, G.save);
   return (
      <div className="resource-panel panel col fstart">
         <div className="f1 row mx10 stretch">
            <div className="row g5" style={{ width: `${FirstColumnWidth}rem` }}>
               <div className="pointer" onClick={() => showPanel(<SettingsModal />)}>
                  <img src={MenuIcon} style={{ width: `${IconWidth}rem` }} />
               </div>
               <FloatingTip
                  label={$t(
                     L.$1IsOurProvinceClickToHighlightItOnTheMap,
                     getProvinceName(G.save.state.playerProvince, G.save),
                  )}
               >
                  <div
                     className="f1 pointer text-md text-display text-right text-ellipsis"
                     style={{ color: `#${MapBackgroundColors[G.save.state.playerProvince].toString(16)}` }}
                     onClick={() => {
                        const scene = G.scene.getCurrent(WorldScene);
                        if (scene) {
                           scene
                              .lookAt(state.capital, { time: 0.2 })
                              .then((scene) => scene.drawProvinceOutline(G.save.state.playerProvince));
                        }
                     }}
                  >
                     {getProvinceName(G.save.state.playerProvince, G.save)}
                  </div>
               </FloatingTip>
            </div>
            <div className="divider vertical" />
            <BreakdownTooltip
               breakdown={administrativePoint}
               tooltip={(element) => (
                  <>
                     <div className="h2">{ProvinceResourceNames.administrative()}</div>
                     {element}
                  </>
               )}
            >
               <div
                  id="TopPanel_AdministrativePoint"
                  className="row g0 pointer"
                  style={{ width: `${ColumnWidth}rem` }}
                  onClick={() => showPanel(<GovernmentModal />)}
               >
                  <img src={Administrative} style={{ width: `${IconWidth}rem` }} />
                  <div className="f1" />
                  <div>
                     {formatNumber(getProvinceResource("administrative", G.save.state.playerProvince, G.save))}
                     {colorNumber(administrativePoint.value)}
                  </div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <BreakdownTooltip
               breakdown={diplomaticPoint}
               tooltip={(element) => (
                  <>
                     <div className="h2">{ProvinceResourceNames.diplomatic()}</div>
                     {element}
                  </>
               )}
            >
               <div
                  className="row g0 pointer"
                  style={{ width: `${ColumnWidth}rem` }}
                  onClick={() => showPanel(<GovernmentModal />)}
               >
                  <img src={Diplomatic} style={{ width: `${IconWidth}rem` }} />
                  <div className="f1" />
                  <div>
                     {formatNumber(getProvinceResource("diplomatic", G.save.state.playerProvince, G.save))}
                     {colorNumber(diplomaticPoint.value)}
                  </div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <BreakdownTooltip
               breakdown={militaryPoint}
               tooltip={(element) => (
                  <>
                     <div className="h2">{ProvinceResourceNames.military()}</div>
                     {element}
                  </>
               )}
            >
               <div
                  className="row g0 pointer"
                  style={{ width: `${ColumnWidth}rem` }}
                  onClick={() => showPanel(<GovernmentModal />)}
               >
                  <img src={Military} style={{ width: `${IconWidth}rem` }} />
                  <div className="f1" />
                  <div>
                     {formatNumber(getProvinceResource("military", G.save.state.playerProvince, G.save))}
                     {colorNumber(militaryPoint.value)}
                  </div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <BreakdownTooltip
               breakdown={warPower}
               tooltip={(element) => (
                  <>
                     <div className="m10">{Modifiers.WarPower.desc()}</div>
                     {element}
                  </>
               )}
            >
               <div
                  className="row g0 pointer"
                  style={{ width: `${ColumnWidth}rem` }}
                  onClick={() => {
                     showPanel(<ArmyModal />);
                  }}
                  id="TopPanel_WarPower"
               >
                  <img src={Army} style={{ width: `${IconWidth}rem` }} />
                  <div className="f1" />
                  {formatNumber(warPower.value)}
               </div>
            </BreakdownTooltip>
         </div>
         <div className="divider" />
         <div className="f1 row mx10 stretch">
            <FloatingTip label={$t(L.GoldAndMonthlyIncome)}>
               <div
                  id="TopPanel_Gold"
                  className="row g0 pointer"
                  style={{ width: `${FirstColumnWidth}rem` }}
                  onClick={() => showPanel(<TreasuryPage />)}
               >
                  <div>
                     <img src={Gold} style={{ width: `${IconWidth}rem` }} />
                  </div>
                  <div className="f1" />
                  <div>
                     {formatNumber(getProvinceResource("gold", G.save.state.playerProvince, G.save))}
                     {colorNumber(getProvinceIncome(G.save.state.playerProvince, G.save).income)}
                  </div>
               </div>
            </FloatingTip>
            <div className="divider vertical" />
            <BreakdownTooltip
               breakdown={prestige}
               tooltip={(element) => (
                  <>
                     <div className="m10">{Modifiers.Prestige.desc()}</div>
                     {element}
                  </>
               )}
            >
               <div
                  className="row g0 pointer"
                  style={{ width: `${ColumnWidth}rem` }}
                  onClick={() => {
                     showPanel(<ProvinceListModal />);
                  }}
               >
                  <img src={Prestige} style={{ width: `${IconWidth}rem` }} />
                  <div className="f1" />
                  <div>{formatNumber(prestige.value)}</div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <div style={IconRowStyle}>
               <FloatingTip label={$t(L.FamilyTree)}>
                  <div className="pointer" id="TopPanel_FamilyTree" onClick={() => showPanel(<FamilyTreeModal />)}>
                     <img src={FamilyTree} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.TilesAndUpgrades)}>
                  <div
                     id="TopPanel_TileCount"
                     className="pointer"
                     onClick={() => {
                        showPanel(<TileListModal />);
                     }}
                  >
                     <img src={ProvinceImage} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip
                  fixedWidth
                  className="p0"
                  label={
                     <div className="m10">
                        <div className="row my5">
                           <div className="f1">{$t(L.GoverningCostCapacity)}</div>
                           <div>
                              {formatNumber(getProvinceGoverningCost(G.save.state.playerProvince, G.save).value)}/
                              {formatNumber(getProvinceGoverningCapacity(G.save.state.playerProvince, G.save).value)}
                           </div>
                        </div>
                        <div className="row my5">
                           <div className="f1">{$t(L.Overextension)}</div>
                           <div>
                              {colorNumberReverse(getProvinceOverextension(G.save.state.playerProvince, G.save).value)}
                           </div>
                        </div>
                        <div className="row my5">
                           <div className="f1">{$t(L.Stability)}</div>
                           <div>{colorNumber(getProvinceStability(G.save.state.playerProvince, G.save).value)}</div>
                        </div>
                     </div>
                  }
               >
                  <div
                     id="TopPanel_InternalAffairs"
                     className="pointer"
                     onClick={() => {
                        showPanel(<InternalAffairsPage />);
                     }}
                  >
                     <img src={Stability} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.SocialClass)}>
                  <div className="pointer" onClick={() => showPanel(<SocialClassModal />)}>
                     <img src={SocialClass} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip fixedWidth className="p0" label={<DiplomatsTooltip />}>
                  <div
                     id="TopPanel_Diplomats"
                     className="pointer"
                     onClick={() => {
                        showPanel(<DiplomacyPage province={G.save.state.playerProvince} />);
                     }}
                  >
                     <img src={Diplomat} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Production)}>
                  <div className="pointer" id="TopPanel_Production" onClick={() => showPanel(<ProductionModal />)}>
                     <img src={Production} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Trade)}>
                  <div
                     className="pointer"
                     id="TopPanel_Trade"
                     onClick={() => showPanel(<TradeModal provinces={new Set([])} />)}
                  >
                     <img src={Trade} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.SenateAndConsuls)}>
                  <div className="pointer" id="TopPanel_Senate" onClick={() => showPanel(<SenateModal />)}>
                     <img src={Senate} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Missions)}>
                  <div className="pointer" id="TopPanel_Mission" onClick={() => showPanel(<MissionPage />)}>
                     <img src={Mission} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Chronicle)}>
                  <div className="pointer" id="TopPanel_Chronicle" onClick={() => showPanel(<ChroniclePage />)}>
                     <img src={Chronicle} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.LegacyUpgrade)}>
                  <div
                     className="pointer"
                     id="TopPanel_LegacyUpgrade"
                     onClick={() => showPanel(<LegacyUpgradeModal />)}
                  >
                     <img src={Legacy} style={{ width: `${IconWidth}rem` }} />
                  </div>
               </FloatingTip>
            </div>
         </div>
      </div>
   );
}

function DiplomatsTooltip(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const currentRelations = Array.from(getCurrentRelations(G.save.state.playerProvince, G.save));
   const totalDiplomats = getDiplomats(G.save.state.playerProvince, G.save);
   return (
      <>
         <div className="m10">{$t(L.WeCurrentlyHave$1Diplomats, formatNumber(totalDiplomats.value))}</div>
         {range(0, totalDiplomats.value).map((i) => {
            return (
               <div className="row mx10 my5" key={i}>
                  <div>
                     <img src={Diplomat} style={{ width: `${IconWidth * 0.8}rem` }} />
                  </div>
                  <div className="f1" />
                  <div>{currentRelations[i] ?? $t(L.Idle)}</div>
               </div>
            );
         })}
         <div className="divider" />
         <div className="m10">{$t(L.DiplomatsAreDeterminedAsFollows)}</div>
         <BreakdownComp breakdown={totalDiplomats} />
      </>
   );
}
