import { Menu } from "@mantine/core";
import { cls, formatNumber } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import FamilyTree from "../assets/images/FamilyTree.svg";
import { finalizeCondition } from "../game/actions/GameAction";
import { getAdvisorInitialCost, getAdvisorMonthlyCost } from "../game/definitions/Advisor";
import { PersonTrait } from "../game/definitions/PersonTrait";
import { type GovernorPower, ProvinceResourceNames } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { showError } from "../game/logic/AlertLogic";
import { getLegacyUpgradeValue } from "../game/logic/LegacyUpgradeLogic";
import {
   getProvinceGovernmentPoint,
   getProvinceName,
   getProvinceResource,
   trySpendProvinceResources,
} from "../game/logic/ProvinceLogic";
import { notEnoughResourcesError } from "../game/logic/ResourceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar, showModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { FamilyTreeModal } from "./FamilyModal";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { playClick, playError } from "./Sound";
import { TimedActionButton } from "./TimedActionButton";
import { Grid3 } from "./UIConstant";

export function GovernmentModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <ModalComp
         size="lg"
         title={
            <ModalTitleBar title={$t(L.GovernmentOf$1, getProvinceName(G.save.state.playerProvince, G.save))} dismiss />
         }
      >
         <div className="h1 row">
            <div className="f1">{$t(L.GovernmentPoints)}</div>
            <div>{getProvinceName(G.save.state.playerProvince, G.save)}</div>
         </div>
         <div className="m10 text-center" style={Grid3}>
            <GovernmentComp type="administrative" />
            <GovernmentComp type="diplomatic" />
            <GovernmentComp type="military" />
         </div>
         <div className="h1 row">
            <div className="f1">{$t(L.Governor)}</div>
            <FloatingTip label={$t(L.ViewFamilyTree)}>
               <div className="row g5 pointer" onClick={() => showModal(<FamilyTreeModal />)}>
                  {state.governor.male.name.join(" ")}
                  <img src={FamilyTree} style={{ height: 21 }} />
               </div>
            </FloatingTip>
         </div>
         <div className="m10" style={Grid3}>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{$t(L.Administrative)}</div>
                  <div>{colorNumber(state.governor.male.administrative)}</div>
               </div>
               <div className="row g5">
                  <div>{$t(L.LegacyUpgrade)}</div>
                  <img src={ProvinceResourceImages.legacy} alt={$t(L.LegacyPoint)} height={17} />
                  <div className="f1" />
                  <div>
                     {colorNumber(getLegacyUpgradeValue("AdministrativePoint", G.save.state.playerProvince, G.save))}
                  </div>
               </div>
            </div>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{$t(L.Diplomatic)}</div>
                  <div>{colorNumber(state.governor.male.diplomatic)}</div>
               </div>
               <div className="row g5">
                  <div>{$t(L.LegacyUpgrade)}</div>
                  <img src={ProvinceResourceImages.legacy} alt={$t(L.LegacyPoint)} height={17} />
                  <div className="f1" />
                  <div>
                     {colorNumber(getLegacyUpgradeValue("DiplomaticPoint", G.save.state.playerProvince, G.save))}
                  </div>
               </div>
            </div>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{$t(L.Military)}</div>
                  <div>{colorNumber(state.governor.male.military)}</div>
               </div>
               <div className="row g5">
                  <div>{$t(L.LegacyUpgrade)}</div>
                  <img src={ProvinceResourceImages.legacy} alt={$t(L.LegacyPoint)} height={17} />
                  <div className="f1" />
                  <div>{colorNumber(getLegacyUpgradeValue("MilitaryPoint", G.save.state.playerProvince, G.save))}</div>
               </div>
            </div>
         </div>
         <div className="h1">{$t(L.Advisors)}</div>
         <div className="m10" style={Grid3}>
            <SelectAdvisor advisor="administrative" />
            <SelectAdvisor advisor="diplomatic" />
            <SelectAdvisor advisor="military" />
         </div>
         <div className="h1">{$t(L.Focus)}</div>
         <div className="m10" style={Grid3}>
            <FocusComp type="administrative" />
            <FocusComp type="diplomatic" />
            <FocusComp type="military" />
         </div>
         <div className="h1">{$t(L.Actions)}</div>
         <div className="m10" style={Grid3}>
            <TimedActionButton timedAction="AppointPontiff" />
            <TimedActionButton timedAction="AppointEnvoy" />
            <TimedActionButton timedAction="AppointArmyStaff" />
         </div>
      </ModalComp>
   );
}

function GovernmentComp({ type }: { type: GovernorPower }): React.ReactNode {
   const governmentPoint = getProvinceGovernmentPoint(type, G.save.state.playerProvince, G.save);
   return (
      <div className="box p5">
         <BreakdownTooltip breakdown={governmentPoint}>
            <div className="text-xl">{governmentPoint.value}</div>
         </BreakdownTooltip>
         <div className="text-sm">{ProvinceResourceNames[type]()}</div>
         <div className="divider mx-5 my5" />
         <div className="row">
            <img src={ProvinceResourceImages[type]} height={20} />
            {formatNumber(getProvinceResource(type, G.save.state.playerProvince, G.save))}
         </div>
      </div>
   );
}

function SelectAdvisor({ advisor }: { advisor: GovernorPower }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const level = state.advisors[advisor].selected?.level ?? 0;
   const monthlyCost = getAdvisorMonthlyCost(level, G.save.state.playerProvince, G.save);
   const traits = state.advisors[advisor].selected?.traits ?? new Set();
   return (
      <div>
         <Menu position="bottom-start" offset={5}>
            <Menu.Target>
               <button
                  className={cls(
                     "text-sm btn w100 px5 py2",
                     state.advisors[advisor].selected ? null : "GovernmentModal_SelectAdvisor",
                  )}
                  style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
               >
                  {state.advisors[advisor].selected?.name ?? $t(L.SelectAdvisor)}
               </button>
            </Menu.Target>
            <Menu.Dropdown className="panel p5">
               {state.advisors[advisor].candidates.map((candidate, i) => (
                  <Menu.Item
                     className={`GovernmentModal_SelectAdvisor_${i}`}
                     key={candidate.name}
                     onClick={() => {
                        if (state.advisors[advisor].selected?.level === candidate.level) {
                           return;
                        }
                        const cost = {
                           gold: getAdvisorInitialCost(candidate.level, G.save.state.playerProvince, G.save).value,
                        };
                        if (trySpendProvinceResources(cost, G.save.state.playerProvince, G.save)) {
                           playClick();
                           state.advisors[advisor].selected = candidate;
                           GameStateUpdated.emit();
                        } else {
                           playError();
                           showError(notEnoughResourcesError(cost, G.save));
                        }
                     }}
                  >
                     <div className="text-display text-md">{candidate.name}</div>
                     <div className="row">
                        <div className="f1">- {ProvinceResourceNames[advisor]()}</div>
                        <div>{colorNumber(candidate.level)}</div>
                     </div>
                     <div className="row">
                        <div className="f1">- {$t(L.OneTimeMonthlyCostGold)}</div>
                        <div>
                           {formatNumber(
                              getAdvisorInitialCost(candidate.level, G.save.state.playerProvince, G.save).value,
                           )}
                           {"/"}
                           {formatNumber(
                              getAdvisorMonthlyCost(candidate.level, G.save.state.playerProvince, G.save).value,
                           )}
                        </div>
                     </div>
                     {Array.from(candidate.traits).map((trait) => (
                        <div key={trait} className="row">
                           <div className="f1">
                              - {PersonTrait[trait].name()}{" "}
                              <span className="text-dimmed">({PersonTrait[trait].desc()})</span>
                           </div>
                        </div>
                     ))}
                  </Menu.Item>
               ))}
               <div className="divider my5" />
               <Menu.Item
                  className="text-display text-md text-red"
                  onClick={() => {
                     playClick();
                     state.advisors[advisor].selected = null;
                     GameStateUpdated.emit();
                  }}
                  rightSection={<div className="mi sm">delete</div>}
               >
                  {$t(L.RemoveAdvisor)}
               </Menu.Item>
            </Menu.Dropdown>
         </Menu>
         <div className="box p5 mt10 text-sm">
            <div className="row">
               <div className="f1">{ProvinceResourceNames[advisor]()}</div>
               <div>{colorNumber(level)}</div>
            </div>
            <BreakdownTooltip breakdown={monthlyCost}>
               <div className="row">
                  <div className="f1">{$t(L.MonthlyCost)}</div>
                  <div>
                     {formatNumber(monthlyCost.value)} {$t(L.Gold)}
                  </div>
               </div>
            </BreakdownTooltip>
            <div className="text-italic">
               {Array.from(traits).map((trait, i) => {
                  return (
                     <Fragment key={trait}>
                        {i > 0 && ", "}
                        <FloatingTip
                           label={
                              <>
                                 {PersonTrait[trait].name()}: {PersonTrait[trait].desc()}
                              </>
                           }
                        >
                           <span>{PersonTrait[trait].name()}</span>
                        </FloatingTip>
                     </Fragment>
                  );
               })}
            </div>
         </div>
      </div>
   );
}

function FocusComp({ type }: { type: GovernorPower }): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <div>
         <ActionButton
            className="w100"
            action={{
               condition: finalizeCondition({
                  breakdown: [
                     ...timedActionConditions({ action: "SetGovernmentFocus" }, G.save.state.playerProvince, G.save),
                     { name: $t(L.NotCurrentFocus), value: state.focus !== type },
                  ],
               }),
               effect: () => {
                  startTimedAction("SetGovernmentFocus", G.save.state.playerProvince, G.save);
                  state.focus = type;
               },
            }}
            tooltip={(element) => (
               <>
                  <TimedActionDescComp action="SetGovernmentFocus" />
                  {element}
               </>
            )}
         >
            {state.focus === type ? $t(L.CurrentFocus) : $t(L.SetFocus)}
         </ActionButton>
         <div className="box p5 mt10 text-sm row">
            <div className="f1">{ProvinceResourceNames[type]()}</div>
            <div>{colorNumber(state.focus === type ? 2 : -1)}</div>
         </div>
      </div>
   );
}
