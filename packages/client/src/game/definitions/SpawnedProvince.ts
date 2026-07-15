import type { Tile } from "@project/shared/src/utils/Helper";
import type { Province, ProvinceResource, ProvinceStat } from "./Province";

export const SpawnedProvinceBoostMonths = 12 * 20;
export const MaxRaidMonths = 12;

const BaseSpawnedProvinceData: SpawnedProvinceData = {
   stats: {
      targetConscription: 20,
      actualConscription: 20,
   },
   resources: {
      generalSkillPoint: 10,
   },
};

export const _SpawnedProvinces = {
   Suebi: {
      ...BaseSpawnedProvinceData,
      tiles: [8454222, 8388685, 8454220, 8454221, 8519756, 8454223, 8454224],
   },
   Visigoths: {
      ...BaseSpawnedProvinceData,
      tiles: [8912972, 8781897, 8847433, 8912970, 8912971, 8912973],
   },
   Vandals: {
      ...BaseSpawnedProvinceData,
      tiles: [9371731, 9306195, 9306196, 9371732, 9240660, 9568338, 9371733],
   },
   Burgundians: {
      ...BaseSpawnedProvinceData,
      tiles: [9044041, 9109576, 9109577, 9044042, 9109575, 9175112, 9044039],
   },
   Franks: {
      ...BaseSpawnedProvinceData,
      tiles: [8978497, 8978498, 9044033, 9109568, 9109569, 9044034, 8912963],
   },
   Saxons: {
      ...BaseSpawnedProvinceData,
      tiles: [8847424, 8847420, 8781885, 8847422, 8847423, 8912959, 8781884],
   },
   Alemanni: {
      ...BaseSpawnedProvinceData,
      tiles: [9240647, 9175111, 9306183, 9240646, 9306182, 9371718, 9306181],
   },
   Ostrogoths: {
      ...BaseSpawnedProvinceData,
      tiles: [9568328, 9633865, 9568329, 9633864, 9502792, 9437256, 9437257],
   },
   Huns: {
      ...BaseSpawnedProvinceData,
      tiles: [9764935, 9764934, 9830471, 9699399, 9633863, 9699400, 9764936],
   },
} as const satisfies Partial<Record<Province, SpawnedProvinceConfig>>;

export interface SpawnedProvinceData {
   stats: Partial<Record<ProvinceStat, number>>;
   resources: Partial<Record<ProvinceResource, number>>;
}

export interface SpawnedProvinceConfig extends SpawnedProvinceData {
   tiles: Tile[];
}

export type SpawnedProvince = keyof typeof _SpawnedProvinces;
export const SpawnedProvinces: Record<SpawnedProvince, SpawnedProvinceConfig> = _SpawnedProvinces;
