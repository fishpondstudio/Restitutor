import { pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { makeNoise2D } from "open-simplex-noise";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";
import type { Building } from "./Building";
import type { Culture } from "./Culture";
import type { Goods } from "./Goods";
import type { IModifier } from "./Modifier";
import { Province } from "./Province";
import type { Religion } from "./Religion";
import type { Terrain } from "./Terrain";

export interface ITileConfig {
   terrain?: Terrain;
   province?: Province;
   name?: string;
   isCapital?: boolean;
}

export interface ITileData {
   nameOverride?: string;
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

export function getBorderingProvinces(tile: Tile, save: SaveGame): Province[] {
   const result: Province[] = [];
   const province = save.state.tiles.get(tile)?.province;
   if (!province) {
      return [];
   }
   for (let dir = 0; dir < 6; dir++) {
      const neighbor = pointToTile(MapGrid.getNeighbor(tileToPoint(tile), dir));
      const neighborProvince = save.state.tiles.get(neighbor)?.province;
      if (neighborProvince && neighborProvince !== province) {
         result.push(neighborProvince);
      }
   }
   return result;
}

export const TerrainToGoods: Record<Terrain, Goods[]> = {
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
         const data: ITileData = initTileData(
            config.province,
            config.terrain,
            goods[Math.floor(random * goods.length)],
         );
         return [tile, data];
      }),
   );
}

export function initTileData(province: Province, terrain: Terrain, goods: Goods): ITileData {
   const provinceConfig = Province[province];
   return {
      province: province,
      coreProvinces: new Set([province]),
      originalProvince: province,
      terrain: terrain,
      culture: provinceConfig.culture,
      religion: provinceConfig.religion,
      goods: goods,
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
}
