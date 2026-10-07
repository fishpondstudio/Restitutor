import { ChineseNameGenerator } from "../ChineseNames";
import { TKWarlords } from "../ThreeKingdoms/TKWarlord";
import type { IScenario } from "./Scenarios";

export const ThreeKingdoms194: IScenario = {
   startDate: new Date(194, 6, 1),
   provinces: new Set(TKWarlords),
   nameGenerator: ChineseNameGenerator,
   events: new Set(),
   flags: new Set(["Polygamy"]),
   provinceResourceNames: {
      consulPoint: () => "Imperial Favor",
   },
   timedActionNames: {
      TakeLover: () => "Take a Concubine",
   },
};
