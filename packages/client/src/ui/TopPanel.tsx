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
import { showModal } from "../utils/ModalManager";
import { ArmyModal } from "./ArmyModal";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { ChroniclePage } from "./ChroniclePage";
import { showSidebar } from "./common/Sidebar";
import { colorNumber, colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { DiplomacyPage } from "./DiplomacyPage";
import { FamilyTreeModal } from "./FamilyModal";
import { GovernmentModal } from "./GovernmentModal";
import { InternalAffairsPage } from "./InternalAffairsPage";
import { LeftPanel } from "./LeftPanel";
import { LegacyUpgradePage } from "./LegacyUpgradePage";
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

const FirstColumnWidth = 140;
const ColumnWidth = 90;
const IconWidth = 20;
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
            <div
               className="row g5"
               style={{
                  color: `#${MapBackgroundColors[G.save.state.playerProvince].toString(16)}`,
                  width: FirstColumnWidth,
               }}
            >
               <div className="pointer" onClick={() => showModal(<SettingsModal />)}>
                  <img src={MenuIcon} width={IconWidth} />
               </div>
               <FloatingTip
                  label={$t(
                     L.$1IsOurProvinceClickToHighlightItOnTheMap,
                     getProvinceName(G.save.state.playerProvince, G.save),
                  )}
               >
                  <div
                     className="f1 pointer text-md text-display text-right text-ellipsis"
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
                  style={{ width: ColumnWidth }}
                  onClick={() => showModal(<GovernmentModal />)}
               >
                  <img src={Administrative} width={IconWidth} />
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
                  style={{ width: ColumnWidth }}
                  onClick={() => showModal(<GovernmentModal />)}
               >
                  <img src={Diplomatic} width={IconWidth} />
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
                  style={{ width: ColumnWidth }}
                  onClick={() => showModal(<GovernmentModal />)}
               >
                  <img src={Military} width={IconWidth} />
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
                  style={{ width: ColumnWidth }}
                  onClick={() => {
                     showModal(<ArmyModal />);
                  }}
                  id="TopPanel_WarPower"
               >
                  <img src={Army} width={IconWidth} />
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
                  style={{ width: FirstColumnWidth }}
                  onClick={() => showSidebar(<TreasuryPage />)}
               >
                  <div>
                     <img src={Gold} width={IconWidth} />
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
                  style={{ width: ColumnWidth }}
                  onClick={() => {
                     showModal(<ProvinceListModal />);
                  }}
               >
                  <img src={Prestige} width={IconWidth} />
                  <div className="f1" />
                  <div>{formatNumber(prestige.value)}</div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <div style={IconRowStyle}>
               <FloatingTip label={$t(L.FamilyTree)}>
                  <div className="pointer" id="TopPanel_FamilyTree" onClick={() => showModal(<FamilyTreeModal />)}>
                     <img src={FamilyTree} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.TilesAndUpgrades)}>
                  <div
                     id="TopPanel_TileCount"
                     className="pointer"
                     onClick={() => {
                        showModal(<TileListModal />);
                     }}
                  >
                     <img src={ProvinceImage} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip
                  w={300}
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
                        showSidebar(<InternalAffairsPage />);
                     }}
                  >
                     <img src={Stability} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.SocialClass)}>
                  <div className="pointer" onClick={() => showModal(<SocialClassModal />)}>
                     <img src={SocialClass} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip w={300} className="p0" label={<DiplomatsMerchantsTooltip />}>
                  <div
                     id="TopPanel_Diplomats"
                     className="pointer"
                     onClick={() => {
                        showSidebar(<DiplomacyPage province={G.save.state.playerProvince} />);
                     }}
                  >
                     <img src={Diplomat} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Production)}>
                  <div className="pointer" id="TopPanel_Production" onClick={() => showModal(<ProductionModal />)}>
                     <img src={Production} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Trade)}>
                  <div
                     className="pointer"
                     id="TopPanel_Trade"
                     onClick={() => showModal(<TradeModal provinces={new Set([])} />)}
                  >
                     <img src={Trade} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.SenateAndConsuls)}>
                  <div className="pointer" id="TopPanel_Senate" onClick={() => showModal(<SenateModal />)}>
                     <img src={Senate} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Missions)}>
                  <div className="pointer" id="TopPanel_Mission" onClick={() => showSidebar(<MissionPage />)}>
                     <img src={Mission} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.Chronicle)}>
                  <div className="pointer" id="TopPanel_Chronicle" onClick={() => showSidebar(<ChroniclePage />)}>
                     <img src={Chronicle} width={IconWidth} />
                  </div>
               </FloatingTip>
               <FloatingTip label={$t(L.LegacyUpgrade)}>
                  <div
                     className="pointer"
                     id="TopPanel_LegacyUpgrade"
                     onClick={() => showSidebar(<LegacyUpgradePage />)}
                  >
                     <img src={Legacy} width={IconWidth} />
                  </div>
               </FloatingTip>
            </div>
         </div>
      </div>
   );
}

function DiplomatsMerchantsTooltip(): React.ReactNode {
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
                     <img src={Diplomat} width={IconWidth * 0.8} />
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
