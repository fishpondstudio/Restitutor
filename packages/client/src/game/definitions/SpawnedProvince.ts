import type { ValueOf } from "@project/shared/src/utils/Helper";
import type { Province } from "./Province";
import type { ProvinceResource } from "./ProvinceResources";
import type { ProvinceStat } from "./ProvinceStats";

export const SpawnedProvinceBoostMonths = 12 * 20;
export const MaxRaidMonths = 12;
export const BarbarianRaidNegativeEffect = -10;

export const SpawnedProvinceFlags = {
   None: 0,
   Raid: 1 << 0,
} as const;

export type SpawnedProvinceFlags = ValueOf<typeof SpawnedProvinceFlags>;

const BaseSpawnedProvinceData: SpawnedProvinceData = {
   stats: {
      targetConscription: 20,
      actualConscription: 20,
   },
   resources: {
      generalSkillPoint: 10,
   },
   flags: SpawnedProvinceFlags.Raid,
};

export const _SpawnedProvinces = {
   Suebi: { ...BaseSpawnedProvinceData },
   Visigoths: { ...BaseSpawnedProvinceData },
   Vandals: { ...BaseSpawnedProvinceData },
   Burgundians: { ...BaseSpawnedProvinceData },
   Franks: { ...BaseSpawnedProvinceData },
   Saxons: { ...BaseSpawnedProvinceData },
   Alemanni: { ...BaseSpawnedProvinceData },
   Ostrogoths: { ...BaseSpawnedProvinceData },
   Huns: { ...BaseSpawnedProvinceData },
   Avars: { ...BaseSpawnedProvinceData },
   Lombards: { ...BaseSpawnedProvinceData },
   Caliphate: { ...BaseSpawnedProvinceData, flags: SpawnedProvinceFlags.None },
   Bulgars: { ...BaseSpawnedProvinceData },
} as const satisfies Partial<Record<Province, SpawnedProvinceData>>;

export interface SpawnedProvinceData {
   stats: Partial<Record<ProvinceStat, number>>;
   resources: Partial<Record<ProvinceResource, number>>;
   flags: SpawnedProvinceFlags;
}

export type SpawnedProvince = keyof typeof _SpawnedProvinces;
export const SpawnedProvinces: Record<SpawnedProvince, SpawnedProvinceData> = _SpawnedProvinces;
