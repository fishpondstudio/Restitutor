import { Select } from "@mantine/core";
import { cls, formatDelta, formatNumber, formatPercent, keysOf } from "@project/shared/src/utils/Helper";
import type React from "react";
import { memo } from "react";
import { ChangeRivalAction } from "../game/actions/ChangeRivalAction";
import { AnnexClientAction, RequestMilitaryAidAction, SummonGovernorAction } from "../game/actions/ClientActions";
import {
   CorruptOfficialsAction,
   FabricateCasusBelliAction,
   InciteUnrestAction,
   RevealElectionBackingAction,
   SabotageAction,
   SubvertGarrisonAction,
   UndermineTheirArmyAction,
} from "../game/actions/CovertActions";
import { DemandElectionBackingAction } from "../game/actions/DemandElectionBackingAction";
import { DemandTileCostCondition } from "../game/actions/DemandTileCostCondition";
import { DemandTributeCostCondition } from "../game/actions/DemandTributeCostCondition";
import { DenounceAction } from "../game/actions/DenounceAction";
import type { IGameAction } from "../game/actions/GameAction";
import {
   CancelImproveRelationsAction,
   CancelInfiltrationAction,
   DeterAggressionAction,
   GuaranteeDefenseAction,
   ImproveRelationsAction,
   InfiltrateAction,
   ProclaimCrusadeAction,
   SendAGiftAction,
} from "../game/actions/RelationsActions";
import { CasusBelli } from "../game/definitions/CasusBelli";
import { Culture } from "../game/definitions/Culture";
import { Modifiers } from "../game/definitions/Modifier";
import type { Province } from "../game/definitions/Province";
import { Religion } from "../game/definitions/Religion";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import type { SaveGame } from "../game/GameState";
import { showError } from "../game/logic/AlertLogic";
import {
   getAnnexCostDiscount,
   getAttitudeTowards,
   getDiplomaticDistance,
   getDiplomaticRange,
   getImproveRelationsRate,
   getInfiltrationRate,
   getProvincesThatDeterAggressionOf,
   getProvincesThatGuaranteeDefenseOf,
   getRelation,
   HumiliateRivalCasusBelliMonths,
   isImprovingRelations,
   isInfiltrating,
   MaxImprovedRelations,
   RivalAttitudeDuration,
   RivalAttitudeModifier,
} from "../game/logic/DiplomacyLogic";
import { getProvinceName, getProvincePrestige, getProvinceTileCount, getWarPower } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { getTimedActionCooldownLeft, getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import { getAllies, getClients, getDefensePacts, getPatrons } from "../game/logic/TreatyLogic";
import { getCurrentWars, getTruceMonthsLeft } from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DeclareWarPage } from "./DeclareWarPage";
import { DemandTileModal } from "./DemandTileModal";
import { DemandTributeModal } from "./DemandTributeModal";
import { LookForSpouseModal } from "./LookForSpouseModal";
import { TradeSingletonModal } from "./TradeSingletonModal";
import { TreatyActionButton } from "./TreatyActionButton";
import { DiplomacyActionWidth, DiplomacyWidth, SidebarWidth } from "./UIConstant";
import { WarModal } from "./WarModal";
import { WarTooltip } from "./WarTooltip";

export function DiplomacyPage({ province }: { province: Province }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const theirState = G.save.state.provinces[province];
   if (!theirState) {
      return null;
   }
   const ourState = G.save.state.provinces[G.save.state.playerProvince];
   if (!ourState) {
      return null;
   }
   const usToThem = getRelation(G.save.state.playerProvince, province, G.save);
   const isMe = province === G.save.state.playerProvince;
   const guaranteeDefense = getProvincesThatGuaranteeDefenseOf(province, G.save);
   const deterAggression = getProvincesThatDeterAggressionOf(province, G.save);
   const defensePacts = getDefensePacts(province, G.save);
   const allies = getAllies(province, G.save);
   const patrons = getPatrons(province, G.save);
   const clients = getClients(province, G.save);
   const treatySabotaged = getTimedActionTimeLeft("TreatySabotaged", province, G.save);
   const truceMonthsLeft = getTruceMonthsLeft(G.save.state.playerProvince, province, G.save);
   const wars = getCurrentWars(province, G.save);
   const diplomaticRange = getDiplomaticRange(G.save.state.playerProvince, G.save);
   const diplomaticDistance = getDiplomaticDistance(G.save.state.playerProvince, province, G.save);
   return (
      <SidebarComp
         title={<SidebarHeader title={$t(L.DiplomacyWith$1, getProvinceName(province, G.save))} />}
         width={isMe ? SidebarWidth : DiplomacyWidth}
      >
         <div className="row g0 fstart">
            <div className={cls("f1", isMe ? "" : "box m10")}>
               <div className="h1">{getProvinceName(province, G.save)}</div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Governor)}</div>
                  <div>{theirState.governor.male.name.join(" ")}</div>
               </div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Tiles)}</div>
                  <div>{getProvinceTileCount(province, G.save)}</div>
               </div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Culture)}</div>
                  <div>{Culture[theirState.culture].name()}</div>
               </div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Religion)}</div>
                  <div>{Religion[theirState.religion].name()}</div>
               </div>
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.WarPower)}
                  breakdown={getWarPower(province, G.save)}
                  formatFunc={formatNumber}
               />
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Prestige)}</div>
                  <div>{formatNumber(getProvincePrestige(province, G.save).value)}</div>
               </div>
               {treatySabotaged > 0 && (
                  <FloatingTip
                     label={$t(
                        L.$1sTreatyHasBeenSabotagedFor$2Months,
                        getProvinceName(province, G.save),
                        formatNumber(TimedActions.TreatySabotaged.duration),
                     )}
                  >
                     <div className="row mx10 my5 text-yellow">
                        <div className="f1">{$t(L.TreatySabotaged)}</div>
                        <div>{$t(L.$1MonthsLeft, formatNumber(treatySabotaged))}</div>
                     </div>
                  </FloatingTip>
               )}
               {usToThem && (
                  <>
                     <BreakdownRow
                        className="mx10 my5"
                        name={$t(L.Attitude)}
                        tooltip={(element) => (
                           <>
                              <div className="m10">{$t(L.TheirAttitudeIsDeterminedAsFollows)}</div>
                              {element}
                           </>
                        )}
                        breakdown={getAttitudeTowards(province, G.save.state.playerProvince, G.save)}
                        formatFunc={colorNumber}
                     />
                     <div className="row my5 mx10">
                        <div className="f1">{$t(L.Infiltration)}</div>
                        <div>{formatNumber(usToThem.infiltrate.value)}</div>
                     </div>
                     <BreakdownTooltip
                        breakdown={diplomaticRange}
                        tooltip={(element) => (
                           <>
                              <div className="m10">{Modifiers.DiplomaticRange.desc()}</div>
                              <div className="h2">{Modifiers.DiplomaticRange.name()}</div>
                              {element}
                              <div className="divider" />
                              {diplomaticDistance > diplomaticRange.value ? (
                                 <div className="m10 text-red">
                                    {$t(L.$1IsNotWithinOurDiplomaticRange, getProvinceName(province, G.save))}
                                 </div>
                              ) : (
                                 <div className="m10 text-green">
                                    {$t(L.$1IsWithinOurDiplomaticRange, getProvinceName(province, G.save))}
                                 </div>
                              )}
                           </>
                        )}
                     >
                        <div className="row my5 mx10 g5">
                           <div className="f1">{$t(L.DiplomaticDistance)}</div>
                           {diplomaticDistance > diplomaticRange.value && <div className="mi sm text-red">error</div>}
                           <div>{formatNumber(diplomaticDistance)}</div>
                        </div>
                     </BreakdownTooltip>
                     {truceMonthsLeft > 0 && (
                        <FloatingTip
                           label={$t(
                              L.WeAreInATruceWith$1For$2Months,
                              getProvinceName(province, G.save),
                              formatNumber(truceMonthsLeft),
                           )}
                        >
                           <div className="row mx10 my5 text-yellow">
                              <div className="f1">{$t(L.Truce)}</div>
                              <div>{$t(L.$1MonthsLeft, formatNumber(truceMonthsLeft))}</div>
                           </div>
                        </FloatingTip>
                     )}
                     <div className="divider my5" />
                     <div className="mx10 my5 text-display">{$t(L.CasusBelli)}</div>
                     {Array.from(usToThem.casusBelli).map(([cb, data]) => {
                        const effect = CasusBelli[cb].effect;
                        return (
                           <FloatingTip
                              key={cb}
                              disabled={!effect}
                              label={
                                 <>
                                    {$t(L.CasusBelliEffect)} {effect?.()}
                                 </>
                              }
                           >
                              <div className="row mx10 my5 text-sm text-red">
                                 <div className="f1">{CasusBelli[cb].name()}</div>
                                 <div className="text-italic">{$t(L.$1MonthsLeft, formatNumber(data.monthsLeft))}</div>
                              </div>
                           </FloatingTip>
                        );
                     })}
                  </>
               )}
               {wars.length > 0 && (
                  <>
                     <div className="divider my5" />
                     <div className="mx10 my5 text-display">{$t(L.OngoingWars)}</div>
                     {wars.map((war, idx) => {
                        return (
                           <FloatingTip className="p0" fixedWidth key={idx} label={<WarTooltip war={war} />}>
                              <div
                                 className={cls("row mx10 my5 text-sm", isMe ? "pointer" : null)}
                                 onClick={() => {
                                    if (isMe) {
                                       showPanel(WarModal, { war });
                                    }
                                 }}
                              >
                                 <div className="f1 text-red">
                                    {$t(
                                       L.$1$2War,
                                       getProvinceName(war.attacker, G.save),
                                       getProvinceName(war.defender, G.save),
                                    )}
                                 </div>
                                 {isMe && <div className="mi xs">open_in_new</div>}
                              </div>
                           </FloatingTip>
                        );
                     })}
                  </>
               )}
               <FloatingTip
                  label={
                     <ul>
                        <li>
                           {$t(
                              L.OurRivalWillHave$1AttitudeFor$2Months,
                              formatDelta(RivalAttitudeModifier),
                              formatNumber(RivalAttitudeDuration),
                           )}
                        </li>
                        <li>
                           {html(
                              $t(
                                 L.OurRivalWillGet$1CasusBelliFor$2Months,
                                 CasusBelli.HumiliateRival.name(),
                                 formatNumber(HumiliateRivalCasusBelliMonths),
                              ),
                           )}
                        </li>
                        <li>{html($t(L.WinningAWarAgainstOurRivalGives$1PrestigeFor$2Months, "25", "120"))}</li>
                        <li>{$t(L.DenouncingARivalGains$1PrestigeInsteadOf$2, "20", "10")}</li>
                        <li>{$t(L.DeterringARivalsAggressionIncreasesPrestigeBy$1InsteadOf$2, "20", "10")}</li>
                        <li>
                           {$t(
                              L.ChangingRivalCanOnlyBeDoneOnceEvery$1Months,
                              formatNumber(TimedActions.ChangeRival.cooldown),
                           )}
                        </li>
                     </ul>
                  }
               >
                  <div className="h1 row">
                     <div className="f1">{$t(L.Rivals)}</div>
                     <div className="mi sm">info</div>
                  </div>
               </FloatingTip>
               {isMe ? (
                  <div className="m10 col stretch g5">
                     <SelectRival province={province} index={0} />
                     <SelectRival province={province} index={1} />
                  </div>
               ) : (
                  <div className="mx10">
                     {theirState.rivals.map((rival) => {
                        if (!rival) return null;
                        return (
                           <div key={rival} className="row my5">
                              <div className="f1">{getProvinceName(rival, G.save)}</div>
                              <ViewProvinceButton province={rival} />
                           </div>
                        );
                     })}
                     {theirState.rivals.filter(Boolean).length === 0 && (
                        <div className="my5 text-dimmed text-italic">{$t(L.None)}</div>
                     )}
                  </div>
               )}
               {guaranteeDefense.length > 0 && (
                  <>
                     <div className="h1">{$t(L.DefenseGuaranteedBy)}</div>
                     {guaranteeDefense.map((p) => (
                        <div key={p} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(p, G.save)}</div>
                           <ViewProvinceButton province={p} />
                        </div>
                     ))}
                  </>
               )}
               {deterAggression.length > 0 && (
                  <>
                     <div className="h1">{$t(L.AggressionDeterredBy)}</div>
                     {deterAggression.map((p) => (
                        <div key={p} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(p, G.save)}</div>
                           <ViewProvinceButton province={p} />
                        </div>
                     ))}
                  </>
               )}
               {defensePacts.length > 0 && (
                  <>
                     <div className="h1">{$t(L.DefensePacts)}</div>
                     {defensePacts.map((defensePact) => (
                        <div key={defensePact} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(defensePact, G.save)}</div>
                           {!isMe && <SabotageButton fromProvince={province} toProvince={defensePact} />}
                           <ViewProvinceButton province={defensePact} />
                        </div>
                     ))}
                  </>
               )}
               {allies.length > 0 && (
                  <>
                     <div className="h1">{$t(L.Allies)}</div>
                     {allies.map((ally) => (
                        <div key={ally} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(ally, G.save)}</div>
                           {!isMe && <SabotageButton fromProvince={province} toProvince={ally} />}
                           <ViewProvinceButton province={ally} />
                        </div>
                     ))}
                  </>
               )}
               {patrons.length > 0 && (
                  <>
                     <div className="h1">{$t(L.Patrons)}</div>
                     {patrons.map((patron) => (
                        <div key={patron} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(patron, G.save)}</div>
                           <ViewProvinceButton province={patron} />
                        </div>
                     ))}
                  </>
               )}
               {clients.length > 0 && (
                  <>
                     <div className="h1">{$t(L.Clients)}</div>
                     {clients.map((client) => (
                        <div key={client} className="row g5 mx10 my5">
                           <div className="f1">{getProvinceName(client, G.save)}</div>
                           <ViewProvinceButton province={client} />
                        </div>
                     ))}
                  </>
               )}
            </div>
            <DiplomacyActions province={province} />
         </div>
      </SidebarComp>
   );
}

function DiplomacyActions({ province }: { province: Province }): React.ReactNode {
   const theirState = G.save.state.provinces[province];
   if (!theirState) {
      return null;
   }
   const ourState = G.save.state.provinces[G.save.state.playerProvince];
   if (!ourState) {
      return null;
   }
   const usToThem = getRelation(G.save.state.playerProvince, province, G.save);
   if (!usToThem) {
      return null;
   }
   const themToUs = getRelation(province, G.save.state.playerProvince, G.save);
   if (!themToUs) {
      return null;
   }
   const consulVotes = G.save.state.senate.votes.get(province) ?? new Set<number>();
   return (
      <div className="box m10" style={{ width: DiplomacyActionWidth, marginLeft: 0 }}>
         <div className="m10 col stretch g5">
            <FloatingTip label={$t(L.WeWillConfirmDeclaringWarInTheNextScreen)}>
               <button
                  id={`DiplomacyPage_DeclareWar_${province}`}
                  className="btn py2 red"
                  onClick={() => {
                     showPanel(DeclareWarPage, { province });
                  }}
               >
                  {$t(L.DeclareWar)}
               </button>
            </FloatingTip>
         </div>
         <div className="h1 row">
            <div className="f1">{$t(L.Treaties)}</div>
            <FloatingTip
               style={{ maxWidth: "25rem" }}
               label={
                  <>
                     <div className="text-sm">{$t(L.ObligationOfOtherPartyInCaseOfWar)}</div>
                     <div className="h10" />
                     <AllianceTableComp />
                  </>
               }
            >
               <div className="mi sm">info</div>
            </FloatingTip>
         </div>
         <div className="m10 col stretch g5">
            <TreatyActionButton
               ourProvince={G.save.state.playerProvince}
               theirProvince={province}
               treaty="DefensePact"
            />
            <TreatyActionButton ourProvince={G.save.state.playerProvince} theirProvince={province} treaty="Alliance" />
            <TreatyActionButton ourProvince={G.save.state.playerProvince} theirProvince={province} treaty="Patron" />
         </div>
         <div className="h1">{$t(L.RelationsActions)}</div>
         <div className="m10 col stretch g5">
            <RelationsActionButton
               province={province}
               isDoingTooltip={html($t(L.CancellingImproveRelationsFreesADiplomat))}
               tooltip={(element) => {
                  const rate = getImproveRelationsRate(province, G.save);
                  return (
                     <>
                        <div className="m10">
                           {$t(
                              L.ImprovingRelationsIncreasesAttitudeBy$1PerMonthMax$2,
                              formatNumber(rate.value),
                              MaxImprovedRelations,
                           )}
                        </div>
                        <div className="h2">{Modifiers.ImproveRelationsRate.name()}</div>
                        <BreakdownComp breakdown={rate} />
                        {element}
                     </>
                  );
               }}
               isDoingFunc={isImprovingRelations}
               cancelActionFunc={CancelImproveRelationsAction}
               actionFunc={ImproveRelationsAction}
               doLabel={$t(L.ImproveRelations)}
               cancelLabel={$t(L.CancelImproveRelations)}
            />
            <button
               className="btn py2"
               onClick={() => showPanel(LookForSpouseModal, { family: ourState.governor, province })}
            >
               {$t(L.OfferMarriage)}
            </button>
            <button
               className="btn py2"
               onClick={() => showPanel(TradeSingletonModal, { provinces: new Set([province]) })}
            >
               {$t(L.TradeGoods)}
            </button>
            <ActionButton
               className="py2"
               action={GuaranteeDefenseAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="GuaranteeDefense" />
                     {element}
                  </>
               )}
            >
               {TimedActions.GuaranteeDefense.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={DeterAggressionAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="DeterAggression" />
                     {element}
                  </>
               )}
            >
               {$t(L.DeterAggression)}
            </ActionButton>
            <ActionButton
               className="py2"
               action={DenounceAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="Denounce" />
                     {element}
                  </>
               )}
            >
               {TimedActions.Denounce.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={SendAGiftAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="SendAGift" />
                     {element}
                  </>
               )}
            >
               {$t(L.SendAGift)}
            </ActionButton>
            <ActionButton
               className="py2"
               action={ProclaimCrusadeAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="ProclaimCrusade" />
                     {element}
                  </>
               )}
            >
               {TimedActions.ProclaimCrusade.name()}
            </ActionButton>
         </div>
         {getPatrons(province, G.save).includes(G.save.state.playerProvince) && (
            <>
               <div className="h1">{$t(L.ClientActions)}</div>
               <div className="m10 col stretch g5">
                  <ActionButton
                     className="py2"
                     action={SummonGovernorAction(G.save.state.playerProvince, province, G.save)}
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="SummonGovernor" />
                           {element}
                        </>
                     )}
                  >
                     {TimedActions.SummonGovernor.name()}
                  </ActionButton>
                  <ActionButton
                     className="py2"
                     action={RequestMilitaryAidAction(G.save.state.playerProvince, province, G.save)}
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="RequestMilitaryAid" />
                           {element}
                        </>
                     )}
                  >
                     {TimedActions.RequestMilitaryAid.name()}
                  </ActionButton>
                  <ActionButton
                     className="py2"
                     action={AnnexClientAction(G.save.state.playerProvince, province, G.save)}
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="AnnexClient" />
                           {element}
                           <div className="h2">{Modifiers.AnnexCostDiscount.name()}</div>
                           <BreakdownComp
                              breakdown={getAnnexCostDiscount(G.save.state.playerProvince, province, G.save)}
                              formatFunc={formatPercent}
                           />
                        </>
                     )}
                  >
                     {TimedActions.AnnexClient.name()}
                  </ActionButton>
               </div>
            </>
         )}
         <div className="h1">{$t(L.CovertActions)}</div>
         <div className="m10 col stretch g5">
            <RelationsActionButton
               province={province}
               isDoingTooltip={html($t(L.CancellingInfiltrateFreesADiplomat))}
               tooltip={(element) => {
                  const rate = getInfiltrationRate(province, G.save);
                  return (
                     <>
                        <div className="m10">
                           {html($t(L.InfiltratingProvinceIncreasesInfiltrationBy$1PerMonth, formatNumber(rate.value)))}
                        </div>
                        <div className="h2">{Modifiers.InfiltrationRate.name()}</div>
                        <BreakdownComp breakdown={rate} />
                        {element}
                     </>
                  );
               }}
               isDoingFunc={isInfiltrating}
               cancelActionFunc={CancelInfiltrationAction}
               actionFunc={InfiltrateAction}
               doLabel={$t(L.Infiltrate)}
               doId={`DiplomacyPage_Infiltrate_${province}`}
               cancelLabel={$t(L.CancelInfiltrate)}
            />
            <ActionButton
               className="py2"
               action={FabricateCasusBelliAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="FabricateCasusBelli" />
                     {element}
                  </>
               )}
            >
               {TimedActions.FabricateCasusBelli.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={UndermineTheirArmyAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="UndermineTheirArmy" />
                     {element}
                  </>
               )}
            >
               {TimedActions.UndermineTheirArmy.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={CorruptOfficialsAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="CorruptOfficials" />
                     {element}
                  </>
               )}
            >
               {TimedActions.CorruptOfficials.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={SubvertGarrisonAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="SubvertGarrison" />
                     {element}
                  </>
               )}
            >
               {TimedActions.SubvertGarrison.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={InciteUnrestAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="InciteUnrest" />
                     {element}
                  </>
               )}
            >
               {TimedActions.InciteUnrest.name()}
            </ActionButton>
            <ActionButton
               className="py2"
               action={RevealElectionBackingAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     {usToThem.revealElectionBacking && (
                        <>
                           <div className="m10 text-green">
                              {$t(L.InTheUpcomingConsulElectionTheyPledgeSupportTo)}{" "}
                              <ul>
                                 {Array.from(consulVotes).map((vote) => (
                                    <li key={vote}>{G.save.state.senate.consulCandidates[vote]}</li>
                                 ))}
                              </ul>
                           </div>
                           <div className="divider" />
                        </>
                     )}
                     <TimedActionDescComp action="RevealElectionBacking" />
                     {element}
                  </>
               )}
            >
               {TimedActions.RevealElectionBacking.name()}
            </ActionButton>
         </div>
         <div className="h1">{$t(L.GreatPowerActions)}</div>
         <div className="m10 col stretch g5">
            <ActionButton
               className="btn py2"
               action={{
                  ...DemandTileCostCondition(G.save.state.playerProvince, province, [], G.save),
                  effect: () => showPanel(DemandTileModal, { province }),
               }}
            >
               {$t(L.DemandATile)}
            </ActionButton>
            <ActionButton
               className="btn py2"
               action={{
                  ...DemandTributeCostCondition(G.save.state.playerProvince, province, G.save),
                  effect: () => showPanel(DemandTributeModal, { province }),
               }}
            >
               {TimedActions.DemandTribute.name()}
            </ActionButton>
            <ActionButton
               className="btn py2"
               action={DemandElectionBackingAction(G.save.state.playerProvince, province, G.save)}
               tooltip={(element) => (
                  <>
                     <TimedActionDescComp action="DemandElectionBacking" />
                     {element}
                  </>
               )}
            >
               {TimedActions.DemandElectionBacking.name()}
            </ActionButton>
         </div>
      </div>
   );
}

function SelectRival({ province, index }: { province: Province; index: number }): React.ReactNode {
   const state = G.save.state.provinces[province];
   if (!state) {
      return null;
   }
   return (
      <Select
         className={cls(state.rivals[index] ? null : "DiplomacyPage_SelectRival")}
         data={keysOf(G.save.state.provinces)
            .filter((p) => p !== province)
            .sort((a, b) => getProvinceName(a, G.save).localeCompare(getProvinceName(b, G.save)))
            .map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
         checkIconPosition="right"
         allowDeselect={false}
         value={state.rivals[index]}
         disabled={getTimedActionCooldownLeft("ChangeRival", province, G.save) > 0 && state.rivals[index] !== null}
         onChange={(value) => {
            const selected = value as Province;
            const action = ChangeRivalAction(province, index, selected, G.save);
            const failedCondition = action.condition?.breakdown.find((condition) => !condition.value);
            if (failedCondition) {
               showError(failedCondition.name);
               return;
            }
            action.effect({ headless: false });
            GameStateUpdated.emit();
         }}
         searchable
      />
   );
}

function AllianceTableComp(): React.ReactNode {
   return (
      <>
         <table className="data-table">
            <thead>
               <tr>
                  <th></th>
                  <th>{$t(L.WeAttack)}</th>
                  <th>{$t(L.TheyAttack)}</th>
                  <th>{$t(L.WeDefend)}</th>
                  <th>{$t(L.TheyDefend)}</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td>{$t(L.OfferProtection)}</td>
                  <td>
                     <div className="mi sm">close</div>
                  </td>
                  <td>
                     <div className="mi sm">close</div>
                  </td>
                  <td>
                     <div className="mi sm">close</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
               </tr>
               <tr>
                  <td>{$t(L.OfferDefensePact)}</td>
                  <td>
                     <div className="mi sm">close</div>
                  </td>
                  <td>
                     <div className="mi sm">close</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
               </tr>
               <tr>
                  <td>{$t(L.OfferAlliance)}</td>
                  <td>
                     <div className="mi sm">question_mark</div>
                  </td>
                  <td>
                     <div className="mi sm">question_mark</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
               </tr>
               <tr>
                  <td>{$t(L.OfferPatronage)}</td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
                  <td>
                     <div className="mi sm">remove</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
                  <td>
                     <div className="mi sm">check</div>
                  </td>
               </tr>
            </tbody>
         </table>
         <div className="h10" />
         <div>
            <div className="mi sm inline">close</div> {$t(L.NoObligationToJoinWar)}
         </div>
         <div>
            <div className="mi sm inline">check</div> {$t(L.ObligationToJoinWar)}
         </div>
         <div>
            <div className="mi sm inline">question_mark</div> {$t(L.CallToArmsCanBeIgnoredWithPenalty)}
         </div>
         <div>
            <div className="mi sm inline">remove</div> {$t(L.ActionNotAvailable)}
         </div>
      </>
   );
}

function RelationsActionButton({
   province,
   isDoingTooltip,
   isDoingFunc,
   cancelActionFunc,
   actionFunc,
   doLabel,
   doId,
   cancelLabel,
   tooltip,
}: {
   province: Province;
   isDoingTooltip: React.ReactNode;
   isDoingFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => boolean;
   cancelActionFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => IGameAction;
   actionFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => IGameAction;
   doLabel: React.ReactNode;
   doId?: string;
   cancelLabel: React.ReactNode;
   tooltip: (element: React.ReactNode) => React.ReactNode;
}): React.ReactNode {
   const ourProvince = G.save.state.playerProvince;
   if (isDoingFunc(ourProvince, province, G.save)) {
      const action = cancelActionFunc(ourProvince, province, G.save);
      return (
         <button
            className="btn py2"
            onClick={() => {
               action.effect({ headless: false });
               GameStateUpdated.emit();
            }}
         >
            <FloatingTip label={isDoingTooltip}>
               <div>{cancelLabel}</div>
            </FloatingTip>
         </button>
      );
   }
   return (
      <ActionButton action={actionFunc(ourProvince, province, G.save)} tooltip={tooltip} className="py2" id={doId}>
         {doLabel}
      </ActionButton>
   );
}

function SabotageButton({
   fromProvince,
   toProvince,
}: {
   fromProvince: Province;
   toProvince: Province;
}): React.ReactNode {
   return (
      <ActionButton
         className="text-sm"
         action={SabotageAction(fromProvince, toProvince, G.save)}
         tooltip={(element) => (
            <>
               <div className="m10">
                  {html(
                     $t(
                        L.SabotageDescription$1$2$3$4,
                        getProvinceName(fromProvince, G.save),
                        getProvinceName(toProvince, G.save),
                        getProvinceName(fromProvince, G.save),
                        formatNumber(TimedActions.TreatySabotaged.duration),
                     ),
                  )}
               </div>
               {element}
            </>
         )}
      >
         {$t(L.Sabotage)}
      </ActionButton>
   );
}

export const ViewProvinceButton = memo(_ViewProvinceButton, (prev, next) => {
   return prev.province === next.province;
});
function _ViewProvinceButton({ province }: { province: Province }): React.ReactNode {
   const state = G.save.state.provinces[province];
   if (!state) {
      return null;
   }
   return (
      <button
         className="btn text-sm"
         onClick={() => {
            showPanel(DiplomacyPage, { province });
            G.scene
               .getCurrent(WorldScene)
               ?.lookAt(state.capital, { time: 0.2 })
               .then((scene) => scene.drawProvinceOutline(province));
         }}
      >
         {$t(L.View)}
      </button>
   );
}
