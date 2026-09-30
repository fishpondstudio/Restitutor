import { $t, L } from "../../utils/i18n";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import { forcePatronageEffect, maxCoreTileChecks } from "../logic/MissionLogic";
import { requireNoTreatyBetweenChecks, requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import { GameEventOrder } from "./GameEventOrder";
import type { IGameEventConfig } from "./GameEvents";

export const MacedoniaEvents = {
   Macedonia1: {
      name: () => $t(L.AlexandersRecruits),
      wikipedia: "Caracalla",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.AlexandersRecruitsDesc),
      condition: { province: new Set(["Macedonia"]), year: [214, 214] },
      buttons: [
         {
            label: () => $t(L.EquipTheRecruitsAtOurExpense),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekExemptionsForFarmingFamilies),
            resources: { diplomatic: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia2: {
      name: () => $t(L.CitizensOnTheRamparts),
      wikipedia: "Siege_of_Thessalonica_(254)",
      image: EventImage.RomanWall,
      desc: () => $t(L.CitizensOnTheRampartsDesc),
      condition: { province: new Set(["Macedonia"]), year: [254, 254] },
      buttons: [
         {
            label: () => $t(L.ProvisionTheCitizenDefenders),
            resources: { gold: -750 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.OrganizeWatchesByNeighborhood),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia3: {
      name: () => $t(L.ConstantinesHarbor),
      wikipedia: "Port_of_Thessaloniki",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.ConstantinesHarborDesc),
      condition: { province: new Set(["Macedonia"]), year: [322, 322] },
      buttons: [
         {
            label: () => $t(L.FundQuaysForMerchantsAndStores),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CoordinateTheFleetsSupplyDepots),
            resources: { administrative: -50 },
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia4: {
      name: () => $t(L.SilenceAtTheHippodrome),
      wikipedia: "Massacre_of_Thessalonica",
      image: EventImage.RomanMassacre,
      desc: () => $t(L.SilenceAtTheHippodromeDesc),
      condition: { province: new Set(["Macedonia"]), year: [390, 390] },
      buttons: [
         {
            label: () => $t(L.RelieveTheBereavedHouseholds),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForSafeguardsAndRedress),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia5: {
      name: () => $t(L.AshesAlongTheAxios),
      wikipedia: "Stobi",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.AshesAlongTheAxiosDesc),
      condition: { province: new Set(["Macedonia"]), year: [479, 479] },
      buttons: [
         {
            label: () => $t(L.HouseFamiliesAndReopenWorkshops),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortCaravansThroughTheValley),
            resources: { military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia6: {
      name: () => $t(L.VigilOfSaintDemetrius),
      wikipedia: "Siege_of_Thessalonica_(586)",
      image: EventImage.RomanWall,
      desc: () => $t(L.VigilOfSaintDemetriusDesc),
      condition: { province: new Set(["Macedonia"]), year: [586, 586] },
      buttons: [
         {
            label: () => $t(L.PayMasonsToReinforceTheWalls),
            resources: { gold: -1000 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.OrganizeReliefForTheNightWatches),
            resources: { administrative: -50, gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia7: {
      name: () => $t(L.TheForumShakes),
      wikipedia: "History_of_Thessaloniki",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.TheForumShakesDesc),
      condition: { province: new Set(["Macedonia"]), year: [620, 620] },
      buttons: [
         {
            label: () => $t(L.ClearStreetsAndRepairTheMarkets),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProvideSheltersAndRemitTaxes),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia8: {
      name: () => $t(L.GrainBeyondTheBlockade),
      wikipedia: "Siege_of_Thessalonica_(676%E2%80%93678)",
      image: EventImage.RomanGalley,
      desc: () => $t(L.GrainBeyondTheBlockadeDesc),
      condition: { province: new Set(["Macedonia"]), year: [676, 676] },
      buttons: [
         {
            label: () => $t(L.FinanceEscortedGrainVoyages),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RationStoresThroughNeighborhoodRolls),
            resources: { administrative: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia9: {
      name: () => $t(L.OathsInTheHinterland),
      wikipedia: "Constantine_V",
      image: EventImage.MountedParley,
      desc: () => $t(L.OathsInTheHinterlandDesc),
      condition: { province: new Set(["Macedonia"]), year: [758, 758] },
      buttons: [
         {
            label: () => $t(L.RecordObligationsWithVillageElders),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateProtectedMarketAccess),
            resources: { diplomatic: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia10: {
      name: () => $t(L.AnAbbotUnderEscort),
      wikipedia: "Theodore_the_Studite",
      image: EventImage.JeromeStudy,
      desc: () => $t(L.AnAbbotUnderEscortDesc),
      condition: { province: new Set(["Macedonia"]), year: [796, 796] },
      buttons: [
         {
            label: () => $t(L.ProvideOrderlyLodgingAndRelief),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MediateBetweenClergyAndOfficials),
            resources: { diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Macedonia11: {
      name: () => $t(L.AnEpiroteAppeal),
      image: EventImage.RomanAudience,
      desc: () => $t(L.AnEpiroteAppealDesc),
      order: GameEventOrder.Order1,
      condition: {
         province: new Set(["Macedonia"]),
         onMap: { Epirus: true },
         annexAndCore: { Achaia: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(3, "Epirus", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Epirus", save);
            yield* requirePeaceBetweenChecks(province, "Epirus", save);
            yield* availableDiplomatChecks(province, "Epirus", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ReceiveEpirusAsOurClient),
            custom: [forcePatronageEffect("Epirus")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
