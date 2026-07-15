import { Progress } from "@mantine/core";
import { cls, formatNumber } from "@project/shared/src/utils/Helper";
import BarbarianRaidHeader from "../assets/images/BarbarianRaidHeader.webp";
import { MaxRaidMonths, SpawnedProvinceBoostMonths } from "../game/definitions/SpawnedProvince";
import { getTileName } from "../game/definitions/TileName";
import { GameStateUpdated } from "../game/Events";
import { getProvinceName, getWarPower } from "../game/logic/ProvinceLogic";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp } from "../utils/ModalManager";
import { BreakdownTooltip } from "./BreakdownRow";
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
                        return (
                           <tr key={raid.attacker}>
                              <td>
                                 <span className="text-display">{getProvinceName(raid.attacker, G.save)}</span>
                              </td>
                              <td>
                                 <BreakdownTooltip breakdown={warPower}>
                                    <div>{formatNumber(warPower.value)}</div>
                                 </BreakdownTooltip>
                                 <div className="text-dimmed">
                                    {getTimedActionTimeLeft("BarbarianInvasions", raid.attacker, G.save)}/
                                    {SpawnedProvinceBoostMonths}
                                 </div>
                              </td>
                              <td>
                                 {raid && (
                                    <>
                                       <div className="row">
                                          <div>
                                             <span
                                                className={cls(
                                                   "text-display",
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
                                       <div style={Grid2}>
                                          <button className="btn">Ransom</button>
                                          <button className="btn">Placate</button>
                                          <button className="btn">Negotiate</button>
                                          <button className="btn">Subvert</button>
                                       </div>
                                    ) : (
                                       <div style={Grid2}>
                                          <button className="btn">Incite</button>
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
