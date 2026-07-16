import { Progress } from "@mantine/core";
import { cls, formatNumber } from "@project/shared/src/utils/Helper";
import BarbarianRaidHeader from "../assets/images/BarbarianRaidHeader.webp";
import { finalizeCondition } from "../game/actions/GameAction";
import { NegotiateWhitePeaceAction } from "../game/actions/NegotiateWhitePeaceAction";
import { MaxRaidMonths } from "../game/definitions/SpawnedProvince";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getAttitudeTowards, getRelation, requireInfiltration } from "../game/logic/DiplomacyLogic";
import { getProvinceName, getTotalUpgrades, getWarPower } from "../game/logic/ProvinceLogic";
import { getTimedActionTimeLeft, timedActionConditions } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { CloseButtonClass, Grid2 } from "./UIConstant";

export function BarbarianRaidModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <ModalComp
         size="lg"
         title={
            <>
               <div className="text-shadow" style={{ position: "relative" }}>
                  <div
                     style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(to bottom, transparent, rgba(40, 40, 40, 1))",
                     }}
                  />
                  <FloatingTip label={$t(L.ImageCredit$1, "Alexander and Darius at Issus, Anton Hoffmann (1920)")}>
                     <div
                        className="text-roman text-lg"
                        style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem" }}
                     >
                        Barbarian Raids
                     </div>
                  </FloatingTip>
                  <div
                     className={`mi pointer text-white ${CloseButtonClass}`}
                     onClick={hideModal}
                     style={{ position: "absolute", top: "0.3125rem", right: "0.3125rem" }}
                  >
                     close
                  </div>
                  <img className="display-block w100" src={BarbarianRaidHeader} />
               </div>
               <div className="divider" />
            </>
         }
      >
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th>Barbarian</th>
                     <th>War Power</th>
                     <th style={{ width: "40%" }}>Current Raid</th>
                     <th></th>
                  </tr>
               </thead>
               <tbody>
                  {G.save.state.wars
                     .filter((war) => war.casusBelli === "BarbarianRaid")
                     .sort((a, b) => a.attacker.localeCompare(b.attacker))
                     .map((raid) => {
                        const warPower = getWarPower(raid.attacker, G.save);
                        const attitude = getAttitudeTowards(raid.attacker, G.save.state.playerProvince, G.save);
                        return (
                           <tr key={raid.attacker}>
                              <td>
                                 <BreakdownTooltip
                                    breakdown={attitude}
                                    tooltip={(element) => (
                                       <>
                                          <div className="m10">
                                             Barbarians will not raid our province if their attitude towards us is
                                             positive.
                                          </div>
                                          <div className="h2 row">
                                             <div className="f1">Attitude Towards Us</div>
                                             <div>{colorNumber(attitude.value)}</div>
                                          </div>
                                          {element}
                                       </>
                                    )}
                                 >
                                    <div>
                                       <div className="text-display text-md">
                                          {getProvinceName(raid.attacker, G.save)}
                                       </div>
                                       <div className="row g5 text-dimmed">
                                          <div className="mi xs">sentiment_neutral</div>
                                          <div className="f1">{formatNumber(attitude.value)}</div>
                                       </div>
                                    </div>
                                 </BreakdownTooltip>
                              </td>
                              <td>
                                 <BreakdownTooltip
                                    breakdown={warPower}
                                    tooltip={(element) => (
                                       <>
                                          <div className="m10">
                                             {getProvinceName(raid.attacker, G.save)} is currently receiving a
                                             significant war power boost that will end in{" "}
                                             {getTimedActionTimeLeft("BarbarianInvasions", raid.attacker, G.save)}{" "}
                                             months.
                                          </div>
                                          {element}
                                       </>
                                    )}
                                 >
                                    <div>
                                       <div>{formatNumber(warPower.value)}</div>
                                       <div className="row g5 text-dimmed">
                                          <div className="mi xs">schedule</div>
                                          <div className="f1">
                                             {getTimedActionTimeLeft("BarbarianInvasions", raid.attacker, G.save)}
                                          </div>
                                       </div>
                                    </div>
                                 </BreakdownTooltip>
                              </td>
                              <td>
                                 {raid && (
                                    <>
                                       <div className="row">
                                          <div>
                                             <span
                                                className={cls(
                                                   "text-display text-md",
                                                   raid.defender === G.save.state.playerProvince ? "text-yellow" : "",
                                                )}
                                             >
                                                {getProvinceName(raid.defender, G.save)}
                                             </span>{" "}
                                             <span className="text-dimmed">
                                                (
                                                {Array.from(raid.tiles)
                                                   .map((tile) => getTileName(tile))
                                                   .join(", ")}
                                                )
                                             </span>
                                          </div>
                                          <div className="f1" />
                                          <div>
                                             {raid.log.length}/{MaxRaidMonths}
                                          </div>
                                       </div>
                                       <div className="h5" />
                                       <Progress value={(100 * raid.log.length) / MaxRaidMonths} />
                                    </>
                                 )}
                              </td>
                              <td>
                                 {raid &&
                                    (raid.defender === G.save.state.playerProvince ? (
                                       <div style={{ ...Grid2, gap: "0.3125rem" }}>
                                          <ActionButton
                                             action={{
                                                cost: {
                                                   gold: getTotalUpgrades(G.save.state.playerProvince, G.save) * 12,
                                                },
                                                condition: finalizeCondition([
                                                   ...timedActionConditions(
                                                      {
                                                         action: "BarbarianActions",
                                                         label: "Barbarian actions are not on cooldown",
                                                      },
                                                      G.save.state.playerProvince,
                                                      G.save,
                                                   ),
                                                ]),
                                                effect: () => {
                                                   const rel = getRelation(
                                                      G.save.state.playerProvince,
                                                      raid.attacker,
                                                      G.save,
                                                   );
                                                   if (!rel) {
                                                      return;
                                                   }
                                                   NegotiateWhitePeaceAction(raid, raid.attacker, G.save).effect({
                                                      headless: true,
                                                   });
                                                },
                                             }}
                                             tooltip={(element) => (
                                                <>
                                                   <div className="m10">
                                                      Paying a random will end the raid on us immediately.
                                                   </div>
                                                   {element}
                                                </>
                                             )}
                                          >
                                             Ransom
                                          </ActionButton>
                                          <ActionButton
                                             action={{
                                                condition: finalizeCondition([
                                                   ...timedActionConditions(
                                                      {
                                                         action: "BarbarianActions",
                                                         label: "Barbarian actions are not on cooldown",
                                                      },
                                                      G.save.state.playerProvince,
                                                      G.save,
                                                   ),
                                                   requireInfiltration(
                                                      25,
                                                      { consume: true },
                                                      G.save.state.playerProvince,
                                                      raid.attacker,
                                                      G.save,
                                                   ),
                                                ]),
                                                effect: () => {
                                                   const rel = getRelation(
                                                      G.save.state.playerProvince,
                                                      raid.attacker,
                                                      G.save,
                                                   );
                                                   if (!rel) {
                                                      return;
                                                   }
                                                   rel.infiltrate.value -= 25;
                                                   NegotiateWhitePeaceAction(raid, raid.attacker, G.save).effect({
                                                      headless: true,
                                                   });
                                                },
                                             }}
                                             tooltip={(element) => (
                                                <>
                                                   <div className="m10">
                                                      Subverting will end the raid on us immediately.
                                                   </div>
                                                   {element}
                                                </>
                                             )}
                                          >
                                             Subvert
                                          </ActionButton>
                                       </div>
                                    ) : (
                                       <div style={{ ...Grid2, gap: "0.3125rem" }}>
                                          <ActionButton
                                             action={{
                                                cost: {
                                                   gold: getTotalUpgrades(G.save.state.playerProvince, G.save) * 12,
                                                },
                                                condition: finalizeCondition([
                                                   ...timedActionConditions(
                                                      {
                                                         action: "BarbarianActions",
                                                         label: "Barbarian actions are not on cooldown",
                                                      },
                                                      G.save.state.playerProvince,
                                                      G.save,
                                                   ),
                                                ]),
                                                effect: () => {},
                                             }}
                                             tooltip={(element) => (
                                                <>
                                                   <div className="m10">
                                                      Inciting the raid has the following effects
                                                   </div>
                                                   <div className="m10">
                                                      <div className="row my5">
                                                         <div className="f1">
                                                            {getProvinceName(raid.attacker, G.save)}'s War Power
                                                         </div>
                                                         <div>+25%</div>
                                                      </div>
                                                      <div className="row my5">
                                                         <div className="f1">
                                                            {getProvinceName(raid.defender, G.save)}'s Defense
                                                         </div>
                                                         <div>-25%</div>
                                                      </div>
                                                   </div>
                                                   {element}
                                                </>
                                             )}
                                          >
                                             Incite
                                          </ActionButton>
                                          <button className="btn">Deter</button>
                                       </div>
                                    ))}
                              </td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
      </ModalComp>
   );
}
