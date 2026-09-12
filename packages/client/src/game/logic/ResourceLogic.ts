import { entriesOf, formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type Province, type ProvinceResource, ProvinceResourceNames } from "../definitions/Province";
import type { SaveGame } from "../GameState";

export function provinceResourceOf(resource: ProvinceResource, province: Province, save: SaveGame): [number, number] {
   const state = save.state.provinces[province];
   if (!state) {
      return [0, 0];
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   return state.resources[resource];
}

export function getProvinceResource(resource: ProvinceResource, province: Province, save: SaveGame): number {
   const [total, used] = provinceResourceOf(resource, province, save);
   return total - used;
}

export function addProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][0] += value;
}

export function spendProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][1] += value;
}

export function refundProvinceResource(
   resource: ProvinceResource,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   if (state.resources[resource] === undefined) {
      state.resources[resource] = [0, 0];
   }
   state.resources[resource][1] -= value;
}

export function resetProvinceResource(resource: ProvinceResource, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.resources[resource] = [0, 0];
}

export function hasEnoughProvinceResources(
   resources: Partial<Record<ProvinceResource, number>>,
   province: Province,
   save: SaveGame,
): boolean {
   for (const [resource, value] of entriesOf(resources)) {
      if (getProvinceResource(resource, province, save) < value) {
         return false;
      }
   }
   return true;
}

export function trySpendProvinceResources(
   resources: Partial<Record<ProvinceResource, number>>,
   province: Province,
   save: SaveGame,
): boolean {
   if (!hasEnoughProvinceResources(resources, province, save)) {
      return false;
   }
   for (const [resource, value] of entriesOf(resources)) {
      spendProvinceResource(resource, value, province, save);
   }
   return true;
}

export function notEnoughResourcesError(resources: Partial<Record<ProvinceResource, number>>, save: SaveGame): string {
   return $t(
      L.NotEnoughResources$1,
      entriesOf(resources)
         .map(
            ([key, value]) =>
               `${ProvinceResourceNames[key]()}: ${formatNumber(getProvinceResource(key, save.state.playerProvince, save) - value)}`,
         )
         .join(", "),
   );
}
