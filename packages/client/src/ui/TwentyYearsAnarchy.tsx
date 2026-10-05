import { formatNumber } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import type { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { EasternRomanEmpireProvinces } from "../game/definitions/TileConstants";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { activeTimedActionCondition } from "../game/logic/MissionLogic";
import { getTimedActionTimeLeft, startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";
import { renderMarkup } from "./ParseMarkup";
import { Grid2 } from "./UIConstant";

export function TwentyYearsAnarchyPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const provinces = EasternRomanEmpireProvinces.filter((province) => {
      const state = G.save.state.provinces[province];
      if (!state || province === G.save.state.playerProvince) {
         return false;
      }
      return true;
   });
   return (
      <SidebarComp
         title={
            <>
               <SidebarImageHeader image={HeaderImages.Anarchy} title={TimedActions.TwentyYearsAnarchy.name()} />
               <div className="divider" />
            </>
         }
      >
         <div className="mx10 my5">
            {$t(
               L.$1EndsIn$2Months,
               TimedActions.TwentyYearsAnarchy.name(),
               formatNumber(getTimedActionTimeLeft("TwentyYearsAnarchy", G.save.state.playerProvince, G.save)),
            )}
         </div>
         {provinces.map((province, index) => {
            return <ProvinceBox province={province} key={province} collapsed={index > 0} />;
         })}
      </SidebarComp>
   );
}

function ProvinceBox({ province, collapsed }: { province: Province; collapsed: boolean }): React.ReactNode {
   const [collapsedState, setCollapsedState] = useState(collapsed);
   return (
      <div className="box mx10 my5 text-sm" key={province}>
         <div className="h1 row">
            <div className="f1">{renderMarkup(`<Province>${province}</Province>`)}</div>
            <button className="btn p1" onClick={() => setCollapsedState(!collapsedState)}>
               <div className="mi xs">{collapsedState ? "add" : "remove"}</div>
            </button>
         </div>
         {!collapsedState && (
            <div className="m5" style={{ ...Grid2, gap: "0.5rem" }}>
               <ActionButton
                  action={() => ({
                     cost: {
                        administrative: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        provinceModifiers: [
                           {
                              modifier: "Stability",
                              type: "add",
                              value: -10,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                              province,
                           },
                        ],
                     },
                  })}
               >
                  {$t(L.StirDissent)}
               </ActionButton>
               <ActionButton
                  action={() => ({
                     cost: {
                        administrative: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        provinceModifiers: [
                           {
                              modifier: "Manpower",
                              type: "multiply",
                              value: -0.1,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                              province,
                           },
                        ],
                     },
                  })}
               >
                  {$t(L.DisruptRecruitment)}
               </ActionButton>
               <ActionButton
                  action={() => ({
                     cost: {
                        diplomatic: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        provinceModifiers: [
                           {
                              modifier: "Prestige",
                              type: "multiply",
                              value: -0.1,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                              province,
                           },
                        ],
                     },
                  })}
               >
                  {$t(L.SpreadScandal)}
               </ActionButton>
               <ActionButton
                  action={() => ({
                     cost: {
                        diplomatic: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        casusBelli: {
                           [province]: {
                              casusBelli: "ContestedImperium" satisfies CasusBelli,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                           },
                        },
                     },
                  })}
               >
                  {$t(L.DisputeLegitimacy)}
               </ActionButton>
               <ActionButton
                  action={() => ({
                     cost: {
                        military: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        provinceModifiers: [
                           {
                              modifier: "WarPower",
                              type: "multiply",
                              value: -0.1,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                              province,
                           },
                        ],
                     },
                  })}
               >
                  {$t(L.SabotageSupplies)}
               </ActionButton>
               <ActionButton
                  action={() => ({
                     cost: {
                        military: 50,
                     },
                     condition: finalizeCondition([
                        activeTimedActionCondition("TwentyYearsAnarchy", G.save.state.playerProvince, G.save),
                        ...timedActionConditions(
                           { action: "TwentyYearsAnarchyAction" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                     ]),
                     execute: () => {
                        startTimedAction("TwentyYearsAnarchyAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: TimedActions.TwentyYearsAnarchyAction.name(),
                        provinceModifiers: [
                           {
                              modifier: "Defense",
                              type: "multiply",
                              value: -0.1,
                              duration: TimedActions.TwentyYearsAnarchyAction.duration,
                              province,
                           },
                        ],
                     },
                  })}
               >
                  {$t(L.SabotageDefenses)}
               </ActionButton>
            </div>
         )}
      </div>
   );
}
