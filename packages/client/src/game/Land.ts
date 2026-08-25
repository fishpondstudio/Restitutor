import type { Tile } from "@project/shared/src/utils/Helper";
import type { Terrain } from "./definitions/Terrain";
import LandBase64 from "./Land.base64.txt?raw";
import { MapHeight, MapWidth } from "./MapGrid";

const OceanCode = 0;
const TerrainByCode = [undefined, "Plain", "Hill", "Forest", "Mountain", "Arid"] as const satisfies readonly (
   | Terrain
   | undefined
)[];

const TerrainCodes = (() => {
   const binary = atob(LandBase64.trim());
   const result = new Uint8Array(binary.length);
   for (let index = 0; index < binary.length; index++) {
      result[index] = binary.charCodeAt(index);
   }
   return result;
})();

export const LandSize = 17958;

function getTerrainCode(tile: Tile): number {
   const x = tile >>> 16;
   const y = tile & 0xffff;
   if (x >= MapWidth || y >= MapHeight) {
      return OceanCode;
   }
   return TerrainCodes[x * MapHeight + y];
}

export function isLand(tile: Tile): boolean {
   return getTerrainCode(tile) !== OceanCode;
}

export function terrainOf(tile: Tile): Terrain | undefined {
   return TerrainByCode[getTerrainCode(tile)];
}
