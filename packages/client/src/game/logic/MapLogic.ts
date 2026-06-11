import { hslToRgb } from "@project/shared/src/thirdparty/RandomColor";
import { fromEntries, pointToTile, range, tileToPoint } from "@project/shared/src/utils/Helper";
import { type Province, Provinces } from "../definitions/Province";
import { MapGrid } from "../MapGrid";
import { RomeMap } from "../RomeMap";

const Hues = range(0, Provinces.length).map((i) => (i * 360) / Provinces.length);
const AdjacentProvinces = buildAdjacentProvinces();

const MapColorsH: Record<Province, number> = assignProvinceHues(AdjacentProvinces);

export const MapBackgroundColors: Record<Province, number> = fromEntries(
   Provinces.map((province) => {
      const h = MapColorsH[province];
      const s = 90;
      const l = 85;
      return [province, hslToRgb(h, s, l)];
   }),
);

export const MapForegroundColors: Record<Province, number> = fromEntries(
   Provinces.map((province) => {
      const h = MapColorsH[province];
      const s = 30;
      const l = 50;
      return [province, hslToRgb(h, s, l)];
   }),
);

export const MapTextColors: Record<Province, number> = fromEntries(
   Provinces.map((province) => {
      const h = MapColorsH[province];
      const s = 30;
      const l = 30;
      return [province, hslToRgb(h, s, l)];
   }),
);

function buildAdjacentProvinces(): Record<Province, Set<Province>> {
   const adjacency = fromEntries(Provinces.map((province) => [province, new Set<Province>()]));
   for (const [tile, data] of RomeMap) {
      const province = data.province;
      if (!province) {
         continue;
      }
      for (const neighbor of MapGrid.getNeighbors(tileToPoint(tile))) {
         const neighborProvince = RomeMap.get(pointToTile(neighbor))?.province;
         if (neighborProvince && neighborProvince !== province) {
            adjacency[province].add(neighborProvince);
            adjacency[neighborProvince].add(province);
         }
      }
   }
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
