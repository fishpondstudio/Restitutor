import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { forcePatronageEffect, marriageChecks, minCoreTileChecks } from "../logic/MissionLogic";
import {
   requireAnyTreatyBetweenChecks,
   requireNoTreatyBetweenChecks,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const EpirusEvents = {
   Epirus1: {
      name: () => $t(L.AForgottenTranslation),
      wikipedia: "Hexapla",
      image: EventImage.JeromeStudy,
      desc: () => $t(L.AForgottenTranslationDesc),
      condition: { province: new Set(["Epirus"]), year: [231, 231] },
      buttons: [
         {
            label: () => $t(L.CommissionCopiesForVisitingScholars),
            resources: { gold: -500 },
            modifiers: { Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.EndowInstructionForLocalScribes),
            resources: { gold: -750 },
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 } },
         },
      ],
   },
   Epirus2: {
      name: () => $t(L.TheGapsInTheWalls),
      wikipedia: "Nicopolis",
      image: EventImage.RomanWall,
      desc: () => $t(L.TheGapsInTheWallsDesc),
      condition: { province: new Set(["Epirus"]), year: [268, 268] },
      buttons: [
         {
            label: () => $t(L.PayCrewsToCloseTheBreaches),
            resources: { gold: -750 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.CoordinateAidWithCorcyra),
            resources: { diplomatic: -50, gold: -300 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus3: {
      name: () => $t(L.LettersFromSardica),
      wikipedia: "Council_of_Serdica",
      image: EventImage.RomanAudience,
      desc: () => $t(L.LettersFromSardicaDesc),
      condition: { province: new Set(["Epirus"]), year: [343, 343] },
      buttons: [
         {
            label: () => $t(L.ArrangeMeetingsAmongLocalElders),
            resources: { diplomatic: -50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.FundAReliableCourierService),
            resources: { gold: -750 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus4: {
      name: () => $t(L.SailsOffNicopolis),
      wikipedia: "Epirus_(Roman_province)",
      image: EventImage.RomanGalley,
      desc: () => $t(L.SailsOffNicopolisDesc),
      condition: { province: new Set(["Epirus"]), year: [474, 474] },
      buttons: [
         {
            label: () => $t(L.FundTheRecoveryOfCaptives),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StationGuardsAtCoastalLandings),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus5: {
      name: () => $t(L.TheEmptyEpiscopalChair),
      wikipedia: "Nicopolis",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheEmptyEpiscopalChairDesc),
      condition: { province: new Set(["Epirus"]), year: [516, 516] },
      buttons: [
         {
            label: () => $t(L.GuaranteeTheBasilicasPoorRelief),
            resources: { gold: -750 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ReviewEndowmentsWithTheNewBishop),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus6: {
      name: () => $t(L.NewsFromTheShatteredCoast),
      wikipedia: "Epirus_(Roman_province)",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.NewsFromTheShatteredCoastDesc),
      condition: { province: new Set(["Epirus"]), year: [522, 522] },
      buttons: [
         {
            label: () => $t(L.StrengthenOurReceivingQuays),
            resources: { gold: -1000 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.SettleDisplacedFamiliesNearOurTowns),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus7: {
      name: () => $t(L.TotilasShips),
      wikipedia: "Gothic_War_(535%E2%80%93554)",
      image: EventImage.RomanGalley,
      desc: () => $t(L.TotilasShipsDesc),
      condition: { province: new Set(["Epirus"]), year: [551, 551] },
      buttons: [
         {
            label: () => $t(L.PayForEscortsAndConvoyStores),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StockRefugesAlongTheInlandRoads),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus8: {
      name: () => $t(L.ASaintAcrossTheWater),
      wikipedia: "Euroea_(Epirus)",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.ASaintAcrossTheWaterDesc),
      condition: { province: new Set(["Epirus"]), year: [590, 590] },
      buttons: [
         {
            label: () => $t(L.ProvideSeedAndShelterOnCorcyra),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArbitrateLodgingAndLandClaims),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus9: {
      name: () => $t(L.ALetterWithoutAVoyage),
      wikipedia: "Nicopolis",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.ALetterWithoutAVoyageDesc),
      condition: { province: new Set(["Epirus"]), year: [625, 625] },
      buttons: [
         {
            label: () => $t(L.SubsidizeARegularEscortedPassage),
            resources: { gold: -750, military: -30 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.SendLettersThroughCoastalContacts),
            resources: { diplomatic: -50 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus10: {
      name: () => $t(L.TwoDestinationsForAnAppeal),
      wikipedia: "Metropolis_of_Nicopolis",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TwoDestinationsForAnAppealDesc),
      condition: { province: new Set(["Epirus"]), year: [732, 732] },
      buttons: [
         {
            label: () => $t(L.ReconcileTheDisputedChurchAccounts),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekGuaranteesForExistingEndowments),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Epirus11: {
      name: () => $t(L.ThePromiseBehindTheWedding),
      image: EventImage.Wedding2,
      desc: () => $t(L.ThePromiseBehindTheWeddingDesc),
      condition: {
         playerOnly: true,
         province: new Set(["Epirus"]),
         onMap: { Achaia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province.Epirus.tiles.length, "Epirus", save);
            yield* requirePeaceBetweenChecks(province, "Achaia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Achaia", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "Achaia", save);
            yield* marriageChecks(province, "Achaia", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Achaia.name()),
            custom: [forcePatronageEffect("Achaia")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
