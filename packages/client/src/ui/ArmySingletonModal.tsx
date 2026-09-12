import { Checkbox, Slider } from "@mantine/core";
import {
   cls,
   formatNumber,
   formatPercent,
   formatPercentDelta,
   hasFlag,
   setFlag,
} from "@project/shared/src/utils/Helper";
import { useState } from "react";
import {
   MakeGovernorGeneralAction,
   RecruitGeneralAction,
   UpgradeGeneralSkillAction,
} from "../game/actions/ArmyGeneralAction";
import { finalizeCondition } from "../game/actions/GameAction";
import { durationToString } from "../game/definitions/Modifier";
import { ProvinceResourceNames, ProvinceStatNames } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameOptionUpdated, GameStateUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import {
   GeneralArmyMaintenancePct,
   getArmyMaintenanceCost,
   getProvinceManpower,
   getWarPower,
} from "../game/logic/ArmyLogic";
import { getProvinceStat } from "../game/logic/ProvinceLogic";
import { getProvinceResource, provinceResourceOf } from "../game/logic/ResourceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import {
   ArmyCounterBonus,
   ArmyMoraleMonthlyIncrease,
   dismissGeneral,
   getArmyComposition,
   getCurrentGeneral,
   getUnitWarPower,
   hasGeneralCondition,
   MaxArmyMaintenance,
   MaxConscription,
   MinArmyMaintenance,
   MinConscription,
   setArmyComposition,
   setProvinceArmyMaintenance,
   setProvinceTargetConscription,
   UnitPowerUpgradeBonus,
} from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownRow } from "./BreakdownRow";
import { ConfirmModal } from "./ConfirmModal";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { TimedActionButton } from "./TimedActionButton";
import { Grid3 } from "./UIConstant";
import { WarPowerRow } from "./WarPowerTooltip";

export function ArmySingletonModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const { infantry, ranged, cavalry } = getArmyComposition(G.save.state.playerProvince, G.save);
   const manpower = getProvinceManpower(G.save.state.playerProvince, G.save);
   const maintenanceCost = getArmyMaintenanceCost(G.save.state.playerProvince, G.save);
   const actualConscription = getProvinceStat("actualConscription", G.save.state.playerProvince, G.save);
   const targetConscription = getProvinceStat("targetConscription", G.save.state.playerProvince, G.save);
   const armyMorale = getProvinceStat("armyMorale", G.save.state.playerProvince, G.save);
   const armyMaintenance = getProvinceStat("armyMaintenance", G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.ArmyAndWarPower)} dismiss />}>
         <BreakdownRow className="m10" name={$t(L.TotalManpower)} breakdown={manpower} />
         <div className="h1">{$t(L.ConscriptionAndStandingArmy)}</div>
         <div className="mx10 my5" id="ArmyModal_TargetConscription">
            {$t(L.TargetConscription)}
         </div>
         <TargetConscriptionSlider />
         <div className="h20" />
         <div className="divider" />
         <div className="row g5 mx10 my5">
            <div className="f1">{$t(L.ActualConscription)}</div>
            {targetConscription > actualConscription && (
               <FloatingTip label={() => $t(L.ActualConscriptionIncreasingAt$1PerMonth, "1%")}>
                  <div className="mi sm text-green">trending_up</div>
               </FloatingTip>
            )}
            {formatNumber(actualConscription)}%
            {targetConscription > actualConscription && (
               <>
                  <div className="mi sm">arrow_right_alt</div>
                  <div>{formatNumber(targetConscription)}%</div>
               </>
            )}
         </div>
         <div className="row g5 mx10 my5 text-display text-lg">
            <div className="f1">{$t(L.StandingArmy)}</div>
            {targetConscription > actualConscription && (
               <FloatingTip label={() => $t(L.ActualConscriptionIncreasingAt$1PerMonth, "1%")}>
                  <div className="mi sm text-green">trending_up</div>
               </FloatingTip>
            )}
            {formatNumber(manpower.value * (actualConscription / 100))}
            {targetConscription > actualConscription && (
               <>
                  <div className="mi sm">arrow_right_alt</div>
                  <div>{formatNumber(manpower.value * (targetConscription / 100))}</div>
               </>
            )}
         </div>
         <div className="h1">{$t(L.ArmyComposition)}</div>
         <div className="row g0 my5 text-sm">
            <div className="f1">
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.Infantry)}</div>
                  <div>{infantry}%</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getUnitWarPower("infantry", G.save.state.playerProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <div className="m10">
                           {html($t(L.InfantryCountersCavalryAndIsCounteredByRangedUnits))}
                           <div className="h5" />
                           {html(
                              $t(L.InfantryEffectivenessIncreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                           <div className="h5" />
                           {html(
                              $t(L.InfantryEffectivenessDecreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                        </div>
                        {element}
                     </>
                  )}
               />
               <div className="mx10 my5">
                  <Slider styles={{ thumb: { display: "none" } }} value={infantry} />
               </div>
            </div>
            <div className="divider vertical" />
            <div className="f1">
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.Ranged)}</div>
                  <div>{ranged}%</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getUnitWarPower("ranged", G.save.state.playerProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <div className="m10">
                           {html($t(L.RangedUnitsCounterInfantryAndAreCounteredByCavalry))}
                           <div className="h5" />
                           {html(
                              $t(L.RangedEffectivenessIncreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                           <div className="h5" />
                           {html(
                              $t(L.RangedEffectivenessDecreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                        </div>
                        {element}
                     </>
                  )}
               />
               <div className="mx10 my5">
                  <ArmyCompositionSlider unit="ranged" value={ranged} />
               </div>
            </div>
            <div className="divider vertical" />
            <div className="f1">
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.Cavalry)}</div>
                  <div>{cavalry}%</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getUnitWarPower("cavalry", G.save.state.playerProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <div className="m10">
                           {html($t(L.CavalryCountersRangedUnitsAndIsCounteredByInfantry))}
                           <div className="h5" />
                           {html(
                              $t(L.CavalryEffectivenessIncreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                           <div className="h5" />
                           {html(
                              $t(L.CavalryEffectivenessDecreaseDesc$1$2, "1%", formatPercent(0.01 * ArmyCounterBonus)),
                           )}
                        </div>
                        {element}
                     </>
                  )}
               />
               <div className="mx10 my5">
                  <ArmyCompositionSlider unit="cavalry" value={cavalry} />
               </div>
            </div>
         </div>
         <div className="h1 row g5">
            <div>{$t(L.ArmyGeneral)}</div>
            <GeneralStatusComp />
            <div className="f1" />
            <FloatingTip label={() => <GeneralSkillPointTooltip />} className="p0" fixedWidth>
               <div className="row g5">
                  <div>
                     {getProvinceResource("generalSkillPoint", G.save.state.playerProvince, G.save)}{" "}
                     {ProvinceResourceNames.generalSkillPoint()}
                  </div>
                  <img
                     src={ProvinceResourceImages.generalSkillPoint}
                     className="icon-block"
                     style={{ height: "1.3125rem" }}
                  />
               </div>
            </FloatingTip>
         </div>
         <div className="m10" style={Grid3}>
            <ActionButton
               id="ArmyModal_RecruitGeneral"
               action={() => RecruitGeneralAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="RecruitAGeneral" />
                     <div className="h2">{$t(L.MonthlyGoldCost)}</div>
                     <div className="mx10 my5">
                        {$t(L.$1ArmyMaintenanceCost, formatPercentDelta(GeneralArmyMaintenancePct))}
                     </div>
                     {element}
                  </>
               )}
            >
               {TimedActions.RecruitAGeneral.name()}
            </ActionButton>
            <ActionButton
               id="ArmyModal_MakeGovernorGeneral"
               action={() => MakeGovernorGeneralAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <div className="m10">
                        {html($t(L.MakingGovernorGeneralDoesNotCostGold$1$2$3$4, "10%", "1", "1", "1"))}
                     </div>
                     {element}
                  </>
               )}
            >
               {$t(L.MakeGovernorGeneral)}
            </ActionButton>
            <ActionButton
               action={() => ({
                  condition: finalizeCondition([hasGeneralCondition(G.save.state.playerProvince, G.save)]),
                  execute: () => {
                     dismissGeneral(G.save.state.playerProvince, G.save);
                  },
               })}
               tooltip={(element) => (
                  <>
                     <div className="m10">
                        {$t(L.DismissingGeneralWillRemoveFromCommand)} <div className="h10" />
                        {$t(L.GeneralSkillPointsCarryover)}
                     </div>
                     {element}
                  </>
               )}
            >
               {$t(L.DismissGeneral)}
            </ActionButton>
         </div>
         <div className="m10"></div>
         <div className="m10" style={Grid3}>
            <UpgradeSkillButton skill="infantrySkill" id="ArmyModal_UpgradeInfantrySkill" />
            <UpgradeSkillButton skill="rangedSkill" id="ArmyModal_UpgradeRangedSkill" />
            <UpgradeSkillButton skill="cavalrySkill" id="ArmyModal_UpgradeCavalrySkill" />
         </div>
         <div className="h1">{$t(L.Actions)}</div>
         <div className="m10" style={Grid3}>
            <TimedActionButton timedAction="UpgradeRations" />
            <TimedActionButton timedAction="RefitArmor" />
            <TimedActionButton timedAction="ServiceWeapons" />
         </div>
         <div className="h1">{$t(L.MaintenanceAndMorale)}</div>
         <div className="mx10 my5" id="ArmyModal_ArmyMaintenance">
            {$t(L.ArmyMaintenance)}
         </div>
         <ArmyMaintenanceSlider />
         <div className="h20" />
         <div className="divider" />
         <div className="row mx10 my5">
            <div className="f1">{$t(L.CurrentMorale)}</div>
            {armyMaintenance > armyMorale && (
               <FloatingTip
                  label={() =>
                     $t(
                        L.MoraleIsIncreasingAt$1PerMonthToReachArmyMaintenance,
                        formatPercent(ArmyMoraleMonthlyIncrease / 100),
                     )
                  }
               >
                  <div className="mi sm text-green">trending_up</div>
               </FloatingTip>
            )}
            <div>{armyMorale}%</div>
         </div>
         <div className="h1">{$t(L.MonthlyCostAndWarPower)}</div>
         <BreakdownRow className="mx10 my5" name={$t(L.MonthlyGoldCost)} breakdown={maintenanceCost} />
         <WarPowerRow
            className="mx10 my5 text-display text-lg"
            name={$t(L.WarPower)}
            breakdown={getWarPower(G.save.state.playerProvince, G.save)}
         />
      </ModalComp>
   );
}

function ArmyCompositionSlider({ unit, value }: { unit: "ranged" | "cavalry"; value: number }): React.ReactNode {
   return (
      <Slider
         min={0}
         max={100}
         step={1}
         value={value}
         onChange={(nextValue) => {
            const province = G.save.state.playerProvince;
            const composition = getArmyComposition(province, G.save);
            const other = unit === "ranged" ? "cavalry" : "ranged";
            composition[unit] = nextValue;
            composition[other] = Math.min(composition[other], 100 - nextValue);
            setArmyComposition(composition.ranged, composition.cavalry, province, G.save);
            GameStateUpdated.emit();
         }}
      />
   );
}

function TargetConscriptionSlider(): React.ReactNode {
   const [preview, setPreview] = useState<number>();
   const currentValue = getProvinceStat("targetConscription", G.save.state.playerProvince, G.save);
   return (
      <Slider
         className="m10"
         value={preview ?? currentValue}
         onChange={setPreview}
         onChangeEnd={(value) => {
            const save = G.save;
            const province = save.state.playerProvince;
            const previousValue = getProvinceStat("targetConscription", province, save);
            if (value === previousValue) {
               setPreview(undefined);
               return;
            }
            const apply = () => {
               setPreview(undefined);
               if (G.save !== save || G.save.state.playerProvince !== province) {
                  return;
               }
               setProvinceTargetConscription(value, province, save);
               GameStateUpdated.emit();
            };
            if (
               value < previousValue &&
               value < getProvinceStat("actualConscription", province, save) &&
               !hasFlag(save.options.flag, GameOptionFlag.SkipConscriptionReductionConfirmation)
            ) {
               let skipConfirmation = false;
               showPanel(ConfirmModal, {
                  title: $t(L.LowerTargetConscription),
                  message: (
                     <>
                        <div className="box red">
                           <div className="row mx10 my5 g5">
                              <div>{$t(L.TargetConscription)}</div>
                              <div className="f1" />
                              <div>{formatPercent(previousValue / 100)}</div>
                              <div className="mi sm text-red">arrow_right_alt</div>
                              <div>{formatPercent(value / 100)}</div>
                           </div>
                           <div className="row mx10 my5 g5">
                              <div>{$t(L.ActualConscription)}</div>
                              <div className="f1" />
                              <div>{formatPercent(getProvinceStat("actualConscription", province, save) / 100)}</div>
                              <div className="mi sm text-red">arrow_right_alt</div>
                              <div>{formatPercent(value / 100)}</div>
                           </div>
                        </div>
                        <div className="mt10 text-sm text-dimmed">
                           {html(
                              $t(
                                 L.ConscriptionReductionWarning$1$2$2,
                                 formatPercent(previousValue / 100),
                                 formatPercent(value / 100),
                              ),
                           )}
                        </div>
                        <Checkbox
                           className="mt10"
                           label={$t(L.DontShowThisConfirmationAgain)}
                           defaultChecked={false}
                           onChange={(event) => {
                              skipConfirmation = event.currentTarget.checked;
                           }}
                        />
                     </>
                  ),
                  onCancel: () => setPreview(undefined),
                  confirm: {
                     label: $t(L.Confirm),
                     onClick: () => {
                        if (G.save === save && G.save.state.playerProvince === province && skipConfirmation) {
                           save.options.flag = setFlag(
                              save.options.flag,
                              GameOptionFlag.SkipConscriptionReductionConfirmation,
                           );
                           GameOptionUpdated.emit();
                        }
                        apply();
                        hideModal();
                     },
                  },
               });
               return;
            }
            apply();
         }}
         min={MinConscription}
         max={MaxConscription}
         marks={[
            { value: 5, label: "5%" },
            { value: 10, label: "10%" },
            { value: 15, label: "15%" },
            { value: 20, label: "20%" },
            { value: 25, label: "25%" },
            { value: 30, label: "30%" },
            { value: 35, label: "35%" },
            { value: 40, label: "40%" },
            { value: 45, label: "45%" },
            { value: 50, label: "50%" },
         ]}
      />
   );
}

function ArmyMaintenanceSlider(): React.ReactNode {
   const [preview, setPreview] = useState<number>();
   const currentValue = getProvinceStat("armyMaintenance", G.save.state.playerProvince, G.save);
   return (
      <Slider
         className="m10"
         value={preview ?? currentValue}
         onChange={setPreview}
         onChangeEnd={(value) => {
            const save = G.save;
            const province = save.state.playerProvince;
            const previousValue = getProvinceStat("armyMaintenance", province, save);
            if (value === previousValue) {
               setPreview(undefined);
               return;
            }
            const apply = () => {
               setPreview(undefined);
               if (G.save !== save || G.save.state.playerProvince !== province) {
                  return;
               }
               setProvinceArmyMaintenance(value, province, save);
               GameStateUpdated.emit();
            };
            if (
               value < previousValue &&
               value < getProvinceStat("armyMorale", province, save) &&
               !hasFlag(save.options.flag, GameOptionFlag.SkipArmyMaintenanceReductionConfirmation)
            ) {
               let skipConfirmation = false;
               showPanel(ConfirmModal, {
                  title: $t(L.LowerArmyMaintenance),
                  message: (
                     <>
                        <div className="box red">
                           <div className="row mx10 my5 g5">
                              <div>{$t(L.ArmyMaintenance)}</div>
                              <div className="f1" />
                              <div>{formatPercent(previousValue / 100)}</div>
                              <div className="mi sm text-red">arrow_right_alt</div>
                              <div>{formatPercent(value / 100)}</div>
                           </div>
                           <div className="row mx10 my5 g5">
                              <div>{$t(L.CurrentMorale)}</div>
                              <div className="f1" />
                              <div>{formatPercent(getProvinceStat("armyMorale", province, save) / 100)}</div>
                              <div className="mi sm text-red">arrow_right_alt</div>
                              <div>{formatPercent(value / 100)}</div>
                           </div>
                        </div>
                        <div className="mt10 text-sm text-dimmed">
                           {html(
                              $t(
                                 L.ArmyMaintenanceReductionWarning$1$2$2,
                                 formatPercent(previousValue / 100),
                                 formatPercent(value / 100),
                              ),
                           )}
                        </div>
                        <Checkbox
                           className="mt10"
                           label={$t(L.DontShowThisConfirmationAgain)}
                           defaultChecked={false}
                           onChange={(event) => {
                              skipConfirmation = event.currentTarget.checked;
                           }}
                        />
                     </>
                  ),
                  onCancel: () => setPreview(undefined),
                  confirm: {
                     label: $t(L.Confirm),
                     onClick: () => {
                        if (G.save === save && G.save.state.playerProvince === province && skipConfirmation) {
                           save.options.flag = setFlag(
                              save.options.flag,
                              GameOptionFlag.SkipArmyMaintenanceReductionConfirmation,
                           );
                           GameOptionUpdated.emit();
                        }
                        apply();
                        hideModal();
                     },
                  },
               });
               return;
            }
            apply();
         }}
         min={MinArmyMaintenance}
         max={MaxArmyMaintenance}
         marks={[
            { value: 50, label: "50%" },
            { value: 60, label: "60%" },
            { value: 70, label: "70%" },
            { value: 80, label: "80%" },
            { value: 90, label: "90%" },
            { value: 100, label: "100%" },
         ]}
      />
   );
}

function UpgradeSkillButton({
   skill,
   id,
}: {
   skill: "infantrySkill" | "rangedSkill" | "cavalrySkill";
   id?: string;
}): React.ReactNode {
   return (
      <ActionButton
         id={id}
         action={() => UpgradeGeneralSkillAction(skill, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <div className="m10">{$t(L.GeneralSkillBasePowerDesc$1, formatPercent(UnitPowerUpgradeBonus))}</div>
               {element}
            </>
         )}
         className="btn"
      >
         <div>{ProvinceStatNames[skill]()}</div>
         <div className="fixed-right text-roman mr10">
            {getProvinceStat(skill, G.save.state.playerProvince, G.save)}
         </div>
      </ActionButton>
   );
}

function GeneralSkillPointTooltip(): React.ReactNode {
   const skillPoints = provinceResourceOf("generalSkillPoint", G.save.state.playerProvince, G.save);
   return (
      <>
         <div className="h2">{ProvinceResourceNames.generalSkillPoint()}</div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.AvailableEarned)}</div>
            <div>
               {skillPoints[0] - skillPoints[1]}/{skillPoints[0]}
            </div>
         </div>
         <div className="divider" />
         <div className="mx10 my5">{html($t(L.GeneralSkillPointsFromWar))}</div>
         <div className="divider" />
         <div className="mx10 my5">{$t(L.GeneralSkillPointsCarryover)}</div>
      </>
   );
}

function GeneralStatusComp(): React.ReactNode {
   const currentGeneral = getCurrentGeneral(G.save.state.playerProvince, G.save);
   const timeLeft = getTimedActionTimeLeft("RecruitAGeneral", G.save.state.playerProvince, G.save);
   return (
      <>
         {currentGeneral === undefined && (
            <FloatingTip label={() => $t(L.GeneralIsCurrentlyVacantConsiderAppointingAGeneral)}>
               <div className="mi sm text-yellow">warning</div>
            </FloatingTip>
         )}
         {currentGeneral === "Governor" && (
            <FloatingTip label={() => $t(L.OurGovernorIsCurrentlyInCommand)}>
               <div className="ml5 text-dimmed">({$t(L.Governor)})</div>
            </FloatingTip>
         )}
         {currentGeneral === "Recruit" && (
            <FloatingTip label={() => $t(L.TimeLeftBeforeTheCurrentGeneralRetires)}>
               <div className={cls("ml5", timeLeft < 12 ? "text-yellow" : "text-dimmed")}>
                  ({$t(L.$1Left, durationToString(timeLeft))})
               </div>
            </FloatingTip>
         )}
      </>
   );
}
