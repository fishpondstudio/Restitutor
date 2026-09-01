import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { Tiles } from "../definitions/TileConstants";
import {
   isCoreTileCondition,
   marriageCondition,
   maxCoreTileCondition,
   minCoreTileCondition,
} from "../logic/MissionLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const SiciliaEvent = {
   Sicilia1: {
      name: () => $t(L.TheGranariesOfRome),
      wikipedia: "Cura_annonae",
      image: EventImage.FieldHarvest,
      desc: () => $t(L.TheGranariesOfRomeDesc),
      condition: {
         province: ["Sicilia"],
         year: [200, 200],
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheExportEstates),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveGrainForTheIsland),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 3 * 12 },
            },
         },
      ],
   },
   Sicilia2: {
      name: () => $t(L.TheVeilBeforeTheFire),
      wikipedia: "Agatha_of_Sicily",
      image: EventImage.AgathaHealing,
      desc: () => $t(L.TheVeilBeforeTheFireDesc),
      condition: {
         province: ["Sicilia"],
         year: [252, 252],
      },
      buttons: [
         {
            label: () => $t(L.LetCatanaHonorItsProtector),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RebuildWithoutEndorsingAMiracle),
            resources: { gold: -300 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia3: {
      name: () => $t(L.TheVillaOfTheGreatHunt),
      wikipedia: "Villa_Romana_del_Casale",
      image: EventImage.GreatHunt,
      desc: () => $t(L.TheVillaOfTheGreatHuntDesc),
      condition: {
         province: ["Sicilia"],
         year: [300, 300],
      },
      buttons: [
         {
            label: () => $t(L.InviteTheGreatEstatesToBuild),
            resources: { gold: -300 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.AssessTheseFortunesForTaxation),
            resources: { gold: 750 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia4: {
      name: () => $t(L.ABishopSummonedFromSyracuse),
      wikipedia: "Council_of_Arles_(314)",
      image: EventImage.Donatism,
      desc: () => $t(L.ABishopSummonedFromSyracuseDesc),
      condition: {
         province: ["Sicilia"],
         year: [314, 314],
      },
      buttons: [
         {
            label: () => $t(L.SendChrestusWithAFullDelegation),
            resources: { christianity: 15, diplomatic: 50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepSiciliaOutOfTheAfricanQuarrel),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia5: {
      name: () => $t(L.TheSeaWithdraws),
      wikipedia: "365_Crete_earthquake",
      image: EventImage.Flood,
      desc: () => $t(L.TheSeaWithdrawsDesc),
      condition: {
         province: ["Sicilia"],
         year: [365, 365],
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheHarborsStrongerThanBefore),
            resources: { gold: -750 },
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RelieveTheRuinedCoastalTowns),
            resources: { gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia6: {
      name: () => $t(L.WhenAfricaWithholdsItsGrain),
      wikipedia: "Gildonic_War",
      image: EventImage.HonoriusCourt,
      desc: () => $t(L.WhenAfricaWithholdsItsGrainDesc),
      condition: {
         province: ["Sicilia"],
         year: [397, 397],
      },
      buttons: [
         {
            label: () => $t(L.EmptyTheStorehousesForRome),
            resources: { gold: 750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FeedSiciliaBeforeTheCapital),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia7: {
      name: () => $t(L.TheVandalSiegeOfPanormus),
      wikipedia: "Vandals",
      image: EventImage.VandalsInItaly,
      desc: () => $t(L.TheVandalSiegeOfPanormusDesc),
      condition: {
         province: ["Sicilia"],
         year: [440, 440],
      },
      buttons: [
         {
            label: () => $t(L.RaiseBeaconTowersAroundTheIsland),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.BuildASquadronToHuntTheRaiders),
            resources: { military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Sicilia8: {
      name: () => $t(L.TheFleetRecalledEast),
      wikipedia: "Vandals",
      image: EventImage.QueenEmbarkation,
      desc: () => $t(L.TheFleetRecalledEastDesc),
      condition: {
         province: ["Sicilia"],
         year: [441, 441],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionTheFleetUntilDangerPasses),
            resources: { gold: -500 },
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.KeepPartOfTheFleetInSicilia),
            resources: { diplomatic: 75 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia9: {
      name: () => $t(L.TheArmadaThatNeverReturned),
      wikipedia: "Battle_of_Cape_Bon_(468)",
      image: EventImage.NavalBattle,
      desc: () => $t(L.TheArmadaThatNeverReturnedDesc),
      condition: {
         province: ["Sicilia"],
         year: [468, 468],
      },
      buttons: [
         {
            label: () => $t(L.SalvageTheFleetForAnotherCampaign),
            resources: { gold: -500, military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.FortifySiciliaAndAbandonAfrica),
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia10: {
      name: () => $t(L.ThePerpetualPeace),
      wikipedia: "Gaiseric",
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.ThePerpetualPeaceDesc),
      condition: {
         province: ["Sicilia"],
         year: [474, 474],
      },
      buttons: [
         {
            label: () => $t(L.MakeSiciliaTheMarketOfThePeace),
            resources: { diplomatic: 75 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ATreatyCannotReplaceTheFleet),
            resources: { military: 100 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia11: {
      name: () => $t(L.TheItalianShoreSecured),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheItalianShoreSecuredDesc),
      condition: {
         province: ["Sicilia"],
         annexAndCore: { Italia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.BindTheNewLandsToSiciliasEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProclaimDominionOverBothShores),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia12: {
      name: () => $t(L.RomeAnswersToSicilia),
      image: EventImage.FieldHarvest,
      desc: () => $t(L.RomeAnswersToSiciliaDesc),
      condition: {
         province: ["Sicilia"],
         conditions: (province, save) => [isCoreTileCondition(Tiles.Rome, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.PutRomesInstitutionsInOurService),
            resources: { administrative: 100, diplomatic: 100, military: 100 },
         },
         {
            label: () => $t(L.ClaimTheMantleOfRomanPower),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Sicilia13: {
      name: () => $t(L.TheSardinianMarriageSettlement),
      image: EventImage.NavalBattle,
      desc: () => $t(L.TheSardinianMarriageSettlementDesc),
      condition: {
         province: ["Sicilia"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Sardinia", save),
            requirePeaceBetween(province, "Sardinia", save),
            minCoreTileCondition(15, province, save),
            maxCoreTileCondition(3, "Sardinia", save),
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Sardinia", save),
            marriageCondition(province, "Sardinia", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveSardiniaAsOurClient),
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
   Sicilia14: {
      name: () => $t(L.CorsicaLooksSouth),
      image: EventImage.NavalBattle,
      desc: () => $t(L.CorsicaLooksSouthDesc),
      condition: {
         province: ["Sicilia"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Corsica", save),
            requirePeaceBetween(province, "Corsica", save),
            minCoreTileCondition(15, province, save),
            maxCoreTileCondition(3, "Corsica", save),
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Corsica", save),
            marriageCondition(province, "Corsica", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveCorsicaAsOurClient),
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
   Sicilia15: {
      name: () => $t(L.APactAcrossTheStrait),
      image: EventImage.NavalBattle,
      desc: () => $t(L.APactAcrossTheStraitDesc),
      condition: {
         province: ["Sicilia"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Africa", save),
            requirePeaceBetween(province, "Africa", save),
            minCoreTileCondition(15, province, save),
            maxCoreTileCondition(3, "Africa", save),
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Africa", save),
            marriageCondition(province, "Africa", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveAfricaAsOurClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Africa", save);
                     OfferPatronageAction(province, "Africa", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Africa.name()),
               },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
