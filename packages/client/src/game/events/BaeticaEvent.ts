import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { StraitOfGibraltarTiles } from "../definitions/TileConstants";
import { getTileName } from "../definitions/TileName";
import {
   marriageCondition,
   maxCoreTileCondition,
   minCoreTileCondition,
   provinceResourceCondition,
   warPowerCondition,
} from "../logic/MissionLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { allCoreTileCondition } from "../logic/TileLogic";
import { dissolveAllTreaties, requireAnyTreatyBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const BaeticaEvent = {
   Baetica1: {
      name: () => $t(L.TheOliveFleetOfTheBaetis),
      image: EventImage.Olive,
      desc: () => $t(L.TheOliveFleetOfTheBaetisDesc),
      condition: {
         province: ["Baetica"],
         year: [200, 200],
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheOilworks),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.IncreaseTheOilLevy),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica2: {
      name: () => $t(L.TheGarumVatsOfGades),
      image: EventImage.Baetica2,
      desc: () => $t(L.TheGarumVatsOfGadesDesc),
      condition: {
         province: ["Baetica"],
         year: [220, 220],
      },
      buttons: [
         {
            label: () => $t(L.PatronizeTheExporters),
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MonopolizeTheFinestSauce),
            resources: { gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica3: {
      name: () => $t(L.TheMinesOfTheSierraMorena),
      image: EventImage.Baetica3,
      desc: () => $t(L.TheMinesOfTheSierraMorenaDesc),
      condition: {
         province: ["Baetica"],
         year: [245, 245],
      },
      buttons: [
         {
            label: () => $t(L.ReopenTheImperialShafts),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LeaseThemToLocalMagnates),
            resources: { gold: 500 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica4: {
      name: () => $t(L.TheAncestralGloryOfItalica),
      image: EventImage.Y238,
      desc: () => $t(L.TheAncestralGloryOfItalicaDesc),
      condition: {
         province: ["Baetica"],
         year: [271, 271],
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheMonumentsOfItalica),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReuseTheStoneInLivingCities),
            resources: { administrative: 50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica5: {
      name: () => $t(L.TheMartyrsOfCorduba),
      wikipedia: "Acisclus",
      image: EventImage.Baetica5,
      desc: () => $t(L.TheMartyrsOfCordubaDesc),
      condition: {
         province: ["Baetica"],
         year: [304, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [provinceResourceCondition("christianity", 10, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.HonorTheCordubanMartyrs),
            resources: { christianity: 15 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceTheImperialEdicts),
            resources: { christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica6: {
      name: () => $t(L.TheCouncilOfElvira),
      wikipedia: "Synod_of_Elvira",
      image: EventImage.Baetica6,
      desc: () => $t(L.TheCouncilOfElviraDesc),
      condition: {
         province: ["Baetica"],
         year: [306, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [provinceResourceCondition("christianity", 20, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.EnforceTheCouncilsDiscipline),
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekCompromiseWithOldCustoms),
            resources: { christianity: -5 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica7: {
      name: () => $t(L.HosiusReturnsFromNicaea),
      wikipedia: "Hosius_of_Corduba",
      image: EventImage.Baetica7,
      desc: () => $t(L.HosiusReturnsFromNicaeaDesc),
      condition: {
         province: ["Baetica"],
         year: [325, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [provinceResourceCondition("christianity", 30, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.GiveHosiusChargeOfTheChurch),
            resources: { christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepHosiussAuthorityInCheck),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SendHosiusToTheImperialCourt),
            resources: { diplomatic: 50, consulPoint: 1 },
         },
      ],
   },
   Baetica8: {
      name: () => $t(L.TheDancersOfGades),
      image: EventImage.Dancer,
      desc: () => $t(L.TheDancersOfGadesDesc),
      condition: {
         province: ["Baetica"],
         year: [350, 350],
      },
      buttons: [
         {
            label: () => $t(L.CelebrateBaeticanCulture),
            resources: { gold: -300 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxTheBaeticanPerformances),
            resources: { gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica9: {
      name: () => $t(L.TheVandalsReceiveBaetica),
      wikipedia: "Silingi",
      image: EventImage.Baetica9,
      desc: () => $t(L.TheVandalsReceiveBaeticaDesc),
      condition: {
         province: ["Baetica"],
         year: [411, 411],
      },
      buttons: [
         {
            label: () => $t(L.RecognizeThemAsFederates),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RallyTheCitiesAgainstThem),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica10: {
      name: () => $t(L.TheEmptyHarborsAfterTheCrossing),
      wikipedia: "Vandal_conquest_of_Roman_Africa",
      image: EventImage.Narbonensis10,
      desc: () => $t(L.TheEmptyHarborsAfterTheCrossingDesc),
      condition: {
         province: ["Baetica"],
         year: [430, 430],
      },
      buttons: [
         {
            label: () => $t(L.SeizeTheVandalStores),
            resources: { gold: 1000 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreTheCoastalTrade),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheCoastalStraits),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica11: {
      name: () => $t(L.TheLusitanianCounterweight),
      image: EventImage.Alliance,
      desc: () => $t(L.TheLusitanianCounterweightDesc),
      condition: {
         province: ["Baetica"],
         provinceOnMap: ["Lusitania"],
         conditions: (province, save) => [
            requireAnyTreatyBetween(["DefensePact", "Alliance", "Patron"], province, "Lusitania", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.PlanAnOffensiveWithLusitania),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Tarraconensis: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.PlanADefenseWithLusitania),
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Tarraconensis: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Baetica12: {
      name: () => $t(L.ThePillarsOfHercules),
      image: EventImage.Gibraltar,
      desc: () => $t(L.ThePillarsOfHerculesDesc),
      condition: {
         province: ["Baetica"],
         conditions: (province, save) => [allCoreTileCondition(StraitOfGibraltarTiles, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.DevelopThePortsOnBothShores),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ExactTributeFromPassingShips),
            resources: {
               gold: 1500,
               administrative: 50,
               diplomatic: 50,
               military: 50,
            },
         },
      ],
   },
   Baetica13: {
      name: () => $t(L.BaeticaAscendant),
      image: EventImage.Prosperity,
      desc: () => $t(L.BaeticaAscendantDesc),
      condition: {
         province: ["Baetica"],
         conditions: (province, save) => [minCoreTileCondition(15, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.ProclaimBaeticasRenewedGreatness),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BindTheNewTerritoriesToOurRule),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica14: {
      name: () => $t(L.TheAppealOfPalma),
      image: EventImage.Island,
      desc: () => $t(L.TheAppealOfPalmaDesc),
      condition: {
         province: ["Baetica"],
         annexAndCore: { Tarraconensis: 5 },
         conditions: (province, save) => [
            provinceResourceCondition("diplomatic", 200, province, save),
            warPowerCondition(10_000, province, save),
            allCoreTileCondition([8978513], "Tarraconensis", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.BringPalmaUnderOurProtection),
            resources: { diplomatic: -200 },
            custom: [
               {
                  desc: (province, save) => {
                     const tileNames = [8978513].map(getTileName).join(", ");
                     return $t(L.$1Annexes$2, getProvinceName(province, save), tileNames);
                  },
                  effect: (province, save) => {
                     [8978513].forEach((tile) => {
                        const tileData = save.state.tiles.get(tile);
                        if (tileData) {
                           tileData.province = province;
                        }
                     });
                  },
               },
            ],
         },
         {
            label: () => $t(L.CondemnTarraconensissNeglect),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Baetica15: {
      name: () => $t(L.TheLusitanianMarriageSettlement),
      image: EventImage.Wedding2,
      desc: () => $t(L.TheLusitanianMarriageSettlementDesc),
      condition: {
         province: ["Baetica"],
         provinceOnMap: ["Lusitania"],
         conditions: (province, save) => [
            provinceResourceCondition("diplomatic", 200, province, save),
            minCoreTileCondition(20, province, save),
            maxCoreTileCondition(5, "Lusitania", save),
            marriageCondition(province, "Lusitania", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveLusitaniaAsOurClient),
            resources: { diplomatic: -200 },
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Lusitania", save);
                     OfferPatronageAction(province, "Lusitania", save).effect({ headless: false });
                  },
                  desc: (_province, _save) => $t(L.$1BecomesOurClient, Province.Lusitania.name()),
               },
            ],
         },
         {
            label: () => $t(L.RenewTheUnionBetweenEquals),
            resources: { diplomatic: 200 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 5 * 12 },
               Stability: { type: "add", value: 10, duration: 5 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
