import type { Tile } from "@project/shared/src/utils/Helper";
import Amphitheatre from "../../assets/images/buildings/Amphitheatre.webp";
import ArmyCamp from "../../assets/images/buildings/ArmyCamp.webp";
import Barracks from "../../assets/images/buildings/Barracks.webp";
import Castra from "../../assets/images/buildings/Castra.webp";
import CircusMaximus from "../../assets/images/buildings/CircusMaximus.webp";
import Citadel from "../../assets/images/buildings/Citadel.webp";
import Courthouse from "../../assets/images/buildings/Courthouse.webp";
import Forum from "../../assets/images/buildings/Forum.webp";
import Harbour from "../../assets/images/buildings/Harbour.webp";
import Market from "../../assets/images/buildings/Market.webp";
import Temple from "../../assets/images/buildings/Temple.webp";
import TownSquare from "../../assets/images/buildings/TownSquare.webp";
import TradeDistrict from "../../assets/images/buildings/TradeDistrict.webp";
import Workshop from "../../assets/images/buildings/Workshop.webp";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { isCoastal } from "../logic/TileLogic";
import type { ProvinceResourceCosts } from "./Province";

export interface IBuilding {
   name: () => string;
   desc: () => string;
   image: string;
   construction: ProvinceResourceCosts;
   maintenance: ProvinceResourceCosts;
   conditions: (tile: Tile, save: SaveGame) => ICondition[];
   imageCredit: string;
}

export const _Buildings = {
   Amphitheatre: {
      name: () => $t(L.BuildingAmphitheatre),
      desc: () => $t(L.XTileUnrest, "-10"),
      image: Amphitheatre,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "Colosseum Rome, Michel Vincent Brandoin (c. 1700s)",
   },
   CircusMaximus: {
      name: () => $t(L.BuildingCircusMaximus),
      desc: () => $t(L.XTileUnrest, "-20"),
      image: CircusMaximus,
      construction: {
         gold: 4 * 120,
      },
      maintenance: {
         gold: 4,
      },
      conditions: () => [],
      imageCredit: "Forum Nervae, Forum Augusti, Christoph Ziegler (1882)",
   },
   TownSquare: {
      name: () => $t(L.BuildingTownSquare),
      desc: () => $t(L.XTileLandTax, "+20%"),
      image: TownSquare,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "Greece, Athens - Agora Monastiraki Square (1853), Harald Conrad Stilling (Danish, 1815 - 1891)",
   },
   Forum: {
      name: () => $t(L.BuildingForum),
      desc: () => $t(L.XTileLandTax, "+40%"),
      image: Forum,
      construction: {
         gold: 4 * 120,
      },
      maintenance: {
         gold: 4,
      },
      conditions: () => [],
      imageCredit: "Das Forum Romanum, J. Bühlmann (1901)",
   },
   Market: {
      name: () => $t(L.BuildingMarket),
      desc: () => $t(L.XTileOutput, "+20%"),
      image: Market,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "Flower market in Amsterdam, Heinrich Hermanns (1900s)",
   },
   TradeDistrict: {
      name: () => $t(L.BuildingTradeDistrict),
      desc: () => $t(L.XTileOutput, "+40%"),
      image: TradeDistrict,
      construction: {
         gold: 4 * 120,
      },
      maintenance: {
         gold: 4,
      },
      conditions: () => [],
      imageCredit: "The Bazaar at Athens, Dodwell Edward (Irish, 1767-1832)",
   },
   ArmyCamp: {
      name: () => $t(L.BuildingArmyCamp),
      desc: () => $t(L.XTileManpower, "+20%"),
      image: ArmyCamp,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "An Army Camp (c. 1662 - c. 1664), Philips Wouwerman (Dutch, 1619-1668)",
   },
   Barracks: {
      name: () => $t(L.BuildingBarracks),
      desc: () => $t(L.XTileManpower, "+40%"),
      image: Barracks,
      construction: {
         gold: 4 * 120,
      },
      maintenance: {
         gold: 4,
      },
      conditions: () => [],
      imageCredit: "Der erste Hof der Salzgries-Kaserne in Wien, Emil Hütter (1880)",
   },
   Castra: {
      name: () => $t(L.BuildingCastra),
      desc: () => $t(L.XTileDefense, "+20%"),
      image: Castra,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "Im römischen Lager, Johannes Gehrts (1900)",
   },
   Citadel: {
      name: () => $t(L.BuildingCitadel),
      desc: () => $t(L.XTileDefense, "+40%"),
      image: Citadel,
      construction: {
         gold: 4 * 120,
      },
      maintenance: {
         gold: 4,
      },
      conditions: () => [],
      imageCredit: "Im römischen Lager, Johannes Gehrts (1900)",
   },
   Temple: {
      name: () => $t(L.BuildingTemple),
      desc: () => $t(L.XTileMaintenanceCostAndYBuildingSlot, "-20%", "+1"),
      image: Temple,
      construction: {
         gold: 2 * 120,
      },
      maintenance: {
         gold: 2,
      },
      conditions: () => [],
      imageCredit: "Sacrifice In Front Of A Roman Temple, Vinzenz Fischer (1791)",
   },
   Courthouse: {
      name: () => $t(L.BuildingCourthouse),
      desc: () => $t(L.XTileGoverningCost, "-20%"),
      image: Courthouse,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "Forum Nervae, Forum Augusti, Christoph Ziegler (1882)  ",
   },
   Workshop: {
      name: () => $t(L.BuildingWorkshop),
      desc: () => $t(L.XProductionCapacity, "+1"),
      image: Workshop,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: () => [],
      imageCredit: "A Forge (18th century), Antonio Zucchi (Italian, 1726-1796)",
   },
   Harbour: {
      name: () => $t(L.BuildingHarbour),
      desc: () => $t(L.XTradeCapacity, "+1"),
      image: Harbour,
      construction: {
         gold: 120,
      },
      maintenance: {
         gold: 1,
      },
      conditions: (tile, save) => [{ name: $t(L.TileIsCoastal), value: isCoastal(tile) }],
      imageCredit: "View of a Mediterranean harbour, Hendrik Frans Van Lint (Flemish, 1684-1763)",
   },
} as const satisfies Record<string, IBuilding>;

export type Building = keyof typeof _Buildings;
export const Buildings = Object.freeze(_Buildings as Record<Building, IBuilding>);
