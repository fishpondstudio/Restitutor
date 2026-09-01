import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import {
   allCoreTileCondition,
   marriageCondition,
   minCoreCoastalTileCondition,
   minCoreTileCondition,
   provinceResourceCondition,
} from "../logic/MissionLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ItaliaEvent = {
   Italia1: {
      name: () => $t(L.TheSecularGamesOfSeptimiusSeverus),
      wikipedia: "Secular_Games",
      image: EventImage.ChariotRace1,
      desc: () => $t(L.TheSecularGamesOfSeptimiusSeverusDesc),
      condition: {
         province: ["Italia"],
         year: [204, 204],
      },
      buttons: [
         {
            label: () => $t(L.LetRomeAstonishTheWorld),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheCelebrationsWithinReason),
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia2: {
      name: () => $t(L.TheBathsOfCaracalla),
      wikipedia: "Baths_of_Caracalla",
      image: EventImage.CaracallaBaths,
      desc: () => $t(L.TheBathsOfCaracallaDesc),
      condition: {
         province: ["Italia"],
         year: [216, 216],
      },
      buttons: [
         {
            label: () => $t(L.EndowTheBathsInPerpetuity),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ChargeTheWealthyForTheirLuxuries),
            resources: { gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia3: {
      name: () => $t(L.TheWallsOfAurelian),
      wikipedia: "Aurelian_Walls",
      image: EventImage.AurelianWalls,
      desc: () => $t(L.TheWallsOfAurelianDesc),
      condition: {
         province: ["Italia"],
         year: [271, 271],
      },
      buttons: [
         {
            label: () => $t(L.EveryGuildShallLendItsHands),
            resources: { gold: -750 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 5 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheVulnerableApproaches),
            resources: { gold: -250 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Italia4: {
      name: () => $t(L.TheSenatesLastEmperor),
      wikipedia: "Tacitus_(emperor)",
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.TheSenatesLastEmperorDesc),
      condition: {
         province: ["Italia"],
         year: [275, 275],
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheSenatesAncientDignity),
            resources: { administrative: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ImperialPowerRestsWithTheLegions),
            resources: { military: 75 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia5: {
      name: () => $t(L.AnImperialCourtAtMediolanum),
      wikipedia: "Mediolanum",
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.AnImperialCourtAtMediolanumDesc),
      condition: {
         province: ["Italia"],
         year: [286, 286],
      },
      buttons: [
         {
            label: () => $t(L.BuildACapitalWorthyOfAnAugustus),
            resources: { gold: -500 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheCourtPayForItsOwnSplendor),
            resources: { gold: 500 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia6: {
      name: () => $t(L.TheArchOfConstantine),
      wikipedia: "Arch_of_Constantine",
      image: EventImage.RomanTriumph1,
      desc: () => $t(L.TheArchOfConstantineDesc),
      condition: {
         province: ["Italia"],
         year: [315, 315],
      },
      buttons: [
         {
            label: () => $t(L.BindConstantineToRomesGoldenAge),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PreserveTheOlderMonumentsInstead),
            resources: { administrative: 75 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia7: {
      name: () => $t(L.TheAltarOfVictory),
      wikipedia: "Altar_of_Victory",
      image: EventImage.AmbroseBarsTheodosius,
      desc: () => $t(L.TheAltarOfVictoryDesc),
      condition: {
         province: ["Italia"],
         year: [382, Number.POSITIVE_INFINITY],
      },
      buttons: [
         {
            label: () => $t(L.TheOldRitesHaveHadTheirDay),
            resources: { christianity: 20 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreTheAltarForConcord),
            resources: { christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia8: {
      name: () => $t(L.TheCourtWithdrawsToRavenna),
      wikipedia: "Ravenna",
      image: EventImage.RavennaMosaic,
      desc: () => $t(L.TheCourtWithdrawsToRavennaDesc),
      condition: {
         province: ["Italia"],
         year: [402, 402],
      },
      buttons: [
         {
            label: () => $t(L.TurnRavennaIntoAnImpregnableCapital),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeCapacity: { type: "add", value: 1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.TheCourtMustRemainCloseToRome),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia9: {
      name: () => $t(L.TheMarriageAtRavenna),
      wikipedia: "Galla_Placidia",
      image: EventImage.Wedding2,
      desc: () => $t(L.TheMarriageAtRavennaDesc),
      condition: {
         province: ["Italia"],
         year: [417, 417],
      },
      buttons: [
         {
            label: () => $t(L.CelebrateTheUnionOfDynastyAndArmy),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RewardConstantiusWithGreaterCommand),
            resources: { military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Italia10: {
      name: () => $t(L.TheMurderOfAetius),
      wikipedia: "Flavius_Aetius",
      image: EventImage.CaesarDeath1,
      desc: () => $t(L.TheMurderOfAetiusDesc),
      condition: {
         province: ["Italia"],
         year: [454, 454],
      },
      buttons: [
         {
            label: () => $t(L.SecureTheEmperorsAuthority),
            resources: { administrative: 75 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               WarPower: { type: "multiply", value: -0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileAetiussOfficers),
            resources: { gold: -500, military: 75 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
      ],
   },
   Italia11: {
      name: () => $t(L.TheTwoShoresReunited),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheTwoShoresReunitedDesc),
      condition: {
         province: ["Italia"],
         annexAndCore: { Sicilia: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.MakeSiciliaTheCentralSeasBastion),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BindTheIslandThroughGrainAndLaw),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MakeSiciliaAPillarOfGovernment),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Italia12: {
      name: () => $t(L.CorsicaBeneathOurProtection),
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.CorsicaBeneathOurProtectionDesc),
      condition: {
         province: ["Italia"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Corsica", save),
            requirePeaceBetween(province, "Corsica", save),
            minCoreTileCondition(40, province, save),
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Corsica", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveCorsicaAsOurLoyalClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Corsica", save);
                     OfferPatronageAction(province, "Corsica", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Corsica.name()),
               },
            ],
         },
      ],
   },
   Italia13: {
      name: () => $t(L.BondsOfBloodAndSea),
      image: EventImage.Wedding2,
      desc: () => $t(L.BondsOfBloodAndSeaDesc),
      condition: {
         province: ["Italia"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Sardinia", save),
            requirePeaceBetween(province, "Sardinia", save),
            minCoreTileCondition(45, province, save),
            requireAnyTreatyBetween(["Alliance"], province, "Sardinia", save),
            marriageCondition(province, "Sardinia", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.WelcomeSardiniaIntoOurClientRealm),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Sardinia", save);
                     OfferPatronageAction(province, "Sardinia", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Sardinia.name()),
               },
            ],
         },
      ],
   },
   Italia14: {
      name: () => $t(L.BeyondTheAlpineGates),
      image: EventImage.Alps,
      desc: () => $t(L.BeyondTheAlpineGatesDesc),
      condition: {
         province: ["Italia"],
         playerOnly: true,
         annexAndCore: {
            Corsica: Number.POSITIVE_INFINITY,
            Sardinia: Number.POSITIVE_INFINITY,
            Sicilia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.CrossWestIntoNarbonensis),
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 2 * 12, province: "Narbonensis" },
            ],
            casusBelli: { Narbonensis: { casusBelli: "ConquestMission", duration: 5 * 12 } },
         },
         {
            label: () => $t(L.ForceThePassesIntoRaetia),
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 2 * 12, province: "Raetia" },
            ],
            casusBelli: { Raetia: { casusBelli: "ConquestMission", duration: 5 * 12 } },
         },
         {
            label: () => $t(L.DescendUponNoricum),
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 2 * 12, province: "Noricum" },
            ],
            casusBelli: { Noricum: { casusBelli: "ConquestMission", duration: 5 * 12 } },
         },
      ],
   },
   Italia15: {
      name: () => $t(L.CloseTheAdriatic),
      image: EventImage.NavalBattle,
      desc: () => $t(L.CloseTheAdriaticDesc),
      condition: {
         province: ["Italia"],
         playerOnly: true,
         conditions: (province, save) => [
            requireAnyTreatyBetween(["Alliance", "Patron"], province, "Macedonia", save),
            allCoreTileCondition([9633865, 9699402], province, save),
            provinceResourceCondition("gold", 5000, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.FundTheJointBlockade),
            resources: { gold: -5000 },
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 } },
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 2 * 12, province: "Dalmatia" },
            ],
            casusBelli: { Dalmatia: { casusBelli: "ConquestMission", duration: 5 * 12 } },
         },
      ],
   },
   Italia16: {
      name: () => $t(L.MasteryOfTheMiddleSea),
      image: EventImage.QueenEmbarkation,
      desc: () => $t(L.MasteryOfTheMiddleSeaDesc),
      condition: {
         province: ["Italia"],
         conditions: (province, save) => [minCoreCoastalTileCondition(40, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.TurnEveryHarborIntoANavalStation),
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.LetOurFleetsDisplayItaliasMajesty),
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.RecruitTheSeasFinestOfficials),
            resources: { administrative: 50, diplomatic: 50, military: 50 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
