import { $t, L } from "../../utils/i18n";
import { OfferAllianceAction, OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { getOriginalTileCount } from "../GameState";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import { maxCoreTileCondition } from "../logic/MissionLogic";
import { getProvinceResource, getProvinceStability } from "../logic/ProvinceLogic";
import { isCoreTileCondition } from "../logic/TileLogic";
import {
   dissolveAllTreaties,
   requireMinimumAttitude,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const AquitaniaEvent = {
   Aquitania1: {
      name: () => $t(L.TheWineFleetOfBurdigala),
      image: EventImage.Aquitania1,
      desc: () => $t(L.TheWineFleetOfBurdigalaDesc),
      condition: {
         province: ["Aquitania"],
         year: [215, 215],
      },
      buttons: [
         {
            label: () => $t(L.InvestInTheAmphoraTrade),
            resources: { gold: -500 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxTheMerchantHouses),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania2: {
      name: () => $t(L.TheGreatEstatesOfTheGaronne),
      image: EventImage.Aquitania2,
      desc: () => $t(L.TheGreatEstatesOfTheGaronneDesc),
      condition: {
         province: ["Aquitania"],
         year: [240, 240],
      },
      buttons: [
         {
            label: () => $t(L.EmpowerTheGreatLandowners),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BindTheColoniToTheLand),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania3: {
      name: () => $t(L.TheBagaudaeRiseInTheCountryside),
      wikipedia: "Bagaudae",
      image: EventImage.Aquitania3,
      desc: () => $t(L.TheBagaudaeRiseInTheCountrysideDesc),
      condition: {
         province: ["Aquitania"],
         year: [285, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsLessThan$2, Province.Aquitania.name(), "0"),
               value: getProvinceStability(province, save).value < 0,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.CrushTheBagaudaeWithTheLegions),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EaseTheBurdenUponThePeasants),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LeaveTheBanditsToTheLandowners),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania4: {
      name: () => $t(L.TheSchoolsOfBordeaux),
      image: EventImage.School,
      desc: () => $t(L.TheSchoolsOfBordeauxDesc),
      condition: {
         province: ["Aquitania"],
         year: [325, 325],
      },
      buttons: [
         {
            label: () => $t(L.EndowTheRhetoricSchools),
            resources: { administrative: -50 },
            modifiers: {
               ResearchCost: { type: "multiply", value: -0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitTheProfessorsToOurService),
            resources: { administrative: 50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania5: {
      name: () => $t(L.HilaryOfPoitiersDefiesTheArians),
      wikipedia: "Hilary_of_Poitiers",
      image: EventImage.Aquitania5,
      desc: () => $t(L.HilaryOfPoitiersDefiesTheAriansDesc),
      condition: {
         province: ["Aquitania"],
         year: [356, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Aquitania.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.StandWithHilaryAgainstArianism),
            resources: { christianity: 10 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceTheEmperorsArianCreed),
            resources: { christianity: -10, consulPoint: 1 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepThePeaceBetweenTheFactions),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania6: {
      name: () => $t(L.PaulinusForsakesTheWorld),
      wikipedia: "Paulinus_of_Nola",
      image: EventImage.Aquitania6,
      desc: () => $t(L.PaulinusForsakesTheWorldDesc),
      condition: {
         province: ["Aquitania"],
         year: [400, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Aquitania.name(), "30"),
               value: getProvinceResource("christianity", province, save) >= 30,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.BlessHisHolyRenunciation),
            resources: { gold: -500, christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MournTheLossToTheTaxRolls),
            resources: { gold: 500, christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania7: {
      name: () => $t(L.AusoniusReturnsToHisVilla),
      wikipedia: "Ausonius",
      image: EventImage.Aquitania7,
      desc: () => $t(L.AusoniusReturnsToHisVillaDesc),
      condition: {
         province: ["Aquitania"],
         year: [374, 374],
      },
      buttons: [
         {
            label: () => $t(L.CelebrateOurPoetsHomecoming),
            resources: { administrative: 50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CourtHisInfluenceAtTheImperialCourt),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania8: {
      name: () => $t(L.TheSpringsOfAquae),
      image: EventImage.Aquitania8,
      desc: () => $t(L.TheSpringsOfAquaeDesc),
      condition: {
         province: ["Aquitania"],
         year: [194, 194],
      },
      buttons: [
         {
            label: () => $t(L.PatronizeTheHealingBaths),
            resources: { gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxTheWealthyBathers),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania9: {
      name: () => $t(L.TheHorseBreedersOfAquitania),
      image: EventImage.Aquitania9,
      desc: () => $t(L.TheHorseBreedersOfAquitaniaDesc),
      condition: {
         province: ["Aquitania"],
         year: [265, 265],
      },
      buttons: [
         {
            label: () => $t(L.RaiseMountsForTheCavalry),
            stats: { cavalrySkill: 1 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SellOurHorsesForProfit),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania10: {
      name: () => $t(L.TheVineyardsFallFallow),
      image: EventImage.Aquitania10,
      desc: () => $t(L.TheVineyardsFallFallowDesc),
      condition: {
         province: ["Aquitania"],
         year: [430, 430],
      },
      buttons: [
         {
            label: () => $t(L.InvestInTheFailingVineyards),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheLandTurnToPasture),
            modifiers: {
               Stability: { type: "add", value: 5, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Aquitania11: {
      name: () => $t(L.AGallicAlliance),
      image: EventImage.Alliance,
      desc: () => $t(L.AGallicAllianceDesc),
      condition: {
         province: ["Aquitania"],
         provinceOnMap: ["Lugdunensis"],
         conditions: (province, save) => {
            return [
               requireNoTreatyBetween(["Alliance", "Patron"], province, "Lugdunensis", save),
               requirePeaceBetween(province, "Lugdunensis", save),
               availableDiplomatCondition(province, "Lugdunensis", save),
               availableDiplomatCondition("Lugdunensis", province, save),
               requireMinimumAttitude("Lugdunensis", province, 25, save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.$1ShallStandAsOurAlly, Province.Lugdunensis.name()),
            custom: [
               {
                  effect: (province, save) => {
                     OfferAllianceAction(province, "Lugdunensis", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurAlly, Province.Lugdunensis.name()),
               },
            ],
         },
      ],
   },
   Aquitania12: {
      name: () => $t(L.APortOnTheMediterranean),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.APortOnTheMediterraneanDesc),
      condition: {
         province: ["Aquitania"],
         annexAndCore: { Narbonensis: 2 },
         conditions: (province, save) => [isCoreTileCondition(8978507, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.ChannelTradeThroughAgatha),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Narbonensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyOurMediterraneanPrize),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Narbonensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Aquitania13: {
      name: () => $t(L.TheSubmissionOfNarbonensis),
      image: EventImage.Annex,
      desc: () => $t(L.TheSubmissionOfNarbonensisDesc),
      condition: {
         province: ["Aquitania"],
         annexAndCore: { Narbonensis: Math.ceil(getOriginalTileCount("Narbonensis") * 0.7) },
         conditions: (province, save) => {
            return [
               requireNoTreatyBetween(["Patron"], province, "Narbonensis", save),
               requirePeaceBetween(province, "Narbonensis", save),
               availableDiplomatCondition(province, "Narbonensis", save),
               maxCoreTileCondition(5, "Narbonensis", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.$1ShallServeAsOurLoyalClient, Province.Narbonensis.name()),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Narbonensis", save);
                     OfferPatronageAction(province, "Narbonensis", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Narbonensis.name()),
               },
            ],
         },
      ],
   },
   Aquitania14: {
      name: () => $t(L.AcrossThePyrenees),
      image: EventImage.Pyrenees,
      desc: () => $t(L.AcrossThePyreneesDesc),
      condition: {
         province: ["Aquitania"],
         annexAndCore: { Tarraconensis: 6 },
      },
      buttons: [
         {
            label: () => $t(L.WeShallContinueOurCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Tarraconensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Lusitania: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Baetica: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.SecureOurIberianFoothold),
            modifiers: {
               Stability: { type: "add", value: 20, duration: 2 * 12 },
            },
            casusBelli: {
               Tarraconensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Lusitania: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Baetica: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
