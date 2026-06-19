import Forest from "../../assets/images/Forest.webp";
import Hill from "../../assets/images/Hill.webp";
import Mountain from "../../assets/images/Mountain.webp";
import Plain from "../../assets/images/Plain.webp";
import type { ImageWithCredit } from "../events/ImageWithCredit";

export const Terrains = {
   Plain: {
      image: {
         url: Plain,
         credit: "The plain of Gennevilliers, yellow fields, Gustave Caillebotte (c.1800s)",
      },
   },
   Hill: {
      image: {
         url: Hill,
         credit: "Vermont Hill, Theodore Robinson (c.1894)",
      },
   },
   Forest: {
      image: {
         url: Forest,
         credit: "A look at the Black Forest, Karl Julius Wilhelm Heilmann",
      },
   },
   Mountain: {
      image: {
         url: Mountain,
         credit: "A Panorama from the Mangart in the Julian Alps 4, Markus Pernhart",
      },
   },
} as const satisfies Record<
   string,
   {
      image: ImageWithCredit;
   }
>;

export type Terrain = keyof typeof Terrains;
