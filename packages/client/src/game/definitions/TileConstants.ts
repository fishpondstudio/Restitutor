import { createTile, keysOf, type Tile } from "@project/shared/src/utils/Helper";
import { Province } from "./Province";

export const GallicEmpireProvinces: Province[] = [
   "Aquitania",
   "Narbonensis",
   "Lugdunensis",
   "Belgica",
   "Germania",
] as const;

export const ExpandedGallicEmpireProvinces: Province[] = [
   ...GallicEmpireProvinces,
   "Britannia",
   "Tarraconensis",
   "Lusitania",
   "Baetica",
] as const;

export const WesternRomanEmpireProvinces: Province[] = [
   ...ExpandedGallicEmpireProvinces,
   "Mauretania",
   "Africa",
   "Raetia",
   "Noricum",
   "Italia",
   "Sicilia",
   "Corsica",
   "Sardinia",
   "Pannonia",
   "Dalmatia",
] as const;

export const EasternRomanEmpireProvinces: Province[] = keysOf(Province).filter(
   (province) => !WesternRomanEmpireProvinces.includes(province),
);

export const PalmyreneEmpireProvinces: Province[] = [
   "Aegyptus",
   "Judea",
   "Syria",
   "Cappadocia",
   "Cilicia",
   "Galatia",
   "Lycia",
] as const;

export const Tiles = {
   Constantinople: createTile(158, 79),
   Rome: createTile(145, 77),
   Durocortorum: createTile(138, 67),
   Lutetia: createTile(137, 68),
} as const satisfies Record<string, Tile>;

export const SpawnedProvinces = {
   Suebi: {
      tiles: [8454222, 8388685, 8454220, 8454221, 8519756, 8454223, 8454224],
   },
   Visigoths: {
      tiles: [8912972, 8781897, 8847433, 8912970, 8912971, 8912973],
   },
   Vandals: {
      tiles: [9371731, 9306195, 9306196, 9371732, 9240660, 9568338, 9371733],
   },
   Burgundians: {
      tiles: [9044041, 9109576, 9109577, 9044042, 9109575, 9175112, 9044039],
   },
   Franks: {
      tiles: [8978497, 8978498, 9044033, 9109568, 9109569, 9044034, 8912963],
   },
   Saxons: {
      tiles: [8847424, 8847420, 8781885, 8847422, 8847423, 8912959, 8781884],
   },
   Alemanni: {
      tiles: [9240647, 9175111, 9306183, 9240646, 9306182, 9371718, 9306181],
   },
   Ostrogoths: {
      tiles: [9568328, 9633865, 9568329, 9633864, 9502792, 9437256, 9437257],
   },
   Huns: {
      tiles: [9764935, 9764934, 9830471, 9699399, 9633863, 9699400, 9764936],
   },
} as const satisfies Partial<Record<Province, { tiles: Tile[] }>>;

export type SpawnedProvince = keyof typeof SpawnedProvinces;
