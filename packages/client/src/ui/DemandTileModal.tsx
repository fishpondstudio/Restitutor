import { Select } from "@mantine/core";
import { formatNumber, safeParseInt, type Tile } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { DemandTileCostCondition } from "../game/actions/DemandTileCostCondition";
import type { IConditionBreakdown, IValueBreakdown } from "../game/actions/GameAction";
import { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { isTileBorderingProvince } from "../game/definitions/Tile";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated, RefreshTiles } from "../game/Events";
import { addAttitudeModifier, getRelation } from "../game/logic/DiplomacyLogic";
import { addModifier } from "../game/logic/ModifierLogic";
import { getProvinceName, getProvincePrestige } from "../game/logic/ProvinceLogic";
import { isCapital } from "../game/logic/TileLogic";
import { startTimedAction } from "../game/logic/TimedActionLogic";
import { getWarParticipants } from "../game/logic/WarLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { html } from "./components/RenderHTMLComp";
import { DiceRollComp } from "./DiceRollDisplay";
import { playClick } from "./Sound";

export function DemandTileModal({ province }: { province: Province }): React.ReactNode {
   const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
   const [rollStarted, setRollStarted] = useState(false);
   return (
      <ModalComp
         size="sm"
         title={
            <ModalTitleBar title={$t(L.DemandATileFromX, getProvinceName(province, G.save))} dismiss={!rollStarted} />
         }
      >
         <div className="m10 text-sm">{html($t(L.DemandTileAsGreatPower))}</div>
         <Select
            disabled={rollStarted}
            className="m10"
            clearable={true}
            allowDeselect={false}
            checkIconPosition="right"
            data={Array.from(G.save.state.tiles)
               .filter(
                  ([tile, data]) =>
                     data.province === province &&
                     !isCapital(tile, G.save) &&
                     isTileBorderingProvince(tile, G.save.state.playerProvince, G.save),
               )
               .map(([tile, data]) => {
                  return {
                     value: tile.toString(),
                     label: getTileName(tile),
                  };
               })}
            value={selectedTile ? String(selectedTile) : null}
            onChange={(value) => {
               if (value) {
                  setSelectedTile(safeParseInt(value));
               } else {
                  setSelectedTile(null);
               }
            }}
         />
         {selectedTile && <DemandTileChance tile={selectedTile} onRollStart={() => setRollStarted(true)} />}
      </ModalComp>
   );
}

function DemandTileChance({ tile, onRollStart }: { tile: Tile; onRollStart: () => void }) {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   const { coAttackers, coDefenders } = getWarParticipants(G.save.state.playerProvince, tileData.province, G.save);
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
   const theirPrestige = getProvincePrestige(tileData.province, G.save);
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
   const tileUpgrades = tileData.infrastructure + tileData.production + tileData.population;
   const acceptChance = ourCoalition / (ourCoalition + theirCoalition + tileUpgrades);
   return (
      <DiceRollComp
         chance={acceptChance}
         chanceTooltip={
            <>
               <div className="m10">{$t(L.AcceptanceChanceOurPrestigeOurPrestigeTheirPrestigeTotalUpgrades)}</div>
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
                  <div className="f1">{getProvinceName(tileData.province, G.save)}</div>
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
               <div className="h2">{$t(L.TotalUpgradesOfX, getTileName(tile))}</div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.TotalUpgrades)}</div>
                  <div>{tileUpgrades}</div>
               </div>
            </>
         }
         action={{
            ...DemandTileCostCondition(G.save.state.playerProvince, tileData.province, G.save),
            effect: () => {
               onRollStart();
               startTimedAction("DemandTile", G.save.state.playerProvince, G.save);
               addAttitudeModifier(
                  tileData.province,
                  G.save.state.playerProvince,
                  {
                     name: $t(L.XDemandedATile, getProvinceName(G.save.state.playerProvince, G.save)),
                     value: -50,
                     duration: TimedActions.DemandTile.duration,
                     type: "add",
                  },
                  G.save,
               );
            },
         }}
         onAccept={() => {
            playClick();
            tileData.province = G.save.state.playerProvince;
            GameStateUpdated.emit();
            RefreshTiles.emit({ tiles: [tile], options: { indicator: true, visual: true } });
            hideModal();
         }}
         onReject={() => {
            playClick();
            const relation = getRelation(G.save.state.playerProvince, tileData.province, G.save);
            if (relation) {
               relation.casusBelli.set("DemandRejected", {
                  monthsLeft: TimedActions.DemandTile.duration,
               });
            }
            addModifier({
               modifier: "Prestige",
               type: "multiply",
               name: $t(L.DemandRejectedByX, getProvinceName(tileData.province, G.save)),
               value: -0.1,
               duration: TimedActions.DemandTile.duration,
               province: G.save.state.playerProvince,
               save: G.save,
            });
            GameStateUpdated.emit();
            hideModal();
         }}
         acceptTooltip={<DemandAcceptedConsequences tile={tile} />}
         rejectTooltip={<DemandRejectedConsequences tile={tile} />}
      />
   );
}

function DemandAcceptedConsequences({ tile }: { tile: Tile }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   return (
      <ul className="m10">
         <li>
            {html(
               $t(
                  L.XShallCedeYToZ,
                  getProvinceName(tileData.province, G.save),
                  getTileName(tile),
                  getProvinceName(G.save.state.playerProvince, G.save),
               ),
            )}
         </li>
         <li>
            {$t(
               L.XsAttitudeTowardsYIsDecreasedByZForPMonths,
               getProvinceName(tileData.province, G.save),
               getProvinceName(G.save.state.playerProvince, G.save),
               "50",
               formatNumber(TimedActions.DemandTile.duration),
            )}
         </li>
      </ul>
   );
}

function DemandRejectedConsequences({ tile }: { tile: Tile }): React.ReactNode {
   const tileData = G.save.state.tiles.get(tile);
   if (!tileData) {
      return null;
   }
   return (
      <ul className="m10">
         <li>
            {html(
               $t(
                  L.XGetsAYCasusBelliAgainstZForPMonths,
                  getProvinceName(G.save.state.playerProvince, G.save),
                  CasusBelli.DemandRejected.name(),
                  getProvinceName(tileData.province, G.save),
                  formatNumber(TimedActions.DemandTile.duration),
               ),
            )}
         </li>
         <li>
            {$t(
               L.XGetsYPrestigeForZMonths,
               getProvinceName(G.save.state.playerProvince, G.save),
               "-10%",
               formatNumber(TimedActions.DemandTile.duration),
            )}
         </li>
         <li>
            {$t(
               L.XsAttitudeTowardsYIsDecreasedByZForPMonths,
               getProvinceName(tileData.province, G.save),
               getProvinceName(G.save.state.playerProvince, G.save),
               "50",
               formatNumber(TimedActions.DemandTile.duration),
            )}
         </li>
      </ul>
   );
}
