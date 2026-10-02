import { formatNumber } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { finalizeCondition, type IGameAction } from "../game/actions/GameAction";
import type { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { WesternMediterraneanProvinces } from "../game/definitions/TileConstants";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getArmyMaintenanceCost } from "../game/logic/ArmyLogic";
import { getProvinceTilesCached } from "../game/logic/CacheLogic";
import { activeTimedActionCondition } from "../game/logic/MissionLogic";
import { addProvinceStat } from "../game/logic/ProvinceLogic";
import { getTimedActionTimeLeft, startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";
import { renderMarkup } from "./ParseMarkup";
import { Grid1 } from "./UIConstant";

export function JustinianReconquestPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const provinces = WesternMediterraneanProvinces.filter((province) => {
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
               <SidebarImageHeader image={HeaderImages.Justinian} title={TimedActions.JustinianReconquest.name()} />
               <div className="divider" />
            </>
         }
      >
         <div className="mx10 my5">
            {$t(
               L.$1EndsIn$2Months,
               TimedActions.JustinianReconquest.name(),
               formatNumber(getTimedActionTimeLeft("JustinianReconquest", G.save.state.playerProvince, G.save)),
            )}
         </div>
         <div className="m10" style={{ ...Grid1, gap: "0.5rem" }}>
            <ActionButton
               action={() => {
                  return {
                     cost: { generalSkillPoint: 1 },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           { action: "JustinianReconquestHonorTheGeneral" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("JustinianReconquest", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("JustinianReconquestHonorTheGeneral", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.HonorTheGeneral),
                        resources: { consulPoint: 1 },
                     },
                  };
               }}
            >
               {$t(L.HonorTheGeneral)}
            </ActionButton>
            <ActionButton
               action={() => {
                  return {
                     cost: { gold: getArmyMaintenanceCost({}, G.save.state.playerProvince, G.save).value * 6 },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           { action: "JustinianReconquestFundReconquest" },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        activeTimedActionCondition("JustinianReconquest", G.save.state.playerProvince, G.save),
                     ]),
                     execute: () => {
                        startTimedAction("JustinianReconquestFundReconquest", G.save.state.playerProvince, G.save);
                     },
                     effect: {
                        name: $t(L.FundReconquest),
                        modifiers: {
                           WarPower: { type: "multiply", value: 0.1, duration: 12 * 2 },
                        },
                     },
                  } satisfies IGameAction;
               }}
            >
               {$t(L.FundReconquest)}
            </ActionButton>
         </div>
         {provinces.map((province) => {
            return <ProvinceBox province={province} key={province} />;
         })}
      </SidebarComp>
   );
}

function ProvinceBox({ province }: { province: Province }): React.ReactNode {
   const [collapsed, setCollapsed] = useState(true);
   return (
      <div className="box mx10 my5 text-sm" key={province}>
         <div className="h1 row">
            <div className="f1">{renderMarkup(`<Province>${province}</Province>`)}</div>
            <button className="btn p1" onClick={() => setCollapsed(!collapsed)}>
               <div className="mi xs">{collapsed ? "add" : "remove"}</div>
            </button>
         </div>
         {!collapsed && (
            <>
               <div className="mx10 my5" style={{ ...Grid1, gap: "0.5rem" }}>
                  <ActionButton
                     action={() => {
                        return {
                           cost: { administrative: 50 },
                           condition: finalizeCondition([
                              ...timedActionConditions(
                                 {
                                    action: "JustinianReconquestAction",
                                 },
                                 G.save.state.playerProvince,
                                 G.save,
                              ),
                              activeTimedActionCondition("JustinianReconquest", G.save.state.playerProvince, G.save),
                           ]),
                           execute: () => {
                              startTimedAction("JustinianReconquestAction", G.save.state.playerProvince, G.save);
                           },
                           effect: {
                              name: $t(L.ProclaimRestoration),
                              casusBelli: {
                                 [province]: {
                                    casusBelli: "Reconquista" satisfies CasusBelli,
                                    duration: TimedActions.JustinianReconquestAction.duration,
                                 },
                              },
                           },
                        } satisfies IGameAction;
                     }}
                  >
                     {$t(L.ProclaimRestoration)}
                  </ActionButton>
                  <ActionButton
                     action={() => {
                        return {
                           cost: { diplomatic: 50 },
                           condition: finalizeCondition([
                              ...timedActionConditions(
                                 {
                                    action: "JustinianReconquestAction",
                                 },
                                 G.save.state.playerProvince,
                                 G.save,
                              ),
                              activeTimedActionCondition("JustinianReconquest", G.save.state.playerProvince, G.save),
                           ]),
                           execute: () => {
                              startTimedAction("JustinianReconquestAction", G.save.state.playerProvince, G.save);
                           },
                           effect: {
                              name: $t(L.SubvertDefenders),
                              provinceModifiers: [
                                 {
                                    modifier: "Defense",
                                    type: "multiply",
                                    value: -0.1,
                                    duration: TimedActions.JustinianReconquestAction.duration,
                                    province,
                                 },
                              ],
                           },
                        } satisfies IGameAction;
                     }}
                  >
                     {$t(L.SubvertDefenders)}
                  </ActionButton>
               </div>
               <div className="divider" />
               {getProvinceTilesCached(province, G.save).map((tile) => {
                  const tileData = G.save.state.tiles.get(tile);
                  if (!tileData) {
                     return null;
                  }
                  return (
                     <div className="row g5 px10 py5 hover-highlight" key={tile}>
                        <div>{renderMarkup(`<Tile>${tile}</Tile>`)}</div>
                        <div className="text-dimmed">
                           ({tileData.infrastructure}/{tileData.production}/{tileData.population})
                        </div>
                        <div className="f1" />
                        <ActionButton
                           action={() => {
                              return {
                                 cost: { consulPoint: 1 },
                                 condition: finalizeCondition([
                                    ...timedActionConditions(
                                       {
                                          action: "JustinianReconquestAction",
                                       },
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                    activeTimedActionCondition(
                                       "JustinianReconquest",
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                    {
                                       name: $t(L.TileIsNotYetOurCore),
                                       value: !tileData.coreProvinces.has(G.save.state.playerProvince),
                                    },
                                 ]),
                                 execute: () => {
                                    tileData.coreProvinces.add(G.save.state.playerProvince);
                                    addProvinceStat("makeCoreCount", 1, G.save.state.playerProvince, G.save);
                                    startTimedAction("JustinianReconquestAction", G.save.state.playerProvince, G.save);
                                 },
                              };
                           }}
                        >
                           {$t(L.ClaimCore)}
                        </ActionButton>
                     </div>
                  );
               })}
            </>
         )}
      </div>
   );
}
