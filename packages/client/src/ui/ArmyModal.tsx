import { Slider } from "@mantine/core";
import { formatNumber, formatPercent, formatPercentDelta } from "@project/shared/src/utils/Helper";
import {
   MakeGovernorGeneralAction,
   RecruitGeneralAction,
   UpgradeGeneralSkillAction,
} from "../game/actions/ArmyGeneralAction";
import { finalizeCondition } from "../game/actions/GameAction";
import { ProvinceResourceNames, ProvinceStatNames } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import {
   GeneralArmyMaintenancePct,
   getArmyMaintenanceCost,
   getProvinceManpower,
   getProvinceResource,
   getProvinceStat,
   getWarPower,
   setProvinceStat,
} from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import {
   ArmyMoraleMonthlyIncrease,
   dismissGeneral,
   getCavalryUnitWarPower,
   getCurrentGeneral,
   getInfantryUnitWarPower,
   getRangedUnitWarPower,
   hasGeneralCondition,
   MaxConscription,
   MinConscription,
} from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownRow } from "./BreakdownRow";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { TimedActionButton } from "./TimedActionButton";
import { Grid3 } from "./UIConstant";

export function ArmyModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
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
         <Slider
            className="m10"
            value={targetConscription}
            onChange={(value) => {
               if (value < getProvinceStat("actualConscription", G.save.state.playerProvince, G.save)) {
                  setProvinceStat("actualConscription", value, G.save.state.playerProvince, G.save);
               }
               setProvinceStat("targetConscription", value, G.save.state.playerProvince, G.save);
               GameStateUpdated.emit();
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
         <div className="h20" />
         <div className="divider" />
         <div className="row g5 mx10 my5">
            <div className="f1">{$t(L.ActualConscription)}</div>
            {targetConscription > actualConscription && (
               <FloatingTip label={$t(L.ActualConscriptionIncreasingAtXPerMonth, "1%")}>
                  <div className="mi sm text-green">trending_up</div>
               </FloatingTip>
            )}
            {actualConscription}%
            {targetConscription > actualConscription && (
               <>
                  <div className="mi sm">arrow_right_alt</div>
                  <div>{targetConscription}%</div>
               </>
            )}
         </div>
         <div className="row g5 mx10 my5 text-display text-lg">
            <div className="f1">{$t(L.StandingArmy)}</div>
            {targetConscription > actualConscription && (
               <FloatingTip label={$t(L.ActualConscriptionIncreasingAtXPerMonth, "1%")}>
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
                  <div>
                     {100 -
                        getProvinceStat("cavalryUnit", G.save.state.playerProvince, G.save) -
                        getProvinceStat("rangedUnit", G.save.state.playerProvince, G.save)}
                     %
                  </div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getInfantryUnitWarPower(G.save.state.playerProvince, G.save)}
               />
               <div className="mx10 my5">
                  <Slider
                     styles={{ thumb: { display: "none" } }}
                     value={
                        100 -
                        getProvinceStat("cavalryUnit", G.save.state.playerProvince, G.save) -
                        getProvinceStat("rangedUnit", G.save.state.playerProvince, G.save)
                     }
                  />
               </div>
            </div>
            <div className="divider vertical" />
            <div className="f1">
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.Ranged)}</div>
                  <div>{getProvinceStat("rangedUnit", G.save.state.playerProvince, G.save)}%</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getRangedUnitWarPower(G.save.state.playerProvince, G.save)}
               />
               <div className="mx10 my5">
                  <Slider
                     min={0}
                     max={25}
                     step={1}
                     value={getProvinceStat("rangedUnit", G.save.state.playerProvince, G.save)}
                     onChange={(value) => {
                        setProvinceStat("rangedUnit", value, G.save.state.playerProvince, G.save);
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </div>
            <div className="divider vertical" />
            <div className="f1">
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.Cavalry)}</div>
                  <div>{getProvinceStat("cavalryUnit", G.save.state.playerProvince, G.save)}%</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.UnitPower)}
                  breakdown={getCavalryUnitWarPower(G.save.state.playerProvince, G.save)}
               />
               <div className="mx10 my5">
                  <Slider
                     min={0}
                     max={25}
                     step={1}
                     value={getProvinceStat("cavalryUnit", G.save.state.playerProvince, G.save)}
                     onChange={(value) => {
                        setProvinceStat("cavalryUnit", value, G.save.state.playerProvince, G.save);
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </div>
         </div>
         <div className="h1">{$t(L.ArmyGeneral)}</div>
         <div className="m10" style={Grid3}>
            <ActionButton
               id="ArmyModal_RecruitGeneral"
               action={RecruitGeneralAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="RecruitAGeneral" />
                     <div className="h2">{$t(L.MonthlyGoldCost)}</div>
                     <div className="mx10 my5">
                        {$t(L.XArmyMaintenanceCost, formatPercentDelta(GeneralArmyMaintenancePct))}
                     </div>
                     {element}
                  </>
               )}
            >
               {TimedActions.RecruitAGeneral.name()}
            </ActionButton>
            <ActionButton
               id="ArmyModal_MakeGovernorGeneral"
               action={MakeGovernorGeneralAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <div className="m10">{html($t(L.MakingGovernorGeneralDoesNotCostGold, "10%", "1", "1", "1"))}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.MakeGovernorGeneral)}
            </ActionButton>
            <ActionButton
               action={{
                  condition: finalizeCondition({
                     breakdown: [hasGeneralCondition(G.save.state.playerProvince, G.save)],
                  }),
                  effect: () => {
                     dismissGeneral(G.save.state.playerProvince, G.save);
                  },
               }}
               tooltip={(element) => (
                  <>
                     <div className="m10">{$t(L.DismissingOurGeneralWillResetSkillPointsAndCommandUpgrades)}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.DismissGeneral)}
            </ActionButton>
         </div>
         <div className="m10">
            {getCurrentGeneral(G.save.state.playerProvince, G.save) === undefined && (
               <div className="text-yellow mb5">{$t(L.GeneralIsCurrentlyVacantConsiderAppointingAGeneral)}</div>
            )}
            <FloatingTip label={html($t(L.OurGeneralWillAccumulateSkillPoints, "1"))}>
               <div className="row">
                  <div className="f1">{ProvinceResourceNames.generalSkillPoint()}</div>
                  <div>{getProvinceResource("generalSkillPoint", G.save.state.playerProvince, G.save)}</div>
               </div>
            </FloatingTip>
         </div>
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
         <Slider
            className="m10"
            value={armyMaintenance}
            onChange={(value) => {
               if (value < getProvinceStat("armyMorale", G.save.state.playerProvince, G.save)) {
                  setProvinceStat("armyMorale", value, G.save.state.playerProvince, G.save);
               }
               setProvinceStat("armyMaintenance", value, G.save.state.playerProvince, G.save);
               GameStateUpdated.emit();
            }}
            min={50}
            max={100}
            marks={[
               { value: 50, label: "50%" },
               { value: 60, label: "60%" },
               { value: 70, label: "70%" },
               { value: 80, label: "80%" },
               { value: 90, label: "90%" },
               { value: 100, label: "100%" },
            ]}
         />
         <div className="h20" />
         <div className="divider" />
         <div className="row mx10 my5">
            <div className="f1">{$t(L.CurrentMorale)}</div>
            {armyMaintenance > armyMorale && (
               <FloatingTip
                  label={$t(
                     L.MoraleIsIncreasingAtXPerMonthToReachArmyMaintenance,
                     formatPercent(ArmyMoraleMonthlyIncrease / 100),
                  )}
               >
                  <div className="mi sm text-green">trending_up</div>
               </FloatingTip>
            )}
            <div>{armyMorale}%</div>
         </div>
         <div className="h1">{$t(L.MonthlyCostAndWarPower)}</div>
         <BreakdownRow className="mx10 my5" name={$t(L.MonthlyGoldCost)} breakdown={maintenanceCost} />
         <BreakdownRow
            className="mx10 my5 text-display text-lg"
            name={$t(L.WarPower)}
            breakdown={getWarPower(G.save.state.playerProvince, G.save)}
         />
      </ModalComp>
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
         action={UpgradeGeneralSkillAction(skill, G.save.state.playerProvince, G.save)}
         tooltip={(element) => (
            <>
               <div className="m10">{$t(L.EachGeneralSkillLevelContributesToTheCorrespondingUnitsPower)}</div>
               {element}
            </>
         )}
         className="btn py5"
      >
         <div className="text-xl">{getProvinceStat(skill, G.save.state.playerProvince, G.save)}</div>
         <div className="text-sm">{ProvinceStatNames[skill]()}</div>
      </ActionButton>
   );
}
