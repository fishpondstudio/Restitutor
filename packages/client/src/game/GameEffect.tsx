import {
   forEach,
   formatDelta,
   formatNumber,
   formatPercent,
   mapOf,
   shuffle,
   type Tile,
} from "@project/shared/src/utils/Helper";
import type React from "react";
import { html } from "../ui/components/RenderHTMLComp";
import { $t, L } from "../utils/i18n";
import { CasusBelli } from "./definitions/CasusBelli";
import { Goods } from "./definitions/Goods";
import {
   durationToString,
   type IBaseModifier,
   type Modifier,
   modifierToString,
   modifierValueToString,
} from "./definitions/Modifier";
import {
   Province,
   type ProvinceResource,
   ProvinceResourceNames,
   type ProvinceStat,
   ProvinceStatNames,
   type TradeOfferBase,
} from "./definitions/Province";
import { addProvinceUpgrade, type ProvinceUpgrade, ProvinceUpgrades } from "./definitions/ProvinceUpgrades";
import { ChristianHeresy, isChristianReligion, Religion } from "./definitions/Religion";
import type { SpawnedProvince } from "./definitions/SpawnedProvince";
import { SpawnedProvinces } from "./definitions/SpawnedProvince";
import type { ITileData } from "./definitions/Tile";
import { getTileName } from "./definitions/TileName";
import { TimedActions } from "./definitions/TimedAction";
import { RefreshTiles } from "./Events";
import { filterProvinces } from "./events/GameEventLogic";
import type { SaveGame } from "./GameState";
import { addAttitudeModifier, getRelation } from "./logic/DiplomacyLogic";
import { addModifier } from "./logic/ModifierLogic";
import {
   addProvinceResource,
   addProvinceStat,
   generateTrade,
   getProvinceName,
   spawnProvince,
} from "./logic/ProvinceLogic";

export interface IGameEffect {
   resources?: Partial<Record<ProvinceResource, number>>;
   stats?: Partial<Record<ProvinceStat, number>>;
   infiltration?: Partial<Record<Province, number>>;
   trades?: Partial<Record<Province, IEventTrade>>;
   provinceUpgrades?: ProvinceUpgrade[];
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
   provinceModifiers?: (IBaseModifier & { modifier: Modifier; province: Province })[];
   attitudes?: Partial<Record<Province, IBaseModifier & { duration: number }>>;
   casusBelli?: Partial<Record<Province, { casusBelli: CasusBelli; duration: number }>>;
   spawnProvinces?: SpawnedProvince[];
   spawnHeresies?: ChristianHeresy[];
}

export interface ICustomEffect {
   effect?: (province: Province, save: SaveGame) => void;
   desc?: (province: Province, save: SaveGame) => string;
}

export type IEventTrade = {
   offer: TradeOfferBase;
   extraProfit: number;
};

export function getGameEffectDesc(effect: IGameEffect, province: Province, save: SaveGame): React.ReactNode {
   return (
      <>
         {effect.provinceUpgrades?.map((upgrade) => (
            <div key={upgrade}>
               {$t(L.Enact$1, ProvinceUpgrades[upgrade].name())}
               {ProvinceUpgrades[upgrade].desc && (
                  <div className="text-dimmed text-xs">{ProvinceUpgrades[upgrade].desc()}</div>
               )}
            </div>
         ))}
         {effect.resources &&
            mapOf(effect.resources, (resource, amount) => (
               <div key={resource}>
                  {formatDelta(amount)} {ProvinceResourceNames[resource]()}
               </div>
            ))}
         {effect.stats &&
            mapOf(effect.stats, (stat, amount) => (
               <div key={stat}>
                  {formatDelta(amount)} {ProvinceStatNames[stat]()}
               </div>
            ))}
         {effect.modifiers &&
            mapOf(effect.modifiers, (modifier, data) => <div key={modifier}>{modifierToString(modifier, data)}</div>)}
         {effect.provinceModifiers?.map((modifier) => (
            <div key={modifier.modifier}>
               {getProvinceName(modifier.province, save)}: {modifierToString(modifier.modifier, modifier)}
            </div>
         ))}
         {effect.attitudes &&
            mapOf(filterProvinces(effect.attitudes, province, save), (fromProvince, modifier) => (
               <div key={fromProvince}>
                  {$t(
                     L.$1$2AttitudeTowardsUsFor$3,
                     modifierValueToString(modifier),
                     getProvinceName(fromProvince, save),
                     durationToString(modifier.duration),
                  )}
               </div>
            ))}
         {effect.infiltration &&
            mapOf(filterProvinces(effect.infiltration, province, save), (fromProvince, amount) => (
               <div key={fromProvince}>
                  {$t(L.$1InfiltrationTo$2, formatDelta(amount), getProvinceName(fromProvince, save))}
               </div>
            ))}
         {effect.casusBelli &&
            mapOf(filterProvinces(effect.casusBelli, province, save), (fromProvince, data) => (
               <div key={fromProvince}>
                  {$t(
                     L.Gain$1CasusBelliAgainst$2For$3,
                     CasusBelli[data.casusBelli].name(),
                     getProvinceName(fromProvince, save),
                     durationToString(data.duration),
                  )}
               </div>
            ))}
         {effect.trades &&
            mapOf(filterProvinces(effect.trades, province, save), (fromProvince, { offer, extraProfit }) => {
               const { trade, profit } = generateTrade(offer, extraProfit, province, save);
               return (
                  <div key={fromProvince}>
                     {$t(
                        L.ATradeWith$1WeOffer$2$3TheyOffer$4$5IsArranged$6,
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
         {effect.spawnProvinces?.map((province) => (
            <div key={province}>
               {html(
                  $t(
                     L.SpawnProvinceEffectDesc$1$2,
                     Province[province].name(),
                     SpawnedProvinces[province].tiles
                        .map((tile, index) =>
                           index === 0 ? `${getTileName(tile, save)} (${$t(L.Capital)})` : getTileName(tile, save),
                        )
                        .join(", "),
                  ),
               )}
            </div>
         ))}
         {effect.spawnHeresies?.map((heresy) => (
            <div key={heresy}>
               {$t(
                  L.$1SpreadsTo$2And$3OfTheChristianTiles,
                  Religion[heresy].name(),
                  ChristianHeresy[heresy].provinces.map((province) => getProvinceName(province, save)).join(", "),
                  formatPercent(ChristianHeresy[heresy].percentage),
               )}
            </div>
         ))}
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
   effect.provinceModifiers?.forEach((data) => {
      addModifier({
         ...data,
         name: source,
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
   const changedTiles: Tile[] = [];
   effect.spawnProvinces?.forEach((spawnedProvince) => {
      spawnProvince(spawnedProvince, source, save).forEach((tile) => {
         changedTiles.push(tile);
      });
   });
   effect.spawnHeresies?.forEach((heresy) => {
      const tiles = new Map<Tile, ITileData>();
      const provinces = ChristianHeresy[heresy].provinces;
      const pool = shuffle(Array.from(save.state.tiles));
      for (const province of provinces) {
         for (const [tile, tileData] of pool) {
            if (tileData.province === province && tileData.coreProvinces.has(province)) {
               tiles.set(tile, tileData);
               break;
            }
         }
      }
      const candidates = pool.filter(([tile, tileData]) => isChristianReligion(tileData.religion) && !tiles.has(tile));
      const size = Math.ceil(candidates.length * ChristianHeresy[heresy].percentage);
      candidates.slice(0, size).forEach(([tile, tileData]) => {
         tiles.set(tile, tileData);
      });
      tiles.forEach((tileData, tile) => {
         tileData.religion = heresy;
      });
   });
   if (changedTiles.length > 0) {
      RefreshTiles.emit({ tiles: changedTiles, options: { visual: true, indicator: true } });
   }
}
