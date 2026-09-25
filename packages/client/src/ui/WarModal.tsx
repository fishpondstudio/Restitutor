import { Progress } from "@mantine/core";
import { formatNumber, formatPercent, hasFlag } from "@project/shared/src/utils/Helper";
import { HireMercenariesAction } from "../game/actions/HireMercenariesAction";
import { NegotiateWhitePeaceAction } from "../game/actions/NegotiateWhitePeaceAction";
import { SignPeaceTreatyAction } from "../game/actions/SignPeaceTreatyAction";
import {
   DecimateOurArmyAction,
   ExecuteBattlePlanAction,
   ForceAttackAction,
   FortifyOurBordersAction,
   getBattlePlanWarScore,
   getWarActionWarScore,
   LeaveWarCoalitionAction,
   MakeWarSpeechAction,
   PlunderWarTilesAction,
   ProclaimRightOfReprisalAction,
} from "../game/actions/WarActions";
import { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getMercenaryCost, getWarPower } from "../game/logic/ArmyLogic";
import { monthToDate } from "../game/logic/GameDateTime";
import { getAvailablePeaceTreatyOptions } from "../game/logic/PeaceTreatyLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import {
   getCurrentWars,
   getTruceDuration,
   getWarEstimatedTime,
   getWarPlunder,
   getWarPowerComparison,
   type IWar,
   type IWarLog,
   isWarStalled,
   WarLogFlag,
   WarResult,
} from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { showPanel } from "./common/ShowPanel";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { PeaceTreatyPage } from "./PeaceTreatyPage";
import { PeaceTreatyTooltip } from "./PeaceTreatyTooltip";
import { TilePage } from "./TilePage";
import { Grid2, Grid3 } from "./UIConstant";
import { WarChanceTooltip } from "./WarChanceTooltip";
import { WarMonthlyConsequences } from "./WarMonthlyConsequences";
import { WarPowerComp } from "./WarPowerComp";
import { WarPowerTooltip } from "./WarPowerTooltip";
import { WhitePeaceTooltip } from "./WhitePeaceTooltip";

export function WarModal({ war }: { war: IWar }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const comparison = getWarPowerComparison(war.attacker, war.coAttackers, war.defender, war.coDefenders, G.save);
   const { successChance } = comparison;
   const isWon = war.actualWarScore >= war.requiredWarScore;
   const estimatedTimeLeft = getWarEstimatedTime(war.requiredWarScore - war.actualWarScore, successChance);
   const forceAttack = getTimedActionTimeLeft("ForceAttack", war.attacker, G.save);
   return (
      <ModalComp
         size="lg"
         title={
            <ModalTitleBar
               title={$t(L.$1$2War, getProvinceName(war.attacker, G.save), getProvinceName(war.defender, G.save))}
               dismiss
            />
         }
      >
         <WarPowerComp
            attacker={war.attacker}
            coAttackers={war.coAttackers}
            coDefenders={war.coDefenders}
            defender={war.defender}
            comparison={comparison}
         />
         <div className="h10" />
         <div className="h1 row">
            <div className="f1">{$t(L.WarProgress)}</div>
            <div>{formatPercent(war.actualWarScore / war.requiredWarScore)}</div>
         </div>
         <div className="m10">
            <Progress value={(war.actualWarScore / war.requiredWarScore) * 100} />
         </div>

         <div className="row mx10 my5">
            <div className="f1">{$t(L.ActualRequiredWarScore)}</div>
            <div>
               {formatNumber(war.actualWarScore)}/{formatNumber(war.requiredWarScore)}
            </div>
         </div>
         <FloatingTip
            label={() => <WarChanceTooltip successChance={successChance} requiredWarScore={war.requiredWarScore} />}
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.LengthOfTheWarEstTimeLeft)}</div>
               <div>
                  {formatNumber(war.log.length)}/
                  {successChance <= 0.5 ? (
                     <span className="text-red">{$t(L.Never)}</span>
                  ) : (
                     $t(L.$1Months, formatNumber(estimatedTimeLeft))
                  )}
               </div>
            </div>
         </FloatingTip>
         {forceAttack > 0 && (
            <div className="row mx10 my5 text-yellow">
               <div className="f1">{$t(L.ForcefulAttack)}</div>
               <div>{$t(L.$1MonthsLeft, formatNumber(forceAttack))}</div>
            </div>
         )}
         {isWon && (
            <div className="mx10 my5 text-green">
               {$t(L.After$1Months$2HasWonTheWar, formatNumber(war.log.length), getProvinceName(war.attacker, G.save))}
            </div>
         )}
         {war.attacker === G.save.state.playerProvince && !isWon && successChance <= 0.5 && (
            <div className="mx10 my5 text-red">{$t(L.WarIsNotExpectedToWin)}</div>
         )}
         {war.attacker === G.save.state.playerProvince && !isWon && isWarStalled(war, G.save) && (
            <div className="mx10 my5 text-yellow">{$t(L.WarIsStalledDueToInsufficientMilitaryPoints)}</div>
         )}
         <div style={Grid2} className="m10">
            <div>
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>{$t(L.Date)}</th>
                        <th>{$t(L.Chance)}</th>
                        <th>{$t(L.Attacks)}</th>
                        <th>{$t(L.Result)}</th>
                        <th>{$t(L.Score)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {war.log.slice(0, 20).map((log) => (
                        <tr key={log.month}>
                           <td>{monthToDate(log.month, G.save).toLocaleDateString()}</td>
                           <td>{formatPercent(log.successChance)}</td>
                           <td>
                              <FloatingTip
                                 disabled={log.rolls.length === 0}
                                 className="p0"
                                 fixedWidth
                                 label={() => (
                                    <>
                                       <div className="m10">
                                          {$t(L.WarMonthlyAttackExplanation$1$2, "3", formatPercent(log.successChance))}
                                       </div>
                                       <div className="m10" style={Grid3}>
                                          {log.rolls.map((roll, i) => {
                                             return (
                                                <div key={i} className="box text-center">
                                                   <div className="h2">
                                                      <div className="mi sm">timer_{i + 1}</div>
                                                   </div>
                                                   <div className="h10" />
                                                   <div className="mi lg">
                                                      {roll < log.successChance ? "swords" : "security"}
                                                   </div>
                                                   <div className="h5" />
                                                   <div>{formatPercent(roll)}</div>
                                                   <div>
                                                      {WarResult[
                                                         roll < log.successChance ? "Success" : "Repelled"
                                                      ].name()}
                                                   </div>
                                                   <div className="h10" />
                                                </div>
                                             );
                                          })}
                                       </div>
                                       <div className="box row m10 p10">
                                          <div className="f1">{$t(L.FinalResult)}</div>
                                          <div>{WarResult[log.result].name()}</div>
                                       </div>
                                    </>
                                 )}
                              >
                                 <div className="row g0">
                                    {log.rolls.map((roll, i) => {
                                       return (
                                          <div key={i} className="mi xs">
                                             {roll < log.successChance ? "swords" : "security"}
                                          </div>
                                       );
                                    })}
                                 </div>
                              </FloatingTip>
                           </td>
                           <td>{WarResult[log.result].name()}</td>
                           <td className="text-right">
                              <WarLogScoreComp log={log} />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="box">
               <div className="m10 col g10 stretch">
                  <SignPeaceTreatyButton war={war} province={G.save.state.playerProvince} />
                  <NegotiateWhitePeaceButton war={war} province={G.save.state.playerProvince} />
                  <LeaveWarCoalitionButton war={war} province={G.save.state.playerProvince} />
                  <ProclaimRightOfReprisalButton war={war} province={G.save.state.playerProvince} />
                  <FortifyOurBordersButton war={war} province={G.save.state.playerProvince} />
                  <PlunderWarTilesButton war={war} province={G.save.state.playerProvince} />
                  <HireMercenariesButton war={war} province={G.save.state.playerProvince} />
                  <ForceAttackButton war={war} province={G.save.state.playerProvince} />
                  <DecimateOurArmyButton war={war} province={G.save.state.playerProvince} />
                  <MakeWarSpeechButton war={war} province={G.save.state.playerProvince} />
                  <ExecuteBattlePlanButton war={war} province={G.save.state.playerProvince} />
               </div>
               <div className="h1">{$t(L.WarGoal)}</div>
               <div className="m10">
                  {Array.from(war.tiles).map((tile) => {
                     const tileData = G.save.state.tiles.get(tile);
                     if (!tileData) {
                        return null;
                     }
                     return (
                        <div className="row my5" key={tile}>
                           <div className="f1">{getTileName(tile, G.save)}</div>
                           <button
                              className="btn pointer text-sm"
                              key={tile}
                              onClick={() => {
                                 hideModal();
                                 G.scene
                                    .getCurrent(WorldScene)
                                    ?.lookAt(tile, { time: 0.2 })
                                    .then((scene) => {
                                       scene.drawSelectors(new Set([tile]));
                                       scene.drawProvinceOutline(tileData.province);
                                       showPanel(TilePage, { tile });
                                    });
                              }}
                           >
                              {$t(L.View)}
                           </button>
                        </div>
                     );
                  })}
               </div>
               <div className="h1">{$t(L.CasusBelli)}</div>
               <FloatingTip
                  disabled={!CasusBelli[war.casusBelli].effect}
                  label={() => CasusBelli[war.casusBelli].effect?.()}
               >
                  <div className="mx10 my5">{CasusBelli[war.casusBelli].name()}</div>
               </FloatingTip>
               {war.attacker === G.save.state.playerProvince && (
                  <>
                     <div className="h1">{$t(L.MonthlyConsequences)}</div>
                     <WarMonthlyConsequences war={war} />
                  </>
               )}
               {getCurrentWars(G.save.state.playerProvince, G.save).length > 1 && (
                  <>
                     <div className="divider" />
                     <WarPowerTooltip breakdown={getWarPower({}, G.save.state.playerProvince, G.save)}>
                        <div className="m10 text-italic text-red text-sm">
                           {$t(L.WeAreInvolvedInMultipleOngoingWarsOurWarPowerIsReduced)}
                        </div>
                     </WarPowerTooltip>
                  </>
               )}
            </div>
         </div>
      </ModalComp>
   );
}

function WarLogScoreComp({ log }: { log: IWarLog }): React.ReactNode {
   if (hasFlag(log.flag, WarLogFlag.ForceAttack)) {
      return (
         <FloatingTip label={() => TimedActions.ForceAttack.desc?.()}>
            <span className="text-red">0*</span>
         </FloatingTip>
      );
   }
   return colorNumber(WarResult[log.result].score);
}

function SignPeaceTreatyButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore < war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         id="WarModal_SignPeaceTreaty"
         className="py2 primary"
         action={() => ({
            condition: SignPeaceTreatyAction(war, province, getAvailablePeaceTreatyOptions(war, G.save)[0], G.save)
               .condition,
            execute: () => {
               hideModal();
               showPanel(PeaceTreatyPage, { war, province });
            },
         })}
         tooltip={(element) => (
            <>
               {element}
               <PeaceTreatyTooltip war={war} />
            </>
         )}
      >
         {$t(L.SignPeaceTreaty)}
      </ActionButton>
   );
}

function NegotiateWhitePeaceButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         className="btn py2"
         tooltip={(element) => (
            <>
               <div className="h2">{$t(L.NegotiateWhitePeace)}</div>
               <WhitePeaceTooltip war={war} />
               {element}
            </>
         )}
         action={() => NegotiateWhitePeaceAction(war, province, G.save)}
      >
         {$t(L.NegotiateWhitePeace)}
      </ActionButton>
   );
}

function LeaveWarCoalitionButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (!war.coAttackers.has(province) && !war.coDefenders.has(province)) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   let coalitionLeader: Province | undefined;
   if (war.coAttackers.has(province)) {
      coalitionLeader = war.attacker;
   }
   if (war.coDefenders.has(province)) {
      coalitionLeader = war.defender;
   }
   if (!coalitionLeader) {
      return null;
   }
   return (
      <ActionButton
         className="btn py2"
         tooltip={(element) => (
            <>
               <div className="m10">
                  {$t(
                     L.LeavingWarCoalitionTooltip$1$2$3,
                     getProvinceName(coalitionLeader, G.save),
                     "50",
                     formatNumber(getTruceDuration(war, G.save).value),
                  )}
               </div>
               {element}
            </>
         )}
         action={() => LeaveWarCoalitionAction(war, province, G.save)}
      >
         {$t(L.LeaveWarCoalition)}
      </ActionButton>
   );
}

function ProclaimRightOfReprisalButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.coDefenders.has(province) || war.defender === province) {
      return (
         <ActionButton
            className="btn py2"
            tooltip={(element) => (
               <>
                  <TimedActionDescComp action="ProclaimRightOfReprisal" />
                  {element}
               </>
            )}
            action={() => ProclaimRightOfReprisalAction(war, province, G.save)}
         >
            {TimedActions.ProclaimRightOfReprisal.name()}
         </ActionButton>
      );
   }
   return null;
}

function ExecuteBattlePlanButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province || war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         className="btn py2"
         action={() => ExecuteBattlePlanAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="ExecuteBattlePlan" />
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.WarScore)}</div>
                  <div>{colorNumber(getBattlePlanWarScore(province, G.save))}</div>
               </div>
               {element}
            </>
         )}
      >
         {TimedActions.ExecuteBattlePlan.name()}
      </ActionButton>
   );
}

function MakeWarSpeechButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   const warScore = getWarActionWarScore(war);
   return (
      <ActionButton
         className="btn py2"
         action={() => MakeWarSpeechAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="MakeWarSpeech" />
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.WarScore)}</div>
                  <div>{colorNumber(warScore)}</div>
               </div>
               {element}
            </>
         )}
      >
         {TimedActions.MakeWarSpeech.name()}
      </ActionButton>
   );
}

function FortifyOurBordersButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province && war.defender !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         className="btn py2"
         action={() => FortifyOurBordersAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="FortifyBorders" />
               {element}
            </>
         )}
      >
         {TimedActions.FortifyBorders.name()}
      </ActionButton>
   );
}

function HireMercenariesButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province && war.defender !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         action={() => HireMercenariesAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="HireMercenaries" />
               {element}
               <div className="box m5">
                  <div className="h2">{$t(L.TheCostIsCalculatedAsFollows)}</div>
                  <BreakdownComp breakdown={getMercenaryCost(province, G.save)} />
               </div>
            </>
         )}
      >
         {TimedActions.HireMercenaries.name()}
      </ActionButton>
   );
}

function PlunderWarTilesButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   const plunder = getWarPlunder(war, G.save);
   return (
      <ActionButton
         action={() => PlunderWarTilesAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               {element}
               <div className="divider" />
               <div className="m10">{html($t(L.PlunderingWarTilesWillReduceTheRequiredWarScore))}</div>
               <BreakdownComp breakdown={plunder.warScore} />
               <div className="m10">{html($t(L.TheFollowingTileUpgradesWillBeReducedIfWeveWonTheWar))}</div>
               <BreakdownComp breakdown={plunder.tiles} />
            </>
         )}
      >
         {$t(L.PlunderWarTiles)}
      </ActionButton>
   );
}

function ForceAttackButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         action={() => ForceAttackAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="ForceAttack" />
               {element}
            </>
         )}
      >
         {TimedActions.ForceAttack.name()}
      </ActionButton>
   );
}

function DecimateOurArmyButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   const warScore = getWarActionWarScore(war);
   return (
      <ActionButton
         className="btn py2"
         action={() => DecimateOurArmyAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="DecimateOurArmy" />
               <div className="mx10 my5 row">
                  <div className="f1">{$t(L.WarScore)}</div>
                  <div>{colorNumber(warScore)}</div>
               </div>
               {element}
            </>
         )}
      >
         {TimedActions.DecimateOurArmy.name()}
      </ActionButton>
   );
}
