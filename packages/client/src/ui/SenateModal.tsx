import { Switch } from "@mantine/core";
import { hasFlag, toggleFlag } from "@project/shared/src/utils/Helper";
import { ProvinceFlags } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getRevealedConsulVotes } from "../game/logic/DiplomacyLogic";
import {
   ConsulElectionMonths,
   getProvinceName,
   getProvinceResource,
   getProvinceStat,
} from "../game/logic/ProvinceLogic";
import { monthToDate, monthToNextYear } from "../game/logic/TickLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar, showModal } from "../utils/ModalManager";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DissolveTreatyModal } from "./DissolveTreatyModal";
import { NamePublicEnemyModal } from "./NamePublicEnemyModal";
import { TimedActionButton } from "./TimedActionButton";
import { Grid2, Grid3 } from "./UIConstant";

export function SenateModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const votes = G.save.state.senate.votes.get(G.save.state.playerProvince) ?? new Set();
   const thisYear = monthToDate(G.save.state.month).getFullYear();
   const revealedVotes = getRevealedConsulVotes(G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.SenateAndConsuls)} dismiss />}>
         <FloatingTip
            label={$t(L.ConsulPointsWillExpireWhenTheNextConsulsAreElectedInXMonths, monthToNextYear(G.save))}
         >
            <div className="h1 row">
               <div className="f1">{$t(L.SenateDecrees)}</div>
               <div>
                  {getProvinceResource("consulPoint", G.save.state.playerProvince, G.save)} {$t(L.ConsulPoint)}
               </div>
            </div>
         </FloatingTip>
         <div style={Grid3} className="m10">
            <TimedActionButton timedAction="RequestFunding" />
            <TimedActionButton timedAction="EnactSenateOversight" />
            <TimedActionButton timedAction="AffirmCivicUnity" />
            <TimedActionButton timedAction="DeclareMobilization" />
            <button className="btn" onClick={() => showModal(<NamePublicEnemyModal />)}>
               {TimedActions.PublicEnemy.name()}
            </button>
            <button className="btn" onClick={() => showModal(<DissolveTreatyModal />)}>
               {TimedActions.DissolveTreaty.name()}
            </button>
         </div>
         <div className="h1">{$t(L.ElectedConsulsOfXAd, thisYear)}</div>
         <div style={Grid2} className="m10">
            {Array.from(G.save.state.senate.electedConsuls).map(([name, provinces], i) => {
               return (
                  <FloatingTip
                     key={i}
                     label={html(
                        $t(
                           L.ThisConsulIsSupportedByTheFollowingProvincesX,
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
         <div className="h1">{$t(L.Automation)}</div>
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
         <div className="h1">{$t(L.ConsulElectionOfXAd, thisYear + Math.ceil(ConsulElectionMonths / 12))}</div>
         <FloatingTip label={$t(L.DefaultPledgeSupportTooltip)}>
            <div className="m10 row">
               <div className="f1">{$t(L.ProvincialBacking)}</div>
               <div>{getProvinceStat("consulVotes", G.save.state.playerProvince, G.save)}</div>
            </div>
         </FloatingTip>
         <div className="divider" />
         <div style={Grid3} className="m10">
            {G.save.state.senate.consulCandidates.map((name, i) => {
               const supportedProvinces = revealedVotes.get(i) ?? [];
               return (
                  <div key={i} className="box p5 col stretch">
                     <FloatingTip label={name}>
                        <div
                           className="text-display text-center mb5"
                           style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                           {name}
                        </div>
                     </FloatingTip>
                     <div className="row g5">
                        <button
                           id={`SenateModal_Candidate_${i}_${votes.has(i) ? "Revoke" : "Pledge"}`}
                           className="btn f1"
                           onClick={() => {
                              if (votes.has(i)) {
                                 votes.delete(i);
                              } else {
                                 votes.add(i);
                              }
                              G.save.state.senate.votes.set(G.save.state.playerProvince, votes);
                              GameStateUpdated.emit();
                           }}
                           disabled={!votes.has(i) && votes.size >= 2}
                        >
                           <FloatingTip label={$t(L.PledgeSupportTooltip)}>
                              {votes.has(i) ? (
                                 <div className="text-red">{$t(L.RevokeSupport)}</div>
                              ) : (
                                 <div>{$t(L.PledgeSupport)}</div>
                              )}
                           </FloatingTip>
                        </button>
                        <FloatingTip
                           label={
                              supportedProvinces.length > 0
                                 ? $t(
                                      L.AccordingToOurIntelligenceThisCandidateIsSupportedByX,
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
      </ModalComp>
   );
}
