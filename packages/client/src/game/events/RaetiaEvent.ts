import { $t, L } from "../../utils/i18n";
import { Culture } from "../definitions/Culture";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import {
   forcePatronageEffect,
   isCoreTileCondition,
   maxCoreTileCondition,
   mediterraneanCoastCondition,
   minCoreTileCondition,
   minCulturePercentageCondition,
} from "../logic/MissionLogic";
import { changeProvinceCulture } from "../logic/ProvinceLogic";
import { requireNoTreatyBetween, requirePeaceBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const RaetiaEvent = {
   Raetia1: {
      name: () => $t(L.TheMilestonesOfRaetia),
      wikipedia: "Via_Raetia",
      image: EventImage.StoneBridge,
      desc: () => $t(L.TheMilestonesOfRaetiaDesc),
      condition: {
         province: ["Raetia"],
         year: [195, 195],
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheViaRaetia),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MakeTheTownsMaintainTheRoads),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia2: {
      name: () => $t(L.CaracallaCrossesRaetia),
      wikipedia: "Caracalla",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.CaracallaCrossesRaetiaDesc),
      condition: {
         province: ["Raetia"],
         year: [213, 213],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionTheImperialArmy),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForStrongerPassForts),
            resources: { diplomatic: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SellSuppliesAtWartimePrices),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia3: {
      name: () => $t(L.TheAlamanniBreakTheFrontier),
      wikipedia: "Alamanni",
      image: EventImage.VandalsInItaly,
      desc: () => $t(L.TheAlamanniBreakTheFrontierDesc),
      condition: {
         province: ["Raetia"],
         year: [233, 233],
      },
      buttons: [
         {
            label: () => $t(L.HoldEveryFortOnTheOuterWall),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ScreenTheTownsWithFieldTroops),
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AbandonTheExposedDistricts),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia4: {
      name: () => $t(L.TheBrennerPassLiesOpen),
      wikipedia: "Battle_of_Lake_Benacus",
      image: EventImage.TribalCrossing,
      desc: () => $t(L.TheBrennerPassLiesOpenDesc),
      condition: {
         province: ["Raetia"],
         year: [268, 268],
      },
      buttons: [
         {
            label: () => $t(L.SealTheBrennerPass),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.HarassTheInvadersRetreat),
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheHostPassIntoItalia),
            resources: { gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.15, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia5: {
      name: () => $t(L.TheAugustiAtAugustaVindelicum),
      wikipedia: "Diocletian",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheAugustiAtAugustaVindelicumDesc),
      condition: {
         province: ["Raetia"],
         year: [288, 288],
      },
      buttons: [
         {
            label: () => $t(L.StageAnImperialReception),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SupplyScoutsForTheCounterattack),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForFrontierFunds),
            resources: { diplomatic: -50, gold: 500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia6: {
      name: () => $t(L.RaetiaDivided),
      wikipedia: "Raetia_Prima",
      image: EventImage.ImperialRescript,
      desc: () => $t(L.RaetiaDividedDesc),
      condition: {
         province: ["Raetia"],
         year: [297, 297],
      },
      buttons: [
         {
            label: () => $t(L.CarryOutTheDivisionFaithfully),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               ResearchCost: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheBestOfficesAtAugusta),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SendTroopsAndFundsToCuria),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia7: {
      name: () => $t(L.ConstantiusAtTheCampiCannini),
      wikipedia: "Constantius_II",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ConstantiusAtTheCampiCanniniDesc),
      condition: {
         province: ["Raetia"],
         year: [355, 355],
      },
      buttons: [
         {
            label: () => $t(L.AttachOurBestTroopsToArbetio),
            resources: { generalSkillPoint: 1 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheCampiCannini),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OfferTheLentiensesNewTerms),
            resources: { diplomatic: -50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia8: {
      name: () => $t(L.ValentiniansFrontierTowers),
      wikipedia: "Valentinian_I",
      image: EventImage.RomanWall,
      desc: () => $t(L.ValentiniansFrontierTowersDesc),
      condition: {
         province: ["Raetia"],
         year: [369, 369],
      },
      buttons: [
         {
            label: () => $t(L.RaiseAChainOfBurgi),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.BuildGranariesBesideTheTowers),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RepairOnlyTheStrongestForts),
            resources: { gold: 500 },
            modifiers: {
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia9: {
      name: () => $t(L.BautoCallsTheSteppeWarriors),
      wikipedia: "Juthungi",
      image: EventImage.MountedParley,
      desc: () => $t(L.BautoCallsTheSteppeWarriorsDesc),
      condition: {
         province: ["Raetia"],
         year: [384, 384],
      },
      buttons: [
         {
            label: () => $t(L.PayBautosHunsAndAlans),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MusterTheRaetianLimitanei),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SendEnvoysToBuyAWithdrawal),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia10: {
      name: () => $t(L.StilichosWinterInRaetia),
      wikipedia: "Stilicho",
      image: EventImage.WinterMarch,
      desc: () => $t(L.StilichosWinterInRaetiaDesc),
      condition: {
         province: ["Raetia"],
         year: [401, 401],
      },
      buttons: [
         {
            label: () => $t(L.ReleaseTheTroopsForItalia),
            resources: { consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheAlpinePassesManned),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionToSettleThemAsFederates),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia11: {
      name: () => $t(L.BurcoAtTheCampiCannini),
      wikipedia: "Battle_of_Campi_Cannini",
      image: EventImage.BarbarianCaptives,
      desc: () => $t(L.BurcoAtTheCampiCanniniDesc),
      condition: {
         province: ["Raetia"],
         year: [457, 457],
      },
      buttons: [
         {
            label: () => $t(L.HuntTheSurvivorsThroughTheAlps),
            resources: { generalSkillPoint: 1 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StrengthenTheAlpineWatch),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitTheCapturedWarriors),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia12: {
      name: () => $t(L.ARealmBeyondTheNorthernFrontier),
      image: EventImage.HeroTriumph,
      desc: () => $t(L.ARealmBeyondTheNorthernFrontierDesc),
      condition: {
         province: ["Raetia"],
         annexAndCore: {
            Germania: 4,
         },
         conditions: (province, save) => [isCoreTileCondition(9240645, "Raetia", save)],
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimsInGermania),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Germania: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.SettleAndTaxOurConquests),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TrainAGovernmentForExpansion),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
      ],
   },
   Raetia13: {
      name: () => $t(L.AnAlpineProtectorate),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.AnAlpineProtectorateDesc),
      condition: {
         province: ["Raetia"],
         provinceOnMap: ["Noricum"],
         conditions: (province, save) => [
            minCoreTileCondition(15, "Raetia", save),
            maxCoreTileCondition(3, "Noricum", save),
            requireNoTreatyBetween(["Patron"], province, "Noricum", save),
            requirePeaceBetween(province, "Noricum", save),
            availableDiplomatCondition(province, "Noricum", save),
            availableDiplomatCondition("Noricum", province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveNoricumAsOurClient),
            custom: [forcePatronageEffect("Noricum")],
         },
      ],
   },
   Raetia14: {
      name: () => $t(L.RaetiaReachesTheMediterranean),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.RaetiaReachesTheMediterraneanDesc),
      condition: {
         province: ["Raetia"],
         conditions: (province, save) => [mediterraneanCoastCondition(2, province, save)],
      },
      buttons: [
         { label: () => $t(L.CollectTheHarborCustoms), resources: { gold: 1000 } },
         { label: () => $t(L.CharterTheCoastalCities), resources: { administrative: 20, diplomatic: 20 } },
         { label: () => $t(L.RecruitCrewsForOurFleet), resources: { military: 50 } },
      ],
   },
   Raetia15: {
      name: () => $t(L.RaetiaAscendant),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.RaetiaAscendantDesc),
      condition: {
         province: ["Raetia"],
         conditions: (province, save) => [minCoreTileCondition(20, province, save)],
      },
      buttons: [
         { label: () => $t(L.ClaimAMandateToRule), resources: { mandate: 1 } },
         { label: () => $t(L.SeekHonorsFromTheSenate), resources: { consulPoint: 2 } },
         {
            label: () => $t(L.ExpandTheProvincialOffices),
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   Raetia16: {
      name: () => $t(L.AGermanicRaetia),
      image: EventImage.VortigernAndRowena,
      desc: () => $t(L.AGermanicRaetiaDesc),
      condition: {
         province: ["Raetia"],
         conditions: (province, save) => [minCulturePercentageCondition(0.25, "Germanic", province, save)],
      },
      buttons: [
         {
            label: () => $t(L.MakeGermanicOurLeadingCulture),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.Adopt$1AsOurDominantCultureAndMake$2AToleratedCulture,
                        Culture.Germanic.name(),
                        Culture.Raetian.name(),
                     ),
                  effect: (province, save) => {
                     const state = save.state.provinces[province];
                     if (state) {
                        changeProvinceCulture("Germanic", province, save);
                        state.toleratedCultures.add("Raetian");
                     }
                  },
               },
            ],
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.TolerateGermanicCustoms),
            custom: [
               {
                  desc: () => $t(L.Make$1AToleratedCulture, Culture.Germanic.name()),
                  effect: (province, save) => {
                     const state = save.state.provinces[province];
                     if (state) {
                        state.toleratedCultures.add("Germanic");
                     }
                  },
               },
            ],
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
      ],
   },
   Raetia17: {
      name: () => $t(L.ARaetianTriumphInItalia),
      image: EventImage.RomanTriumph2,
      desc: () => $t(L.ARaetianTriumphInItaliaDesc),
      condition: {
         province: ["Raetia"],
         annexAndCore: {
            Italia: 10,
         },
      },
      buttons: [
         {
            label: () => $t(L.RuleThroughTheItalianCities),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTheItalianNotables),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.EntrustItaliaToOurLegions),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
