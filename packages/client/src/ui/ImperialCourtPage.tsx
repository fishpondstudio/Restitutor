import { Select } from "@mantine/core";
import { keysOf } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import {
   IssueCensureAction,
   OrderAnInquiryAction,
   RestrictArmsSupplyAction,
} from "../game/actions/ImperialInterventionActions";
import { NamePublicEnemyAction } from "../game/actions/NamePublicEnemyAction";
import { getAncestralTempleSlots } from "../game/definitions/GovernmentTier";
import type { Province } from "../game/definitions/Province";
import { getResourceName } from "../game/definitions/ProvinceResources";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import {
   getRelation,
   RequestImperialFavorCost,
   requireInfiltration,
   tryUseInfiltration,
} from "../game/logic/DiplomacyLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { addProvinceResource, getProvinceResource } from "../game/logic/ResourceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ActionButton } from "./ActionButton";
import { CharacterSlotCapacityComp } from "./CharacterSlotCapacityComp";
import { CharacterSlotComp } from "./CharacterSlotComp";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { DissolveTreatyModal } from "./DissolveTreatyModal";
import { HeaderImages } from "./HeaderImages";
import { NullifyTruceModal } from "./NullifyTruceModal";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { TimedActionButton } from "./TimedActionButton";
import { Grid1, Grid2 } from "./UIConstant";

export function ImperialCourtPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const slots = getAncestralTempleSlots();
   const requestFavorProvinces = keysOf(G.save.state.provinces).filter(
      (p) =>
         p !== G.save.state.playerProvince &&
         (getRelation(G.save.state.playerProvince, p, G.save)?.infiltrate.value ?? 0) > 0,
   );
   const currentProvinces = keysOf(G.save.state.provinces)
      .sort()
      .filter((p) => p !== G.save.state.playerProvince);
   const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(currentProvinces[0]);
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.ImperialCourt} title="Imperial Court" />}>
         <div className="h1 row">
            <div className="f1">Imperial Court</div>
            <div>
               {getProvinceResource("consulPoint", G.save.state.playerProvince, G.save)}{" "}
               {getResourceName("consulPoint", G.save.state.scenario)}
            </div>
            <img
               src={ProvinceResourceImages.consulPoint}
               className="icon-block"
               style={{ height: "2.1rem", margin: "-0.5rem 0" }}
            />
         </div>
         <div style={Grid2} className="m10">
            <TimedActionButton timedAction="RequestFunding" />
            <TimedActionButton timedAction="CutPublicSpending" />
            <TimedActionButton timedAction="EnactSenateOversight" />
            <TimedActionButton timedAction="AffirmCivicUnity" />
            <TimedActionButton timedAction="DeclareMobilization" />
            <TimedActionButton timedAction="BolsterDignitas" />
            <button className="btn" onClick={() => showPanel(DissolveTreatyModal, {})}>
               {TimedActions.DissolveTreaty.name()}
            </button>
            <button className="btn" onClick={() => showPanel(NullifyTruceModal, {})}>
               {TimedActions.NullifyTruce.name()}
            </button>
         </div>
         <div className="h3">Imperial Interventions</div>
         <div className="m10">
            <Select
               autoFocus={true}
               className="w100"
               value={selectedProvince}
               onChange={(value) => {
                  if (value) {
                     setSelectedProvince(value as Province);
                  }
               }}
               checkIconPosition="right"
               allowDeselect={false}
               data={currentProvinces.map((p) => ({
                  value: p,
                  label: getProvinceName(p, G.save),
               }))}
            />
         </div>
         {selectedProvince && (
            <div style={Grid2} className="m10">
               <ActionButton
                  action={() => NamePublicEnemyAction(selectedProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <TimedActionDescComp action="PublicEnemy" />
                        {element}
                     </>
                  )}
               >
                  {TimedActions.PublicEnemy.name()}
               </ActionButton>
               <ActionButton
                  action={() => RestrictArmsSupplyAction(selectedProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <TimedActionDescComp action="RestrictArmsSupply" />
                        {element}
                     </>
                  )}
               >
                  {TimedActions.RestrictArmsSupply.name()}
               </ActionButton>
               <ActionButton
                  action={() => OrderAnInquiryAction(selectedProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <TimedActionDescComp action="OrderAnInquiry" />
                        {element}
                     </>
                  )}
               >
                  {TimedActions.OrderAnInquiry.name()}
               </ActionButton>
               <ActionButton
                  action={() => IssueCensureAction(selectedProvince, G.save)}
                  tooltip={(element) => (
                     <>
                        <TimedActionDescComp action="IssueCensure" />
                        {element}
                     </>
                  )}
               >
                  {TimedActions.IssueCensure.name()}
               </ActionButton>
            </div>
         )}
         <div className="h3">{TimedActions.EnlistCourtSupport.name()}</div>
         {requestFavorProvinces.map((p) => {
            return (
               <div className="row m10" key={p}>
                  <div className="f1">{getProvinceName(p, G.save)}</div>
                  <ActionButton
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="EnlistCourtSupport" />
                           {element}
                        </>
                     )}
                     action={() => {
                        return {
                           condition: finalizeCondition([
                              ...timedActionConditions(
                                 { action: "EnlistCourtSupport" },
                                 G.save.state.playerProvince,
                                 G.save,
                              ),
                              requireInfiltration(
                                 RequestImperialFavorCost,
                                 { consume: true },
                                 G.save.state.playerProvince,
                                 p,
                                 G.save,
                              ),
                           ]),
                           execute(options) {
                              if (
                                 tryUseInfiltration(RequestImperialFavorCost, G.save.state.playerProvince, p, G.save)
                              ) {
                                 startTimedAction("EnlistCourtSupport", G.save.state.playerProvince, G.save);
                                 addProvinceResource("consulPoint", 1, G.save.state.playerProvince, G.save);
                              }
                           },
                        };
                     }}
                  >
                     Enlist Support
                  </ActionButton>
               </div>
            );
         })}
         {requestFavorProvinces.length === 0 && (
            <div className="m10 text-dimmed">No court connections available to enlist support</div>
         )}
         <div className="h1 row g5">
            <div className="f1">Ancestral Temple</div>
            <CharacterSlotCapacityComp />
         </div>
         <div className="m10" style={Grid1}>
            {slots.map((slot) => (
               <CharacterSlotComp key={slot} slot={slot} />
            ))}
         </div>
      </SidebarComp>
   );
}
