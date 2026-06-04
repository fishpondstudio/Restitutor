import { keysOf } from "@project/shared/src/utils/Helper";
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
