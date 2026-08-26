import { createTile, pointToTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import type { Terrain } from "./definitions/Terrain";
import LandBase64 from "./Land.base64.txt?raw";
import { MapGrid, MapHeight, MapWidth } from "./MapGrid";

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

function seaTileIndex(tile: Tile): number {
   const { x, y } = tileToPoint(tile);
   return x * MapHeight + y;
}

function calculateSeaComponents(): Uint16Array {
   const components = new Uint16Array(MapWidth * MapHeight);
   const queue: Tile[] = [];
   let component = 0;

   for (let x = 0; x < MapWidth; x++) {
      for (let y = 0; y < MapHeight; y++) {
         const tile = createTile(x, y);
         const index = seaTileIndex(tile);
         if (components[index] !== 0 || isLand(tile)) {
            continue;
         }

         component++;
         components[index] = component;
         queue.length = 0;
         queue.push(tile);

         for (let queueIndex = 0; queueIndex < queue.length; queueIndex++) {
            for (const neighbor of MapGrid.getNeighbors(tileToPoint(queue[queueIndex]))) {
               const neighborTile = pointToTile(neighbor);
               const neighborIndex = seaTileIndex(neighborTile);
               if (components[neighborIndex] === 0 && !isLand(neighborTile)) {
                  components[neighborIndex] = component;
                  queue.push(neighborTile);
               }
            }
         }
      }
   }

   return components;
}

const _seaComponents = calculateSeaComponents();

export function getSeaComponent(tile: Tile): number {
   return _seaComponents[seaTileIndex(tile)];
}
