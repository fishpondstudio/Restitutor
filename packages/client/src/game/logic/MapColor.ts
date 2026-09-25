import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { forEach, fromEntries, pointToTile, range, tileToPoint } from "@project/shared/src/utils/Helper";
import { Province, Provinces } from "../definitions/Province";
import { SpawnedProvinces } from "../definitions/SpawnedProvince";
import type { SaveGame } from "../GameState";
import { MapGrid } from "../MapGrid";
import { getInitialTiles } from "../scenarios/Scenarios";

const Hues = range(0, Provinces.length).map((i) => (i * 360) / Provinces.length);
export let MapColorsH: Record<Province, number>;
export let MapBackgroundColors: Record<Province, number>;
export let MapForegroundColors: Record<Province, number>;
export let MapTextColors: Record<Province, number>;

export function initMapColors(save: SaveGame): void {
   MapColorsH = assignProvinceHues(buildAdjacentProvinces(save));
   MapBackgroundColors = fromEntries(Provinces.map((province) => [province, hslToRgb(MapColorsH[province], 65, 85)]));
   MapForegroundColors = fromEntries(Provinces.map((province) => [province, hslToRgb(MapColorsH[province], 40, 50)]));
   MapTextColors = fromEntries(Provinces.map((province) => [province, hslToRgb(MapColorsH[province], 25, 35)]));
}

function addAdjacency(province1: Province, province2: Province, adjacency: Record<Province, Set<Province>>) {
   adjacency[province1].add(province2);
   adjacency[province2].add(province1);
}

function buildAdjacentProvinces(save: SaveGame): Record<Province, Set<Province>> {
   const adjacency = fromEntries(Provinces.map((province) => [province, new Set<Province>()]));
   const initialTiles = getInitialTiles(save.state.scenario);
   for (const [tile, province] of initialTiles) {
      if (!province) {
         continue;
      }
      for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
         const neighborProvince = initialTiles.get(pointToTile(neighbor));
         if (neighborProvince && neighborProvince !== province) {
            adjacency[province].add(neighborProvince);
            adjacency[neighborProvince].add(province);
         }
      }
   }

   forEach(SpawnedProvinces, (province) => {
      Province[province].tiles.forEach((tile) => {
         for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
            const neighborProvince = initialTiles.get(pointToTile(neighbor));
            if (neighborProvince && neighborProvince !== province) {
               adjacency[province].add(neighborProvince);
               adjacency[neighborProvince].add(province);
            }
         }
      });
   });

   return adjacency;
}

function circularHueDistance(a: number, b: number): number {
   const distance = Math.abs(a - b) % 360;
   return Math.min(distance, 360 - distance);
}

function minHueDistanceToNeighbors(hue: number, neighborHues: number[]): number {
   return Math.min(...neighborHues.map((neighborHue) => circularHueDistance(hue, neighborHue)));
}

function pickBestHue(neighborHues: number[], candidates: number[]): number {
   if (neighborHues.length === 0) {
      return candidates[0];
   }

   let bestHue = candidates[0];
   let bestScore = minHueDistanceToNeighbors(bestHue, neighborHues);
   for (let i = 1; i < candidates.length; i++) {
      const hue = candidates[i];
      const score = minHueDistanceToNeighbors(hue, neighborHues);
      if (score > bestScore) {
         bestScore = score;
         bestHue = hue;
      }
   }
   return bestHue;
}

function getNeighborHues(
   adjacency: Record<Province, Set<Province>>,
   province: Province,
   hues: Record<Province, number>,
   assigned?: ReadonlySet<Province>,
): number[] {
   return Array.from(adjacency[province])
      .filter((neighbor) => !assigned || assigned.has(neighbor))
      .map((neighbor) => hues[neighbor]);
}

function assignProvinceHues(adjacency: Record<Province, Set<Province>>): Record<Province, number> {
   const hues = fromEntries(Provinces.map((province) => [province, Hues[0]]));
   const assigned = new Set<Province>();
   const usedHues = new Set<number>();

   const provincesByNeighborCount = [...Provinces].sort((a, b) => adjacency[b].size - adjacency[a].size);

   for (const province of provincesByNeighborCount) {
      const hue = pickBestHue(
         getNeighborHues(adjacency, province, hues, assigned),
         Hues.filter((hue) => !usedHues.has(hue)),
      );
      hues[province] = hue;
      usedHues.add(hue);
      assigned.add(province);
   }

   for (let pass = 0; pass < 2; pass++) {
      for (const province of Provinces) {
         hues[province] = pickBestHue(getNeighborHues(adjacency, province, hues), Hues);
      }
   }

   return hues;
}
