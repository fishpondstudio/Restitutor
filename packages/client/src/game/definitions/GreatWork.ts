import type { Tile } from "@project/shared/src/utils/Helper";
import GreatPyramidOfGiza from "../../assets/images/greatworks/GreatPyramidOfGiza.webp";
import PharosOfAlexandria from "../../assets/images/greatworks/PharosOfAlexandria.webp";
import TempleOfArtemis from "../../assets/images/greatworks/TempleOfArtemis.webp";
import { $t, L } from "../../utils/i18n";
import type { ImageWithCredit } from "../events/ImageWithCredit";

interface IGreatWork {
   name: () => string;
   tile: Tile;
   completionYear: number;
   image: ImageWithCredit;
}

export const _GreatWork = {
   GreatPyramidOfGiza: {
      name: () => $t(L.GreatWorkGreatPyramidOfGiza),
      tile: 10551390,
      completionYear: -2560,
      image: {
         url: GreatPyramidOfGiza,
         credit: "The Sphinx and the Pyramids of Giza, Josef Langl (1883)",
      },
   },
   TempleOfArtemis: {
      name: () => $t(L.GreatWorkTempleOfArtemis),
      tile: 10289234,
      completionYear: -323,
      image: {
         url: TempleOfArtemis,
         credit: "The Building of the Temple of Artemis at Ephesus, Hendrik van Cleve (III) (c.1500s)",
      },
   },
   PharosOfAlexandria: {
      name: () => $t(L.GreatWorkPharosOfAlexandria),
      tile: 10485850,
      completionYear: -283,
      image: {
         url: PharosOfAlexandria,
         credit: "Lighthouse of Alexandria, Philip Galle (1572)",
      },
   },
   HadriansWall: {
      name: () => $t(L.GreatWorkHadriansWall),
      tile: 8716347,
      completionYear: 128,
   },
   RomanWallsOfLugo: {
      name: () => $t(L.GreatWorkRomanWallsOfLugo),
      tile: 8454220,
      completionYear: 275,
   },
   AqueductOfSegovia: {
      name: () => $t(L.GreatWorkAqueductOfSegovia),
      tile: 8716366,
      completionYear: 120,
   },
   PortaNigra: {
      name: () => $t(L.GreatWorkPortaNigra),
      tile: 9175107,
      completionYear: 170,
   },
   PontDuGard: {
      name: () => $t(L.GreatWorkPontDuGard),
      tile: 9044042,
      completionYear: 50,
   },
   Colosseum: {
      name: () => $t(L.GreatWorkColosseum),
      tile: 9502797,
      completionYear: 80,
   },
   AntonineBaths: {
      name: () => $t(L.GreatWorkAntonineBaths),
      tile: 9371731,
      completionYear: 162,
   },
   DiocletiansPalace: {
      name: () => $t(L.GreatWorkDiocletiansPalace),
      tile: 9764939,
      completionYear: 305,
   },
   RotundaOfGalerius: {
      name: () => $t(L.GreatWorkRotundaOfGalerius),
      tile: 10027087,
      completionYear: 306,
   },
   HagiaSophia: {
      name: () => $t(L.GreatWorkHagiaSophia),
      tile: 10354767,
      completionYear: 537,
   },
   TempleOfBelComplex: {
      name: () => $t(L.GreatWorkTempleOfBelComplex),
      tile: 10879061,
      completionYear: 175,
   },
   AlKhazneh: {
      name: () => $t(L.GreatWorkAlKhazneh),
      tile: 10682459,
      completionYear: 25,
   },
   ChurchOfTheHolySepulchre: {
      name: () => $t(L.GreatWorkChurchOfTheHolySepulchre),
      tile: 10747993,
      completionYear: 335,
   },
} as const satisfies Record<string, IGreatWork>;

export type GreatWork = keyof typeof _GreatWork;
export const GreatWork = _GreatWork as Record<GreatWork, IGreatWork>;
