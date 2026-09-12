import { forEach, keysOf, shuffle } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { Buildings } from "../definitions/Building";
import { Goods, Price } from "../definitions/Goods";
import { LegacyUpgrades } from "../definitions/LegacyUpgrade";
import type { ActiveTrade, Province, TradeOffer, TradeOfferBase } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import type { SaveGame } from "../GameState";
import { getAttitudeTowards, getRelations } from "./DiplomacyLogic";
import { hasLegacyUpgrade } from "./LegacyUpgradeLogic";
import { attachModifiers } from "./ModifierLogic";
import { hasStraitOfGibraltar } from "./ProvinceLogic";
import { getTreatyCount } from "./TreatyLogic";

export function getProvinceTrades(province: Province, save: SaveGame): Map<Province, ActiveTrade> {
   const result = new Map<Province, ActiveTrade>();
   const relations = getRelations(province, save);
   if (relations) {
      for (const [otherProvince, relation] of relations) {
         if (relation.trade) {
            result.set(otherProvince, relation.trade);
         }
      }
   }
   return result;
}

export function rollTradeOffers(save: SaveGame): void {
   forEach(save.state.provinces, (province, state) => {
      const goods = shuffle(keysOf(Goods));
      state.tradeOffers = [
         fillOfferAmount({ theyOffer: goods[0], weOffer: goods[1] }),
         fillOfferAmount({ theyOffer: goods[2], weOffer: "gold" }),
         fillOfferAmount({ theyOffer: "gold", weOffer: goods[3] }),
      ];
   });
}

export function fillOfferAmount(offer: TradeOfferBase): TradeOffer {
   const result: TradeOffer = { ...offer, theyOfferAmount: 0, weOfferAmount: 0 };
   if (result.theyOffer !== "gold" && result.weOffer !== "gold") {
      if (Price[result.weOffer] > Price[result.theyOffer]) {
         result.weOfferAmount = 1;
         result.theyOfferAmount = Price[result.weOffer] / Price[result.theyOffer];
      } else {
         result.theyOfferAmount = 1;
         result.weOfferAmount = Price[result.theyOffer] / Price[result.weOffer];
      }
   }
   if (result.weOffer === "gold") {
      result.theyOfferAmount = 1;
      result.weOfferAmount = Price[result.theyOffer];
   }
   if (result.theyOffer === "gold") {
      result.weOfferAmount = 1;
      result.theyOfferAmount = Price[result.weOffer];
   }
   return result;
}

export function getProvinceTradeCapacity(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BaseValue), value: 1 });
   let harbour = 0;
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province && data.buildings.has("Harbour")) {
         ++harbour;
      }
   }
   if (harbour > 0) {
      result.add.push({ name: Buildings.Harbour.name(), value: harbour });
   }
   if (hasProvinceUpgrade("CommercialAlliances", province, save)) {
      const treatyCount = getTreatyCount(province, save);
      result.add.push({ name: ProvinceUpgrades.CommercialAlliances.name(), value: treatyCount });
   }
   if (hasProvinceUpgrade("CommandOfThePillars", province, save) && hasStraitOfGibraltar(province, save)) {
      result.add.push({ name: ProvinceUpgrades.CommandOfThePillars.name(), value: 3 });
   }
   attachModifiers("TradeCapacity", result, province, save);
   return finalizeBreakdown(result);
}

export function getProvinceTradeProfit(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({ multiplyBase: { name: $t(L.BaseValue), value: 0.1 } });
   result.add.push({ name: $t(L.ReferenceValue), value: 1 });
   if (hasProvinceUpgrade("TradeProfitForEachTrade", province, save)) {
      const tradeCount = getProvinceTrades(province, save).size;
      if (tradeCount > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.TradeProfitForEachTrade.name(),
            value: 0.1 * tradeCount,
         });
      }
   }
   if (hasProvinceUpgrade("MaritimeProsperity", province, save)) {
      let harbour = 0;
      for (const [tile, data] of save.state.tiles) {
         if (data.province === province && data.buildings.has("Harbour")) {
            ++harbour;
         }
      }
      if (harbour > 0) {
         result.multiply.push({ name: ProvinceUpgrades.MaritimeProsperity.name(), value: harbour * 0.1 });
      }
   }
   if (hasProvinceUpgrade("CommandOfThePillars", province, save) && hasStraitOfGibraltar(province, save)) {
      result.multiply.push({ name: ProvinceUpgrades.CommandOfThePillars.name(), value: 0.3 });
   }
   attachModifiers("TradeProfit", result, province, save);
   return finalizeBreakdown(result);
}

export function getTradeProfit(ourProvince: Province, theirProvince: Province, save: SaveGame): IValueBreakdown {
   const tradeProfit = getProvinceTradeProfit(ourProvince, save);
   if (hasLegacyUpgrade("TradeProfitForAttitude", ourProvince, save)) {
      const attitude = getAttitudeTowards(theirProvince, ourProvince, save);
      if (attitude.value > 0) {
         tradeProfit.multiply.push({
            name: $t(L.LegacyUpgrade),
            desc: LegacyUpgrades.TradeProfitForAttitude.name(),
            value: attitude.value * 0.01,
         });
      }
   }
   return finalizeBreakdown(tradeProfit);
}

export function generateTrade(
   offer: TradeOfferBase,
   extraProfit: number,
   province: Province,
   save: SaveGame,
): { trade: TradeOffer; profit: number } {
   const tradeCapacity = getProvinceTradeCapacity(province, save).value;
   const tradeProfit = getProvinceTradeProfit(province, save).value;
   const result = fillOfferAmount({ ...offer });
   const totalProfit = tradeProfit + extraProfit;
   result.weOfferAmount *= tradeCapacity;
   result.theyOfferAmount *= tradeCapacity * (1 + totalProfit);
   return { trade: result, profit: totalProfit };
}
