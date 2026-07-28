import { $t, L } from "../../utils/i18n";
import { OfferAllianceAction, OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { getTileName } from "../definitions/TileName";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import { provinceResourceCondition } from "../logic/MissionLogic";
import { getProvinceCoreTileCount, getProvinceName, getProvinceResource } from "../logic/ProvinceLogic";
import { isCoreTileCondition } from "../logic/TileLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireHigherPrestige,
   requireMinimumAttitude,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const TarraconensisEvent = {
   Tarraconensis1: {
      name: () => $t(L.TheSilverOfCarthagoNova),
      image: EventImage.Mine,
      desc: () => $t(L.TheSilverOfCarthagoNovaDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [205, 205],
      },
      buttons: [
         {
            label: () => $t(L.DrainTheOldWorkings),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LeaseTheMinesToContractors),
            resources: { gold: 500 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis2: {
      name: () => $t(L.TheGamesOfTarraco),
      image: EventImage.Games2,
      desc: () => $t(L.TheGamesOfTarracoDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [225, 225],
      },
      buttons: [
         {
            label: () => $t(L.FundMagnificentGames),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MakeTheCitiesPay),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis3: {
      name: () => $t(L.TheMartyrdomOfFructuosus),
      image: EventImage.Y303,
      desc: () => $t(L.TheMartyrdomOfFructuosusDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [259, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Tarraconensis.name(), "10"),
               value: getProvinceResource("christianity", province, save) >= 10,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.PreserveTheBishopsMemory),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceTheImperialSentence),
            resources: { christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis4: {
      name: () => $t(L.WallsForBarcino),
      image: EventImage.Toledo,
      desc: () => $t(L.WallsForBarcinoDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [275, 275],
      },
      buttons: [
         {
            label: () => $t(L.RaiseBarcinosCircuitOfTowers),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConcentrateResourcesAtTarraco),
            resources: { administrative: 50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis5: {
      name: () => $t(L.TheNewTaxSurvey),
      image: EventImage.Y284,
      desc: () => $t(L.TheNewTaxSurveyDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [298, 298],
      },
      buttons: [
         {
            label: () => $t(L.SurveyEveryEstate),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GrantTheCitiesALighterAssessment),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis6: {
      name: () => $t(L.TheIrrigatorsOfTheEbro),
      image: EventImage.Canal,
      desc: () => $t(L.TheIrrigatorsOfTheEbroDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [331, 331],
      },
      buttons: [
         {
            label: () => $t(L.RepairThePublicCanals),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GrantTheWatersToTheGreatEstates),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis7: {
      name: () => $t(L.PrudentiusSingsOfChristianRome),
      image: EventImage.Tarraconensis7,
      desc: () => $t(L.PrudentiusSingsOfChristianRomeDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [385, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Tarraconensis.name(), "30"),
               value: getProvinceResource("christianity", province, save) >= 30,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.PatronizeThePoet),
            resources: { administrative: -50, christianity: 10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EmployHimAsAnImperialAdvocate),
            resources: { diplomatic: 50, consulPoint: 1 },
         },
      ],
   },
   Tarraconensis8: {
      name: () => $t(L.MaximusTakesThePurpleInHispania),
      image: EventImage.Y222,
      desc: () => $t(L.MaximusTakesThePurpleInHispaniaDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [408, 408],
      },
      buttons: [
         {
            label: () => $t(L.RecognizeTheHispanicEmperor),
            resources: { gold: 500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.HoldTarracoForTheLawfulEmperor),
            resources: { consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis9: {
      name: () => $t(L.TheLastRomanProvinceInHispania),
      image: EventImage.Tarraconensis9,
      desc: () => $t(L.TheLastRomanProvinceInHispaniaDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [411, 411],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveTheRefugeesAndOfficials),
            resources: { administrative: 100 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SealTheMountainPasses),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis10: {
      name: () => $t(L.TheBagaudaeOfTheEbro),
      image: EventImage.Tarraconensis10,
      desc: () => $t(L.TheBagaudaeOfTheEbroDesc),
      condition: {
         province: ["Tarraconensis"],
         year: [441, 441],
      },
      buttons: [
         {
            label: () => $t(L.CrushTheRebels),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReduceRentsAndLevies),
            modifiers: {
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RecognizeTheLocalMilitias),
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis11: {
      name: () => $t(L.AFootholdInBaetica),
      image: EventImage.Expedition,
      desc: () => $t(L.AFootholdInBaeticaDesc),
      condition: {
         province: ["Tarraconensis"],
         annexAndCore: { Baetica: 2 },
         year: [Number.NEGATIVE_INFINITY, 200],
      },
      buttons: [
         {
            label: () => $t(L.EnterTheEstatesOnOurTaxRolls),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreTheFieldsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitTheConqueredGarrisons),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Tarraconensis12: {
      name: () => $t(L.BaeticaLiesExposed),
      image: EventImage.Belgica3,
      desc: () => $t(L.BaeticaLiesExposedDesc),
      condition: {
         province: ["Tarraconensis"],
         playerOnly: true,
         provinceOnMap: ["Baetica"],
         conditions: (province, save) => [
            {
               name: $t(L.$1HasAtMost$2CoreTiles, Province.Baetica.name(), "3"),
               value: getProvinceCoreTileCount("Baetica", save) <= 3,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.UndermineTheFrontierForts),
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.3, duration: 5 * 12, province: "Baetica" },
            ],
         },
         {
            label: () => $t(L.SubornTheRemainingGarrisons),
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.3, duration: 5 * 12, province: "Baetica" },
            ],
         },
      ],
   },
   Tarraconensis13: {
      name: () => $t(L.AnAccordWithLusitania),
      image: EventImage.Alliance,
      desc: () => $t(L.AnAccordWithLusitaniaDesc),
      condition: {
         province: ["Tarraconensis"],
         provinceOnMap: ["Lusitania"],
         conditions: (province, save) => {
            return [
               requireNoTreatyBetween(["Alliance", "Patron"], province, "Lusitania", save),
               requirePeaceBetween(province, "Lusitania", save),
               availableDiplomatCondition(province, "Lusitania", save),
               availableDiplomatCondition("Lusitania", province, save),
               requireMinimumAttitude("Lusitania", province, 25, save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.ExchangeProvincialMagistrates),
            resources: { administrative: 100 },
            custom: [
               {
                  effect: (province, save) => {
                     OfferAllianceAction(province, "Lusitania", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurAlly, Province.Lusitania.name()),
               },
            ],
         },
         {
            label: () => $t(L.EstablishAJointEmbassy),
            resources: { diplomatic: 100 },
            custom: [
               {
                  effect: (province, save) => {
                     OfferAllianceAction(province, "Lusitania", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurAlly, Province.Lusitania.name()),
               },
            ],
         },
         {
            label: () => $t(L.CoordinateOurFrontierCommands),
            resources: { military: 100 },
            custom: [
               {
                  effect: (province, save) => {
                     OfferAllianceAction(province, "Lusitania", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurAlly, Province.Lusitania.name()),
               },
            ],
         },
      ],
   },
   Tarraconensis14: {
      name: () => $t(L.TheDistressOfLusitania),
      image: EventImage.Aquitania3,
      desc: () => $t(L.TheDistressOfLusitaniaDesc),
      condition: {
         province: ["Tarraconensis"],
         playerOnly: true,
         conditions: (province, save) => {
            return [
               requireAnyTreatyBetween(["Alliance", "Patron"], province, "Lusitania", save),
               provinceResourceCondition("gold", 5000, province, save),
               isCoreTileCondition(8585296, "Lusitania", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.PurchaseCaperaForTarraconensis),
            resources: { gold: -5000 },
            custom: [
               {
                  desc: (province, save) => $t(L.$1Annexes$2, getProvinceName(province, save), getTileName(8585296)),
                  effect: (province, save) => {
                     const tileData = save.state.tiles.get(8585296);
                     if (tileData) {
                        tileData.province = province;
                     }
                  },
               },
            ],
         },
         {
            label: () => $t(L.GrantOurAllyEmergencyRelief),
            resources: { gold: -500 },
            attitudes: {
               Lusitania: {
                  type: "add",
                  value: 20,
                  duration: 2 * 12,
               },
            },
         },
         {
            label: () => $t(L.LetLusitaniaPayItsOwnDebts),
            attitudes: {
               Lusitania: {
                  type: "add",
                  value: -10,
                  duration: 2 * 12,
               },
            },
         },
      ],
   },
   Tarraconensis15: {
      name: () => $t(L.LusitaniaUnderOurProtection),
      image: EventImage.Emperor,
      desc: () => $t(L.LusitaniaUnderOurProtectionDesc),
      condition: {
         province: ["Tarraconensis"],
         conditions: (province, save) => {
            return [
               requireAnyTreatyBetween(["Alliance", "Patron"], province, "Lusitania", save),
               requireHigherPrestige(province, "Lusitania", 2.5, save),
               provinceResourceCondition("diplomatic", 100, province, save),
               provinceResourceCondition("gold", 10_000, province, save),
            ];
         },
      },
      buttons: [
         {
            resources: { gold: -10_000, diplomatic: -100 },
            label: () => $t(L.ReceiveLusitaniaAsOurClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Lusitania", save);
                     OfferPatronageAction(province, "Lusitania", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Lusitania.name()),
               },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
