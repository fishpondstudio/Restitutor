import { entriesOf, hasFlag, keysOf, type ValueOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { Province } from "./Province";

export const ReligionFlags = {
   None: 0,
   Christian: 1 << 0,
} as const;

export type ReligionFlags = ValueOf<typeof ReligionFlags>;

interface IReligionConfig {
   name: () => string;
   flags: ReligionFlags;
}

const _Religion = {
   GrecoRoman: { name: () => $t(L.ReligionGrecoRoman), flags: ReligionFlags.None },
   Celtic: { name: () => $t(L.ReligionCeltic), flags: ReligionFlags.None },
   Germanic: { name: () => $t(L.ReligionGermanic), flags: ReligionFlags.None },
   Iberian: { name: () => $t(L.ReligionIberian), flags: ReligionFlags.None },
   Berber: { name: () => $t(L.ReligionBerber), flags: ReligionFlags.None },
   Eastern: { name: () => $t(L.ReligionEastern), flags: ReligionFlags.None },
   Anatolian: { name: () => $t(L.ReligionAnatolian), flags: ReligionFlags.None },
   Egyptian: { name: () => $t(L.ReligionEgyptian), flags: ReligionFlags.None },
   Judaism: { name: () => $t(L.ReligionJudaism), flags: ReligionFlags.None },
   Hunnic: { name: () => $t(L.ReligionHunnic), flags: ReligionFlags.None },
   Christianity: { name: () => $t(L.ReligionChristianity), flags: ReligionFlags.Christian },
   Donatism: { name: () => $t(L.ReligionDonatism), flags: ReligionFlags.Christian },
   Arianism: { name: () => $t(L.ReligionArianism), flags: ReligionFlags.Christian },
   Macedonianism: { name: () => $t(L.ReligionMacedonianism), flags: ReligionFlags.Christian },
   Pelagianism: { name: () => $t(L.ReligionPelagianism), flags: ReligionFlags.Christian },
   Nestorianism: { name: () => $t(L.ReligionNestorianism), flags: ReligionFlags.Christian },
   Miaphysitism: { name: () => $t(L.ReligionMiaphysitism), flags: ReligionFlags.Christian },
   Monothelitism: { name: () => $t(L.ReligionMonothelitism), flags: ReligionFlags.Christian },
   Iconoclasm: { name: () => $t(L.ReligionIconoclasm), flags: ReligionFlags.Christian },
} as const satisfies Record<string, IReligionConfig>;

interface IChristianDoctrineConfig {
   percentage: number;
   provinces: Province[];
   year: number;
}

const _ChristianDoctrines = {
   Donatism: { year: 311, percentage: 0.15, provinces: ["Africa", "Mauretania"] },
   Arianism: {
      year: 318,
      percentage: 0.3,
      provinces: [
         "Italia",
         "Aegyptus",
         "Cyrenaica",
         "Judea",
         "Syria",
         "Cilicia",
         "Cappadocia",
         "Galatia",
         "Lycia",
         "Asia",
         "Bithynia",
         "Thracia",
         "Macedonia",
         "Achaia",
         "Moesia",
         "Dacia",
         "Pannonia",
         "Suebi",
         "Visigoths",
         "Vandals",
         "Burgundians",
         "Ostrogoths",
      ],
   },
   Macedonianism: {
      year: 360,
      percentage: 0.1,
      provinces: ["Thracia", "Bithynia", "Asia", "Galatia", "Cappadocia", "Cilicia", "Syria", "Aegyptus"],
   },
   Pelagianism: {
      year: 411,
      percentage: 0.1,
      provinces: ["Britannia", "Italia", "Africa", "Mauretania", "Sicilia", "Judea"],
   },
   Nestorianism: {
      year: 428,
      percentage: 0.15,
      provinces: [
         "Thracia",
         "Bithynia",
         "Asia",
         "Galatia",
         "Cappadocia",
         "Cilicia",
         "Syria",
         "Judea",
         "Aegyptus",
         "Cyrenaica",
      ],
   },
   Miaphysitism: {
      year: 451,
      percentage: 0.25,
      provinces: ["Aegyptus", "Cyrenaica", "Syria", "Judea", "Cilicia", "Cappadocia", "Galatia"],
   },
   Monothelitism: {
      year: 638,
      percentage: 0.15,
      provinces: [
         "Thracia",
         "Bithynia",
         "Asia",
         "Galatia",
         "Cappadocia",
         "Cilicia",
         "Syria",
         "Judea",
         "Aegyptus",
         "Cyrenaica",
         "Achaia",
         "Macedonia",
         "Italia",
         "Sicilia",
         "Africa",
      ],
   },
   Iconoclasm: {
      year: 726,
      percentage: 0.2,
      provinces: [
         "Asia",
         "Bithynia",
         "Cappadocia",
         "Cilicia",
         "Galatia",
         "Lycia",
         "Thracia",
         "Macedonia",
         "Achaia",
         "Epirus",
         "Moesia",
         "Dacia",
         "Dalmatia",
         "Italia",
         "Sicilia",
      ],
   },
} as const satisfies Partial<Record<Religion, IChristianDoctrineConfig>>;

export type Religion = keyof typeof _Religion;
export type ChristianDoctrines = keyof typeof _ChristianDoctrines;
export const ChristianDoctrines: Record<ChristianDoctrines, IChristianDoctrineConfig> = _ChristianDoctrines;
export const Religion: Record<Religion, IReligionConfig> = _Religion;
export const Religions = keysOf(_Religion);
export const ChristianReligions = entriesOf(Religion)
   .filter(([_, config]) => hasFlag(config.flags, ReligionFlags.Christian))
   .map(([religion, _]) => religion);

export function isChristianReligion(religion: Religion): boolean {
   return hasFlag(Religion[religion].flags, ReligionFlags.Christian);
}
