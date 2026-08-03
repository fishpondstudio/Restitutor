import { Select } from "@mantine/core";
import { formatNumber, formatPercentDelta } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { finalizeCondition } from "../game/actions/GameAction";
import { CasusBelli } from "../game/definitions/CasusBelli";
import { Modifiers, modifierToString } from "../game/definitions/Modifier";
import { Province, ProvinceResourceNames } from "../game/definitions/Province";
import { type ChristianHeresy, Religion } from "../game/definitions/Religion";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getRelation } from "../game/logic/DiplomacyLogic";
import {
   EcumenicalCouncilChristianityPct,
   EcumenicalCouncilPct,
   getCouncilHeresies,
   getHereticProvinces,
   getOngoingEcumenicalCouncil,
   getReconcileTiles,
   ongoingEcumenicalCouncilCondition,
} from "../game/logic/EcumenicalCouncilLogic";
import { addModifier, type IAddModifier } from "../game/logic/ModifierLogic";
import { addProvinceResource, getProvinceName } from "../game/logic/ProvinceLogic";
import { getTimedActionTimeLeft, startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { HeaderImages } from "./HeaderImages";
import { Grid2 } from "./UIConstant";

export function EcumenicalCouncilPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const council = getOngoingEcumenicalCouncil(G.save.state.playerProvince, G.save);
   if (!council) {
      return null;
   }
   const config = getCouncilHeresies(council);
   return (
      <SidebarComp
         title={
            <>
               <SidebarImageHeader image={HeaderImages.EcumenicalCouncil} title={TimedActions[council].name()} />
               <div className="divider" />
            </>
         }
      >
         <div className="row mx10 my5">
            <div className="f1">
               {$t(
                  L.CouncilEndsIn$1Months,
                  formatNumber(getTimedActionTimeLeft(council, G.save.state.playerProvince, G.save)),
               )}
            </div>
         </div>
         <div className="mx10 my5 text-dimmed text-sm">
            {$t(
               L.OurProvinceGets$1$2During$3,
               formatPercentDelta(EcumenicalCouncilChristianityPct),
               Modifiers.ChristianityYearly.name(),
               TimedActions[council].name(),
            )}
         </div>
         <div style={{ ...Grid2 }} className="m10">
            <ActionButton
               action={{
                  cost: {
                     gold: 500,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown) },
                        G.save.state.playerProvince,
                        G.save,
                     ),
                     ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                  ]),
                  effect: () => {
                     startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                     addProvinceResource("christianity", 1, G.save.state.playerProvince, G.save);
                  },
               }}
               tooltip={(element) => (
                  <>
                     <div className="m10">+1 {ProvinceResourceNames.christianity()}</div>
                     {element}
                  </>
               )}
            >
               {TimedActions.EcumenicalCouncilAction.name()}
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     administrative: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown) },
                        G.save.state.playerProvince,
                        G.save,
                     ),
                     ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                  ]),
                  effect: () => {
                     startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                     addProvinceResource("christianity", 1, G.save.state.playerProvince, G.save);
                  },
               }}
               tooltip={(element) => (
                  <>
                     <div className="m10">+1 {ProvinceResourceNames.christianity()}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.DraftAgenda)}
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     diplomatic: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown) },
                        G.save.state.playerProvince,
                        G.save,
                     ),
                     ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                  ]),
                  effect: () => {
                     startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                     addProvinceResource("christianity", 1, G.save.state.playerProvince, G.save);
                  },
               }}
               tooltip={(element) => (
                  <>
                     <div className="m10">+1 {ProvinceResourceNames.christianity()}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.LobbyBishops)}
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     military: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown) },
                        G.save.state.playerProvince,
                        G.save,
                     ),
                     ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                  ]),
                  effect: () => {
                     startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                     addProvinceResource("christianity", 1, G.save.state.playerProvince, G.save);
                  },
               }}
               tooltip={(element) => (
                  <>
                     <div className="m10">+1 {ProvinceResourceNames.christianity()}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.PressureBishops)}
            </ActionButton>
         </div>
         <div className="h1">{$t(L.ReconcileHeretics)}</div>
         <ReconcilePanel />
         {Array.from(config).map((heresy) => {
            return <HeresyPanel key={heresy} heresy={heresy} />;
         })}
      </SidebarComp>
   );
}

function ReconcilePanel(): React.ReactNode {
   const tiles = getReconcileTiles(G.save.state.playerProvince, G.save);
   if (tiles.size === 0) {
      return null;
   }
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <div className="m10">
         <table className="data-table">
            <thead>
               <tr>
                  <th>{$t(L.Tile)}</th>
                  <th>{$t(L.Upgrades)}</th>
                  <th>{$t(L.Heresy)}</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>
               {Array.from(tiles).map((tile) => {
                  const tileData = G.save.state.tiles.get(tile);
                  if (!tileData) {
                     return null;
                  }
                  const tileUpgrades = tileData.infrastructure + tileData.production + tileData.population;
                  return (
                     <tr key={tile}>
                        <td>
                           <div
                              className="row pointer"
                              onClick={() => {
                                 G.scene
                                    .getCurrent(WorldScene)
                                    ?.lookAt(tile, { time: 0.2 })
                                    .then((scene) => {
                                       scene.drawSelectors(new Set([tile]));
                                       scene.drawProvinceOutline(tileData.province);
                                    });
                              }}
                           >
                              <div className="mi sm">open_in_new</div>
                              <div className="f1">{getTileName(tile)}</div>
                           </div>
                        </td>
                        <td>{tileUpgrades}</td>
                        <td>{Religion[tileData.religion].name()}</td>
                        <td>
                           <ActionButton
                              action={{
                                 condition: finalizeCondition([
                                    ...timedActionConditions(
                                       {
                                          action: "EcumenicalCouncilAction",
                                          label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown),
                                       },
                                       tileData.province,
                                       G.save,
                                    ),
                                    ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                                 ]),
                                 cost: { christianity: tileUpgrades },
                                 effect: () => {
                                    tileData.religion = state.religion;
                                    startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                                 },
                              }}
                              tooltip={(element) => (
                                 <>
                                    <div className="m10">
                                       {$t(
                                          L.Convert$1From$2To$3,
                                          getTileName(tile),
                                          Religion[tileData.religion].name(),
                                          Religion[state.religion].name(),
                                       )}
                                    </div>
                                    {element}
                                 </>
                              )}
                           >
                              {$t(L.Reconcile)}
                           </ActionButton>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
   );
}

function HeresyPanel({ heresy }: { heresy: ChristianHeresy }): React.ReactNode {
   const hereticProvinces = getHereticProvinces(heresy, G.save);
   hereticProvinces.delete(G.save.state.playerProvince);
   const provinces = Array.from(hereticProvinces);
   if (provinces.length === 0) {
      return null;
   }
   const [selectedProvince, setSelectedProvince] = useState<Province>(provinces[0]);
   return (
      <div key={heresy}>
         <FloatingTip
            label={$t(
               L.AllTilesFollowing$1Get$2$3And$4$5,
               Religion[heresy].name(),
               formatPercentDelta(-EcumenicalCouncilPct),
               $t(L.Defense),
               formatPercentDelta(EcumenicalCouncilPct),
               $t(L.Maintenance),
            )}
         >
            <div className="h1">{Religion[heresy].name()}</div>
         </FloatingTip>
         <div className="mx10 my5 row">
            <div>{$t(L.HereticProvince)}</div>
            <div className="f1"></div>
            <Select
               checkIconPosition="right"
               allowDeselect={false}
               searchable
               data={Array.from(provinces)
                  .sort()
                  .map((province) => {
                     return { value: province, label: Province[province].name() };
                  })}
               value={selectedProvince}
               onChange={(value) => {
                  if (value) {
                     setSelectedProvince(value);
                     const capital = G.save.state.provinces[value]?.capital;
                     if (capital) {
                        G.scene
                           .getCurrent(WorldScene)
                           ?.lookAt(capital, { time: 0.2 })
                           .then((scene) => scene.drawProvinceOutline(value));
                     }
                  }
               }}
            />
         </div>
         {selectedProvince ? (
            <div style={Grid2} className="m10">
               <ActionButton
                  action={{
                     cost: { christianity: 1 },
                     condition: finalizeCondition([
                        ...timedActionConditions(
                           {
                              action: "EcumenicalCouncilAction",
                              label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown),
                           },
                           G.save.state.playerProvince,
                           G.save,
                        ),
                        ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
                     ]),
                     effect: () => {
                        startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
                        const relation = getRelation(G.save.state.playerProvince, selectedProvince, G.save);
                        if (relation) {
                           relation.casusBelli.set("ReligiousWar", { monthsLeft: 12 });
                        }
                     },
                  }}
                  tooltip={(element) => (
                     <>
                        <div className="m10">
                           {html(
                              $t(
                                 L.Gain$1CasusBelliAgainst$2For$3Years,
                                 CasusBelli.ReligiousWar.name(),
                                 getProvinceName(selectedProvince, G.save),
                                 "1",
                              ),
                           )}
                        </div>
                        {element}
                     </>
                  )}
               >
                  {$t(L.ProclaimHolyWar)}
               </ActionButton>
               <CouncilActionButton
                  modifier={{
                     name: $t(L.Excommunicate),
                     modifier: "Stability",
                     type: "add",
                     value: -10,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: $t(L.CondemnHeretics),
                     modifier: "Prestige",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: $t(L.InterdictLands),
                     modifier: "LandTax",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: $t(L.EmbargoHeretics),
                     modifier: "TileOutput",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: $t(L.ForbidEnlistment),
                     modifier: "WarPower",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
            </div>
         ) : (
            <div className="m10 text-dimmed">{$t(L.SelectAHereticProvinceFirst)}</div>
         )}
      </div>
   );
}

function CouncilActionButton({ modifier }: { modifier: Omit<IAddModifier, "save"> }): React.ReactNode {
   return (
      <ActionButton
         action={{
            cost: { christianity: 1 },
            condition: finalizeCondition([
               ...timedActionConditions(
                  { action: "EcumenicalCouncilAction", label: $t(L.EcumenicalCouncilActionsAreNotOnCooldown) },
                  G.save.state.playerProvince,
                  G.save,
               ),
               ongoingEcumenicalCouncilCondition(G.save.state.playerProvince, G.save),
            ]),
            effect: () => {
               startTimedAction("EcumenicalCouncilAction", G.save.state.playerProvince, G.save);
               addModifier({
                  ...modifier,
                  save: G.save,
               });
            },
         }}
         tooltip={(element) => (
            <>
               <div className="m10">
                  {getProvinceName(modifier.province, G.save)}: {modifierToString(modifier.modifier, modifier)}
               </div>
               {element}
            </>
         )}
      >
         {modifier.name}
      </ActionButton>
   );
}
