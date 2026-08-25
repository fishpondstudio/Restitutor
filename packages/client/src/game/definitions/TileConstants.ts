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
export const WesternMediterraneanProvinces: Province[] = [
   "Baetica",
   "Tarraconensis",
   "Narbonensis",
   "Italia",
   "Sicilia",
   "Corsica",
   "Sardinia",
   "Dalmatia",
   "Africa",
   "Mauretania",
] as const;

export const EasternMediterraneanProvinces: Province[] = [
   "Macedonia",
   "Epirus",
   "Achaia",
   "Thracia",
   "Asia",
   "Lycia",
   "Cilicia",
   "Syria",
   "Judea",
   "Aegyptus",
   "Cyrenaica",
] as const;

export const MediterraneanProvinces: Province[] = [
   ...WesternMediterraneanProvinces,
   ...EasternMediterraneanProvinces,
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

export const MediterraneanTiles: Set<Tile> = new Set([
   8585301, 8650836, 8650837, 8716372, 8716373, 8781907, 8781908, 8847441, 8847442, 8847443, 8847444, 8912975, 8912976,
   8912977, 8912978, 8912979, 8978511, 8978512, 8978514, 8978515, 9044044, 9044045, 9044046, 9044047, 9044048, 9044049,
   9044050, 9044051, 9109580, 9109581, 9109582, 9109583, 9109584, 9109585, 9109586, 9109587, 9175116, 9175117, 9175118,
   9175119, 9175120, 9175121, 9175122, 9240651, 9240652, 9240653, 9240654, 9240655, 9240656, 9240657, 9240658, 9240659,
   9306187, 9306188, 9306190, 9306192, 9306193, 9306194, 9371723, 9371724, 9371725, 9371726, 9371727, 9371729, 9371730,
   9437261, 9437262, 9437263, 9437264, 9437265, 9437266, 9437267, 9437268, 9437269, 9437270, 9437271, 9502793, 9502798,
   9502799, 9502800, 9502801, 9502802, 9502803, 9502804, 9502805, 9502806, 9502807, 9568330, 9568331, 9568335, 9568336,
   9568337, 9568340, 9568341, 9568342, 9568343, 9633866, 9633867, 9633868, 9633869, 9633872, 9633873, 9633876, 9633877,
   9633878, 9633879, 9633880, 9699404, 9699405, 9699411, 9699412, 9699413, 9699414, 9699415, 9699416, 9699417, 9764940,
   9764941, 9764942, 9764944, 9764945, 9764946, 9764947, 9764948, 9764949, 9764950, 9764951, 9764952, 9764953, 9830477,
   9830478, 9830479, 9830480, 9830481, 9830482, 9830483, 9830484, 9830485, 9830486, 9830487, 9830488, 9830489, 9830490,
   9896016, 9896017, 9896018, 9896019, 9896020, 9896021, 9896022, 9896023, 9896024, 9896026, 9961554, 9961555, 9961556,
   9961557, 9961558, 9961559, 10027092, 10027093, 10027094, 10027095, 10092624, 10092625, 10092627, 10092628, 10092630,
   10092631, 10092632, 10158159, 10158160, 10158161, 10158162, 10158163, 10158164, 10158166, 10158167, 10158168,
   10158169, 10223696, 10223697, 10223698, 10223699, 10223700, 10223701, 10223702, 10223703, 10223704, 10223705,
   10289236, 10289237, 10289238, 10289239, 10289240, 10289241, 10354772, 10354773, 10354774, 10354775, 10354776,
   10354777, 10420308, 10420309, 10420310, 10420311, 10420312, 10420313, 10485844, 10485845, 10485846, 10485847,
   10485848, 10485849, 10551380, 10551381, 10551382, 10551383, 10551384, 10551385, 10616917, 10616919, 10616920,
   10616921, 10682452, 10682453, 10682454, 10682455, 10682456, 10747988, 10747990,
]);

export const BlackSeaTiles: Set<Tile> = new Set([
   10354763, 10354764, 10354765, 10420297, 10420298, 10420299, 10420300, 10420301, 10420302, 10485832, 10485833,
   10485834, 10485835, 10485836, 10485837, 10485838, 10551368, 10551369, 10551370, 10551371, 10551372, 10551373,
   10616904, 10616906, 10616907, 10616908, 10616909, 10682442, 10682443, 10682444, 10682445, 10747976, 10747977,
   10747978, 10747979, 10747980, 10747981, 10813511, 10813512, 10813514, 10813515, 10813516, 10813517, 10879051,
   10879052, 10879053, 10879054, 10944588, 10944589, 10944590, 11010124, 11010125, 11010126,
]);
