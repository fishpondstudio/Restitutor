import { Progress, Switch } from "@mantine/core";
import {
   clamp,
   cls,
   compareBool,
   formatDelta,
   formatNumber,
   formatPercent,
   hasFlag,
   mapOf,
   toggleFlag,
} from "@project/shared/src/utils/Helper";
import { ConvertToChristianityAction } from "../game/actions/ConvertToChristianityAction";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../game/actions/ProvinceUpgrades";
import { Modifiers, modifierValueToString } from "../game/definitions/Modifier";
import { ProvinceFlags, ProvinceResourceNames } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import {
   getChristianityYearly,
   getGoverningCapacityPerRestoration,
   getProgressToNextRestoration,
   getProvinceGoverningCapacity,
   getProvinceGoverningCost,
   getProvinceOverextension,
   getProvinceResource,
   getProvinceStability,
   getTilesAnnexedAndCored,
   TilesPerRestoration,
} from "../game/logic/ProvinceLogic";
import { getTileUnrest, isCapital } from "../game/logic/TileLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { showSidebar } from "./common/Sidebar";
import { SidebarComp } from "./common/SidebarComp";
import { colorNumber, colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { playClick } from "./Sound";
import { TilePage } from "./TilePage";
import { TimedActionButton } from "./TimedActionButton";
import { Grid2 } from "./UIConstant";

export function InternalAffairsPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const governingCost = getProvinceGoverningCost(G.save.state.playerProvince, G.save);
   const governingCapacity = getProvinceGoverningCapacity(G.save.state.playerProvince, G.save);
   const christianity = getProvinceResource("christianity", G.save.state.playerProvince, G.save);
   const christianityYearly = getChristianityYearly(G.save.state.playerProvince, G.save);
   const tileAnnexedAndCored = getTilesAnnexedAndCored(G.save.state.playerProvince, G.save);
   const progressToNextRestoration = getProgressToNextRestoration(G.save.state.playerProvince, G.save);
   const governingCapacityPerRestoration = getGoverningCapacityPerRestoration(G.save.state.playerProvince, G.save);
   const tiles = Array.from(G.save.state.tiles)
      .filter(
         ([tile, tileData]) =>
            tileData.province === G.save.state.playerProvince &&
            (tileData.rebellion > 0 || !tileData.coreProvinces.has(tileData.province) || tileData.autonomy > 0),
      )
      .sort((a, b) => {
         const diff = compareBool(a[1].coreProvinces.has(a[1].province), b[1].coreProvinces.has(b[1].province));
         if (diff !== 0) {
            return diff;
         }
         return b[1].rebellion - a[1].rebellion;
      });
   return (
      <SidebarComp title={$t(L.InternalAffairs)}>
         <div className="h1">{$t(L.GoverningAndStability)}</div>
         <BreakdownTooltip
            breakdown={governingCost}
            tooltip={(element) => (
               <>
                  <div className="m10">{html($t(L.GoverningCostIsTheSumOfAllTilesGoverningCost))}</div>
                  {element}
                  <div className="divider" />
                  <div className="m10">{$t(L.GoverningCapacityIsDeterminedAsFollows)}</div>
                  <BreakdownComp breakdown={governingCapacity} />
               </>
            )}
         >
            <div className="row m10">
               <div className="f1">{$t(L.GoverningCostCapacity)}</div>
               <div>
                  {formatNumber(governingCost.value)}/{formatNumber(governingCapacity.value)}
               </div>
            </div>
         </BreakdownTooltip>
         <Progress value={(100 * governingCost.value) / governingCapacity.value} className="mx10" />
         <div className="h15" />
         <div className="divider" />
         <BreakdownRow
            className="m10"
            name={$t(L.Overextension)}
            breakdown={getProvinceOverextension(G.save.state.playerProvince, G.save)}
            tooltip={(element) => (
               <>
                  <div className="m10">{$t(L.GoverningOvercapacityContributesToOverextension)}</div>
                  {element}
               </>
            )}
            formatFunc={colorNumberReverse}
         />
         <BreakdownRow
            className="m10"
            name={$t(L.Stability)}
            breakdown={getProvinceStability(G.save.state.playerProvince, G.save)}
            tooltip={(element) => (
               <>
                  <div className="m10">{Modifiers.Stability.desc()}</div>
                  {element}
               </>
            )}
         />
         <div className="divider" />
         <div className="m10">
            <FloatingTip label={html($t(L.SettleUnrestAutomaticallyEveryMonth, "0"))}>
               <div className="row my5">
                  <div className="f1">{$t(L.AutomaticallySettleUnrest)}</div>
                  <Switch
                     size="xs"
                     checked={hasFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest)}
                     onChange={() => {
                        state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest);
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </FloatingTip>
         </div>
         <div className="divider" />
         <FloatingTip
            className="p0"
            w={300}
            label={
               <>
                  <div className="m10 row">
                     <div className="f1">{$t(L.ProgressToNextRestoration)}</div>
                     <div>{formatPercent(progressToNextRestoration)}</div>
                  </div>
                  <div className="divider" />
                  <div className="m10">
                     {html(
                        $t(
                           L.EveryXTilesAnnexedAndCoredGrant1RestorationEachRestorationGrantsYGoverningCapacity,
                           TilesPerRestoration,
                           governingCapacityPerRestoration.value,
                        ),
                     )}
                  </div>
                  <div className="divider" />
                  <div className="m10">{$t(L.GoverningCapacityPerRestorationIsDeterminedAsFollows)}</div>
                  <BreakdownComp breakdown={governingCapacityPerRestoration} />
               </>
            }
         >
            <div className="m10">
               <div className="row my5">
                  <div className="f1">{$t(L.Restoration)}</div>
                  <div>{formatNumber(tileAnnexedAndCored)}</div>
               </div>
               <div className="h5" />
               <Progress value={100 * progressToNextRestoration} />
               <div className="h5" />
            </div>
         </FloatingTip>
         <div className="m10" style={Grid2}>
            <TimedActionButton timedAction="HoldGames" />
            <TimedActionButton timedAction="ExpandGrainDole" />
            <TimedActionButton timedAction="GrantTaxRelief" />
            <TimedActionButton timedAction="ReformCuria" />
            <TimedActionButton timedAction="RecruitTalents" />
            <TimedActionButton timedAction="RenewVestments" />
         </div>
         <div className="h1">{$t(L.Religion)}</div>
         <FloatingTip
            className="p0"
            w={300}
            label={
               <>
                  <div className="m10">
                     <div className="row my5">
                        <div className="f1">{$t(L.ChristianityInfluence)}</div>
                        <div>{formatNumber(christianity)}</div>
                     </div>
                     <div className="row my5">
                        <div className="f1">{$t(L.GoverningCost)}</div>
                        <div>{formatNumber(governingCost.value)}</div>
                     </div>
                  </div>
                  <div className="h2">{$t(L.ChristianityYearly)}</div>
                  <BreakdownComp breakdown={christianityYearly} />
                  <div className="divider" />
                  <div className="m10">
                     {$t(L.ChristianityConversionEffectsDescription)}
                     <div className="h10" />
                     {mapOf(ProvinceUpgrades.ReligiousUnrest.modifiers, (modifier, data) => (
                        <div className="row my5" key={modifier}>
                           <div className="f1">{Modifiers[modifier].name()}</div>
                           <div className="text-red">{modifierValueToString(data)}</div>
                        </div>
                     ))}
                     {hasProvinceUpgrade("ReligiousUnrest", G.save.state.playerProvince, G.save) && (
                        <div className="text-red my5">{$t(L.TheEffectIsCurrentlyActive)}</div>
                     )}
                  </div>
               </>
            }
         >
            <div className="row g5 m10">
               <div>{ProvinceResourceNames.christianity()}</div>
               {hasProvinceUpgrade("ReligiousUnrest", G.save.state.playerProvince, G.save) && (
                  <div className="mi sm text-red">error</div>
               )}
               <div className="f1" />
               <div>
                  {formatNumber(christianity)}/{formatNumber(governingCost.value)}
                  <span className="text-green"> ({formatDelta(christianityYearly.value)})</span>
               </div>
            </div>
         </FloatingTip>
         <Progress value={(100 * christianity) / governingCost.value} className="m10" />
         <div className="m10" style={Grid2}>
            <ActionButton
               className="btn"
               action={ConvertToChristianityAction(G.save.state.playerProvince, G.save)}
               tooltip={(element) => (
                  <>
                     <div className="m10">{$t(L.ConvertingToChristianityDescription)}</div>
                     {element}
                  </>
               )}
            >
               {$t(L.ConvertToChristianity)}
            </ActionButton>
            <TimedActionButton timedAction="AppointBishop" />
         </div>
         <div className="h1">{$t(L.AutonomyAndRebellion)}</div>
         {tiles.map(([tile, tileData]) => {
            const unrest = getTileUnrest(tile, G.save);
            return (
               <div className="box m10 text-sm" key={tile}>
                  <div className="h3 row">
                     {getTileName(tile)}
                     {isCapital(tile, G.save) && <div className="mi sm text-yellow">stars</div>}
                     <div className="f1" />
                     <div
                        className="mi sm pointer"
                        onClick={() => {
                           hideModal();
                           G.scene
                              .getCurrent(WorldScene)
                              ?.lookAt(tile, { time: 0.2 })
                              .then((scene) => {
                                 scene.drawSelectors(new Set([tile]));
                                 scene.drawProvinceOutline(tileData.province);
                              });
                           showSidebar(<TilePage tile={tile} />);
                        }}
                     >
                        open_in_new
                     </div>
                  </div>
                  <BreakdownTooltip breakdown={unrest}>
                     <div className="row mx10 my5">
                        <div className="f1">{$t(L.Unrest)}</div>
                        <div>{colorNumber(unrest.value, true)}</div>
                     </div>
                  </BreakdownTooltip>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Autonomy)}</div>
                     <div className="row g5">
                        <FloatingTip label={$t(L.SetTileAutonomyToX, "0")}>
                           <button
                              className="btn text-xs"
                              onClick={() => {
                                 playClick();
                                 tileData.autonomy = 0;
                                 GameStateUpdated.emit();
                              }}
                           >
                              {$t(L.Reset)}
                           </button>
                        </FloatingTip>
                        <FloatingTip label={$t(L.SettlingUnrestAdjustsAutonomySoThatTileUnrestIsAtMostX, "0")}>
                           <button
                              className="btn text-xs"
                              onClick={() => {
                                 playClick();
                                 const unrest = getTileUnrest(tile, G.save).value;
                                 tileData.autonomy = clamp(tileData.autonomy + Math.ceil(unrest), 0, 100);
                                 GameStateUpdated.emit();
                              }}
                           >
                              {$t(L.Settle)}
                           </button>
                        </FloatingTip>
                     </div>
                     <div>{tileData.autonomy}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Rebellion)}</div>
                     <div
                        className={cls(
                           tileData.rebellion >= 8 ? "text-red" : tileData.rebellion >= 5 ? "text-yellow" : null,
                        )}
                     >
                        {tileData.rebellion}/10
                     </div>
                  </div>
               </div>
            );
         })}
         {tiles.length === 0 && <div className="text-dimmed m10">{$t(L.NoRebellions)}</div>}
      </SidebarComp>
   );
}
