import { Progress, Switch } from "@mantine/core";
import { cls, compareBool, formatNumber, formatPercent, hasFlag, toggleFlag } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { AdjustAutonomyAction, SettleUnrestAction } from "../game/actions/AdjustAutonomyAction";
import { Modifiers } from "../game/definitions/Modifier";
import { Province } from "../game/definitions/Province";
import { ProvinceResourceNames } from "../game/definitions/ProvinceResources";
import { ProvinceFlags } from "../game/definitions/ProvinceState";
import { getProvinceUpgradeDesc, ProvinceUpgrades } from "../game/definitions/ProvinceUpgrades";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getUpcomingDisasters } from "../game/events/DisasterLogic";
import {
   getProgressToNextRestoration,
   getProvinceGoverningCapacity,
   getProvinceGoverningCost,
   getProvinceGreatWorks,
   getProvinceOverextension,
   getProvinceStability,
   getRestoration,
   getTilesAnnexedAndCored,
   TilesPerRestoration,
} from "../game/logic/ProvinceLogic";
import { getProvinceResource } from "../game/logic/ResourceLogic";
import { getTileUnrest, isCapital } from "../game/logic/TileLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { AppeaseButton } from "./AppeaseButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { CrackDownButton } from "./CrackDownButton";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { colorNumber, colorNumberReverse } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DisasterCard } from "./DisasterCard";
import { DisasterPage } from "./DisasterPage";
import { GreatWorkComponent } from "./GreatWorkComponent";
import { GreatWorksSingletonModal } from "./GreatWorksSingletonModal";
import { MakeCoreButton } from "./MakeCoreButton";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
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
   const tileAnnexedAndCored = getTilesAnnexedAndCored(G.save.state.playerProvince, G.save);
   const progressToNextRestoration = getProgressToNextRestoration(G.save.state.playerProvince, G.save);
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
   const overExtension = getProvinceOverextension(G.save.state.playerProvince, G.save);
   const stability = getProvinceStability(G.save.state.playerProvince, G.save);
   const greatWorks = Array.from(getProvinceGreatWorks(G.save.state.playerProvince, G.save));
   const nextDisaster = getUpcomingDisasters(G.save)[0];
   return (
      <SidebarComp title={<SidebarHeader title={$t(L.InternalAffairs)} />}>
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
            <div className="row mx10 my5">
               <div className="f1">{$t(L.GoverningCostCapacity)}</div>
               <div>
                  {formatNumber(governingCost.value)}/{formatNumber(governingCapacity.value)}
               </div>
            </div>
         </BreakdownTooltip>
         <Progress value={(100 * governingCost.value) / governingCapacity.value} className="mx10" />
         <div className="h10" />
         <div className="divider" />
         <BreakdownTooltip
            breakdown={overExtension}
            tooltip={(element) => (
               <>
                  <div className="m10">{$t(L.GoverningOvercapacityContributesToOverextension)}</div>
                  {element}
               </>
            )}
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Overextension)}</div>
               <div>{colorNumberReverse(overExtension.value)}</div>
            </div>
         </BreakdownTooltip>
         <BreakdownTooltip
            breakdown={stability}
            tooltip={(element) => (
               <>
                  <div className="m10">{Modifiers.Stability.desc()}</div>
                  {element}
               </>
            )}
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.Stability)}</div>
               <div>{colorNumber(stability.value)}</div>
            </div>
         </BreakdownTooltip>
         <FloatingTip
            label={() => (
               <>
                  {$t(L.MandatesCanBeAcquiredFrom)}
                  <ul>
                     <li>{$t(L.RestorationBonus)}</li>
                     <li>{$t(L.Events)}</li>
                     <li>{$t(L.EliminatingAPolityInAPeaceTreaty)}</li>
                     <li>{$t(L.AnnexingAClient)}</li>
                  </ul>
               </>
            )}
         >
            <div className="row mx10 my5">
               <div>{ProvinceResourceNames.mandate()}</div>
               <img src={ProvinceResourceImages.mandate} className="icon-block" />
               <div className="f1" />
               <div>{formatNumber(getProvinceResource("mandate", G.save.state.playerProvince, G.save))}</div>
            </div>
         </FloatingTip>
         <div className="divider" />
         <div className="m10">
            <FloatingTip
               fixedWidth
               className="p0"
               label={() => (
                  <>
                     <div className="m10">{$t(L.AutomaticallySettlePositiveUnrestDesc)}</div>
                     <TimedActionDescComp action="AdjustAutonomy" />
                  </>
               )}
            >
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
            fixedWidth
            label={() => (
               <>
                  <div className="m10 row">
                     <div className="f1">{$t(L.ProgressToNextRestoration)}</div>
                     <div>{formatPercent(progressToNextRestoration)}</div>
                  </div>
                  <div className="divider" />
                  <div className="m10">
                     {html($t(L.EveryTilesGrantRestorationWithBonusChoice$1, TilesPerRestoration))}
                  </div>
               </>
            )}
         >
            <div className="m10">
               <div className="row my5">
                  <div className="f1">{$t(L.Restoration)}</div>
                  <div>{formatNumber(getRestoration(G.save.state.playerProvince, G.save))}</div>
               </div>
               <div className="row my5">
                  <div className="f1">{$t(L.TilesAnnexedAndCored)}</div>
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
         {nextDisaster && (
            <>
               <div className="h1 row">
                  <div className="f1">{$t(L.Disasters)}</div>
                  <button className="btn text-sm" onClick={() => showPanel(DisasterPage, {})}>
                     {$t(L.ShowAll)}
                  </button>
               </div>
               <div className="m10">
                  <DisasterCard disaster={nextDisaster} />
               </div>
            </>
         )}
         <div className="h1">{$t(L.ProvincialSpirits)}</div>
         {Province[G.save.state.playerProvince].upgrades.map((upgrade, idx) => (
            <Fragment key={upgrade}>
               <FloatingTip label={() => getProvinceUpgradeDesc(upgrade)}>
                  <div className="row mx10 my5">
                     <div className="f1">{ProvinceUpgrades[upgrade].name()}</div>
                     <div className="mi sm text-dimmed">info</div>
                  </div>
               </FloatingTip>
            </Fragment>
         ))}
         <div className="h1">{$t(L.ProvincialGreatWorks)}</div>
         <div className="m10">
            {greatWorks.map((gw) => (
               <GreatWorkComponent key={gw} greatWork={gw} />
            ))}
         </div>
         {greatWorks.length > 0 && <div className="divider" />}
         <div className="m10">
            <button className="btn w100" onClick={() => showPanel(GreatWorksSingletonModal, {})}>
               {$t(L.ShowAllGreatWorks)}
            </button>
         </div>
         <div className="h1">{$t(L.AutonomyAndRebellion)}</div>
         {tiles.map(([tile, tileData]) => {
            const unrest = getTileUnrest(tile, G.save);
            return (
               <div className="box m10 text-sm" key={tile}>
                  <div className="h3 row">
                     {getTileName(tile, G.save)}
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
                           showPanel(TilePage, { tile });
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
                        <ActionButton
                           className="text-xs"
                           action={() => AdjustAutonomyAction(tile, 0, G.save.state.playerProvince, G.save)}
                           tooltip={(element) => (
                              <>
                                 <div className="m10">{$t(L.SetTileAutonomyTo$1, "0")}</div>
                                 <TimedActionDescComp action="AdjustAutonomy" />
                                 {element}
                              </>
                           )}
                        >
                           {$t(L.Reset)}
                        </ActionButton>
                        <ActionButton
                           className="text-xs"
                           action={() => SettleUnrestAction(tile, G.save.state.playerProvince, G.save)}
                           tooltip={(element) => (
                              <>
                                 <div className="m10">
                                    {$t(L.SettlingUnrestAdjustsAutonomySoThatTileUnrestIsAtMost$1, "0")}
                                 </div>
                                 <TimedActionDescComp action="AdjustAutonomy" />
                                 {element}
                              </>
                           )}
                        >
                           {$t(L.Settle)}
                        </ActionButton>
                     </div>
                     <div>{tileData.autonomy}</div>
                  </div>
                  <div className="row g5 mx10 my5">
                     <div className="f1">{$t(L.Rebellion)}</div>
                     <MakeCoreButton className="text-xs" id={`InternalAffairsPage_MakeCore_${tile}`} tile={tile} />
                     <AppeaseButton tile={tile} className="text-xs" />
                     <CrackDownButton tile={tile} className="text-xs" />
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
