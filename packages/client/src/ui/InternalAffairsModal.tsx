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
   removeSpace,
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
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { AppeaseButton } from "./AppeaseButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { CrackDownButton } from "./CrackDownButton";
import { showSidebar } from "./common/Sidebar";
import { colorNumber, colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { MakeCoreButton } from "./MakeCoreButton";
import { playClick } from "./Sound";
import { TilePage } from "./TilePage";
import { TimedActionButton } from "./TimedActionButton";

export function InternalAffairsModal(): React.ReactNode {
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
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.InternalAffairs)} dismiss />}>
         <div className="h1">{$t(L.GoverningAndStability)}</div>
         <div className="row g0 fstart">
            <div className="f1">
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
               <div className="h2">{$t(L.Automation)}</div>
               <div className="m10">
                  <FloatingTip label={html($t(L.SettleUnrestAutomaticallyEveryMonth, "0"))}>
                     <div className="row my5">
                        <div className="f1">{$t(L.AutomaticallySettleUnrest)}</div>
                        <Switch
                           checked={hasFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest)}
                           onChange={() => {
                              state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallySettleUnrest);
                              GameStateUpdated.emit();
                           }}
                        />
                     </div>
                  </FloatingTip>
               </div>
            </div>
            <div className="divider vertical" />
            <div style={{ width: 250 }} className="p10 col stretch g5">
               <TimedActionButton timedAction="HoldGames" />
               <TimedActionButton timedAction="ExpandGrainDole" />
               <TimedActionButton timedAction="GrantTaxRelief" />
               <TimedActionButton timedAction="ReformCuria" />
               <TimedActionButton timedAction="RecruitTalents" />
               <TimedActionButton timedAction="RenewVestments" />
               <div className="f1" />
            </div>
         </div>
         <div className="h1">{$t(L.ReligionChristianity)}</div>
         <div className="row g0">
            <div className="f1">
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
               <div className="h5" />
            </div>
            <div className="divider vertical" />
            <div style={{ width: 250 }}>
               <div className="col stretch m10 g5">
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
            </div>
         </div>
         <div className="h1">{$t(L.AutonomyAndRebellion)}</div>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th></th>
                     <th>{$t(L.Unrest)}</th>
                     <th colSpan={2}>{$t(L.Autonomy)}</th>
                     <th colSpan={2}>{$t(L.Rebellion)}</th>
                  </tr>
               </thead>
               <tbody>
                  {tiles.map(([tile, tileData]) => {
                     const unrest = getTileUnrest(tile, G.save);
                     return (
                        <tr key={tile}>
                           <td>
                              <div
                                 className="row g5 pointer"
                                 onClick={() => {
                                    hideModal();
                                    G.scene.getCurrent(WorldScene)?.drawSelectors(new Set([tile]));
                                    showSidebar(<TilePage tile={tile} />);
                                 }}
                              >
                                 <div className="mi sm">open_in_new</div>
                                 {getTileName(tile)}
                                 {isCapital(tile, G.save) && <div className="mi sm text-yellow">stars</div>}
                                 <div className="f1" />
                              </div>
                           </td>
                           <td>
                              <BreakdownTooltip breakdown={unrest}>
                                 <div>{colorNumber(unrest.value, true)}</div>
                              </BreakdownTooltip>
                           </td>
                           <td>{tileData.autonomy}</td>
                           <td className="nowrap">
                              <FloatingTip label={$t(L.SetTileAutonomyToX, "0")}>
                                 <button
                                    className="btn"
                                    onClick={() => {
                                       playClick();
                                       tileData.autonomy = 0;
                                       GameStateUpdated.emit();
                                    }}
                                 >
                                    0
                                 </button>
                              </FloatingTip>
                              <FloatingTip label={$t(L.SettlingUnrestAdjustsAutonomySoThatTileUnrestIsAtMostX, "0")}>
                                 <button
                                    className="btn"
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
                           </td>
                           <td
                              className={cls(
                                 tileData.rebellion >= 8 ? "text-red" : tileData.rebellion >= 5 ? "text-yellow" : null,
                              )}
                           >
                              {tileData.rebellion}/10
                           </td>
                           <td className="nowrap">
                              <AppeaseButton tile={tile} /> <CrackDownButton tile={tile} />{" "}
                              <MakeCoreButton
                                 id={`InternalAffairs_MakeCore_${removeSpace(getTileName(tile))}`}
                                 tile={tile}
                              />
                           </td>
                        </tr>
                     );
                  })}
                  {tiles.length === 0 && (
                     <tr>
                        <td className="text-dimmed text-italic" colSpan={5}>
                           {$t(L.NoRebellions)}
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </ModalComp>
   );
}
