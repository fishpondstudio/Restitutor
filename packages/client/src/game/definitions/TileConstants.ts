import { createTile, keysOf, type Tile } from "@project/shared/src/utils/Helper";
import { Province } from "./Province";
import { SpawnedProvinces } from "./SpawnedProvince";

export const GallicEmpireProvinces: Province[] = [
   "Aquitania",
   "Narbonensis",
   "Lugdunensis",
   "Belgica",
   "Germania",
] as const;

export const HispaniaProvinces: Province[] = ["Tarraconensis", "Lusitania", "Baetica"] as const;
export const ItaliaProvinces: Province[] = ["Italia", "Corsica", "Sardinia", "Sicilia"] as const;
export const DanubiaProvinces: Province[] = ["Dacia", "Dalmatia", "Moesia", "Noricum", "Pannonia", "Raetia"] as const;
export const GraeciaProvinces: Province[] = ["Achaia", "Epirus", "Macedonia", "Thracia"] as const;
export const AnatoliaProvinces: Province[] = ["Asia", "Bithynia", "Cappadocia", "Cilicia", "Galatia", "Lycia"] as const;
export const LevantProvinces: Province[] = ["Judea", "Syria"] as const;
export const AegyptusProvinces: Province[] = ["Aegyptus", "Cyrenaica"] as const;
export const AfricaProvinces: Province[] = ["Africa", "Mauretania"] as const;

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
   (province) => !WesternRomanEmpireProvinces.includes(province) && !(province in SpawnedProvinces),
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

export const StraitOfGibraltarTiles = [8585300, 8519765] as const satisfies Tile[];
