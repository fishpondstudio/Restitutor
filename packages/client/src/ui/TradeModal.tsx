import { Popover, ScrollArea, Switch } from "@mantine/core";
import { cls, entriesOf, formatDelta, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { useState } from "react";
import { canDoAction } from "../game/actions/GameAction";
import { TradeWithAction } from "../game/actions/TradeActions";
import { Goods } from "../game/definitions/Goods";
import { Modifiers } from "../game/definitions/Modifier";
import type { Province, TradeOffer } from "../game/definitions/Province";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getRelation } from "../game/logic/DiplomacyLogic";
import {
   getProvinceName,
   getProvinceResource,
   getProvinceTradeCapacity,
   getProvinceTradeProfit,
   getProvinceTrades,
} from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

export function TradeModal({ provinces }: { provinces: Set<Province> }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [selectedProvinces, setSelectedProvinces] = useState<Set<Province>>(provinces);
   const [showAvailable, setShowAvailable] = useState(false);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const production = state.production;
   const tradeCapacity = getProvinceTradeCapacity(G.save.state.playerProvince, G.save);
   const trades = getProvinceTrades(G.save.state.playerProvince, G.save);
   const tradeProfit = getProvinceTradeProfit(G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.Trade)} dismiss />}>
         <div className="box row m10 text-sm">
            <BreakdownTooltip
               breakdown={tradeCapacity}
               tooltip={(element) => (
                  <>
                     <div className="m10">{Modifiers.TradeCapacity.desc()}</div>
                     {element}
                  </>
               )}
            >
               <div className="f1 row mx10 my5">
                  <div className="f1">{Modifiers.TradeCapacity.name()}</div>
                  <div>{formatNumber(tradeCapacity.value)}</div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <BreakdownTooltip
               formatFunc={formatPercent}
               breakdown={tradeProfit}
               tooltip={(element) => (
                  <>
                     <div className="m10">{Modifiers.TradeProfit.desc()}</div>
                     {element}
                  </>
               )}
            >
               <div className="f1 row mx10 my5">
                  <div className="f1">{Modifiers.TradeProfit.name()}</div>
                  <div>{formatPercent(tradeProfit.value)}</div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <FloatingTip label={$t(L.TradeOffersRefreshEveryYear)}>
               <div className="f1 row mx10 my5">
                  <div className="f1">{$t(L.ActiveTrades)}</div>
                  <div>{formatNumber(trades.size)}</div>
               </div>
            </FloatingTip>
         </div>
         <div className="m10">
            <table className="data-table">
               <thead>
                  <tr>
                     <th className="row fstart g5">
                        <div>{$t(L.Province)}</div>
                        <Popover position="bottom-start">
                           <Popover.Target>
                              <div className={cls("mi sm pointer", selectedProvinces.size > 0 ? "text-primary" : "")}>
                                 filter_list
                              </div>
                           </Popover.Target>
                           <Popover.Dropdown className="p0 panel">
                              <ScrollArea h="50vh">
                                 <button
                                    className="btn text-sm m5"
                                    onClick={() => {
                                       setSelectedProvinces(new Set());
                                    }}
                                 >
                                    {$t(L.ClearAll)}
                                 </button>
                                 <div className="divider" />
                                 {entriesOf(G.save.state.provinces)
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([p, data]) => {
                                       if (p === G.save.state.playerProvince) return null;
                                       return (
                                          <div
                                             key={p}
                                             className={cls(
                                                "row hover-highlight g5 p5 pr10 pointer text-sm",
                                                selectedProvinces.has(p) ? "primary text-primary" : "",
                                             )}
                                             onClick={() => {
                                                setSelectedProvinces((prev) => {
                                                   const result = new Set(prev);
                                                   if (result.has(p)) {
                                                      result.delete(p);
                                                   } else {
                                                      result.add(p);
                                                   }
                                                   return result;
                                                });
                                             }}
                                          >
                                             <div className="mi sm">
                                                {selectedProvinces.has(p) ? "check_box" : "check_box_outline_blank"}
                                             </div>
                                             <div className="f1">{getProvinceName(p, G.save)}</div>
                                          </div>
                                       );
                                    })}
                              </ScrollArea>
                           </Popover.Dropdown>
                        </Popover>
                     </th>
                     <th colSpan={2}>{$t(L.WeOffer)}</th>
                     <th>{$t(L.TheyOffer)}</th>
                     <th>{$t(L.Duration)}</th>
                     <th>
                        <div className="row">
                           <div className="f1"></div>
                           <FloatingTip label={$t(L.OnlyShowAvailableTrades)}>
                              <div>
                                 <Switch
                                    size="xs"
                                    checked={showAvailable}
                                    onChange={(e) => setShowAvailable(e.currentTarget.checked)}
                                 />
                              </div>
                           </FloatingTip>
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {Array.from(trades).map(([province, offer]) => {
                     return (
                        <tr key={province} className="text-primary">
                           <td>{getProvinceName(province, G.save)}</td>
                           <td className="w0">
                              <WeOfferWarning offer={offer} month={offer.monthsLeft} />
                           </td>
                           <td>
                              <div className="row fstart g5">
                                 {formatNumber(offer.weOfferAmount)}{" "}
                                 {offer.weOffer === "gold" ? (
                                    <span className="text-yellow">{$t(L.Gold)}</span>
                                 ) : (
                                    Goods[offer.weOffer].name()
                                 )}
                              </div>
                           </td>
                           <td>
                              {formatNumber(offer.theyOfferAmount)}{" "}
                              {offer.theyOffer === "gold" ? (
                                 <span className="text-yellow">{$t(L.Gold)}</span>
                              ) : (
                                 Goods[offer.theyOffer].name()
                              )}
                           </td>
                           <td>
                              {$t(
                                 L.XYMonths,
                                 formatNumber(offer.monthsLeft),
                                 formatNumber(TimedActions.TradeGoods.duration),
                              )}
                           </td>
                           <td className="text-right">
                              <FloatingTip label={<>{html($t(L.CancellingThisTradeWillNotResetTradeCooldown))}</>}>
                                 <button
                                    className="btn red"
                                    onClick={() => {
                                       const relation = getRelation(G.save.state.playerProvince, province, G.save);
                                       if (relation) {
                                          relation.trade = undefined;
                                       }
                                       GameStateUpdated.emit();
                                    }}
                                 >
                                    {$t(L.Cancel)}
                                 </button>
                              </FloatingTip>
                           </td>
                        </tr>
                     );
                  })}
                  {entriesOf(G.save.state.provinces).map(([province, data]) => {
                     if (province === G.save.state.playerProvince) return null;
                     if (selectedProvinces.size > 0 && !selectedProvinces.has(province)) return null;
                     return data.tradeOffers.map((offer_, idx) => {
                        const offer = {
                           ...offer_,
                           weOfferAmount: offer_.weOfferAmount * tradeCapacity.value,
                           theyOfferAmount: offer_.theyOfferAmount * tradeCapacity.value * (1 + tradeProfit.value),
                        };
                        const action = TradeWithAction(G.save.state.playerProvince, province, offer, G.save);
                        if (showAvailable && !canDoAction(action, G.save.state.playerProvince, G.save)) return null;
                        const weOffer = (
                           <>
                              {formatNumber(offer.weOfferAmount)}{" "}
                              {offer.weOffer === "gold" ? (
                                 <span className="text-yellow">{$t(L.Gold)}</span>
                              ) : (
                                 Goods[offer.weOffer].name()
                              )}
                           </>
                        );
                        const theyOffer = (
                           <>
                              {formatNumber(offer.theyOfferAmount)}{" "}
                              {offer.theyOffer === "gold" ? (
                                 <span className="text-yellow">{$t(L.Gold)}</span>
                              ) : (
                                 Goods[offer.theyOffer].name()
                              )}
                           </>
                        );
                        return (
                           <tr key={`${province}-${idx}`}>
                              <td>{getProvinceName(province, G.save)}</td>
                              <td className="w0">
                                 <WeOfferWarning offer={offer} month={TimedActions.TradeGoods.duration} />
                              </td>
                              <td>{weOffer}</td>
                              <td>{theyOffer}</td>
                              <td>{$t(L.XMonths, formatNumber(TimedActions.TradeGoods.duration))}</td>
                              <td className="text-right">
                                 <ActionButton
                                    action={action}
                                    id={`TradeModal_Trade_${province}_${idx}`}
                                    tooltip={(element) => (
                                       <>
                                          <div className="m10">
                                             <div className="row">
                                                <div className="f1">{$t(L.WeOffer)}</div>
                                                <div>
                                                   {weOffer}
                                                   <span className="text-dimmed text-xs">{$t(L.PerMonth)}</span>
                                                </div>
                                             </div>
                                             {offer.weOffer !== "gold" && (
                                                <div className="text-xs text-dimmed text-right">
                                                   {$t(L.XProduction, Goods[offer.weOffer].name())}:{" "}
                                                   {formatDelta(production[offer.weOffer].capacity)}, {$t(L.Storage)}:{" "}
                                                   {formatNumber(
                                                      getProvinceResource(
                                                         offer.weOffer,
                                                         G.save.state.playerProvince,
                                                         G.save,
                                                      ),
                                                   )}
                                                </div>
                                             )}
                                          </div>
                                          <div className="divider" />
                                          <div className="m10">
                                             <div className="row my5">
                                                <div className="f1">{$t(L.TheyOffer)}</div>
                                                <div>
                                                   {theyOffer}
                                                   <span className="text-dimmed text-xs">{$t(L.PerMonth)}</span>
                                                </div>
                                             </div>
                                             <div className="row my5">
                                                <div className="f1">{$t(L.Duration)}</div>
                                                <div>
                                                   {$t(L.XMonths, formatNumber(TimedActions.TradeGoods.duration))}
                                                </div>
                                             </div>
                                          </div>
                                          <div className="divider" />
                                          <div className="text-display mx10 my5">{$t(L.FinePrint)}</div>
                                          <ul className="m5 text-dimmed text-xs">
                                             <li>{$t(L.ThisTradeCanBeCancelledAtAnyTime)}</li>
                                             <li>{html($t(L.CancellingThisTradeWillNotResetTradeCooldown))}</li>
                                             <li>{$t(L.IfWeDontHaveEnoughGoodsTradeWillBeSkipped)}</li>
                                             <li>{$t(L.TradeWillBeCancelledIfAStateOfWarExistsBetweenUsAndThem)}</li>
                                          </ul>
                                          {element}
                                       </>
                                    )}
                                 >
                                    {$t(L.Trade)}
                                 </ActionButton>
                              </td>
                           </tr>
                        );
                     });
                  })}
               </tbody>
            </table>
         </div>
      </ModalComp>
   );
}

function WeOfferWarning({ offer, month }: { offer: TradeOffer; month: number }): React.ReactNode {
   if (offer.weOffer === "gold") return null;
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const production = state.production;
   const storage = getProvinceResource(offer.weOffer, G.save.state.playerProvince, G.save);
   if (storage >= offer.weOfferAmount * month) {
      return null;
   }
   const isWarning = storage >= offer.weOfferAmount;
   return (
      <FloatingTip
         className="p0"
         w={300}
         label={
            <>
               {isWarning ? (
                  <div className="m10">
                     {html(
                        $t(L.OurStorageIsRunningLowOnXNotEnoughForTheWholeTradeDuration, Goods[offer.weOffer].name()),
                     )}
                  </div>
               ) : (
                  <div className="m10 text-red">
                     {html($t(L.WeDoNotHaveEnoughXInStorageForThisTrade, Goods[offer.weOffer].name()))}
                  </div>
               )}
               <div className="h3">
                  {Goods[offer.weOffer].name()} {$t(L.Production)}
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Production)}</div>
                  <div>{colorNumber(production[offer.weOffer].capacity)}</div>
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Storage)}</div>
                  <div>{formatNumber(getProvinceResource(offer.weOffer, G.save.state.playerProvince, G.save))}</div>
               </div>
            </>
         }
      >
         <div className="row g5 fstart">
            <div className={cls("mi xs", isWarning ? "text-dimmed" : "text-red")}>
               {isWarning ? "info" : "release_alert"}
            </div>
         </div>
      </FloatingTip>
   );
}
