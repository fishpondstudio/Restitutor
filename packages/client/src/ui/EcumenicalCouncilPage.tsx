import { Select } from "@mantine/core";
import { formatPercent } from "@project/shared/src/utils/Helper";
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
import { ActionButton } from "./ActionButton";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
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
            <div className="f1">Months Left</div>
            <div>{getTimedActionTimeLeft(council, G.save.state.playerProvince, G.save)}</div>
         </div>
         <div className="mx10 my5 text-dimmed text-sm">
            Our province gets +{formatPercent(EcumenicalCouncilChristianityPct)} {Modifiers.ChristianityYearly.name()}{" "}
            during {TimedActions[council].name()}
         </div>
         <div style={{ ...Grid2 }} className="m10">
            <ActionButton
               action={{
                  cost: {
                     gold: 500,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
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
               Sponsor Delegate
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     administrative: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
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
               Draft Agenda
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     diplomatic: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
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
               Lobby Bishops
            </ActionButton>
            <ActionButton
               action={{
                  cost: {
                     military: 50,
                  },
                  condition: finalizeCondition([
                     ...timedActionConditions(
                        { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
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
               Pressure Bishops
            </ActionButton>
         </div>
         <div className="h1">Reconcile Heretics</div>
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
                  <th>Tile</th>
                  <th>Upg</th>
                  <th>Heresy</th>
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
                        <td className="w0">
                           <ActionButton
                              action={{
                                 condition: finalizeCondition([
                                    ...timedActionConditions(
                                       {
                                          action: "EcumenicalCouncilAction",
                                          label: "Ecumenical council action not on cooldown",
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
                                       Reconcile {getTileName(tile)} from {Religion[tileData.religion].name()} to{" "}
                                       {Religion[state.religion].name()}
                                    </div>
                                    {element}
                                 </>
                              )}
                           >
                              Reconcile
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
            label={`All tiles following ${Religion[heresy].name()} get -${formatPercent(EcumenicalCouncilPct)} Defense and +${formatPercent(EcumenicalCouncilPct)} Maintenance`}
         >
            <div className="h1">{Religion[heresy].name()}</div>
         </FloatingTip>
         <div className="mx10 my5 row">
            <div>Heretic Province</div>
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
                           { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
                           selectedProvince,
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
                           Gain <i>{CasusBelli.ReligiousWar.name()}</i> casus belli against{" "}
                           {getProvinceName(selectedProvince, G.save)} for 1 year.
                        </div>
                        {element}
                     </>
                  )}
               >
                  Proclaim Holy War
               </ActionButton>
               <CouncilActionButton
                  modifier={{
                     name: "Excommunicate",
                     modifier: "Stability",
                     type: "add",
                     value: -10,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: "Condemn Heretics",
                     modifier: "Prestige",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: "Interdict Lands",
                     modifier: "LandTax",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: "Embargo Heretics",
                     modifier: "TileOutput",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
               <CouncilActionButton
                  modifier={{
                     name: "Forbid Enlistment",
                     modifier: "WarPower",
                     type: "multiply",
                     value: -0.1,
                     duration: 12,
                     province: selectedProvince,
                  }}
               />
            </div>
         ) : (
            <div className="m10 text-dimmed">Select a Heretic Province First</div>
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
                  { action: "EcumenicalCouncilAction", label: "Ecumenical council action not on cooldown" },
                  modifier.province,
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
