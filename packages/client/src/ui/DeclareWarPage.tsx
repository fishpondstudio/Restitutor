import { type ComboboxItem, Select } from "@mantine/core";
import { cls, formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { useEffect, useState } from "react";
import { DeclareWarAction, getOneTimeConsequences } from "../game/actions/DeclareWarAction";
import { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getRelation } from "../game/logic/DiplomacyLogic";
import { getWarParticipants, getWarScore, getWarSuccessChance, getWarTiles } from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { ValueListComp } from "./BreakdownComp";
import { BreakdownRow } from "./BreakdownRow";
import { SidebarComp, SidebarWidth } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { playError } from "./Sound";
import { WarMonthlyConsequences } from "./WarMonthlyConsequences";
import { WarPowerComp } from "./WarPowerComp";

export function DeclareWarPage({ province }: { province: Province }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [selectedTiles, setSelectedTiles] = useState<Set<Tile>>(new Set());
   const defenderState = G.save.state.provinces[province];
   const { coAttackers, coDefenders } = getWarParticipants(G.save.state.playerProvince, province, G.save);
   const successChance = getWarSuccessChance(G.save.state.playerProvince, coAttackers, province, coDefenders, G.save);
   const failChance = 1 - successChance;
   const warTiles = getWarTiles(G.save);
   const relation = getRelation(G.save.state.playerProvince, province, G.save);
   if (!relation) {
      return null;
   }
   const casusBelli: ComboboxItem[] = [
      ...Array.from(relation.casusBelli).map(([cb, data]) => ({
         label: $t(L.$1$2MonthsLeft, CasusBelli[cb].name(), formatNumber(data.monthsLeft)),
         value: cb,
      })),
   ];
   casusBelli.push({ label: CasusBelli.None.name(), value: "None" });
   const [selectedCasusBelli, setSelectedCasusBelli] = useState(casusBelli[0].value as CasusBelli);
   if (selectedCasusBelli !== "None" && !relation.casusBelli.has(selectedCasusBelli)) {
      setSelectedCasusBelli(casusBelli[0].value as CasusBelli);
   }

   const warScore = getWarScore(G.save.state.playerProvince, province, selectedTiles, selectedCasusBelli, G.save);
   const warGoalTiles = Array.from(G.save.state.tiles).filter(
      ([tile, data]) => data.province === province && !warTiles.has(tile),
   );

   const warGoalTilesSet = new Set(warGoalTiles.map(([tile]) => tile));
   useEffect(() => {
      G.scene.getCurrent(WorldScene)?.drawSelectors(selectedTiles);
      G.scene.getCurrent(WorldScene)?.setClickTileHandler((tile, e) => {
         if (!warGoalTilesSet.has(tile)) {
            G.scene.getCurrent(WorldScene)?.drawProvinceOutline(province);
            playError();
            return;
         }
         setSelectedTiles((prev) => {
            const result = new Set(prev);
            if (result.has(tile)) {
               result.delete(tile);
            } else {
               result.add(tile);
            }
            G.scene.getCurrent(WorldScene)?.drawSelectors(result);
            return result;
         });
      });
      return () => {
         G.scene.enqueue(WorldScene, (scene) => {
            scene.drawSelectors(new Set());
            scene.clearClickTileHandler();
         });
      };
   }, [province, selectedTiles, warGoalTilesSet]);

   const effect = CasusBelli[selectedCasusBelli].effect?.();
   return (
      <SidebarComp title={$t(L.DeclareWar)} width={SidebarWidth + 100}>
         <div className="h1">{$t(L.WarGoal)}</div>
         <div
            className="m10 text-sm"
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "5px" }}
         >
            {warGoalTiles.map(([tile, data]) => (
               <div
                  className={cls(
                     "box row py2 px2 pr5 g5 pointer",
                     selectedTiles.has(tile) ? "primary text-primary" : "",
                  )}
                  id={`DeclareWarPage_Tile_${tile}_${selectedTiles.has(tile) ? "Selected" : "Unselected"}`}
                  key={tile}
                  onClick={() =>
                     setSelectedTiles((prev) => {
                        const result = new Set(prev);
                        if (result.has(tile)) {
                           result.delete(tile);
                        } else {
                           result.add(tile);
                        }
                        G.scene.getCurrent(WorldScene)?.drawSelectors(result);
                        return result;
                     })
                  }
               >
                  <div className="mi sm">{selectedTiles.has(tile) ? "check_box" : "check_box_outline_blank"}</div>
                  {getTileName(tile)}
                  {defenderState?.capital === tile ? <div className="mi xs">stars</div> : null}
               </div>
            ))}
         </div>
         <div className="h1">{$t(L.Planning)}</div>
         <WarPowerComp
            attacker={G.save.state.playerProvince}
            coAttackers={coAttackers}
            coDefenders={coDefenders}
            defender={province}
         />
         <div className="divider my10" />
         <BreakdownRow className="mx10 my5" name={$t(L.WarScore)} breakdown={warScore} formatFunc={formatNumber} />
         <FloatingTip
            label={
               <WarChanceTooltip
                  successChance={successChance}
                  failChance={failChance}
                  requiredWarScore={warScore.value}
               />
            }
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.EstTimeToWin)}</div>
               <div>
                  {successChance - failChance <= 0 ? (
                     <span className="text-red">{$t(L.Never)}</span>
                  ) : (
                     $t(L.$1Months, formatNumber(Math.ceil(warScore.value / (successChance - failChance))))
                  )}
               </div>
            </div>
         </FloatingTip>
         <div className="h1">{$t(L.CasusBelli)}</div>
         <div className="m10">
            <Select
               data={casusBelli}
               allowDeselect={false}
               value={selectedCasusBelli}
               onChange={(value) => setSelectedCasusBelli(value as CasusBelli)}
               checkIconPosition="right"
            />
         </div>
         {effect && (
            <div className="box m10 p10 text-primary primary text-sm">
               {$t(L.CasusBelliEffect)} {html(effect, { element: "span" })}
            </div>
         )}
         <div className="h1">{$t(L.OneTimeConsequences)}</div>
         <ValueListComp
            items={getOneTimeConsequences(
               G.save.state.playerProvince,
               province,
               selectedTiles,
               selectedCasusBelli,
               G.save,
            )}
         />
         <div className="h1">{$t(L.MonthlyConsequences)}</div>
         <WarMonthlyConsequences
            war={{
               attacker: G.save.state.playerProvince,
               tiles: selectedTiles,
               casusBelli: selectedCasusBelli,
            }}
         />
         <div className="divider my10" />
         {selectedCasusBelli === "None" && (
            <div className="box p10 m10 red text-red text-sm row g5">
               <div className="mi">error</div>
               <div>{html($t(L.WeAreDeclaringAWarWithoutACasusBelliThisWillResultInAGreaterPenalty))}</div>
            </div>
         )}
         <div className="mx10">
            <ActionButton
               id={`DeclareWarPage_DeclareWar_${province}`}
               className="w100 red py2"
               action={DeclareWarAction(
                  G.save.state.playerProvince,
                  coAttackers,
                  province,
                  coDefenders,
                  selectedTiles,
                  selectedCasusBelli,
                  G.save,
               )}
            >
               {$t(L.DeclareWar)}
            </ActionButton>
         </div>
      </SidebarComp>
   );
}

export function WarChanceTooltip({
   successChance,
   failChance,
   requiredWarScore,
}: {
   successChance: number;
   failChance: number;
   requiredWarScore: number;
}): React.ReactNode {
   return (
      <>
         {$t(
            L.WarChanceTooltip$1$2$3$4$5,
            formatPercent(successChance),
            "1",
            formatPercent(failChance),
            "1",
            formatNumber(requiredWarScore),
         )}
         <div className="h10" />
         {$t(L.WarChanceEstimateOnly)}
      </>
   );
}
