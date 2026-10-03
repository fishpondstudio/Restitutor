import { formatNumber, mapOf } from "@project/shared/src/utils/Helper";
import { finalizeCondition } from "../game/actions/GameAction";
import { Modifiers } from "../game/definitions/Modifier";
import { isChristianReligion } from "../game/definitions/Religion";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getProvinceCoreTilesCached } from "../game/logic/CacheLogic";
import { getAttitudeTowards } from "../game/logic/DiplomacyLogic";
import { activeTimedActionCondition } from "../game/logic/MissionLogic";
import { getTimedActionTimeLeft, startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { HeaderImages } from "./HeaderImages";
import { renderMarkup } from "./ParseMarkup";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { Grid1 } from "./UIConstant";

export function ChristianEmpirePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <SidebarComp
         title={
            <>
               <SidebarImageHeader image={HeaderImages.ChristianEmpire} title={TimedActions.ChristianEmpire.name()} />
               <div className="divider" />
            </>
         }
      >
         <div className="mx10 my5">
            {$t(
               L.$1EndsIn$2Months,
               TimedActions.ChristianEmpire.name(),
               formatNumber(getTimedActionTimeLeft("ChristianEmpire", G.save.state.playerProvince, G.save)),
            )}
         </div>
         <div className="m10" style={{ ...Grid1, gap: "0.5rem" }}>
            <ActionButton
               action={() => {
                  return {
                     cost: {
                        consulPoint: 1,
                     },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           {
                              action: "ChristianEmpireAction",
                           },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("ChristianEmpire", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("ChristianEmpireAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.IssueChristianEdict),
                        resources: {
                           christianity: 3,
                        },
                     },
                  };
               }}
            >
               {$t(L.IssueChristianEdict)}
            </ActionButton>
            <ActionButton
               action={() => {
                  const tileCount = getProvinceCoreTilesCached(G.save.state.playerProvince, G.save).length;
                  return {
                     cost: {
                        administrative: tileCount * 10,
                     },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           {
                              action: "ChristianEmpireAction",
                           },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("ChristianEmpire", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("ChristianEmpireAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.ExpandChurchAdministration),
                        resources: {
                           christianity: tileCount,
                        },
                     },
                  };
               }}
            >
               {$t(L.ExpandChurchAdministration)}
            </ActionButton>
            <ActionButton
               action={() => {
                  const tileCount = getProvinceCoreTilesCached(G.save.state.playerProvince, G.save).length;
                  return {
                     cost: {
                        diplomatic: tileCount * 10,
                     },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           {
                              action: "ChristianEmpireAction",
                           },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("ChristianEmpire", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("ChristianEmpireAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.SponsorMissionaries),
                        resources: {
                           christianity: tileCount,
                        },
                     },
                  };
               }}
            >
               {$t(L.SponsorMissionaries)}
            </ActionButton>
            <ActionButton
               action={() => {
                  const tileCount = getProvinceCoreTilesCached(G.save.state.playerProvince, G.save).length;
                  return {
                     cost: {
                        military: tileCount * 10,
                     },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           {
                              action: "ChristianEmpireAction",
                           },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("ChristianEmpire", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("ChristianEmpireAction", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.AppointMilitaryChaplains),
                        resources: {
                           christianity: tileCount,
                        },
                     },
                  };
               }}
            >
               {$t(L.AppointMilitaryChaplains)}
            </ActionButton>
         </div>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th>{$t(L.Province)}</th>
                     <th>{$t(L.Attitude)}</th>
                     <th>
                        <img src={ProvinceResourceImages.christianity} className="icon-block" />
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {mapOf(G.save.state.provinces, (province, state) => {
                     if (province === G.save.state.playerProvince) {
                        return null;
                     }
                     if (!isChristianReligion(state.religion)) {
                        return null;
                     }
                     const attitude = getAttitudeTowards(province, G.save.state.playerProvince, G.save);
                     return (
                        <tr key={province}>
                           <td>{renderMarkup(`<Province>${province}</Province>`)}</td>
                           <td>
                              <BreakdownTooltip breakdown={attitude}>
                                 <div>{colorNumber(attitude.value)}</div>
                              </BreakdownTooltip>
                           </td>
                           <td>
                              {attitude.value > 0 && (
                                 <FloatingTip
                                    label={() =>
                                       $t(
                                          L.ChristianProvinceInfluenceBonus$1$2,
                                          "+1",
                                          Modifiers.ChristianityYearly.name(),
                                       )
                                    }
                                 >
                                    <div>{$t(L.$1Yearly, "+1")}</div>
                                 </FloatingTip>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </SidebarComp>
   );
}
