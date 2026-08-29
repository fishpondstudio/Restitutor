import { PieChart } from "@mantine/charts";
import { getThemeColor, useMantineTheme } from "@mantine/core";
import { formatDelta, formatNumber, formatPercent, mapOf, numberToRoman } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { finalizeCondition } from "../game/actions/GameAction";
import { GrantSocialClassBonusAction } from "../game/actions/GrantSocialClassBonusAction";
import { modifierToString } from "../game/definitions/Modifier";
import { SocialClass, SocialClassBonuses } from "../game/definitions/SocialClass";
import { GameStateUpdated } from "../game/Events";
import { getGameEffectDesc } from "../game/GameEffect";
import { getTotalUpgrades } from "../game/logic/ProvinceLogic";
import {
   addSocialClassInfluence,
   addSocialClassLoyalty,
   getAgendas,
   getAgendasRefreshIn,
   getSocialClassInfluence,
   getSocialClassInfluencePercentage,
   getSocialClassLoyalty,
   isSocialClassDisloyal,
   isSocialClassDominant,
   SocialClassInfluenceYearly,
} from "../game/logic/SocialClassLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { Grid2 } from "./UIConstant";

export function SocialClassSingletonModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const theme = useMantineTheme();
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const agendas = getAgendas(10, G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="xl" title={<ModalTitleBar title={$t(L.SocialClass)} dismiss />}>
         <div className="row g0 fstart">
            <div className="f1">
               <div className="h1 row">
                  <div className="f1">{$t(L.Agendas)}</div>
                  <div className="text-dimmed">
                     {$t(L.RefreshIn$1Months, formatNumber(getAgendasRefreshIn(G.save.state.playerProvince, G.save)))}
                  </div>
               </div>
               {agendas.map((key, idx) => {
                  const config = SocialClassBonuses[key];
                  return (
                     <Fragment key={key}>
                        <div className="row m10" key={key}>
                           <div className="text-display text-lg text-primary" style={{ width: "2.5rem" }}>
                              {numberToRoman(idx + 1)}.
                           </div>
                           <div className="f1">
                              {getGameEffectDesc(config.effect, G.save.state.playerProvince, G.save)}
                              <div className="row mt5 g5 text-sm text-dimmed">
                                 <div className="mi xs">thumb_up</div>
                                 <div className="text-display">
                                    {config.supporting.map((sc) => SocialClass[sc].name()).join(", ")}
                                 </div>
                                 <div className="w10" />
                                 <div className="mi xs">thumb_down</div>
                                 <div className="text-display">
                                    {config.opposing.map((sc) => SocialClass[sc].name()).join(", ")}
                                 </div>
                                 <div className="f1"></div>
                              </div>
                           </div>
                           <div>
                              <ActionButton
                                 className="btn SocialClassModal_Adopt"
                                 action={GrantSocialClassBonusAction(key, G.save.state.playerProvince, G.save)}
                                 tooltip={(element) => (
                                    <>
                                       <div className="m10">
                                          {getGameEffectDesc(config.effect, G.save.state.playerProvince, G.save)}
                                       </div>
                                       <div className="h2">{$t(L.AfterAdoptingThisAgenda)}</div>
                                       {config.supporting.map((sc) => {
                                          return (
                                             <div className="row mx10 my5" key={sc}>
                                                <div className="f1">{SocialClass[sc].name()}</div>
                                                <div>{$t(L.$1Influence, formatDelta(10))}</div>
                                                <div className="mi xs text-primary mx-5">whatshot</div>
                                             </div>
                                          );
                                       })}
                                       {config.opposing.map((sc) => {
                                          return (
                                             <div className="row mx10 my5" key={sc}>
                                                <div className="f1">{SocialClass[sc].name()}</div>
                                                <div>{$t(L.$1Loyalty, formatDelta(-10))}</div>
                                                <div className="mi xs text-primary mx-5">favorite</div>
                                             </div>
                                          );
                                       })}
                                       {element}
                                    </>
                                 )}
                              >
                                 {$t(L.Adopt)}
                              </ActionButton>
                           </div>
                        </div>
                        <div className="divider" />
                     </Fragment>
                  );
               })}
            </div>
            <div className="divider vertical" />
            <div style={{ width: "20rem" }}>
               <div className="cc">
                  <PieChart
                     data={mapOf(SocialClass, (key, data) => ({
                        value: getSocialClassInfluence(key, G.save.state.playerProvince, G.save),
                        name: SocialClass[key].name(),
                        color: SocialClass[key].color,
                     }))}
                     strokeWidth={5}
                     size={150}
                     withLabels
                     labelsPosition="outside"
                     labelsType="percent"
                     withTooltip
                     tooltipDataSource="segment"
                  />
               </div>
               {mapOf(SocialClass, (key, data) => {
                  const influence = getSocialClassInfluence(key, G.save.state.playerProvince, G.save);
                  const loyalty = getSocialClassLoyalty(key, G.save.state.playerProvince, G.save);
                  return (
                     <div className="box m10 g0 py2" key={key}>
                        <FloatingTip
                           className="p0"
                           fixedWidth
                           label={
                              <>
                                 <div className="h2">{$t(L.$1Class, SocialClass[key].name())}</div>
                                 <div className="row mx10 my5">
                                    <div className="f1">
                                       {$t(L.Influence)}/{$t(L.Percentage)}
                                    </div>
                                    <div>
                                       {formatNumber(influence)}/
                                       {formatPercent(
                                          getSocialClassInfluencePercentage(key, G.save.state.playerProvince, G.save),
                                       )}
                                    </div>
                                    <div className="mi xs text-primary">whatshot</div>
                                 </div>
                                 <div className="row mx10 my5">
                                    <div className="f1">{$t(L.Loyalty)}</div>
                                    <div>{formatNumber(loyalty)}</div>
                                    <div className="mi xs text-primary">favorite</div>
                                 </div>
                                 <div className="h2">{$t(L.WhenDominant)}</div>
                                 {mapOf(SocialClass[key].dominant, (modifier, data) => {
                                    return (
                                       <div className="mx10 my5" key={modifier}>
                                          {modifierToString(modifier, data)}
                                       </div>
                                    );
                                 })}
                                 {isSocialClassDominant(key, G.save.state.playerProvince, G.save) ? (
                                    <div className="mx10 my5 text-red">
                                       {$t(L.$1IsCurrentlyDominant, SocialClass[key].name())}
                                    </div>
                                 ) : null}
                                 <div className="h2">{$t(L.WhenDisloyal)}</div>
                                 {mapOf(SocialClass[key].disloyal, (modifier, data) => {
                                    return (
                                       <div className="mx10 my5" key={modifier}>
                                          {modifierToString(modifier, data)}
                                       </div>
                                    );
                                 })}
                                 {isSocialClassDisloyal(key, G.save.state.playerProvince, G.save) ? (
                                    <div className="mx10 my5 text-red text-display">
                                       {$t(L.$1IsCurrentlyDisloyal, SocialClass[key].name())}
                                    </div>
                                 ) : null}
                                 <div className="h2">{$t(L.InfluencePerYear)}</div>
                                 <BreakdownComp
                                    breakdown={SocialClassInfluenceYearly[key](G.save.state.playerProvince, G.save)}
                                 />
                              </>
                           }
                        >
                           <div>
                              <div className="mx10 my5 row">
                                 <div
                                    style={{
                                       backgroundColor: getThemeColor(SocialClass[key].color, theme),
                                       width: "1rem",
                                       height: "1rem",
                                       borderRadius: "15%",
                                       flex: "0 0 1rem",
                                    }}
                                 />
                                 <div className="f1 text-roman text-sm">{SocialClass[key].name()}</div>
                                 {isSocialClassDominant(key, G.save.state.playerProvince, G.save) ||
                                 isSocialClassDisloyal(key, G.save.state.playerProvince, G.save) ? (
                                    <div className="mi sm text-red">error</div>
                                 ) : null}
                              </div>
                              <div className="divider" />
                              <div className="row mx10 my5">
                                 <div className="row g5">
                                    <div className="mi sm text-primary">favorite</div>
                                    <div>{formatNumber(loyalty)}</div>
                                 </div>
                                 <div className="f1" />
                                 <div className="row g5">
                                    <div className="mi sm text-primary">whatshot</div>
                                    <div>
                                       <span className="text-dimmed">{formatNumber(influence)}/</span>
                                       {formatPercent(
                                          getSocialClassInfluencePercentage(key, G.save.state.playerProvince, G.save),
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </FloatingTip>
                        <div className="m10 my5" style={Grid2}>
                           <ActionButton
                              action={{
                                 cost: {
                                    administrative: getTotalUpgrades(G.save.state.playerProvince, G.save) / 2,
                                 },
                                 condition: finalizeCondition([
                                    ...timedActionConditions(
                                       { action: "SocialClassCurtail" },
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                 ]),
                                 effect: () => {
                                    startTimedAction("SocialClassCurtail", G.save.state.playerProvince, G.save);
                                    addSocialClassInfluence(
                                       key,
                                       -0.2 * getSocialClassInfluence(key, G.save.state.playerProvince, G.save),
                                       G.save.state.playerProvince,
                                       G.save,
                                    );
                                 },
                              }}
                              tooltip={(element) => (
                                 <>
                                    <TimedActionDescComp action="SocialClassCurtail" />
                                    {element}
                                 </>
                              )}
                           >
                              {$t(L.SocialClassCurtail)}
                           </ActionButton>
                           <ActionButton
                              action={{
                                 cost: {
                                    gold: getTotalUpgrades(G.save.state.playerProvince, G.save) * 6,
                                 },
                                 condition: finalizeCondition([
                                    ...timedActionConditions(
                                       { action: "SocialClassFavor" },
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                 ]),
                                 effect: () => {
                                    startTimedAction("SocialClassFavor", G.save.state.playerProvince, G.save);
                                    addSocialClassLoyalty(key, 20, G.save.state.playerProvince, G.save);
                                 },
                              }}
                              tooltip={(element) => (
                                 <>
                                    <TimedActionDescComp action="SocialClassFavor" />
                                    {element}
                                 </>
                              )}
                           >
                              {$t(L.SocialClassFavor)}
                           </ActionButton>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </ModalComp>
   );
}
