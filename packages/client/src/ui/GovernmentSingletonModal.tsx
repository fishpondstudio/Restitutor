import { Menu, Popover, ScrollArea } from "@mantine/core";
import { cls, entriesOf, formatNumber } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { SetGovernmentFocusAction } from "../game/actions/SetGovernmentFocusAction";
import { getAdvisorInitialCost, getAdvisorMonthlyCost } from "../game/definitions/Advisor";
import { AdvisorSlots, GovernmentTier } from "../game/definitions/GovernmentTier";
import { getPersonTraitDescription, PersonTrait } from "../game/definitions/PersonTrait";
import type { GovernorPower } from "../game/definitions/ProvinceResources";
import { GovernorPowerNames, getResourceName } from "../game/definitions/ProvinceResources";
import { GameStateUpdated } from "../game/Events";
import { showError } from "../game/logic/AlertLogic";
import { getProvinceGovernmentPoint, getProvinceName } from "../game/logic/ProvinceLogic";
import { getProvinceResource, notEnoughResourcesError, trySpendProvinceResources } from "../game/logic/ResourceLogic";
import { hasScenarioFlag } from "../game/logic/ScenarioLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { getTKCharacterName, getTKCharacterTierToPower } from "../game/logic/TKCharacterLogic";
import { TKCharacters, TKCharacterTier } from "../game/ThreeKingdoms/TKCharacter";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { showPanel } from "./common/ShowPanel";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { FamilyTreeSingletonModal } from "./FamilyTreeSingletonModal";
import { IconCatalog } from "./IconCatalog";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { TimedActionButton } from "./TimedActionButton";
import { Grid2, Grid3 } from "./UIConstant";

export function GovernmentSingletonModal(): React.ReactNode {
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
            <FloatingTip label={() => $t(L.ViewFamilyTree)}>
               <div className="row g5 pointer" onClick={() => showPanel(FamilyTreeSingletonModal, {})}>
                  {state.governor.male.name.join(" ")}
                  <img src={IconCatalog.FamilyTree} style={{ height: "2.1rem" }} />
               </div>
            </FloatingTip>
         </div>
         <div className="m10" style={Grid3}>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{GovernorPowerNames.administrative()}</div>
                  <div>{colorNumber(state.governor.male.administrative)}</div>
               </div>
            </div>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{GovernorPowerNames.diplomatic()}</div>
                  <div>{colorNumber(state.governor.male.diplomatic)}</div>
               </div>
            </div>
            <div className="box p5 text-sm">
               <div className="row">
                  <div className="f1">{GovernorPowerNames.military()}</div>
                  <div>{colorNumber(state.governor.male.military)}</div>
               </div>
            </div>
         </div>
         {hasScenarioFlag("AdvisorCharacter", G.save) ? <AdvisorCharacterComp /> : <AdvisorComp />}
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

function AdvisorCharacterComp(): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <>
         <div className="h1 row">
            <div className="f1">{$t(L.Advisors)}</div>
            <div>{GovernmentTier[state.tier].name()}</div>
         </div>
         <div className="m10" style={Grid3}>
            {entriesOf(AdvisorSlots).map(([slotKey, config]) => {
               const advisor = state.advisorSlots[slotKey];
               return (
                  <div className="box" key={slotKey}>
                     <div className="row">
                        {advisor && (
                           <img
                              src={TKCharacters[advisor].image}
                              className="display-block mx5"
                              style={{ width: "7rem", height: "7rem" }}
                           />
                        )}
                        <div className="f1">
                           {advisor ? (
                              <>
                                 <div className="text-display">{getTKCharacterName(advisor).fullName}</div>
                                 <div className="text-sm">
                                    <span className="text-dimmed">{getTKCharacterName(advisor).courtesyName}</span>
                                    {" · "}
                                    <span className="text-primary">
                                       {TKCharacterTier[TKCharacters[advisor].tier]()}
                                    </span>
                                 </div>
                              </>
                           ) : (
                              <div className="text-dimmed text-lg text-display cc" style={{ height: "7rem" }}>
                                 {GovernorPowerNames[config.type]()}
                              </div>
                           )}
                        </div>
                     </div>
                     <div className="divider" />
                     <div className="row m5 g5 text-sm">
                        <Popover position="bottom-start" offset={5}>
                           <Popover.Target>
                              <button className="btn p2">
                                 <div className="mi xs">swap_horiz</div>
                              </button>
                           </Popover.Target>
                           <Popover.Dropdown className="panel p0">
                              <ScrollArea h="20vh">
                                 <div style={{ ...Grid2, gap: "0" }} className="p10">
                                    {entriesOf(TKCharacters).map(([characterKey, character]) => {
                                       const { fullName, courtesyName } = getTKCharacterName(characterKey);
                                       return (
                                          <div
                                             className="hover-highlight p5"
                                             key={characterKey}
                                             onClick={() => {
                                                state.advisorSlots[slotKey] = characterKey;
                                                GameStateUpdated.emit();
                                             }}
                                          >
                                             {fullName} <span className="text-dimmed">({courtesyName})</span>
                                          </div>
                                       );
                                    })}
                                 </div>
                              </ScrollArea>
                           </Popover.Dropdown>
                        </Popover>
                        {advisor ? (
                           <>
                              <div>{GovernorPowerNames[config.type]()}</div>
                              <div className="f1" />
                              <div>{colorNumber(getTKCharacterTierToPower(TKCharacters[advisor].tier))}</div>
                           </>
                        ) : (
                           <div className="f1" />
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </>
   );
}

function AdvisorComp(): React.ReactNode {
   return (
      <>
         <div className="h1">{$t(L.Advisors)}</div>
         <div className="m10" style={Grid3}>
            <SelectAdvisor advisor="administrative" />
            <SelectAdvisor advisor="diplomatic" />
            <SelectAdvisor advisor="military" />
         </div>
      </>
   );
}

function GovernmentComp({ type }: { type: GovernorPower }): React.ReactNode {
   const governmentPoint = getProvinceGovernmentPoint(type, G.save.state.playerProvince, G.save);
   return (
      <div className="box p5">
         <BreakdownTooltip breakdown={governmentPoint}>
            <div className="text-xl">{governmentPoint.value}</div>
         </BreakdownTooltip>
         <div className="text-sm">{getResourceName(type, G.save.state.scenario)}</div>
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
                           state.advisors[advisor].selected = candidate;
                           GameStateUpdated.emit();
                        } else {
                           showError(notEnoughResourcesError(cost, G.save));
                        }
                     }}
                  >
                     <div className="text-display text-md">{candidate.name}</div>
                     <div className="row">
                        <div className="f1">- {getResourceName(advisor, G.save.state.scenario)}</div>
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
                              <span className="text-dimmed">({getPersonTraitDescription(trait)})</span>
                           </div>
                        </div>
                     ))}
                  </Menu.Item>
               ))}
               <div className="divider my5" />
               <Menu.Item
                  className="text-display text-md text-red"
                  onClick={() => {
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
               <div className="f1">{getResourceName(advisor, G.save.state.scenario)}</div>
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
                           label={() => (
                              <>
                                 {PersonTrait[trait].name()}: {getPersonTraitDescription(trait)}
                              </>
                           )}
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
            id={`GovernmentModal_Focus_${type}`}
            className="w100"
            action={() => SetGovernmentFocusAction(type, G.save.state.playerProvince, G.save)}
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
            <div className="f1">{getResourceName(type, G.save.state.scenario)}</div>
            <div>{colorNumber(state.focus === type ? 2 : -1)}</div>
         </div>
      </div>
   );
}
