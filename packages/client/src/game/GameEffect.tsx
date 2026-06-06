import { forEach, formatDelta, formatNumber, formatPercent, mapOf } from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../ui/components/RenderHTMLComp";
import { $t, L } from "../utils/i18n";
import { addProvinceUpgrade, type ProvinceUpgrade, ProvinceUpgrades } from "./actions/ProvinceUpgrades";
import { CasusBelli } from "./definitions/CasusBelli";
import { Goods } from "./definitions/Goods";
import {
   type IModifier,
   type Modifier,
   modifierDurationToString,
   modifierToString,
   modifierValueToString,
} from "./definitions/Modifier";
import {
   type Province,
   type ProvinceResource,
   ProvinceResourceNames,
   type ProvinceStat,
   ProvinceStatNames,
   type TradeOfferBase,
} from "./definitions/Province";
import { TimedActions } from "./definitions/TimedAction";
import { filterProvinces } from "./events/GameEventLogic";
import type { SaveGame } from "./GameState";
import { addAttitudeModifier, getRelation } from "./logic/DiplomacyLogic";
import {
   addModifier,
   addProvinceResource,
   addProvinceStat,
   generateTrade,
   getProvinceName,
} from "./logic/ProvinceLogic";

export interface IGameEffect {
   modifiers?: Partial<Record<Modifier, Omit<IModifier, "name">>>;
   resources?: Partial<Record<ProvinceResource, number>>;
   stats?: Partial<Record<ProvinceStat, number>>;
   attitudes?: Partial<Record<Province, Omit<IModifier, "name"> & { duration: number }>>;
   infiltration?: Partial<Record<Province, number>>;
   casusBelli?: Partial<Record<Province, { casusBelli: CasusBelli; duration: number }>>;
   trades?: Partial<Record<Province, IEventTrade>>;
   provinceUpgrades?: ProvinceUpgrade[];
   custom?: ICustomEffect[];
}

export interface ICustomEffect {
   effect?: (province: Province, save: SaveGame) => void;
   desc?: (province: Province, save: SaveGame) => string;
}

export type IEventTrade = {
   offer: TradeOfferBase;
   extraProfit: number;
};

export function getGameEffectDesc(button: IGameEffect, province: Province, save: SaveGame): React.ReactNode {
   return (
      <>
         {button.provinceUpgrades?.map((upgrade) => (
            <div key={upgrade}>{$t(L.EnactX, ProvinceUpgrades[upgrade].name())}</div>
         ))}
         {button.resources &&
            mapOf(button.resources, (resource, amount) => (
               <div key={resource}>
                  {formatDelta(amount)} {ProvinceResourceNames[resource]()}
               </div>
            ))}
         {button.stats &&
            mapOf(button.stats, (stat, amount) => (
               <div key={stat}>
                  {formatDelta(amount)} {ProvinceStatNames[stat]()}
               </div>
            ))}
         {button.modifiers &&
            mapOf(button.modifiers, (modifier, data) => <div key={modifier}>{modifierToString(modifier, data)}</div>)}
         {button.attitudes &&
            mapOf(filterProvinces(button.attitudes, province, save), (fromProvince, modifier) => (
               <div key={fromProvince}>
                  {$t(
                     L.XYAttitudeTowardsUsForZ,
                     modifierValueToString(modifier),
                     getProvinceName(fromProvince, save),
                     modifierDurationToString(modifier.duration),
                  )}
               </div>
            ))}
         {button.infiltration &&
            mapOf(filterProvinces(button.infiltration, province, save), (fromProvince, amount) => (
               <div key={fromProvince}>
                  {$t(L.XInfiltrationToY, formatDelta(amount), getProvinceName(fromProvince, save))}
               </div>
            ))}
         {button.casusBelli &&
            mapOf(filterProvinces(button.casusBelli, province, save), (fromProvince, data) => (
               <div key={fromProvince}>
                  {$t(
                     L.GainXCasusBelliAgainstYForZ,
                     CasusBelli[data.casusBelli].name(),
                     getProvinceName(fromProvince, save),
                     modifierDurationToString(data.duration),
                  )}
               </div>
            ))}
         {button.trades &&
            mapOf(filterProvinces(button.trades, province, save), (fromProvince, { offer, extraProfit }) => {
               const { trade, profit } = generateTrade(offer, extraProfit, province, save);
               return (
                  <div key={fromProvince}>
                     {$t(
                        L.ATradeWithXWeOfferYTheyOfferZIsArranged,
                        getProvinceName(fromProvince, save),
                        formatNumber(trade.weOfferAmount),
                        offer.weOffer === "gold" ? ProvinceResourceNames.gold() : Goods[offer.weOffer].name(),
                        formatNumber(trade.theyOfferAmount),
                        offer.theyOffer === "gold" ? ProvinceResourceNames.gold() : Goods[offer.theyOffer].name(),
                        formatPercent(profit),
                     )}
                  </div>
               );
            })}
         {button.custom?.map(
            (effect, index) => effect.desc && <div key={index}>{html(effect.desc(province, save))}</div>,
         )}
      </>
   );
}

export function applyGameEffect(effect: IGameEffect, source: string, province: Province, save: SaveGame): void {
   forEach(effect.modifiers, (modifier, data) => {
      addModifier({
         ...data,
         name: source,
         modifier: modifier,
         province: province,
         save: save,
      });
   });
   forEach(effect.resources, (resource, amount) => {
      addProvinceResource(resource, amount, province, save);
   });
   forEach(effect.stats, (stat, amount) => {
      addProvinceStat(stat, amount, province, save);
   });
   forEach(filterProvinces(effect.attitudes ?? {}, province, save), (fromProvince, modifier) => {
      addAttitudeModifier(fromProvince, province, { ...modifier, name: source }, save);
   });
   forEach(filterProvinces(effect.infiltration ?? {}, province, save), (fromProvince, amount) => {
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.infiltrate.value += amount;
      }
   });
   forEach(filterProvinces(effect.casusBelli ?? {}, province, save), (fromProvince, data) => {
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.casusBelli.set(data.casusBelli, { monthsLeft: data.duration });
      }
   });
   forEach(filterProvinces(effect.trades ?? {}, province, save), (fromProvince, data) => {
      const { trade } = generateTrade(data.offer, data.extraProfit, province, save);
      const relation = getRelation(province, fromProvince, save);
      if (relation) {
         relation.trade = {
            ...trade,
            monthsLeft: TimedActions.TradeGoods.duration,
         };
      }
   });
   effect.provinceUpgrades?.forEach((upgrade) => {
      addProvinceUpgrade(upgrade, province, save);
   });
   effect.custom?.forEach((effect) => {
      effect.effect?.(province, save);
   });
}
