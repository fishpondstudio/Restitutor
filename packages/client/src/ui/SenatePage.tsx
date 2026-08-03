import { Switch } from "@mantine/core";
import { hasFlag, toggleFlag } from "@project/shared/src/utils/Helper";
import { finalizeCondition } from "../game/actions/GameAction";
import { ProvinceFlags } from "../game/definitions/Province";
import { hasNotProvinceUpgradeCondition } from "../game/definitions/ProvinceUpgrades";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getRevealedConsulVotes } from "../game/logic/DiplomacyLogic";
import { monthToDate } from "../game/logic/GameDateTime";
import {
   getProvinceName,
   getProvinceResource,
   getProvinceStat,
   monthsToNextConsulElection,
} from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DissolveTreatyModal } from "./DissolveTreatyModal";
import { HeaderImages } from "./HeaderImages";
import { NamePublicEnemyModal } from "./NamePublicEnemyModal";
import { TimedActionButton } from "./TimedActionButton";
import { Grid2 } from "./UIConstant";

export function SenatePage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const votes = G.save.state.senate.votes.get(G.save.state.playerProvince) ?? new Set();
   const thisYear = monthToDate(G.save.state.month).getFullYear();
   const monthsToNextElection = monthsToNextConsulElection(G.save);
   const nextElectionYear = monthToDate(G.save.state.month + monthsToNextElection).getFullYear();
   const revealedVotes = getRevealedConsulVotes(G.save.state.playerProvince, G.save);
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.Senate} title={$t(L.SenateAndConsuls)} />}>
         <FloatingTip label={$t(L.ConsulPointsWillExpireWhenTheNextConsulsAreElectedIn$1Months, monthsToNextElection)}>
            <div className="h1 row">
               <div className="f1">{$t(L.SenateDecrees)}</div>
               <div>
                  {getProvinceResource("consulPoint", G.save.state.playerProvince, G.save)} {$t(L.ConsulPoint)}
               </div>
            </div>
         </FloatingTip>
         <div style={Grid2} className="m10">
            <TimedActionButton timedAction="RequestFunding" />
            <TimedActionButton timedAction="EnactSenateOversight" />
            <TimedActionButton timedAction="AffirmCivicUnity" />
            <TimedActionButton timedAction="DeclareMobilization" />
            <button className="btn" onClick={() => showPanel(<NamePublicEnemyModal />)}>
               {TimedActions.PublicEnemy.name()}
            </button>
            <button className="btn" onClick={() => showPanel(<DissolveTreatyModal />)}>
               {TimedActions.DissolveTreaty.name()}
            </button>
         </div>
         <div className="h1">{$t(L.ElectedConsulsOf$1Ad, thisYear)}</div>
         <div style={Grid2} className="m10">
            {Array.from(G.save.state.senate.electedConsuls).map(([name, provinces], i) => {
               return (
                  <FloatingTip
                     key={i}
                     label={html(
                        $t(
                           L.ThisConsulIsSupportedByTheFollowingProvinces$1,
                           provinces.map((p) => getProvinceName(p, G.save)).join(", "),
                        ),
                     )}
                  >
                     <div className="box p10 text-display text-center" key={i}>
                        {name}
                     </div>
                  </FloatingTip>
               );
            })}
         </div>
         <div className="divider" />
         <div className="m10">
            <FloatingTip label={$t(L.AutomaticallyPledgeSupportToTwoRandomCandidatesEveryElectionYear)}>
               <div className="row my5">
                  <div className="f1">{$t(L.AutomaticallyPledgeSupport)}</div>
                  <Switch
                     checked={hasFlag(state.flags, ProvinceFlags.AutomaticallyPledgeSupport)}
                     onChange={() => {
                        state.flags = toggleFlag(state.flags, ProvinceFlags.AutomaticallyPledgeSupport);
                        GameStateUpdated.emit();
                     }}
                  />
               </div>
            </FloatingTip>
         </div>
         <div className="h1">{$t(L.ConsulElectionOf$1Ad, nextElectionYear)}</div>
         <FloatingTip label={$t(L.DefaultPledgeSupportTooltip)}>
            <div className="m10 row">
               <div className="f1">{$t(L.ProvincialBacking)}</div>
               <div>{getProvinceStat("consulVotes", G.save.state.playerProvince, G.save)}</div>
            </div>
         </FloatingTip>
         <div style={Grid2} className="m10">
            {G.save.state.senate.consulCandidates.map((name, i) => {
               const supportedProvinces = revealedVotes.get(i) ?? [];
               return (
                  <div key={i} className="box p10 col stretch">
                     <FloatingTip label={name}>
                        <div
                           className="text-display text-center mb5 mt-5"
                           style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                           {name}
                        </div>
                     </FloatingTip>
                     <div className="row g5">
                        {votes.has(i) ? (
                           <ActionButton
                              id={`SenateModal_Candidate_${i}_Revoke`}
                              className="btn f1"
                              action={{
                                 effect: () => {
                                    votes.delete(i);
                                    G.save.state.senate.votes.set(G.save.state.playerProvince, votes);
                                    GameStateUpdated.emit();
                                 },
                              }}
                              tooltip={(element) => {
                                 return (
                                    <>
                                       <div className="m10">{$t(L.PledgeSupportTooltip)}</div>
                                       {element}
                                    </>
                                 );
                              }}
                           >
                              <div className="text-red">{$t(L.RevokeSupport)}</div>
                           </ActionButton>
                        ) : (
                           <ActionButton
                              id={`SenateModal_Candidate_${i}_Pledge`}
                              className="btn f1"
                              action={{
                                 condition: finalizeCondition([
                                    {
                                       name: $t(L.WeHavePledgedSupportToLessThan2Candidates),
                                       value: votes.size < 2,
                                    },
                                    hasNotProvinceUpgradeCondition(
                                       "OurOwnDestiny",
                                       G.save.state.playerProvince,
                                       G.save,
                                    ),
                                 ]),
                                 effect: () => {
                                    votes.add(i);
                                    G.save.state.senate.votes.set(G.save.state.playerProvince, votes);
                                    GameStateUpdated.emit();
                                 },
                              }}
                              tooltip={(element) => {
                                 return (
                                    <>
                                       <div className="m10">{$t(L.PledgeSupportTooltip)}</div>
                                       {element}
                                    </>
                                 );
                              }}
                           >
                              {votes.has(i) ? (
                                 <div className="text-red">{$t(L.RevokeSupport)}</div>
                              ) : (
                                 <div>{$t(L.PledgeSupport)}</div>
                              )}
                           </ActionButton>
                        )}
                        <FloatingTip
                           label={
                              supportedProvinces.length > 0
                                 ? $t(
                                      L.AccordingToOurIntelligenceThisCandidateIsSupportedBy$1,
                                      supportedProvinces.join(", "),
                                   )
                                 : $t(L.WeDontHaveIntelligenceOnThisCandidatesProvincialSupport)
                           }
                        >
                           <button className="btn">
                              {supportedProvinces.length > 0 ? supportedProvinces.length : "?"}
                           </button>
                        </FloatingTip>
                     </div>
                  </div>
               );
            })}
         </div>
      </SidebarComp>
   );
}
