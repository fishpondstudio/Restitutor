import { entriesOf, forEach, sizeOf } from "@project/shared/src/utils/Helper";
import Armor from "../../assets/images/goods/Armor.png";
import Bread from "../../assets/images/goods/Bread.png";
import Cheese from "../../assets/images/goods/Cheese.png";
import Flour from "../../assets/images/goods/Flour.png";
import Garments from "../../assets/images/goods/Garments.png";
import Grain from "../../assets/images/goods/Grain.png";
import IronIngots from "../../assets/images/goods/IronIngots.png";
import IronOre from "../../assets/images/goods/IronOre.png";
import Leather from "../../assets/images/goods/Leather.png";
import Livestock from "../../assets/images/goods/Livestock.png";
import Lumber from "../../assets/images/goods/Lumber.png";
import Milk from "../../assets/images/goods/Milk.png";
import Weapon from "../../assets/images/goods/Weapon.png";
import Wood from "../../assets/images/goods/Wood.png";
import { $t, L } from "../../utils/i18n";
import type { Tech } from "./Tech";

export interface IGoodsDefinition {
   name: () => string;
   input: Partial<Record<Goods, number>>;
   position: { x: number; y: number };
   icon: string;
   iconTexture: string;
   tech?: Tech;
}

export class GoodsDefinitions {
   grain: IGoodsDefinition = {
      name: () => $t(L.GoodsGrain),
      input: {},
      position: { x: 0, y: 0 },
      icon: Grain,
      iconTexture: "Goods/Grain",
   };
   livestock: IGoodsDefinition = {
      name: () => $t(L.GoodsLivestock),
      input: {},
      position: { x: 1, y: 0 },
      icon: Livestock,
      iconTexture: "Goods/Livestock",
   };
   wood: IGoodsDefinition = {
      name: () => $t(L.GoodsWood),
      input: {},
      position: { x: 4, y: 0 },
      icon: Wood,
      iconTexture: "Goods/Wood",
   };
   ironOre: IGoodsDefinition = {
      name: () => $t(L.GoodsIronOre),
      input: {},
      position: { x: 3, y: 0 },
      icon: IronOre,
      iconTexture: "Goods/IronOre",
   };
   flour: IGoodsDefinition = {
      name: () => $t(L.GoodsFlour),
      input: {
         grain: 2,
      },
      position: { x: 0, y: 1 },
      icon: Flour,
      iconTexture: "Goods/Flour",
   };
   leather: IGoodsDefinition = {
      name: () => $t(L.GoodsLeather),
      input: {
         livestock: 2,
      },
      position: { x: 2, y: 1 },
      icon: Leather,
      iconTexture: "Goods/Leather",
   };
   milk: IGoodsDefinition = {
      name: () => $t(L.GoodsMilk),
      input: {
         livestock: 2,
      },
      position: { x: 1, y: 1 },
      icon: Milk,
      iconTexture: "Goods/Milk",
   };
   lumber: IGoodsDefinition = {
      name: () => $t(L.GoodsLumber),
      input: {
         wood: 2,
      },
      position: { x: 4, y: 1 },
      icon: Lumber,
      iconTexture: "Goods/Lumber",
   };
   ironIngots: IGoodsDefinition = {
      name: () => $t(L.GoodsIronIngots),
      input: {
         ironOre: 2,
      },
      position: { x: 3, y: 1 },
      icon: IronIngots,
      iconTexture: "Goods/IronIngots",
   };
   bread: IGoodsDefinition = {
      name: () => $t(L.GoodsBread),
      input: {
         flour: 2,
      },
      position: { x: 0, y: 2 },
      icon: Bread,
      iconTexture: "Goods/Bread",
   };
   cheese: IGoodsDefinition = {
      name: () => $t(L.GoodsCheese),
      input: {
         milk: 2,
      },
      position: { x: 1, y: 2 },
      icon: Cheese,
      iconTexture: "Goods/Cheese",
   };
   garments: IGoodsDefinition = {
      name: () => $t(L.GoodsGarments),
      input: {
         leather: 2,
      },
      position: { x: 2, y: 2 },
      icon: Garments,
      iconTexture: "Goods/Garments",
   };
   weapon: IGoodsDefinition = {
      name: () => $t(L.GoodsWeapon),
      input: {
         lumber: 1,
         ironIngots: 1,
      },
      position: { x: 4, y: 2 },
      icon: Weapon,
      iconTexture: "Goods/Weapon",
   };
   armor: IGoodsDefinition = {
      name: () => $t(L.GoodsArmor),
      input: {
         leather: 1,
         ironIngots: 1,
      },
      position: { x: 3, y: 2 },
      icon: Armor,
      iconTexture: "Goods/Armor",
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
