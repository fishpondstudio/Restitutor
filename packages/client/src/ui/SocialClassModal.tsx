import { clamp, cls, entriesOf, formatDelta, formatNumber, formatPercentDelta } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { finalizeCondition } from "../game/actions/GameAction";
import { addProvinceUpgrade, hasProvinceUpgrade, removeProvinceUpgrade } from "../game/actions/ProvinceUpgrades";
import { SocialClassBonuses, SocialClassNames } from "../game/definitions/SocialClass";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getProvinceUpgrade } from "../game/logic/ProvinceLogic";
import {
   getDissentChange,
   getEstimatedDissentTime,
   getLoyaltyEquilibrium,
   SocialClassDissentEffectPct,
} from "../game/logic/SocialClassLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { html } from "./components/RenderHTMLComp";
import { Grid3 } from "./UIConstant";

export function SocialClassModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <ModalComp size="xl" title={<ModalTitleBar title={$t(L.SocialClass)} dismiss />}>
         <div className="m10" style={Grid3}>
            {entriesOf(state.socialClasses).map(([socialClass, data]) => {
               const targetLoyalty = getLoyaltyEquilibrium(socialClass, G.save.state.playerProvince, G.save);
               const dissentDelta = getDissentChange(socialClass, G.save.state.playerProvince, G.save);
               const estimatedDissentTime = getEstimatedDissentTime(socialClass, G.save.state.playerProvince, G.save);
               const totalUpgrades = getProvinceUpgrade(G.save.state.playerProvince, G.save);
               return (
                  <div className="box" key={socialClass}>
                     <div className="h1">{SocialClassNames[socialClass]()}</div>
                     <div className="row mx10 my5">
                        <div className="f1">{$t(L.Influence)}</div>
                        <div>{data.influence}</div>
                     </div>
                     <div className="divider vertical" />
                     <BreakdownTooltip
                        breakdown={targetLoyalty}
                        tooltip={(element) => (
                           <>
                              <div className="m10">{$t(L.LoyaltyMovesTowardsEquilibrium, "1")}</div>
                              {element}
                           </>
                        )}
                     >
                        <div className="row g5 mx10 my5">
                           <div className="f1">{$t(L.Loyalty)}</div>
                           {targetLoyalty.value > data.loyalty && <div className="mi sm text-green">trending_up</div>}
                           {targetLoyalty.value < data.loyalty && <div className="mi sm text-red">trending_down</div>}
                           <div>{data.loyalty}</div>
                           {targetLoyalty.value !== data.loyalty && (
                              <div className="text-dimmed">({targetLoyalty.value})</div>
                           )}
                        </div>
                     </BreakdownTooltip>
                     <div className="divider vertical" />
                     <BreakdownTooltip
                        breakdown={dissentDelta}
                        tooltip={(element) => (
                           <>
                              <div className="m10">
                                 {Number.isFinite(estimatedDissentTime) &&
                                    estimatedDissentTime > 0 &&
                                    $t(
                                       L.XIsEstimatedToDissentInYMonths,
                                       SocialClassNames[socialClass](),
                                       formatNumber(estimatedDissentTime),
                                    )}
                                 {estimatedDissentTime === 0 && (
                                    <span className="text-red">
                                       {$t(L.XIsCurrentlyInDissent, SocialClassNames[socialClass]())}
                                    </span>
                                 )}
                                 {$t(L.DissentRangesFrom100To100)}
                              </div>
                              {element}
                              <div className="divider" />
                              <div className="m10">{html($t(L.WhenDissentIsGreaterThanLoyalty))}</div>
                              <div className="row mx10 my5">
                                 <div className="f1">{$t(L.LandTax)}</div>
                                 <div className="text-red">{formatPercentDelta(SocialClassDissentEffectPct)}</div>
                              </div>
                              <div className="row mx10 my5">
                                 <div className="f1">{$t(L.TileOutput)}</div>
                                 <div className="text-red">{formatPercentDelta(SocialClassDissentEffectPct)}</div>
                              </div>
                              <div className="row mx10 my5">
                                 <div className="f1">{$t(L.Manpower)}</div>
                                 <div className="text-red">{formatPercentDelta(SocialClassDissentEffectPct)}</div>
                              </div>
                              <div className="row mx10 my5">
                                 <div className="f1">{$t(L.Stability)}</div>
                                 <div className="text-red">{formatPercentDelta(SocialClassDissentEffectPct)}</div>
                              </div>
                           </>
                        )}
                     >
                        <div className={cls("row g5 mx10 my5", data.dissent > data.loyalty ? "text-red" : null)}>
                           <div className="f1">{$t(L.Dissent)}</div>
                           {dissentDelta.value > 0 && <div className="mi sm text-red">trending_up</div>}
                           {dissentDelta.value < 0 && <div className="mi sm text-green">trending_down</div>}
                           <div>{formatNumber(data.dissent)}</div>
                           {dissentDelta.value !== 0 && (
                              <div className="text-dimmed">({formatDelta(dissentDelta.value)})</div>
                           )}
                        </div>
                     </BreakdownTooltip>
                     <div className="mx10">
                        <ActionButton
                           className="w100 mb10"
                           action={{
                              cost: { gold: totalUpgrades * 3 },
                              condition: finalizeCondition({
                                 breakdown: [
                                    ...timedActionConditions(
                                       { action: "CurryFavor" },
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                 ],
                              }),
                              effect: () => {
                                 startTimedAction("CurryFavor", G.save.state.playerProvince, G.save);
                                 data.loyalty += 20;
                                 data.dissent = clamp(data.dissent - 20, -100, 100);
                              },
                           }}
                           tooltip={(element) => (
                              <>
                                 <TimedActionDescComp action="CurryFavor" />
                                 {element}
                              </>
                           )}
                        >
                           {TimedActions.CurryFavor.name()}
                        </ActionButton>
                     </div>
                     <div className="divider" />
                     <div className="h3">{$t(L.Privileges)}</div>
                     {entriesOf(SocialClassBonuses).map(([action, bonus]) => {
                        if (bonus.socialClass !== socialClass) {
                           return null;
                        }
                        return (
                           <Fragment key={action}>
                              <div className="divider" />
                              <div className="mx10 my5" key={action}>
                                 <div className="text-display">{bonus.name()}</div>
                                 <div className="text-sm text-dimmed">
                                    {bonus.desc()} (+{bonus.influence} {$t(L.Influence)}, +{bonus.loyalty}{" "}
                                    {$t(L.Loyalty)})
                                 </div>
                                 {hasProvinceUpgrade(action, G.save.state.playerProvince, G.save) ? (
                                    <ActionButton
                                       className="text-red my5"
                                       action={{
                                          cost: { administrative: 10 },
                                          condition: finalizeCondition({
                                             breakdown: [
                                                {
                                                   name: $t(L.HasEnoughLoyalty),
                                                   value: data.loyalty >= bonus.loyalty,
                                                   desc: $t(
                                                      L.XWillLoseYLoyaltyAvailableZ,
                                                      SocialClassNames[socialClass](),
                                                      formatNumber(bonus.loyalty),
                                                      formatNumber(data.loyalty),
                                                   ),
                                                },
                                                {
                                                   name: $t(L.HasEnoughInfluence),
                                                   value: data.influence >= bonus.influence,
                                                   desc: $t(
                                                      L.XWillLoseYInfluenceAvailableZ,
                                                      SocialClassNames[socialClass](),
                                                      formatNumber(bonus.influence),
                                                      formatNumber(data.influence),
                                                   ),
                                                },
                                             ],
                                          }),
                                          effect: () => {
                                             removeProvinceUpgrade(action, G.save.state.playerProvince, G.save);
                                             data.influence -= bonus.influence;
                                             data.loyalty -= bonus.loyalty;
                                          },
                                       }}
                                       tooltip={(element) => (
                                          <>
                                             <div className="m10">
                                                {$t(
                                                   L.RevokingThisPrivilegeWillHaveTheFollowingEffectsOnX,
                                                   SocialClassNames[socialClass](),
                                                )}
                                             </div>
                                             <div className="row mx10 my5">
                                                <div className="f1">{$t(L.Influence)}</div>
                                                <div className="text-green">-{bonus.influence}</div>
                                             </div>
                                             <div className="row mx10 my5">
                                                <div className="f1">{$t(L.Loyalty)}</div>
                                                <div className="text-red">-{bonus.loyalty}</div>
                                             </div>
                                             {element}
                                          </>
                                       )}
                                    >
                                       {$t(L.Revoke)}
                                    </ActionButton>
                                 ) : (
                                    <ActionButton
                                       className="my5"
                                       action={{
                                          condition: finalizeCondition({
                                             breakdown: [
                                                {
                                                   name: $t(L.NotExceedMaxInfluence),
                                                   value: data.influence + bonus.influence <= 100,
                                                   desc: $t(
                                                      L.XWillGainYInfluenceHeadroomZ,
                                                      SocialClassNames[socialClass](),
                                                      formatNumber(bonus.influence),
                                                      formatNumber(100 - data.influence),
                                                   ),
                                                },
                                             ],
                                          }),
                                          effect: () => {
                                             addProvinceUpgrade(action, G.save.state.playerProvince, G.save);
                                             data.influence += bonus.influence;
                                             data.loyalty += bonus.loyalty;
                                          },
                                       }}
                                       tooltip={(element) => (
                                          <>
                                             <div className="m10">
                                                {$t(
                                                   L.GrantingThisPrivilegeWillHaveTheFollowingEffectsOnX,
                                                   SocialClassNames[socialClass](),
                                                )}
                                             </div>
                                             <div className="row mx10 my5">
                                                <div className="f1">{$t(L.Influence)}</div>
                                                <div className="text-red">+{bonus.influence}</div>
                                             </div>
                                             <div className="row mx10 my5">
                                                <div className="f1">{$t(L.Loyalty)}</div>
                                                <div className="text-green">+{bonus.loyalty}</div>
                                             </div>
                                             {element}
                                          </>
                                       )}
                                    >
                                       {$t(L.Grant)}
                                    </ActionButton>
                                 )}
                              </div>
                           </Fragment>
                        );
                     })}
                  </div>
               );
            })}
         </div>
      </ModalComp>
   );
}
