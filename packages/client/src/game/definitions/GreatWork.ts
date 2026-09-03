import type { Tile } from "@project/shared/src/utils/Helper";
import AlKhazneh from "../../assets/images/greatworks/AlKhazneh.webp";
import AntonineBaths from "../../assets/images/greatworks/AntonineBaths.webp";
import AqueductOfSegovia from "../../assets/images/greatworks/AqueductOfSegovia.webp";
import ChurchOfTheHolySepulchre from "../../assets/images/greatworks/ChurchOfTheHolySepulchre.webp";
import Colosseum from "../../assets/images/greatworks/Colosseum.webp";
import DiocletiansPalace from "../../assets/images/greatworks/DiocletiansPalace.webp";
import GreatPyramidOfGiza from "../../assets/images/greatworks/GreatPyramidOfGiza.webp";
import HadriansWall from "../../assets/images/greatworks/HadriansWall.webp";
import HagiaSophia from "../../assets/images/greatworks/HagiaSophia.webp";
import PharosOfAlexandria from "../../assets/images/greatworks/PharosOfAlexandria.webp";
import PontDuGard from "../../assets/images/greatworks/PontDuGard.webp";
import PortaNigra from "../../assets/images/greatworks/PortaNigra.webp";
import RotundaOfGalerius from "../../assets/images/greatworks/RotundaOfGalerius.webp";
import TempleOfArtemis from "../../assets/images/greatworks/TempleOfArtemis.webp";
import TempleOfBel from "../../assets/images/greatworks/TempleOfBel.webp";
import TowerOfHercules from "../../assets/images/greatworks/TowerOfHercules.webp";
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
         credit: "The Building of the Temple of Artemis at Ephesus, Hendrik van Cleve (III)",
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
      image: {
         url: HadriansWall,
         credit: "The Romans cause a Wall to be built for the Protection of the South, William Bell Scott (1857)",
      },
   },
   TowerOfHercules: {
      name: () => $t(L.GreatWorkTowerOfHercules),
      tile: 8454220,
      completionYear: 100,
      image: {
         url: TowerOfHercules,
         credit: "Torre de Hércules, Camilo Díaz Baliño (1933)",
      },
   },
   AqueductOfSegovia: {
      name: () => $t(L.GreatWorkAqueductOfSegovia),
      tile: 8716366,
      completionYear: 120,
      image: {
         url: AqueductOfSegovia,
         credit: "Aquaduct at Segovia, Spain, Edward Angelo Goodall",
      },
   },
   PortaNigra: {
      name: () => $t(L.GreatWorkPortaNigra),
      tile: 9175107,
      completionYear: 170,
      image: {
         url: PortaNigra,
         credit: "Ansicht von Trier von Trier mit Blick auf die Porta Nigra, Carl Rüdell",
      },
   },
   PontDuGard: {
      name: () => $t(L.GreatWorkPontDuGard),
      tile: 9044042,
      completionYear: 50,
      image: {
         url: PontDuGard,
         credit: "The Pont du Gard, Hubert Robert (1786)",
      },
   },
   Colosseum: {
      name: () => $t(L.GreatWorkColosseum),
      tile: 9502797,
      completionYear: 80,
      image: {
         url: Colosseum,
         credit: "The Colosseum, Rome, Giovanni Battista Busiri",
      },
   },
   AntonineBaths: {
      name: () => $t(L.GreatWorkAntonineBaths),
      tile: 9371731,
      completionYear: 162,
      image: {
         url: AntonineBaths,
         credit: "Roman Bath, Antonio Joli (c.1745)",
      },
   },
   DiocletiansPalace: {
      name: () => $t(L.GreatWorkDiocletiansPalace),
      tile: 9764939,
      completionYear: 305,
      image: {
         url: DiocletiansPalace,
         credit: "Zeichnung zur Rekonstruktion des Diokletianspalastes in Split (Kroatien), Ernest Hébrard (1912)",
      },
   },
   RotundaOfGalerius: {
      name: () => $t(L.GreatWorkRotundaOfGalerius),
      tile: 10027087,
      completionYear: 306,
      image: {
         url: RotundaOfGalerius,
         credit:
            "Byzantine Arcitecture, illustrated by Examples of Edifices erected in the East during the earliest Ages of Christianity, Félix Marie Charles Texier (1864)",
      },
   },
   HagiaSophia: {
      name: () => $t(L.GreatWorkHagiaSophia),
      tile: 10354767,
      completionYear: 537,
      image: {
         url: HagiaSophia,
         credit: "Aya Sofia, Constantinople, Gaspare Fossati (1852)",
      },
   },
   TempleOfBel: {
      name: () => $t(L.GreatWorkTempleOfBel),
      tile: 10879061,
      completionYear: 175,
      image: {
         url: TempleOfBel,
         credit: "The ruins of the temple of the sun, Palmyra, Carl Haag (1859)",
      },
   },
   AlKhazneh: {
      name: () => $t(L.GreatWorkAlKhazneh),
      tile: 10682459,
      completionYear: 25,
      image: {
         url: AlKhazneh,
         credit: "El Khasnè, Petra. Coloured lithograph by Louis Haghe after David Roberts (1849)",
      },
   },
   ChurchOfTheHolySepulchre: {
      name: () => $t(L.GreatWorkChurchOfTheHolySepulchre),
      tile: 10747993,
      completionYear: 335,
      image: {
         url: ChurchOfTheHolySepulchre,
         credit: "Jerusalem with the Church of the Holy Sepulchre, Luigi Mayer (1804)",
      },
   },
} as const satisfies Record<string, IGreatWork>;

export type GreatWork = keyof typeof _GreatWork;
export const GreatWork = _GreatWork as Record<GreatWork, IGreatWork>;
