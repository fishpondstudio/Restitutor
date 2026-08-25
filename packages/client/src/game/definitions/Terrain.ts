import Forest from "../../assets/images/headers/Forest.webp";
import Hill from "../../assets/images/headers/Hill.webp";
import Mountain from "../../assets/images/headers/Mountain.webp";
import Plain from "../../assets/images/headers/Plain.webp";
import { $t, L } from "../../utils/i18n";
import type { ImageWithCredit } from "../events/ImageWithCredit";

export interface ITerrainConfig {
   name: () => string;
   image: ImageWithCredit;
}

export const Terrains = {
   Plain: {
      name: () => $t(L.TerrainNamePlain),
      image: {
         url: Plain,
         credit: "The plain of Gennevilliers, yellow fields, Gustave Caillebotte (c.1800s)",
      },
   },
   Hill: {
      name: () => $t(L.TerrainNameHill),
      image: {
         url: Hill,
         credit: "Vermont Hill, Theodore Robinson (c.1894)",
      },
   },
   Forest: {
      name: () => $t(L.TerrainNameForest),
      image: {
         url: Forest,
         credit: "A look at the Black Forest, Karl Julius Wilhelm Heilmann",
      },
   },
   Mountain: {
      name: () => $t(L.TerrainNameMountain),
      image: {
         url: Mountain,
         credit: "A Panorama from the Mangart in the Julian Alps 4, Markus Pernhart",
      },
   },
} as const satisfies Record<string, ITerrainConfig>;

export type Terrain = keyof typeof Terrains;
