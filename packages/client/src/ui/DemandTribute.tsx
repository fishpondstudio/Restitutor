import { formatNumber } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { DemandTributeCostCondition } from "../game/actions/DemandTributeCostCondition";
import type { IConditionBreakdown, IValueBreakdown } from "../game/actions/GameAction";
import type { Province } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { addAttitudeModifier } from "../game/logic/DiplomacyLogic";
import { addModifier } from "../game/logic/ModifierLogic";
import {
   addProvinceResource,
   getProvinceName,
   getProvincePrestige,
   getProvinceUpgrade,
} from "../game/logic/ProvinceLogic";
import { startTimedAction } from "../game/logic/TimedActionLogic";
import { getWarParticipants } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { DiceRollComp } from "./DiceRollDisplay";
import { playClick } from "./Sound";

export function DemandTribute({ province }: { province: Province }): React.ReactNode {
   const [rollStarted, setRollStarted] = useState(false);
   const { coAttackers, coDefenders } = getWarParticipants(G.save.state.playerProvince, province, G.save);
   const ourPrestige = getProvincePrestige(G.save.state.playerProvince, G.save);
   let ourCoalition = ourPrestige.value;
   const ours = new Map<Province, [IConditionBreakdown, IValueBreakdown]>(
      Array.from(coAttackers).map(([province, condition]) => {
         const prestige = getProvincePrestige(province, G.save);
         if (condition.value) {
            ourCoalition += prestige.value;
         }
         return [province, [condition, prestige]];
      }),
   );
   const theirPrestige = getProvincePrestige(province, G.save);
   let theirCoalition = theirPrestige.value;
   const theirs = new Map<Province, [IConditionBreakdown, IValueBreakdown]>(
      Array.from(coDefenders).map(([province, condition]) => {
         const prestige = getProvincePrestige(province, G.save);
         if (condition.value) {
            theirCoalition += prestige.value;
         }
         return [province, [condition, prestige]];
      }),
   );
   const acceptChance = ourCoalition / (ourCoalition + theirCoalition);
   const tributeAmount = getProvinceUpgrade(province, G.save) * TimedActions.DemandTribute.duration;
   return (
      <ModalComp
         size="sm"
         title={
            <ModalTitleBar
               title={$t(L.DemandTributeFrom$1, getProvinceName(province, G.save))}
               dismiss={!rollStarted}
            />
         }
      >
         <div className="m10 text-sm">{html($t(L.AsAGreatPowerWeCanDemandATributeFromAnotherProvince))}</div>
         <div className="box p10 m10 text-xl text-center">{$t(L.$1Gold, formatNumber(tributeAmount))}</div>
         <DiceRollComp
            chance={acceptChance}
            chanceTooltip={
               <>
                  <div className="m10">{$t(L.AcceptanceChanceOurPrestigeOurPrestigeTheirPrestige)}</div>
                  <div className="h2">{$t(L.OurPrestige)}</div>
                  <div className="row mx10 my5">
                     <div className="f1">{getProvinceName(G.save.state.playerProvince, G.save)}</div>
                     <div>{formatNumber(ourPrestige.value)}</div>
                  </div>
                  {Array.from(ours).map(([province, [condition, prestige]]) => (
                     <div className="row mx10 my5 g5" key={province.toString()}>
                        {condition.value ? (
                           <div className="mi xs text-green">check_circle</div>
                        ) : (
                           <div className="mi xs text-red">cancel</div>
                        )}
                        <div className="f1">{getProvinceName(province, G.save)}</div>
                        <div>{formatNumber(prestige.value)}</div>
                     </div>
                  ))}
                  <div className="h2">{$t(L.TheirPrestige)}</div>
                  <div className="row mx10 my5">
                     <div className="f1">{getProvinceName(province, G.save)}</div>
                     <div>{formatNumber(theirPrestige.value)}</div>
                  </div>
                  {Array.from(theirs).map(([province, [condition, prestige]]) => (
                     <div className="row mx10 my5 g5" key={province.toString()}>
                        {condition.value ? (
                           <div className="mi xs text-green">check_circle</div>
                        ) : (
                           <div className="mi xs text-red">cancel</div>
                        )}
                        <div className="f1">{getProvinceName(province, G.save)}</div>
                        <div>{formatNumber(prestige.value)}</div>
                     </div>
                  ))}
               </>
            }
            action={{
               ...DemandTributeCostCondition(G.save.state.playerProvince, province, G.save),
               effect: () => {
                  setRollStarted(true);
                  startTimedAction("DemandTribute", G.save.state.playerProvince, G.save);
                  addAttitudeModifier(
                     province,
                     G.save.state.playerProvince,
                     {
                        name: $t(L.$1DemandedATribute, getProvinceName(G.save.state.playerProvince, G.save)),
                        value: -20,
                        duration: TimedActions.DemandTribute.duration,
                        type: "add",
                     },
                     G.save,
                  );
               },
            }}
            acceptTooltip={
               <ul className="m10">
                  <li>{$t(L.$1Gold, formatNumber(tributeAmount))}</li>
                  <li>
                     {$t(
                        L.$1sAttitudeTowards$2IsDecreasedBy$3For$4Months,
                        getProvinceName(province, G.save),
                        getProvinceName(G.save.state.playerProvince, G.save),
                        "20",
                        formatNumber(TimedActions.DemandTribute.duration),
                     )}
                  </li>
               </ul>
            }
            onAccept={() => {
               playClick();
               addProvinceResource("gold", tributeAmount, G.save.state.playerProvince, G.save);
               GameStateUpdated.emit();
               hideModal();
            }}
            rejectTooltip={
               <ul className="m10">
                  <li>{$t(L.$1PrestigeFor$2Months, "-10%", formatNumber(TimedActions.DemandTribute.duration))}</li>
                  <li>
                     {$t(
                        L.$1sAttitudeTowards$2IsDecreasedBy$3For$4Months,
                        getProvinceName(province, G.save),
                        getProvinceName(G.save.state.playerProvince, G.save),
                        "20",
                        formatNumber(TimedActions.DemandTribute.duration),
                     )}
                  </li>
               </ul>
            }
            onReject={() => {
               playClick();
               addModifier({
                  modifier: "Prestige",
                  type: "multiply",
                  name: $t(L.DemandRejectedBy$1, getProvinceName(province, G.save)),
                  value: -0.1,
                  duration: TimedActions.DemandTribute.duration,
                  province: G.save.state.playerProvince,
                  save: G.save,
               });
               GameStateUpdated.emit();
               hideModal();
            }}
         />
      </ModalComp>
   );
}
