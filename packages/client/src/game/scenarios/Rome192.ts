import { keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { RomanEmpireProvinces } from "../definitions/TileConstants";
import { RomeEvents } from "../events/GameEvents";
import { RomanNameGenerator } from "../RomanNames";
import { getCulturesFromProvinces, getReligionsFromProvinces } from "./ScenarioHelper";
import type { IScenario } from "./Scenarios";

export const Rome192: IScenario = {
   name: () => $t(L.ThirdCenturyCrisis),
   desc: () => $t(L.ThirdCenturyCrisisDesc),
   startDate: new Date(192, 11, 31),
   provinces: new Set(RomanEmpireProvinces),
   greatWorks: new Set([
      "GreatPyramidOfGiza",
      "TempleOfArtemis",
      "PharosOfAlexandria",
      "RoyalMausoleumOfMauretania",
      "HadriansWall",
      "RomanTempleOfEvora",
      "AqueductOfSegovia",
      "PortaNigra",
      "PontDuGard",
      "Colosseum",
      "AntonineBaths",
      "DiocletiansPalace",
      "RotundaOfGalerius",
      "HagiaSophia",
      "TempleOfBel",
      "AlKhazneh",
      "ChurchOfTheHolySepulchre",
   ]),
   cultures: new Set([...getCulturesFromProvinces(RomanEmpireProvinces), "Hunnic", "Steppe"]),
   religions: new Set([
      ...getReligionsFromProvinces(RomanEmpireProvinces),
      "Hunnic",
      "Christianity",
      "Donatism",
      "Arianism",
      "Macedonianism",
      "Pelagianism",
      "Nestorianism",
      "Miaphysitism",
      "Monothelitism",
      "Iconoclasm",
      "Steppe",
      "Islam",
   ]),
   nameGenerator: RomanNameGenerator,
   // Event definitions import scenario-aware logic, so defer reading the catalog until initialization finishes.
   events: new Set(keysOf(RomeEvents)),
   flags: new Set(["Senate", "Christianity"]),
};
