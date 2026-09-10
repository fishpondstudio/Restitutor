import { Popover, ScrollArea, Switch } from "@mantine/core";
import { cls, entriesOf, formatDelta, formatNumber, formatPercent, keysOf } from "@project/shared/src/utils/Helper";
import { useEffect, useState } from "react";
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
   getTradeProfit,
} from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

const savedFilters = {
   selectedProvinces: new Set<Province>(),
   showAvailable: false,
   selectedWeOffer: new Set<Goods | "gold">(),
   selectedTheyOffer: new Set<Goods | "gold">(),
};

export function TradeSingletonModal({ provinces }: { provinces: Set<Province> }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const [selectedProvinces, setSelectedProvinces] = useState(
      () => new Set(provinces.size > 0 ? provinces : savedFilters.selectedProvinces),
   );
   const [showAvailable, setShowAvailable] = useState(() => (provinces.size > 0 ? false : savedFilters.showAvailable));
   const [selectedWeOffer, setSelectedWeOffer] = useState(
      () => new Set(provinces.size > 0 ? [] : savedFilters.selectedWeOffer),
   );
   const [selectedTheyOffer, setSelectedTheyOffer] = useState(
      () => new Set(provinces.size > 0 ? [] : savedFilters.selectedTheyOffer),
   );
   useEffect(() => {
      savedFilters.selectedProvinces = selectedProvinces;
      savedFilters.showAvailable = showAvailable;
      savedFilters.selectedWeOffer = selectedWeOffer;
      savedFilters.selectedTheyOffer = selectedTheyOffer;
   }, [selectedProvinces, showAvailable, selectedWeOffer, selectedTheyOffer]);
   const hasActiveFilters =
      selectedProvinces.size > 0 || selectedWeOffer.size > 0 || selectedTheyOffer.size > 0 || showAvailable;
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
               hideAdditive
            >
               <div className="f1 row mx10 my5">
                  <div className="f1">{Modifiers.TradeProfit.name()}</div>
                  <div>{formatPercent(tradeProfit.value)}</div>
               </div>
            </BreakdownTooltip>
            <div className="divider vertical" />
            <FloatingTip label={() => $t(L.TradeOffersRefreshEveryYear)}>
               <div className="f1 row mx10 my5">
                  <div className="f1">{$t(L.ActiveTrades)}</div>
                  <div>{formatNumber(trades.size)}</div>
               </div>
            </FloatingTip>
         </div>
         <div className="m10">
            <table className="data-table">
               <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                     <th>
                        <div className={cls("row fstart g5", selectedProvinces.size > 0 ? "text-primary" : "")}>
                           <div>{$t(L.Province)}</div>
                           <TradeProvinceFilter selected={selectedProvinces} onChange={setSelectedProvinces} />
                        </div>
                     </th>
                     <th colSpan={2}>
                        <div className={cls("row fstart g5", selectedWeOffer.size > 0 ? "text-primary" : "")}>
                           <div>{$t(L.WeOffer)}</div>
                           <TradeGoodsFilter selected={selectedWeOffer} onChange={setSelectedWeOffer} />
                        </div>
                     </th>
                     <th>
                        <div className={cls("row fstart g5", selectedTheyOffer.size > 0 ? "text-primary" : "")}>
                           <div>{$t(L.TheyOffer)}</div>
                           <TradeGoodsFilter selected={selectedTheyOffer} onChange={setSelectedTheyOffer} />
                        </div>
                     </th>
                     <th>{$t(L.Duration)}</th>
                     <th>
                        <div className="row">
                           <div className="f1"></div>
                           {hasActiveFilters && (
                              <FloatingTip label={() => "Clear all filters"}>
                                 <div
                                    className="mi sm text-primary pointer"
                                    onClick={() => {
                                       setSelectedProvinces(new Set());
                                       setSelectedWeOffer(new Set());
                                       setSelectedTheyOffer(new Set());
                                       setShowAvailable(false);
                                    }}
                                 >
                                    filter_list_off
                                 </div>
                              </FloatingTip>
                           )}
                           <FloatingTip label={() => $t(L.OnlyShowAvailableTrades)}>
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
                                 L.$1$2Months,
                                 formatNumber(offer.monthsLeft),
                                 formatNumber(TimedActions.TradeGoods.duration),
                              )}
                           </td>
                           <td className="text-right">
                              <FloatingTip
                                 label={() => <>{html($t(L.CancellingThisTradeWillNotResetTradeCooldown))}</>}
                              >
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
                        if (selectedWeOffer.size > 0 && !selectedWeOffer.has(offer_.weOffer)) return null;
                        if (selectedTheyOffer.size > 0 && !selectedTheyOffer.has(offer_.theyOffer)) return null;
                        const profit = getTradeProfit(G.save.state.playerProvince, province, G.save);
                        const offer = {
                           ...offer_,
                           weOfferAmount: offer_.weOfferAmount * tradeCapacity.value,
                           theyOfferAmount: offer_.theyOfferAmount * tradeCapacity.value * (1 + profit.value),
                        };
                        const action = () => TradeWithAction(G.save.state.playerProvince, province, offer, G.save);
                        if (showAvailable && !canDoAction(action(), G.save.state.playerProvince, G.save)) return null;
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
                              <td>{$t(L.$1Months, formatNumber(TimedActions.TradeGoods.duration))}</td>
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
                                                   <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                                                </div>
                                             </div>
                                             {offer.weOffer !== "gold" && (
                                                <div className="text-xs text-dimmed text-right">
                                                   {$t(L.$1Production, Goods[offer.weOffer].name())}:{" "}
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
                                                   <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                                                </div>
                                             </div>
                                             <div className="row my5">
                                                <div className="f1">{$t(L.Duration)}</div>
                                                <div>
                                                   {$t(L.$1Months, formatNumber(TimedActions.TradeGoods.duration))}
                                                </div>
                                             </div>
                                          </div>
                                          <div className="h2">{$t(L.TradeProfit)}</div>
                                          <BreakdownComp breakdown={profit} formatFunc={formatPercent} hideAdditive />
                                          {element}
                                          <div className="divider" />
                                          <div className="text-display mx10 my5">{$t(L.FinePrint)}</div>
                                          <ul className="m5 text-dimmed text-xs">
                                             <li>{$t(L.ThisTradeCanBeCancelledAtAnyTime)}</li>
                                             <li>{html($t(L.CancellingThisTradeWillNotResetTradeCooldown))}</li>
                                             <li>{$t(L.IfWeDontHaveEnoughGoodsTradeWillBeSkipped)}</li>
                                             <li>{$t(L.TradeWillBeCancelledIfAStateOfWarExistsBetweenUsAndThem)}</li>
                                          </ul>
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

function TradeProvinceFilter({
   selected,
   onChange,
}: {
   selected: Set<Province>;
   onChange: (selected: Set<Province>) => void;
}): React.ReactNode {
   return (
      <Popover position="bottom-start">
         <Popover.Target>
            <div className="mi sm pointer">filter_list</div>
         </Popover.Target>
         <Popover.Dropdown className="p0 panel">
            <div className="m5">
               <button className="btn text-sm w100" onClick={() => onChange(new Set())}>
                  {$t(L.ClearAll)}
               </button>
            </div>
            <div className="divider" />
            <ScrollArea h="50vh">
               {keysOf(G.save.state.provinces)
                  .sort((a, b) => a.localeCompare(b))
                  .map((province) => {
                     if (province === G.save.state.playerProvince) return null;
                     return (
                        <div
                           key={province}
                           className={cls(
                              "row hover-highlight g5 p5 pr10 pointer text-sm",
                              selected.has(province) ? "primary text-primary" : "",
                           )}
                           onClick={() => {
                              const result = new Set(selected);
                              if (result.has(province)) {
                                 result.delete(province);
                              } else {
                                 result.add(province);
                              }
                              onChange(result);
                           }}
                        >
                           <div className="mi sm">
                              {selected.has(province) ? "check_box" : "check_box_outline_blank"}
                           </div>
                           <div className="f1">{getProvinceName(province, G.save)}</div>
                        </div>
                     );
                  })}
            </ScrollArea>
         </Popover.Dropdown>
      </Popover>
   );
}

function TradeGoodsFilter({
   selected,
   onChange,
}: {
   selected: Set<Goods | "gold">;
   onChange: (selected: Set<Goods | "gold">) => void;
}): React.ReactNode {
   const goods: (Goods | "gold")[] = ["gold", ...keysOf(Goods)];
   return (
      <Popover position="bottom-start">
         <Popover.Target>
            <div className="mi sm pointer">filter_list</div>
         </Popover.Target>
         <Popover.Dropdown className="p0 panel">
            <div className="m5">
               <button className="btn text-sm w100" onClick={() => onChange(new Set())}>
                  {$t(L.ClearAll)}
               </button>
            </div>
            <div className="divider" />
            <ScrollArea h="50vh">
               {goods.map((goods) => (
                  <div
                     key={goods}
                     className={cls(
                        "row hover-highlight g5 p5 pr10 pointer text-sm",
                        selected.has(goods) ? "primary text-primary" : "",
                     )}
                     onClick={() => {
                        const result = new Set(selected);
                        if (result.has(goods)) {
                           result.delete(goods);
                        } else {
                           result.add(goods);
                        }
                        onChange(result);
                     }}
                  >
                     <div className="mi sm">{selected.has(goods) ? "check_box" : "check_box_outline_blank"}</div>
                     <div className="f1">{goods === "gold" ? $t(L.Gold) : Goods[goods].name()}</div>
                  </div>
               ))}
            </ScrollArea>
         </Popover.Dropdown>
      </Popover>
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
         fixedWidth
         label={() => (
            <>
               {isWarning ? (
                  <div className="m10">
                     {html(
                        $t(L.OurStorageIsRunningLowOn$1NotEnoughForTheWholeTradeDuration, Goods[offer.weOffer].name()),
                     )}
                  </div>
               ) : (
                  <div className="m10 text-red">
                     {html($t(L.WeDoNotHaveEnough$1InStorageForThisTrade, Goods[offer.weOffer].name()))}
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
         )}
      >
         <div className="row g5 fstart">
            <div className={cls("mi xs", isWarning ? "text-dimmed" : "text-red")}>
               {isWarning ? "info" : "release_alert"}
            </div>
         </div>
      </FloatingTip>
   );
}
