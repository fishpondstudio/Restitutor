import { entriesOf, forEach, mapSafeAdd, sizeOf } from "@project/shared/src/utils/Helper";
import { type Edge, MarkerType, type Node } from "@xyflow/react";
import type { ProductionNode } from "../../ui/ProductionNode";
import { Goods, Price } from "../definitions/Goods";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getRelations } from "./DiplomacyLogic";
import {
   addProvinceResource,
   getProvinceProductionCapacity,
   getProvinceResource,
   getProvinceStat,
   hasEnoughProvinceResources,
   spendProvinceResource,
} from "./ProvinceLogic";
import { hasResearched } from "./TechLogic";
import { getTileOutput } from "./TileLogic";

export const ProductionNodeWidth = 150;
export const ProductionNodeHeight = 150;
export const ProductionNodeSpacingX = 20;
export const ProductionNodeSpacingY = 100;

export function makeProductionTree(province: Province, save: SaveGame): { nodes: Node[]; edges: Edge[] } {
   const nodes: ProductionNode[] = [];
   const edges: Edge[] = [];
   const production = save.state.provinces[province]?.production;
   if (!production) {
      return { nodes, edges };
   }
   for (const [goods, def] of entriesOf(Goods)) {
      nodes.push({
         id: goods,
         data: { goods },
         type: "ProductionNode",
         position: {
            x: def.position.x * (ProductionNodeWidth + ProductionNodeSpacingX),
            y: def.position.y * (ProductionNodeHeight + ProductionNodeSpacingY),
         },
      });
      for (const [input, amount] of entriesOf(def.input)) {
         let sourceHandle = "mid";
         let targetHandle = "mid";
         const inputPosition = Goods[input].position;
         if (inputPosition.x < def.position.x) {
            sourceHandle = "right";
            targetHandle = "left";
         } else if (inputPosition.x > def.position.x) {
            sourceHandle = "left";
            targetHandle = "right";
         }
         edges.push({
            id: `${input}->${goods}`,
            source: input,
            sourceHandle: sourceHandle,
            target: goods,
            targetHandle: targetHandle,
            markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--mantine-color-dark-3)" },
            style: {
               strokeWidth: 2,
               stroke: "var(--mantine-color-dark-3)",
            },
            label: `${amount * production[goods].capacity}`,
            labelStyle: {
               fontSize: "var(--mantine-font-size-md)",
               fill: "var(--mantine-color-dark-1)",
            },
            labelShowBg: false,
         });
      }
   }
   return { nodes, edges };
}

export type GoodsIO = {
   produced: number;
   imported: number;
   consumed: number;
   exported: number;
};

export function initTileProduction(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   forEach(Goods, (goods, def) => {
      if (sizeOf(def.input) === 0) {
         state.production[goods].capacity = 0;
      }
   });
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         state.production[data.goods].capacity += getTileOutput(tile, save).value;
      }
   }
}

export function tickProduction(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const monthly = state.monthly;
   monthly.tradeGold.clear();
   monthly.goodsTax.clear();
   monthly.skippedTrade.clear();
   initTileProduction(province, save);
   const relations = getRelations(province, save);
   // Trades
   if (relations) {
      for (const [otherProvince, relation] of relations) {
         if (relation.trade) {
            if (relation.trade.monthsLeft <= 0) {
               relation.trade = undefined;
               continue;
            }
            --relation.trade.monthsLeft;
            const { theyOffer, theyOfferAmount, weOffer, weOfferAmount } = relation.trade;
            if (weOffer !== "gold" && !hasEnoughProvinceResources({ [weOffer]: weOfferAmount }, province, save)) {
               monthly.skippedTrade.add(otherProvince);
               continue;
            }
            if (weOffer === "gold") {
               mapSafeAdd(monthly.tradeGold, otherProvince, -weOfferAmount);
            } else {
               spendProvinceResource(weOffer, weOfferAmount, province, save);
            }
            if (theyOffer === "gold") {
               mapSafeAdd(monthly.tradeGold, otherProvince, theyOfferAmount);
            } else {
               addProvinceResource(theyOffer, theyOfferAmount, province, save);
            }
         }
      }
   }

   // Production
   const goodsTaxRate = getProvinceStat("goodsTaxRate", province, save) / 100;
   forEach(Goods, (goods, def) => {
      const capacity = state.production[goods].capacity;
      if (capacity <= 0) {
         return;
      }
      if (getInsufficientInput(goods, province, save).size === 0) {
         forEach(def.input, (inputGoods, inputAmount) => {
            spendProvinceResource(inputGoods, inputAmount * capacity, province, save);
         });
         addProvinceResource(goods, capacity * (1 - goodsTaxRate), province, save);
         mapSafeAdd(monthly.goodsTax, goods, capacity * goodsTaxRate * Price[goods]);
      }
   });
}

export function getInsufficientInput(goods: Goods, province: Province, save: SaveGame): Map<Goods, number> {
   const result = new Map<Goods, number>();
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   const capacity = state.production[goods].capacity;
   if (capacity <= 0) {
      return result;
   }
   forEach(Goods[goods].input, (inputGoods, inputAmount) => {
      const surplus = getProvinceResource(inputGoods, province, save) - inputAmount * capacity;
      if (surplus < 0) {
         result.set(inputGoods, surplus);
      }
   });
   return result;
}

export function getGoodsTraded(goods: Goods, province: Province, save: SaveGame): number {
   let result = 0;
   const relations = getRelations(province, save);
   if (!relations) {
      return 0;
   }
   for (const [otherProvince, relation] of relations) {
      if (relation.trade) {
         const { theyOffer, theyOfferAmount, weOffer, weOfferAmount } = relation.trade;
         if (theyOffer === goods) {
            result += theyOfferAmount;
         }
         if (weOffer === goods) {
            result -= weOfferAmount;
         }
      }
   }
   return result;
}

export function getGoodsConsumed(goods: Goods, province: Province, save: SaveGame): number {
   let result = 0;
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   forEach(state.production, (g, data) => {
      const config = Goods[g];
      if (config.input[goods]) {
         result += config.input[goods] * data.capacity;
      }
   });
   return result;
}

export function optimizeProduction(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const production = state.production;
   const totalCapacity = getProvinceProductionCapacity(province, save).value;
   let usedCapacity = 0;
   for (const [goods, data] of entriesOf(production)) {
      if (sizeOf(Goods[goods].input) > 0) {
         data.capacity = 0;
      }
   }
   outer: while (true) {
      let hasChanged = false;
      for (const [goods, def] of entriesOf(Goods)) {
         if (usedCapacity >= totalCapacity) {
            break outer;
         }
         if (sizeOf(def.input) === 0) {
            continue;
         }
         const tech = Goods[goods].tech;
         if (tech && !hasResearched(tech, province, save)) {
            continue;
         }
         production[goods].capacity++;
         if (isProductionSelfSufficient(province, save)) {
            usedCapacity++;
            hasChanged = true;
         } else {
            production[goods].capacity--;
         }
      }
      if (!hasChanged) {
         break;
      }
   }
}

export function resetProduction(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const production = state.production;
   for (const [goods, data] of entriesOf(production)) {
      if (sizeOf(Goods[goods].input) > 0) {
         data.capacity = 0;
      }
   }
}

function isProductionSelfSufficient(province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   const production = state.production;
   const goodsTaxRate = getProvinceStat("goodsTaxRate", province, save) / 100;
   for (const [goods, data] of entriesOf(production)) {
      if (data.capacity * (1 - goodsTaxRate) < getGoodsConsumed(goods, province, save)) {
         return false;
      }
   }
   return true;
}
