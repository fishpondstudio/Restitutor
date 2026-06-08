import { Select } from "@mantine/core";
import { cls, formatDelta, formatNumber, keysOf, type Tile } from "@project/shared/src/utils/Helper";
import type React from "react";
import { memo } from "react";
import { DemandTileCostCondition } from "../game/actions/DemandTileCostCondition";
import { DemandTributeCostCondition } from "../game/actions/DemandTributeCostCondition";
import type { IConditionBreakdown, IValueBreakdownItem } from "../game/actions/GameAction";
import { finalizeCondition } from "../game/actions/GameAction";
import { CasusBelli } from "../game/definitions/CasusBelli";
import { Culture } from "../game/definitions/Culture";
import { Modifiers } from "../game/definitions/Modifier";
import type { Province } from "../game/definitions/Province";
import { Religion } from "../game/definitions/Religion";
import { isTileBorderingProvince } from "../game/definitions/Tile";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated, RefreshTiles } from "../game/Events";
import type { SaveGame } from "../game/GameState";
import { showError } from "../game/logic/AlertLogic";
import {
   addAttitudeModifier,
   cancelImproveRelations,
   cancelInfiltration,
   canImproveRelations,
   canInfiltrate,
   FabricateCasusBelliCost,
   getAttitudeTowards,
   getDiplomaticAnnexationCost,
   getDiplomaticDistance,
   getDiplomaticRange,
   getProvincesThatDeterAggressionOf,
   getProvincesThatGuaranteeDefenseOf,
   getRelation,
   HumiliateRivalCasusBelliMonths,
   InciteUnrestCost,
   improveRelations,
   infiltrate,
   isClientOfAnyProvince,
   isImprovingRelations,
   isInfiltrating,
   isWithinDiplomaticRange,
   MaxImprovedRelations,
   RevealElectionSupportCost,
   RivalAttitudeDuration,
   RivalAttitudeModifier,
   requireInfiltration,
   SubvertGarrisonCost,
   tryUseInfiltration,
   UndermineArmyCost,
} from "../game/logic/DiplomacyLogic";
import { addModifier } from "../game/logic/ModifierLogic";
import {
   addProvinceStat,
   getProvinceName,
   getProvincePrestige,
   getProvinceStat,
   getProvincesInRange,
   getProvinceTileCount,
   getProvinceUpgrade,
   getWarPower,
   isGreatPowerCondition,
   isNorGreatPowerCondition,
} from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import {
   getTimedActionCooldownLeft,
   getTimedActionTimeLeft,
   startTimedAction,
   timedActionConditions,
} from "../game/logic/TimedActionLogic";
import {
   CancelAlliancePenaltyItem,
   CancelDefensePactPenaltyItem,
   CancelPatronagePenaltyItem,
   cancelAlliance,
   cancelDefensePact,
   cancelPatronage,
   canOfferAlliance,
   canOfferDefensePact,
   canOfferPatronage,
   canSabotage,
   getAllies,
   getClients,
   getDefensePacts,
   getPatrons,
   getTreatyMonthLeft,
   hasOfferedAlliance,
   hasOfferedDefensePact,
   hasOfferedPatronage,
   requireHigherPrestige,
   tryOfferAlliance,
   tryOfferDefensePact,
   tryOfferPatronage,
   trySabotage,
} from "../game/logic/TreatyLogic";
import { getCurrentWars, getTruceMonthsLeft, getWarsBetween } from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { showModal } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { ValueListComp } from "./BreakdownComp";
import { BreakdownRow, BreakdownTooltip } from "./BreakdownRow";
import { showSidebar } from "./common/Sidebar";
import { SidebarComp, SidebarWidth } from "./common/SidebarComp";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DeclareWarPage } from "./DeclareWarPage";
import { DemandTileModal } from "./DemandTileModal";
import { DemandTribute } from "./DemandTribute";
import { LookForSpouseModal } from "./LookForSpouseModal";
import { playClick, playError } from "./Sound";
import { TradeModal } from "./TradeModal";
import { WarTooltip } from "./WarTooltip";

const ActionWidth = 250;

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
   if (!usToThem) {
      return null;
   }
   const themToUs = getRelation(province, G.save.state.playerProvince, G.save);
   if (!themToUs) {
      return null;
   }
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
   const consulVotes = G.save.state.senate.votes.get(province) ?? new Set<number>();
   return (
      <SidebarComp
         title={$t(L.DiplomacyWithX, getProvinceName(province, G.save))}
         width={isMe ? SidebarWidth : SidebarWidth + ActionWidth}
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
               <BreakdownRow
                  className="mx10 my5"
                  name={$t(L.WarPower)}
                  breakdown={getWarPower(province, G.save)}
                  formatFunc={formatNumber}
               />
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Culture)}</div>
                  <div>{Culture[theirState.culture].name()}</div>
               </div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Religion)}</div>
                  <div>{Religion[theirState.religion].name()}</div>
               </div>
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Prestige)}</div>
                  <div>{formatNumber(getProvincePrestige(province, G.save).value)}</div>
               </div>
               {!isMe && (
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
               )}
               <div className="row my5 mx10">
                  <div className="f1">{$t(L.Infiltration)}</div>
                  <div>{formatNumber(usToThem.infiltrate.value)}</div>
               </div>
               {!isMe && (
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
                                 {$t(L.XIsNotWithinOurDiplomaticRange, getProvinceName(province, G.save))}
                              </div>
                           ) : (
                              <div className="m10 text-green">
                                 {$t(L.XIsWithinOurDiplomaticRange, getProvinceName(province, G.save))}
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
               )}
               {treatySabotaged > 0 && (
                  <FloatingTip
                     label={$t(
                        L.XsTreatyHasBeenSabotagedForYMonths,
                        getProvinceName(province, G.save),
                        formatNumber(TimedActions.TreatySabotaged.duration),
                     )}
                  >
                     <div className="row mx10 my5 text-yellow">
                        <div className="f1">{$t(L.TreatySabotaged)}</div>
                        <div>{$t(L.XMonthsLeft, formatNumber(treatySabotaged))}</div>
                     </div>
                  </FloatingTip>
               )}
               {truceMonthsLeft > 0 && (
                  <FloatingTip
                     label={$t(
                        L.WeAreInATruceWithXForYMonths,
                        getProvinceName(province, G.save),
                        formatNumber(truceMonthsLeft),
                     )}
                  >
                     <div className="row mx10 my5 text-yellow">
                        <div className="f1">{$t(L.Truce)}</div>
                        <div>{$t(L.XMonthsLeft, formatNumber(truceMonthsLeft))}</div>
                     </div>
                  </FloatingTip>
               )}
               {usToThem.casusBelli.size > 0 && (
                  <>
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
                                 <div className="text-italic">{$t(L.XMonthsLeft, formatNumber(data.monthsLeft))}</div>
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
                           <FloatingTip className="p0" w={300} key={idx} label={<WarTooltip war={war} />}>
                              <div className="mx10 my5 text-sm text-red">
                                 {$t(
                                    L.XYWar,
                                    getProvinceName(war.attacker, G.save),
                                    getProvinceName(war.defender, G.save),
                                 )}
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
                              L.OurRivalWillHaveXAttitudeForYMonths,
                              formatDelta(RivalAttitudeModifier),
                              formatNumber(RivalAttitudeDuration),
                           )}
                        </li>
                        <li>
                           {html(
                              $t(
                                 L.OurRivalWillGetXCasusBelliForYMonths,
                                 CasusBelli.HumiliateRival.name(),
                                 formatNumber(HumiliateRivalCasusBelliMonths),
                              ),
                           )}
                        </li>
                        <li>{html($t(L.WinningAWarAgainstOurRivalGivesXPrestigeForYMonths, "25", "120"))}</li>
                        <li>{$t(L.DenouncingARivalGainsXPrestigeInsteadOfY, "20", "10")}</li>
                        <li>{$t(L.DeterringARivalsAggressionIncreasesPrestigeByXInsteadOfY, "20", "10")}</li>
                        <li>
                           {$t(
                              L.ChangingRivalCanOnlyBeDoneOnceEveryXMonths,
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
                           <div className="mi sm">arrow_circle_right</div>
                           <ViewProvinceButton province={client} />
                        </div>
                     ))}
                  </>
               )}
            </div>
            {!isMe && (
               <div className="box m10" style={{ width: ActionWidth, marginLeft: 0 }}>
                  <div className="m10 col stretch g5">
                     <FloatingTip label={$t(L.WeWillConfirmDeclaringWarInTheNextScreen)}>
                        <button
                           id={`DiplomacyPage_DeclareWar_${province}`}
                           className="btn py2 red"
                           onClick={() => {
                              showSidebar(<DeclareWarPage province={province} />);
                           }}
                        >
                           {$t(L.DeclareWar)}
                        </button>
                     </FloatingTip>
                  </div>
                  <div className="h1 row">
                     <div className="f1">{$t(L.Treaties)}</div>
                     <FloatingTip
                        w={400}
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
                        province={province}
                        hasOfferedFunc={hasOfferedDefensePact}
                        cancelFunc={cancelDefensePact}
                        canOfferFunc={canOfferDefensePact}
                        tryOfferFunc={tryOfferDefensePact}
                        offerLabel={$t(L.OfferDefensePact)}
                        cancelLabel={$t(L.CancelDefensePact)}
                        cancelPenalty={[CancelDefensePactPenaltyItem]}
                     />
                     <TreatyActionButton
                        province={province}
                        hasOfferedFunc={hasOfferedAlliance}
                        cancelFunc={cancelAlliance}
                        canOfferFunc={canOfferAlliance}
                        tryOfferFunc={tryOfferAlliance}
                        offerLabel={$t(L.OfferAlliance)}
                        cancelLabel={$t(L.CancelAlliance)}
                        cancelPenalty={[CancelAlliancePenaltyItem]}
                     />
                     <TreatyActionButton
                        province={province}
                        hasOfferedFunc={hasOfferedPatronage}
                        cancelFunc={cancelPatronage}
                        canOfferFunc={canOfferPatronage}
                        tryOfferFunc={tryOfferPatronage}
                        offerLabel={$t(L.OfferPatronage)}
                        offerTooltip={<div className="m10">{$t(L.IfTheyAcceptPatronageTheyBecomeOurClient)}</div>}
                        cancelLabel={$t(L.CancelPatronage)}
                        cancelPenalty={[CancelPatronagePenaltyItem]}
                     />
                  </div>
                  <div className="h1">{$t(L.RelationsActions)}</div>
                  <div className="m10 col stretch g5">
                     <RelationsActionButton
                        province={province}
                        isDoingTooltip={html($t(L.CancellingImproveRelationsFreesADiplomat))}
                        tooltip={(element) => (
                           <>
                              <div className="m10">
                                 {$t(L.ImprovingRelationsIncreasesAttitudeByXPerMonthMaxY, "1", MaxImprovedRelations)}
                              </div>
                              {element}
                           </>
                        )}
                        isDoingFunc={isImprovingRelations}
                        cancelFunc={cancelImproveRelations}
                        canDoFunc={canImproveRelations}
                        doFunc={improveRelations}
                        doLabel={$t(L.ImproveRelations)}
                        cancelLabel={$t(L.CancelImproveRelations)}
                     />
                     <button
                        className="btn py2"
                        onClick={() => showModal(<LookForSpouseModal family={ourState.governor} province={province} />)}
                     >
                        {$t(L.OfferMarriage)}
                     </button>
                     <button
                        className="btn py2"
                        onClick={() => showModal(<TradeModal provinces={new Set([province])} />)}
                     >
                        {$t(L.TradeGoods)}
                     </button>
                     <ActionButton
                        className="py2"
                        action={{
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "GuaranteeDefense" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 isWithinDiplomaticRange(G.save.state.playerProvince, province, G.save),
                                 {
                                    name: $t(L.WeAreNotAtWarWithThem),
                                    value: getWarsBetween(G.save.state.playerProvince, province, G.save).length === 0,
                                 },
                                 {
                                    name: $t(L.WeHaventGuaranteedTheirDefense),
                                    value: usToThem.guaranteeDefense === undefined,
                                 },
                                 {
                                    name: $t(L.WeHaveNoTreatyWithThem),
                                    value: usToThem.treaty === undefined,
                                 },
                                 requireHigherPrestige(G.save.state.playerProvince, province, 1, G.save),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("GuaranteeDefense", G.save.state.playerProvince, G.save);
                              addAttitudeModifier(
                                 province,
                                 G.save.state.playerProvince,
                                 {
                                    type: "add",
                                    name: $t(
                                       L.GuaranteedDefenseByX,
                                       getProvinceName(G.save.state.playerProvince, G.save),
                                    ),
                                    value: 50,
                                    duration: TimedActions.GuaranteeDefense.duration,
                                 },
                                 G.save,
                              );
                           },
                        }}
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
                        action={{
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "DeterAggression" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 isWithinDiplomaticRange(G.save.state.playerProvince, province, G.save),
                                 {
                                    name: $t(L.WeHaventAlreadyDeterredTheirAggression),
                                    value: usToThem.deterAggression === undefined,
                                 },
                                 requireHigherPrestige(G.save.state.playerProvince, province, 1, G.save),
                                 {
                                    name: $t(L.TheyAreNotAClientOfAnotherProvince),
                                    value: !isClientOfAnyProvince(province, G.save),
                                 },
                              ],
                           }),
                           effect: () => {
                              startTimedAction("DeterAggression", G.save.state.playerProvince, G.save);
                              usToThem.deterAggression = G.save.state.month;
                              addModifier({
                                 modifier: "Prestige",
                                 type: "multiply",
                                 name: $t(L.DeterredXsAggression, getProvinceName(province, G.save)),
                                 value: ourState.rivals.includes(province) ? 0.2 : 0.1,
                                 duration: TimedActions.DeterAggression.duration,
                                 province: G.save.state.playerProvince,
                                 save: G.save,
                              });
                           },
                        }}
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
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * TimedActions.SendAGift.duration },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions({ action: "SendAGift" }, G.save.state.playerProvince, G.save),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("SendAGift", G.save.state.playerProvince, G.save);
                              addAttitudeModifier(
                                 province,
                                 G.save.state.playerProvince,
                                 {
                                    type: "add",
                                    name: $t(
                                       L.ReceivedAGiftFromX,
                                       getProvinceName(G.save.state.playerProvince, G.save),
                                    ),
                                    value: 25,
                                    duration: TimedActions.SendAGift.duration,
                                 },
                                 G.save,
                              );
                           },
                        }}
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
                        action={{
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "ProclaimCrusade" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 {
                                    name: $t(L.OurReligionIsChristianity),
                                    value: ourState.religion === "Christianity",
                                 },
                                 {
                                    name: $t(L.TheirReligionIsNotChristianity),
                                    value: theirState.religion !== "Christianity",
                                 },
                              ],
                           }),
                           effect: () => {
                              startTimedAction("ProclaimCrusade", G.save.state.playerProvince, G.save);
                           },
                        }}
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
                  {patrons.includes(G.save.state.playerProvince) && (
                     <>
                        <div className="h1">{$t(L.ClientActions)}</div>
                        <div className="m10 col stretch g5">
                           <ActionButton
                              className="py2"
                              action={{
                                 condition: finalizeCondition({
                                    breakdown: [
                                       ...timedActionConditions(
                                          { action: "SummonGovernor" },
                                          G.save.state.playerProvince,
                                          G.save,
                                       ),
                                       {
                                          name: $t(L.TheyAreOurClient),
                                          value:
                                             getRelation(G.save.state.playerProvince, province, G.save)?.treaty
                                                ?.type === "Patron" &&
                                             getRelation(province, G.save.state.playerProvince, G.save)?.treaty
                                                ?.type === "Client",
                                       },
                                       {
                                          name: $t(L.WeAreNotAtWarWithThem),
                                          value:
                                             getWarsBetween(G.save.state.playerProvince, province, G.save).length === 0,
                                       },
                                    ],
                                 }),
                                 effect: () => {
                                    startTimedAction("SummonGovernor", G.save.state.playerProvince, G.save);
                                    addModifier({
                                       modifier: "Prestige",
                                       type: "multiply",
                                       name: $t(
                                          L.XSummonedYsGovernor,
                                          getProvinceName(G.save.state.playerProvince, G.save),
                                          getProvinceName(province, G.save),
                                       ),
                                       value: 0.1,
                                       duration: TimedActions.SummonGovernor.duration,
                                       province: G.save.state.playerProvince,
                                       save: G.save,
                                    });
                                    addModifier({
                                       modifier: "Prestige",
                                       type: "multiply",
                                       name: $t(
                                          L.XSummonedYsGovernor,
                                          getProvinceName(province, G.save),
                                          getProvinceName(G.save.state.playerProvince, G.save),
                                       ),
                                       value: -0.1,
                                       duration: TimedActions.SummonGovernor.duration,
                                       province: province,
                                       save: G.save,
                                    });
                                 },
                              }}
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
                              action={{
                                 condition: finalizeCondition({
                                    breakdown: [
                                       ...timedActionConditions(
                                          { action: "RequestMilitaryAid" },
                                          G.save.state.playerProvince,
                                          G.save,
                                       ),
                                       {
                                          name: $t(L.TheyAreOurClient),
                                          value:
                                             usToThem.treaty?.type === "Patron" && themToUs.treaty?.type === "Client",
                                       },
                                       {
                                          name: $t(L.WeAreNotAtWarWithThem),
                                          value:
                                             getWarsBetween(G.save.state.playerProvince, province, G.save).length === 0,
                                       },
                                    ],
                                 }),
                                 effect: () => {
                                    startTimedAction("RequestMilitaryAid", G.save.state.playerProvince, G.save);
                                    addModifier({
                                       modifier: "WarPower",
                                       type: "multiply",
                                       name: $t(
                                          L.XRequestedMilitaryAidFromY,
                                          getProvinceName(G.save.state.playerProvince, G.save),
                                          getProvinceName(province, G.save),
                                       ),
                                       value: 0.1,
                                       duration: TimedActions.RequestMilitaryAid.duration,
                                       province: G.save.state.playerProvince,
                                       save: G.save,
                                    });
                                    addModifier({
                                       modifier: "WarPower",
                                       type: "multiply",
                                       name: $t(
                                          L.XRequestedMilitaryAidFromY,
                                          getProvinceName(G.save.state.playerProvince, G.save),
                                          getProvinceName(province, G.save),
                                       ),
                                       value: -0.1,
                                       duration: TimedActions.RequestMilitaryAid.duration,
                                       province: province,
                                       save: G.save,
                                    });
                                 },
                              }}
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
                              action={{
                                 cost: getDiplomaticAnnexationCost(province, G.save),
                                 condition: finalizeCondition({
                                    breakdown: [
                                       ...timedActionConditions(
                                          { action: "AnnexClient" },
                                          G.save.state.playerProvince,
                                          G.save,
                                       ),
                                       {
                                          name: $t(L.TheyAreOurClient),
                                          value:
                                             usToThem.treaty?.type === "Patron" && themToUs.treaty?.type === "Client",
                                       },
                                       {
                                          name: $t(L.WeAreNotAtWarWithThem),
                                          value:
                                             getWarsBetween(G.save.state.playerProvince, province, G.save).length === 0,
                                       },
                                    ],
                                 }),
                                 effect: () => {
                                    startTimedAction("AnnexClient", G.save.state.playerProvince, G.save);
                                    const tiles = new Set<Tile>();
                                    for (const [tile, data] of G.save.state.tiles) {
                                       if (data.province === province) {
                                          data.province = G.save.state.playerProvince;
                                          tiles.add(tile);
                                       }
                                    }
                                    RefreshTiles.emit({ tiles, options: { indicator: true, visual: true } });
                                 },
                              }}
                              tooltip={(element) => (
                                 <>
                                    <TimedActionDescComp action="AnnexClient" />
                                    {element}
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
                        tooltip={(element) => (
                           <>
                              <div className="m10">
                                 {html($t(L.InfiltratingProvinceIncreasesInfiltrationByXPerMonth, "1"))}
                              </div>
                              {element}
                           </>
                        )}
                        isDoingFunc={isInfiltrating}
                        cancelFunc={cancelInfiltration}
                        canDoFunc={canInfiltrate}
                        doFunc={infiltrate}
                        doLabel={$t(L.Infiltrate)}
                        doId={`DiplomacyPage_Infiltrate_${province}`}
                        cancelLabel={$t(L.CancelInfiltrate)}
                     />
                     <ActionButton
                        className="py2"
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * 3 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "FabricateCasusBelli" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    FabricateCasusBelliCost,
                                    { consume: true },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                                 {
                                    name: $t(L.NoDiplomaticDisputeCasusBelliYet),
                                    value: !usToThem.casusBelli.has("DiplomaticDispute"),
                                 },
                              ],
                           }),
                           effect: () => {
                              if (
                                 tryUseInfiltration(
                                    FabricateCasusBelliCost,
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 )
                              ) {
                                 startTimedAction("FabricateCasusBelli", G.save.state.playerProvince, G.save);
                                 usToThem.casusBelli.set("DiplomaticDispute", {
                                    monthsLeft: TimedActions.FabricateCasusBelli.duration,
                                 });
                              }
                           },
                        }}
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
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * 6 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "UndermineTheirArmy" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    UndermineArmyCost,
                                    { consume: true },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                              ],
                           }),
                           effect: () => {
                              addModifier({
                                 modifier: "WarPower",
                                 type: "multiply",
                                 name: $t(L.UnderminedByX, getProvinceName(G.save.state.playerProvince, G.save)),
                                 value: -0.1,
                                 duration: TimedActions.UndermineTheirArmy.duration,
                                 province: province,
                                 save: G.save,
                              });
                              startTimedAction("UndermineTheirArmy", G.save.state.playerProvince, G.save);
                              const infiltrate = usToThem.infiltrate;
                              if (infiltrate) {
                                 infiltrate.value -= UndermineArmyCost;
                              }
                           },
                        }}
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
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * 12 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "CorruptOfficials" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    25,
                                    { consume: false },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("CorruptOfficials", G.save.state.playerProvince, G.save);
                              usToThem.infiltrate.value += 50;
                           },
                        }}
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
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * 6 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "SubvertGarrison" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    SubvertGarrisonCost,
                                    { consume: true },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                                 {
                                    name: $t(L.WeShareALandBorderWithThem),
                                    value: getProvincesInRange(1, G.save.state.playerProvince, G.save).has(province),
                                 },
                              ],
                           }),
                           effect: () => {
                              for (const [tile, tileData] of G.save.state.tiles) {
                                 if (
                                    tileData.province === province &&
                                    isTileBorderingProvince(tile, G.save.state.playerProvince, G.save)
                                 ) {
                                    tileData.modifiers.Defense.push({
                                       type: "multiply",
                                       name: $t(L.SubvertedByX, getProvinceName(G.save.state.playerProvince, G.save)),
                                       value: -0.2,
                                       duration: TimedActions.SubvertGarrison.duration,
                                    });
                                 }
                              }
                              startTimedAction("SubvertGarrison", G.save.state.playerProvince, G.save);
                              const infiltrate = usToThem.infiltrate;
                              if (infiltrate) {
                                 infiltrate.value -= SubvertGarrisonCost;
                              }
                           },
                        }}
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
                        action={{
                           cost: { gold: getProvinceUpgrade(province, G.save) * 6 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "InciteUnrest" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    InciteUnrestCost,
                                    { consume: true },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                                 {
                                    name: $t(L.WeShareALandBorderWithThem),
                                    value: getProvincesInRange(1, G.save.state.playerProvince, G.save).has(province),
                                 },
                              ],
                           }),
                           effect: () => {
                              for (const [tile, tileData] of G.save.state.tiles) {
                                 if (
                                    tileData.province === province &&
                                    isTileBorderingProvince(tile, G.save.state.playerProvince, G.save)
                                 ) {
                                    tileData.modifiers.Unrest.push({
                                       type: "add",
                                       name: $t(L.IncitedByX, getProvinceName(G.save.state.playerProvince, G.save)),
                                       value: 20,
                                       duration: TimedActions.InciteUnrest.duration,
                                    });
                                 }
                              }
                              startTimedAction("InciteUnrest", G.save.state.playerProvince, G.save);
                              const infiltrate = usToThem.infiltrate;
                              if (infiltrate) {
                                 infiltrate.value -= InciteUnrestCost;
                              }
                           },
                        }}
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
                        action={{
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "RevealElectionBacking" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 requireInfiltration(
                                    RevealElectionSupportCost,
                                    { consume: true },
                                    G.save.state.playerProvince,
                                    province,
                                    G.save,
                                 ),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("RevealElectionBacking", G.save.state.playerProvince, G.save);
                              usToThem.revealElectionBacking = G.save.state.month;
                           },
                        }}
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
                           ...DemandTileCostCondition(G.save.state.playerProvince, province, G.save),
                           effect: () => showModal(<DemandTileModal province={province} />),
                        }}
                     >
                        {$t(L.DemandATile)}
                     </ActionButton>
                     <ActionButton
                        className="btn py2"
                        action={{
                           ...DemandTributeCostCondition(G.save.state.playerProvince, province, G.save),
                           effect: () => showModal(<DemandTribute province={province} />),
                        }}
                     >
                        {TimedActions.DemandTribute.name()}
                     </ActionButton>
                     <ActionButton
                        className="btn py2"
                        action={{
                           cost: { diplomatic: 50 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions(
                                    { action: "DemandElectionBacking" },
                                    G.save.state.playerProvince,
                                    G.save,
                                 ),
                                 isGreatPowerCondition(G.save.state.playerProvince, G.save),
                                 isNorGreatPowerCondition(province, G.save),
                                 {
                                    name: $t(
                                       L.XHasNotAlreadyPledgedWithOtherProvinces,
                                       getProvinceName(province, G.save),
                                    ),
                                    value: getProvinceStat("consulVotes", province, G.save) >= 1,
                                 },
                              ],
                           }),
                           effect: () => {
                              addProvinceStat("consulVotes", -1, province, G.save);
                              addProvinceStat("consulVotes", 1, G.save.state.playerProvince, G.save);
                              startTimedAction("DemandElectionBacking", G.save.state.playerProvince, G.save);
                           },
                        }}
                        tooltip={(element) => (
                           <>
                              <TimedActionDescComp action="DemandElectionBacking" />
                              {element}
                           </>
                        )}
                     >
                        {TimedActions.DemandElectionBacking.name()}
                     </ActionButton>
                     <ActionButton
                        className="py2"
                        action={{
                           cost: { diplomatic: 50 },
                           condition: finalizeCondition({
                              breakdown: [
                                 ...timedActionConditions({ action: "Denounce" }, G.save.state.playerProvince, G.save),
                                 isGreatPowerCondition(G.save.state.playerProvince, G.save),
                                 isNorGreatPowerCondition(province, G.save),
                              ],
                           }),
                           effect: () => {
                              startTimedAction("Denounce", G.save.state.playerProvince, G.save);
                              addAttitudeModifier(
                                 province,
                                 G.save.state.playerProvince,
                                 {
                                    type: "add",
                                    name: $t(
                                       L.XDenouncedY,
                                       getProvinceName(G.save.state.playerProvince, G.save),
                                       getProvinceName(province, G.save),
                                    ),
                                    value: -50,
                                    duration: TimedActions.Denounce.duration,
                                 },
                                 G.save,
                              );
                              addModifier({
                                 modifier: "Prestige",
                                 type: "multiply",
                                 name: $t(
                                    L.XDenouncedY,
                                    getProvinceName(G.save.state.playerProvince, G.save),
                                    getProvinceName(province, G.save),
                                 ),
                                 value: ourState.rivals.includes(province) ? 0.2 : 0.1,
                                 duration: TimedActions.Denounce.duration,
                                 province: G.save.state.playerProvince,
                                 save: G.save,
                              });
                           },
                        }}
                        tooltip={(element) => (
                           <>
                              <TimedActionDescComp action="Denounce" />
                              {element}
                           </>
                        )}
                     >
                        {TimedActions.Denounce.name()}
                     </ActionButton>
                  </div>
               </div>
            )}
         </div>
      </SidebarComp>
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
         allowDeselect={false}
         data={keysOf(G.save.state.provinces)
            .filter((p) => p !== province)
            .sort((a, b) => getProvinceName(a, G.save).localeCompare(getProvinceName(b, G.save)))
            .map((p) => ({ value: p, label: getProvinceName(p, G.save) }))}
         checkIconPosition="right"
         value={state.rivals[index]}
         disabled={getTimedActionCooldownLeft("ChangeRival", province, G.save) > 0 && state.rivals[index] !== null}
         onChange={(value) => {
            const selected = value as Province;
            if (selected === province) {
               showError($t(L.WeCannotSelectOurselvesAsARival));
               return;
            }
            if (state.rivals.includes(selected)) {
               showError($t(L.WeCannotSelectTheSameRivalTwice));
               return;
            }
            const cooldown = getTimedActionCooldownLeft("ChangeRival", province, G.save);
            if (state.rivals[index] !== null && cooldown > 0) {
               showError($t(L.WeCannotChangeRivalForAnotherXMonths, formatNumber(cooldown)));
               return;
            }
            playClick();
            addAttitudeModifier(
               selected,
               province,
               {
                  type: "add",
                  name: $t(L.XConsidersYARival, getProvinceName(province, G.save), getProvinceName(selected, G.save)),
                  value: RivalAttitudeModifier,
                  duration: RivalAttitudeDuration,
               },
               G.save,
            );
            state.rivals[index] = selected;
            const relation = getRelation(selected, province, G.save);
            if (relation) {
               relation.casusBelli.set("HumiliateRival", { monthsLeft: 10 * 12 });
            }
            startTimedAction("ChangeRival", province, G.save);
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
            <div className="mi sm inline">question_mark</div> {html($t(L.CallToArmsCanBeIgnoredWithPenalty))}
         </div>
         <div>
            <div className="mi sm inline">remove</div> {$t(L.ActionNotAvailable)}
         </div>
      </>
   );
}

function TreatyActionButton({
   province,
   hasOfferedFunc,
   cancelFunc,
   canOfferFunc,
   tryOfferFunc,
   offerLabel,
   offerTooltip,
   cancelLabel,
   cancelPenalty,
}: {
   province: Province;
   hasOfferedFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => boolean;
   cancelFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => boolean;
   canOfferFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => IConditionBreakdown;
   tryOfferFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => boolean;
   offerLabel: React.ReactNode;
   offerTooltip?: React.ReactNode;
   cancelLabel: React.ReactNode;
   cancelPenalty: IValueBreakdownItem[];
}): React.ReactNode {
   const canOffer = canOfferFunc(G.save.state.playerProvince, province, G.save);
   const monthLeft = getTreatyMonthLeft(G.save.state.playerProvince, province, G.save);
   return hasOfferedFunc(G.save.state.playerProvince, province, G.save) ? (
      <button
         className="btn py2"
         onClick={() => {
            if (cancelFunc(G.save.state.playerProvince, province, G.save)) {
               playClick();
               GameStateUpdated.emit();
            } else {
               playError();
            }
         }}
      >
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  <div className="m10">
                     {html(
                        $t(
                           L.ThisTreatyLastsForXMonthsAndExpiresInYMonths,
                           formatNumber(TimedActions.DiplomaticTreaty.duration),
                           formatNumber(monthLeft),
                        ),
                     )}
                  </div>
                  <div className="divider" />
                  <div className="m10">{$t(L.CancellingATreatyBeforeExpiryNegativelyImpactsAttitude)}</div>
                  <ValueListComp items={cancelPenalty} />
               </>
            }
         >
            <div>{cancelLabel}</div>
         </FloatingTip>
      </button>
   ) : (
      <ActionButton
         action={{
            cost: { diplomatic: 50 },
            condition: canOffer,
            effect: () => {
               tryOfferFunc(G.save.state.playerProvince, province, G.save);
            },
         }}
         tooltip={(element) => (
            <>
               {offerTooltip}
               <div className="m10">
                  {$t(
                     L.ATreatyLastsForXMonthsAndHasToBeRenegotiatedAfterExpiry,
                     formatNumber(TimedActions.DiplomaticTreaty.duration),
                  )}
               </div>
               {element}
            </>
         )}
         className="btn py2"
      >
         {offerLabel}
      </ActionButton>
   );
}

function RelationsActionButton({
   province,
   isDoingTooltip,
   isDoingFunc,
   cancelFunc,
   canDoFunc,
   doFunc,
   doLabel,
   doId,
   cancelLabel,
   tooltip,
}: {
   province: Province;
   isDoingTooltip: React.ReactNode;
   isDoingFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => boolean;
   cancelFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => void;
   canDoFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => IConditionBreakdown;
   doFunc: (fromProvince: Province, toProvince: Province, save: SaveGame) => void;
   doLabel: React.ReactNode;
   doId?: string;
   cancelLabel: React.ReactNode;
   tooltip: (element: React.ReactNode) => React.ReactNode;
}): React.ReactNode {
   return isDoingFunc(G.save.state.playerProvince, province, G.save) ? (
      <button
         className="btn py2"
         onClick={() => {
            cancelFunc(G.save.state.playerProvince, province, G.save);
            GameStateUpdated.emit();
         }}
      >
         <FloatingTip label={isDoingTooltip}>
            <div>{cancelLabel}</div>
         </FloatingTip>
      </button>
   ) : (
      <ActionButton
         action={{
            condition: canDoFunc(G.save.state.playerProvince, province, G.save),
            effect: () => {
               doFunc(G.save.state.playerProvince, province, G.save);
            },
         }}
         tooltip={tooltip}
         className="py2"
         id={doId}
      >
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
         action={{
            cost: { gold: 1000 },
            condition: canSabotage(fromProvince, toProvince, G.save),
            effect: () => {
               trySabotage(fromProvince, toProvince, G.save);
            },
         }}
         tooltip={(element) => (
            <>
               <div className="m10">
                  {html(
                     $t(
                        L.SabotageDescription,
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
            showSidebar(<DiplomacyPage province={province} />);
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
