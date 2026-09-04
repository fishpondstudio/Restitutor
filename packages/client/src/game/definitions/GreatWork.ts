import { entriesOf, type Tile } from "@project/shared/src/utils/Helper";
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
import RomanTempleOfEvora from "../../assets/images/greatworks/RomanTempleOfEvora.webp";
import RotundaOfGalerius from "../../assets/images/greatworks/RotundaOfGalerius.webp";
import RoyalMausoleumOfMauretania from "../../assets/images/greatworks/RoyalMausoleumOfMauretania.webp";
import TempleOfArtemis from "../../assets/images/greatworks/TempleOfArtemis.webp";
import TempleOfBel from "../../assets/images/greatworks/TempleOfBel.webp";
import { $t, L } from "../../utils/i18n";
import type { ImageWithCredit } from "../events/ImageWithCredit";
import type { IBaseModifier, Modifier } from "./Modifier";

interface IGreatWork {
   name: () => string;
   tile: Tile;
   completionYear: number;
   image: ImageWithCredit;
   modifiers: Partial<Record<Modifier, IBaseModifier>>;
   wikipedia: string;
}

export const _GreatWork = {
   GreatPyramidOfGiza: {
      name: () => $t(L.GreatWorkGreatPyramidOfGiza),
      tile: 10551390,
      completionYear: -2560,
      wikipedia: "Great_Pyramid_of_Giza",
      image: {
         url: GreatPyramidOfGiza,
         credit: "The Sphinx and the Pyramids of Giza, Josef Langl (1883)",
      },
      modifiers: {
         LandTax: { type: "multiply", value: 0.1 },
      },
   },
   TempleOfArtemis: {
      name: () => $t(L.GreatWorkTempleOfArtemis),
      tile: 10289234,
      completionYear: -323,
      wikipedia: "Temple_of_Artemis",
      image: {
         url: TempleOfArtemis,
         credit: "The Building of the Temple of Artemis at Ephesus, Hendrik van Cleve (III)",
      },
      modifiers: {
         TileOutput: { type: "multiply", value: 0.1 },
      },
   },
   PharosOfAlexandria: {
      name: () => $t(L.GreatWorkPharosOfAlexandria),
      tile: 10485850,
      completionYear: -283,
      wikipedia: "Lighthouse_of_Alexandria",
      image: {
         url: PharosOfAlexandria,
         credit: "Lighthouse of Alexandria, Philip Galle (1572)",
      },
      modifiers: {
         ResearchCost: { type: "multiply", value: -0.1 },
      },
   },
   RoyalMausoleumOfMauretania: {
      name: () => $t(L.GreatWorkRoyalMausoleumOfMauretania),
      tile: 8978516,
      completionYear: -3,
      wikipedia: "Royal_Mausoleum_of_Mauretania",
      image: {
         url: RoyalMausoleumOfMauretania,
         credit: "Tomb of Juba II and Cleopatra Selene, James Bruce (1769)",
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   },
   HadriansWall: {
      name: () => $t(L.GreatWorkHadriansWall),
      tile: 8716347,
      completionYear: 128,
      wikipedia: "Hadrian%27s_Wall",
      image: {
         url: HadriansWall,
         credit: "The Romans cause a Wall to be built for the Protection of the South, William Bell Scott (1857)",
      },
      modifiers: {
         Defense: { type: "multiply", value: 0.1 },
      },
   },
   RomanTempleOfEvora: {
      name: () => $t(L.GreatWorkRomanTempleOfEvora),
      tile: 8454225,
      completionYear: 100,
      wikipedia: "Roman_Temple_of_%C3%89vora",
      image: {
         url: RomanTempleOfEvora,
         credit: "Templo de Diana em Évora, Alfredo Roque Gameiro (1917)",
      },
      modifiers: {
         TradeProfit: { type: "multiply", value: 0.1 },
      },
   },
   AqueductOfSegovia: {
      name: () => $t(L.GreatWorkAqueductOfSegovia),
      tile: 8716366,
      completionYear: 120,
      wikipedia: "Aqueduct_of_Segovia",
      image: {
         url: AqueductOfSegovia,
         credit: "Aquaduct at Segovia, Spain, Edward Angelo Goodall",
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   },
   PortaNigra: {
      name: () => $t(L.GreatWorkPortaNigra),
      tile: 9175107,
      completionYear: 170,
      wikipedia: "Porta_Nigra",
      image: {
         url: PortaNigra,
         credit: "Ansicht von Trier von Trier mit Blick auf die Porta Nigra, Carl Rüdell",
      },
      modifiers: {
         WarPower: { type: "multiply", value: 0.1 },
      },
   },
   PontDuGard: {
      name: () => $t(L.GreatWorkPontDuGard),
      tile: 9044042,
      completionYear: 50,
      wikipedia: "Pont_du_Gard",
      image: {
         url: PontDuGard,
         credit: "The Pont du Gard, Hubert Robert (1786)",
      },
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   },
   Colosseum: {
      name: () => $t(L.GreatWorkColosseum),
      tile: 9502797,
      completionYear: 80,
      wikipedia: "Colosseum",
      image: {
         url: Colosseum,
         credit: "The Colosseum, Rome, Giovanni Battista Busiri",
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   },
   AntonineBaths: {
      name: () => $t(L.GreatWorkAntonineBaths),
      tile: 9371731,
      completionYear: 162,
      wikipedia: "Baths_of_Antoninus",
      image: {
         url: AntonineBaths,
         credit: "Roman Bath, Antonio Joli (c.1745)",
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   },
   DiocletiansPalace: {
      name: () => $t(L.GreatWorkDiocletiansPalace),
      tile: 9764939,
      completionYear: 305,
      wikipedia: "Diocletian%27s_Palace",
      image: {
         url: DiocletiansPalace,
         credit: "Zeichnung zur Rekonstruktion des Diokletianspalastes in Split (Kroatien), Ernest Hébrard (1912)",
      },
      modifiers: {
         MakeCoreCost: { type: "multiply", value: -0.1 },
      },
   },
   RotundaOfGalerius: {
      name: () => $t(L.GreatWorkRotundaOfGalerius),
      tile: 10027087,
      completionYear: 306,
      wikipedia: "Arch_of_Galerius_and_Rotunda",
      image: {
         url: RotundaOfGalerius,
         credit:
            "Byzantine Arcitecture, illustrated by Examples of Edifices erected in the East during the earliest Ages of Christianity, Félix Marie Charles Texier (1864)",
      },
      modifiers: {
         TradeCapacity: { type: "add", value: 1 },
      },
   },
   HagiaSophia: {
      name: () => $t(L.GreatWorkHagiaSophia),
      tile: 10354767,
      completionYear: 537,
      wikipedia: "Hagia_Sophia",
      image: {
         url: HagiaSophia,
         credit: "Aya Sofia, Constantinople, Gaspare Fossati (1852)",
      },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   },
   TempleOfBel: {
      name: () => $t(L.GreatWorkTempleOfBel),
      tile: 10879061,
      completionYear: 175,
      wikipedia: "Temple_of_Bel",
      image: {
         url: TempleOfBel,
         credit: "The ruins of the temple of the sun, Palmyra, Carl Haag (1859)",
      },
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   },
   AlKhazneh: {
      name: () => $t(L.GreatWorkAlKhazneh),
      tile: 10682459,
      completionYear: 25,
      wikipedia: "Al-Khazneh",
      image: {
         url: AlKhazneh,
         credit: "El Khasnè, Petra. Coloured lithograph by Louis Haghe after David Roberts (1849)",
      },
      modifiers: {
         Prestige: { type: "add", value: 10 },
      },
   },
   ChurchOfTheHolySepulchre: {
      name: () => $t(L.GreatWorkChurchOfTheHolySepulchre),
      tile: 10747993,
      completionYear: 335,
      wikipedia: "Church_of_the_Holy_Sepulchre",
      image: {
         url: ChurchOfTheHolySepulchre,
         credit: "Jerusalem with the Church of the Holy Sepulchre, Luigi Mayer (1804)",
      },
      modifiers: {
         ChristianityYearly: { type: "add", value: 1 },
      },
   },
} as const satisfies Record<string, IGreatWork>;

export type GreatWork = keyof typeof _GreatWork;
export const GreatWork = _GreatWork as Record<GreatWork, IGreatWork>;
export const TileToGreatWork: Map<Tile, GreatWork> = new Map(
   entriesOf(GreatWork).map(([key, value]) => [value.tile, key]),
);
