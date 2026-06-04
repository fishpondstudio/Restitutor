import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { createTile, fromEntries, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { makeNoise2D } from "open-simplex-noise";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import type { Building } from "./Building";
import type { Culture } from "./Culture";
import type { Goods } from "./Goods";
import type { IModifier } from "./Modifier";
import { Province, Provinces } from "./Province";
import type { Religion } from "./Religion";
import type { Terrain } from "./Terrain";

export const Tiles = {
   Constantinople: createTile(158, 79),
   Rome: createTile(145, 77),
} as const satisfies Record<string, Tile>;

export const MapColorsH: Record<Province, number> = fromEntries(
   Provinces.map((province, index, array) => {
      const h = (360 * index) / (array.length - 1);
      return [province, h];
   }),
);

export const MapBackgroundColors: Record<Province, number> = fromEntries(
   Provinces.map((province, index, array) => {
      const h = (360 * index) / (array.length - 1);
      const s = 90;
      const l = 85;
      return [province, hslToRgb(h, s, l)];
   }),
);

export const MapForegroundColors: Record<Province, number> = fromEntries(
   Provinces.map((province, index, array) => {
      const h = (360 * index) / (array.length - 1);
      const s = 30;
      const l = 50;
      return [province, hslToRgb(h, s, l)];
   }),
);

export interface ITileConfig {
   terrain?: Terrain;
   province?: Province;
   name?: string;
   isCapital?: boolean;
   culture?: Culture;
   religion?: Religion;
}

export interface ITileData {
   terrain: Terrain;
   province: Province;
   coreProvinces: Set<Province>;
   originalProvince: Province;
   culture: Culture;
   religion: Religion;
   goods: Goods;
   buildings: Set<Building>;

   infrastructure: number;
   production: number;
   population: number;
   upgradeCount: number;
   rebellion: number;
   autonomy: number;

   modifiers: {
      GoverningCapacity: IModifier[];
      Defense: IModifier[];
      Manpower: IModifier[];
      LandTax: IModifier[];
      GoodsTax: IModifier[];
      Maintenance: IModifier[];
      Unrest: IModifier[];
   };
}

export function isTileBorderingProvince(tile: Tile, province: Province, save: SaveGame): boolean {
   for (let dir = 0; dir < 6; dir++) {
      const neighbor = pointToTile(MapGrid.getNeighbor(tileToPoint(tile), dir));
      if (save.state.tiles.get(neighbor)?.province === province) {
         return true;
      }
   }
   return false;
}

const TerrainToGoods: Record<Terrain, Goods[]> = {
   Forest: ["wood"],
   Mountain: ["ironOre", "wood"],
   Hill: ["ironOre", "livestock", "wood"],
   Plain: ["grain", "livestock"],
};

export function initTiles(): Map<Tile, ITileData> {
   const noise = makeNoise2D(Date.now());
   return new Map(
      Array.from(RomeMap.entries()).map(([tile, config]) => {
         if (!config.name || !config.province || !config.terrain) {
            throw new Error(`Invalid tile config: ${tile}: ${JSON.stringify(config)}`);
         }
         const { x, y } = tileToPoint(tile);
         const random = (noise(x, y) + 1) / 2;
         const goods = TerrainToGoods[config.terrain];
         const data: ITileData = {
            province: config.province,
            coreProvinces: new Set([config.province]),
            originalProvince: config.province,
            terrain: config.terrain,
            culture: config.culture ?? Province[config.province].culture,
            religion: config.religion ?? Province[config.province].religion,
            goods: goods[Math.floor(random * goods.length)],
            buildings: new Set(),
            infrastructure: 0,
            production: 0,
            population: 0,
            upgradeCount: 0,
            rebellion: 0,
            autonomy: 0,
            modifiers: {
               GoverningCapacity: [],
               Defense: [],
               Manpower: [],
               LandTax: [],
               GoodsTax: [],
               Maintenance: [],
               Unrest: [],
            },
         };
         return [tile, data];
      }),
   );
}
