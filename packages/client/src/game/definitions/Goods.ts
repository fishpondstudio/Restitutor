import { entriesOf, forEach, sizeOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Tech } from "./Tech";

export interface IGoodsDefinition {
   name: () => string;
   input: Partial<Record<Goods, number>>;
   position: { x: number; y: number };
   tech?: Tech;
}

export class GoodsDefinitions {
   grain: IGoodsDefinition = {
      name: () => $t(L.GoodsGrain),
      input: {},
      position: { x: 0, y: 0 },
   };
   livestock: IGoodsDefinition = {
      name: () => $t(L.GoodsLivestock),
      input: {},
      position: { x: 1, y: 0 },
   };
   wood: IGoodsDefinition = {
      name: () => $t(L.GoodsWood),
      input: {},
      position: { x: 4, y: 0 },
   };
   ironOre: IGoodsDefinition = {
      name: () => $t(L.GoodsIronOre),
      input: {},
      position: { x: 3, y: 0 },
   };
   flour: IGoodsDefinition = {
      name: () => $t(L.GoodsFlour),
      input: {
         grain: 2,
      },
      position: { x: 0, y: 1 },
   };
   leather: IGoodsDefinition = {
      name: () => $t(L.GoodsLeather),
      input: {
         livestock: 2,
      },
      position: { x: 2, y: 1 },
   };
   milk: IGoodsDefinition = {
      name: () => $t(L.GoodsMilk),
      input: {
         livestock: 2,
      },
      position: { x: 1, y: 1 },
   };
   lumber: IGoodsDefinition = {
      name: () => $t(L.GoodsLumber),
      input: {
         wood: 2,
      },
      position: { x: 4, y: 1 },
   };
   ironIngots: IGoodsDefinition = {
      name: () => $t(L.GoodsIronIngots),
      input: {
         ironOre: 2,
      },
      position: { x: 3, y: 1 },
   };
   bread: IGoodsDefinition = {
      name: () => $t(L.GoodsBread),
      input: {
         flour: 2,
      },
      position: { x: 0, y: 2 },
   };
   cheese: IGoodsDefinition = {
      name: () => $t(L.GoodsCheese),
      input: {
         milk: 2,
      },
      position: { x: 1, y: 2 },
   };
   garments: IGoodsDefinition = {
      name: () => $t(L.GoodsGarments),
      input: {
         leather: 2,
      },
      position: { x: 2, y: 2 },
   };
   weapon: IGoodsDefinition = {
      name: () => $t(L.GoodsWeapon),
      input: {
         lumber: 1,
         ironIngots: 1,
      },
      position: { x: 4, y: 2 },
   };
   armor: IGoodsDefinition = {
      name: () => $t(L.GoodsArmor),
      input: {
         leather: 1,
         ironIngots: 1,
      },
      position: { x: 3, y: 2 },
   };
}

export type Goods = keyof GoodsDefinitions;
export const Goods = new GoodsDefinitions();

export const Price = {} as Record<Goods, number>;
export const Tier = {} as Record<Goods, number>;

function calculateTier(goods: Goods): number {
   const recipe = Goods[goods].input;
   if (sizeOf(recipe) === 0) {
      return 1;
   }
   return 1 + entriesOf(recipe).reduce((acc, [curr]) => Math.max(acc, calculateTier(curr)), 0);
}

function calculatePrice(goods: Goods): number {
   const recipe = Goods[goods].input;
   if (sizeOf(recipe) === 0) {
      return 2;
   }
   return (
      (1 + sizeOf(recipe) * 0.25) *
      entriesOf(recipe).reduce((acc, [curr, amount]) => acc + calculatePrice(curr) * amount, 0)
   );
}

forEach(Goods, (goods) => {
   Tier[goods] = calculateTier(goods);
   Price[goods] = calculatePrice(goods);
});

export function getGoodsProfit(goods: Goods): { price: number; cost: number; profit: number } {
   const price = Price[goods];
   const cost = entriesOf(Goods[goods].input).reduce((acc, [g, amount]) => acc + Price[g] * amount, 0);
   return { price, cost, profit: price - cost };
}
