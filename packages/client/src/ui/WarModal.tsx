import { Progress } from "@mantine/core";
import { formatNumber, formatPercent, hasFlag, setFlag } from "@project/shared/src/utils/Helper";
import { finalizeCondition } from "../game/actions/GameAction";
import { HireMercenariesAction } from "../game/actions/HireMercenariesAction";
import { NegotiateWhitePeaceAction } from "../game/actions/NegotiateWhitePeaceAction";
import { SignPeaceTreatyAction } from "../game/actions/SignPeaceTreatyAction";
import { CasusBelli } from "../game/definitions/CasusBelli";
import type { Province } from "../game/definitions/Province";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { showSuccess } from "../game/logic/AlertLogic";
import { addAttitudeModifier } from "../game/logic/DiplomacyLogic";
import {
   getArmyMaintenanceCost,
   getMercenaryCost,
   getProvinceName,
   getProvinceStat,
   getWarPower,
   setProvinceStat,
} from "../game/logic/ProvinceLogic";
import { monthToDate } from "../game/logic/TickLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { getTimedActionTimeLeft, startTimedAction, timedActionConditions } from "../game/logic/TimedActionLogic";
import {
   getCurrentWars,
   getTruceLength,
   getWarPlunder,
   getWarSuccessChance,
   type IWar,
   type IWarLog,
   isWarStalled,
   WarFlag,
   WarLogFlag,
   WarResultScore,
   WhitePeaceCostPerTile,
} from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { showSidebar } from "./common/Sidebar";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { WarChanceTooltip } from "./DeclareWarPage";
import { TilePage } from "./TilePage";
import { WarMonthlyConsequences } from "./WarMonthlyConsequences";
import { WarPowerComp } from "./WarPowerComp";

export function WarModal({ war }: { war: IWar }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const successChance = getWarSuccessChance(war.attacker, war.coAttackers, war.defender, war.coDefenders, G.save);
   const failChance = 1 - successChance;
   const isWon = war.actualWarScore >= war.requiredWarScore;
   const estimatedTimeLeft = Math.ceil((war.requiredWarScore - war.actualWarScore) / (successChance - failChance));
   const forceAttack = getTimedActionTimeLeft("ForceAttack", war.attacker, G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.XYWar, war.attacker, war.defender)} dismiss />}>
         <WarPowerComp
            attacker={war.attacker}
            coAttackers={war.coAttackers}
            coDefenders={war.coDefenders}
            defender={war.defender}
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
            label={
               <WarChanceTooltip
                  successChance={successChance}
                  failChance={failChance}
                  requiredWarScore={war.requiredWarScore}
               />
            }
         >
            <div className="row mx10 my5">
               <div className="f1">{$t(L.LengthOfTheWarEstTimeLeft)}</div>
               <div>
                  {formatNumber(war.log.length)}/
                  {successChance - failChance <= 0 ? (
                     <span className="text-red">{$t(L.Never)}</span>
                  ) : (
                     <>{$t(L.XMonths, formatNumber(estimatedTimeLeft))}</>
                  )}
               </div>
            </div>
         </FloatingTip>
         {forceAttack > 0 && (
            <div className="row mx10 my5 text-yellow">
               <div className="f1">{$t(L.ForcefulAttack)}</div>
               <div>{$t(L.XMonthsLeft, formatNumber(forceAttack))}</div>
            </div>
         )}
         {isWon && (
            <div className="mx10 my5 text-green">
               {$t(L.AfterXMonthsYHasWonTheWar, formatNumber(war.log.length), war.attacker)}
            </div>
         )}
         {war.attacker === G.save.state.playerProvince && !isWon && successChance < 0.5 && (
            <div className="mx10 my5 text-red">{$t(L.WarIsNotExpectedToWin)}</div>
         )}
         {war.attacker === G.save.state.playerProvince && !isWon && isWarStalled(war, G.save) && (
            <div className="mx10 my5 text-yellow">{$t(L.WarIsStalledDueToInsufficientMilitaryPoints)}</div>
         )}
         <div className="row m10">
            <div className="f1 stretch">
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>{$t(L.Date)}</th>
                        <th>{$t(L.Roll)}</th>
                        <th>{$t(L.Chance)}</th>
                        <th>{$t(L.Result)}</th>
                        <th>{$t(L.Score)}</th>
                     </tr>
                  </thead>
                  <tbody>
                     {war.log.slice(0, 20).map((log) => (
                        <tr key={log.month}>
                           <td>{monthToDate(log.month).toLocaleDateString()}</td>
                           <td>{log.roll >= 0 ? formatPercent(log.roll) : "-"}</td>
                           <td>{formatPercent(log.successChance)}</td>
                           <td>{log.result}</td>
                           <td className="text-right">
                              <WarLogScoreComp log={log} />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="f1 box stretch">
               <div className="m10 col g10 stretch">
                  <SignPeaceTreatyButton war={war} province={G.save.state.playerProvince} />
                  <NegotiateWhitePeaceButton war={war} province={G.save.state.playerProvince} />
                  <LeaveWarCoalitionButton war={war} province={G.save.state.playerProvince} />
                  <MakeWarSpeechButton war={war} province={G.save.state.playerProvince} />
                  <FortifyOurBordersButton war={war} province={G.save.state.playerProvince} />
                  <HireMercenariesButton war={war} province={G.save.state.playerProvince} />
                  <PlunderWarTilesButton war={war} province={G.save.state.playerProvince} />
                  <ForceAttackButton war={war} province={G.save.state.playerProvince} />
                  <DecimateOurArmyButton war={war} province={G.save.state.playerProvince} />
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
                           <div className="f1">{getTileName(tile)}</div>
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
                                       showSidebar(<TilePage tile={tile} />);
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
               <FloatingTip disabled={!CasusBelli[war.casusBelli].effect} label={CasusBelli[war.casusBelli].effect?.()}>
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
                     <BreakdownTooltip breakdown={getWarPower(G.save.state.playerProvince, G.save)}>
                        <div className="m10 text-italic text-red text-sm">
                           {$t(L.WeAreInvolvedInMultipleOngoingWarsOurWarPowerIsReduced)}
                        </div>
                     </BreakdownTooltip>
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
         <FloatingTip label={$t(L.TimedActionForceAttackDesc, "10%", "1")}>
            <span className="text-red">0*</span>
         </FloatingTip>
      );
   }
   return colorNumber(WarResultScore[log.result]);
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
         action={SignPeaceTreatyAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <div className="h2">{$t(L.PeaceTreatyHasTheFollowingEffects)}</div>
               <div className="m10">
                  <PeaceTreatyTooltip war={war} />
               </div>
               {element}
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
               <div className="m10">
                  <WhitePeaceTooltip war={war} />
               </div>
               {element}
            </>
         )}
         action={NegotiateWhitePeaceAction(war, province, G.save)}
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
                  {$t(L.LeavingWarCoalitionTooltip, coalitionLeader, "50", formatNumber(getTruceLength(war)))}
               </div>
               {element}
            </>
         )}
         action={{
            cost: { diplomatic: WhitePeaceCostPerTile * war.tiles.size },
            condition: finalizeCondition({
               breakdown: [
                  {
                     name: $t(L.WeAreACoAttackerOrCoDefenderOfTheWar),
                     value: war.coAttackers.has(province) || war.coDefenders.has(province),
                  },
                  {
                     name: $t(L.WarHasNotEndedYet),
                     value: war.actualWarScore < war.requiredWarScore,
                  },
                  { name: $t(L.WarHasBeenGoingOnForAtLeastAYear), value: war.log.length >= 12 },
               ],
            }),
            effect: ({ headless }) => {
               war.coAttackers.delete(province);
               war.coDefenders.delete(province);
               addAttitudeModifier(
                  coalitionLeader,
                  province,
                  {
                     type: "add",
                     name: $t(
                        L.XLeftWarCoalitionInYZWar,
                        getProvinceName(province, G.save),
                        getProvinceName(war.attacker, G.save),
                        getProvinceName(war.defender, G.save),
                     ),
                     value: -50,
                     duration: getTruceLength(war),
                  },
                  G.save,
               );
               if (!headless) {
                  showSuccess($t(L.WeHaveLeftTheXWar, `${war.attacker}-${war.defender}`));
                  hideModal();
               }
            },
         }}
      >
         {$t(L.LeaveWarCoalition)}
      </ActionButton>
   );
}

function MakeWarSpeechButton({ war, province }: { war: IWar; province: Province }): React.ReactNode {
   if (war.attacker !== province && war.defender !== province) {
      return null;
   }
   if (war.actualWarScore >= war.requiredWarScore) {
      return null;
   }
   return (
      <ActionButton
         className="btn py2"
         action={{
            cost: { administrative: 50 },
            condition: finalizeCondition({
               breakdown: [
                  ...timedActionConditions({ action: "MakeWarSpeech" }, province, G.save),
                  {
                     name: $t(L.WeAreTheLeadAttackerOrDefenderOfTheWar),
                     value: war.attacker === province || war.defender === province,
                  },
                  {
                     name: $t(L.WeAreWithinTheFirstYearOfWar),
                     value: war.log.length <= 12,
                  },
                  {
                     name: $t(L.WeHaventWonTheWar),
                     value: war.actualWarScore < war.requiredWarScore,
                  },
               ],
            }),
            effect: () => {
               startTimedAction("MakeWarSpeech", province, G.save);
            },
         }}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="MakeWarSpeech" />
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
         action={{
            cost: { administrative: 50 },
            condition: finalizeCondition({
               breakdown: [
                  ...timedActionConditions({ action: "FortifyBorders" }, province, G.save),
                  { name: $t(L.XYWarIsOngoing, war.attacker, war.defender), value: true },
                  {
                     name: $t(L.WeAreTheLeadAttackerOrDefenderOfTheWar),
                     value: war.attacker === province || war.defender === province,
                  },
                  {
                     name: $t(L.WeHaventWonTheWar),
                     value: war.actualWarScore < war.requiredWarScore,
                  },
               ],
            }),
            effect: () => {
               startTimedAction("FortifyBorders", province, G.save);
            },
         }}
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
         action={HireMercenariesAction(war, province, G.save)}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="HireMercenaries" />
               {element}
               <div className="divider" />
               <div className="m10">{$t(L.TheCostOfHiringMercenariesIsCalculatedAsFollows)}</div>
               <BreakdownComp breakdown={getMercenaryCost(province, G.save)} />
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
         action={{
            condition: finalizeCondition({
               breakdown: [
                  ...timedActionConditions({ action: "PlunderWarTile" }, province, G.save),
                  {
                     name: $t(L.WeHaveNotPlunderedWarTilesYet),
                     value: !hasFlag(war.flag, WarFlag.Plunder),
                  },
                  {
                     name: $t(L.WeAreTheLeadAttackerOfTheWar),
                     value: war.attacker === province,
                  },
                  { name: $t(L.WeHaventWonTheWar), value: war.actualWarScore < war.requiredWarScore },
               ],
            }),
            effect: () => {
               war.flag = setFlag(war.flag, WarFlag.Plunder);
               war.requiredWarScore += plunder.warScore.value;
            },
         }}
         tooltip={(element) => (
            <>
               {element}
               <div className="divider" />
               <div className="m10">{html($t(L.PlunderingWarTilesWillReduceTheRequiredWarScore))}</div>
               <BreakdownComp breakdown={plunder.warScore} />
               <div className="divider" />
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
         action={{
            condition: finalizeCondition({
               breakdown: [
                  ...timedActionConditions({ action: "ForceAttack" }, province, G.save),
                  {
                     name: $t(L.WeAreTheLeadAttackerOfTheWar),
                     value: war.attacker === province,
                  },
                  { name: $t(L.WeHaventWonTheWar), value: war.actualWarScore < war.requiredWarScore },
               ],
            }),
            effect: () => {
               startTimedAction("ForceAttack", province, G.save);
            },
         }}
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
   return (
      <ActionButton
         className="btn py2"
         action={{
            cost: {
               gold: getArmyMaintenanceCost(province, G.save).value,
            },
            condition: finalizeCondition({
               breakdown: [
                  ...timedActionConditions({ action: "DecimateOurArmy" }, province, G.save),
                  { name: $t(L.WeAreTheLeadAttackerOfTheWar), value: war.attacker === province },
                  { name: $t(L.WeHaventWonTheWar), value: war.actualWarScore < war.requiredWarScore },
               ],
            }),
            effect: () => {
               startTimedAction("DecimateOurArmy", province, G.save);
               war.actualWarScore += 1;
               setProvinceStat(
                  "actualConscription",
                  getProvinceStat("actualConscription", province, G.save) * 0.9,
                  province,
                  G.save,
               );
            },
         }}
         tooltip={(element) => (
            <>
               <TimedActionDescComp action="DecimateOurArmy" />
               {element}
            </>
         )}
      >
         {TimedActions.DecimateOurArmy.name()}
      </ActionButton>
   );
}

export function WhitePeaceTooltip({ war }: { war: IWar }): React.ReactNode {
   return <>{$t(L.WhitePeaceTooltip, formatNumber(getTruceLength(war)), war.attacker, war.defender)}</>;
}

export function PeaceTreatyTooltip({ war }: { war: IWar }): React.ReactNode {
   const tileNames = Array.from(war.tiles)
      .map((tile) => getTileName(tile))
      .join(", ");
   return (
      <ul>
         <li>{html($t(L.XShallCedeYToZ, war.defender, tileNames, war.attacker))}</li>
         <li>
            {$t(
               L.AXMonthTruceShallBeEnactedBetweenYAndZ,
               formatNumber(getTruceLength(war)),
               war.attacker,
               war.defender,
            )}
         </li>
         <li>
            {html(
               $t(
                  L.XGetsAYCasusBelliAgainstZForPYears,
                  war.defender,
                  CasusBelli.Reconquista.name(),
                  war.attacker,
                  "10",
               ),
            )}
         </li>
      </ul>
   );
}
