import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import {
   allCoreTileChecks,
   forcePatronageEffect,
   maxCoreTileChecks,
   minCoreTileChecks,
   provinceRevenueChecks,
   warPowerChecks,
} from "../logic/MissionLogic";
import { requireNoTreatyBetweenChecks, requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const BithyniaEvents = {
   Bithynia1: {
      name: () => $t(L.SmokeBeyondTheBosporus),
      wikipedia: "Nicaea",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.SmokeBeyondTheBosporusDesc),
      condition: { province: new Set(["Bithynia"]), year: [258, 258] },
      buttons: [
         {
            label: () => $t(L.ProvideSeedAndShelter),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardTheRoadsBetweenOurTowns),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia2: {
      name: () => $t(L.ACourtAtOurDoor),
      wikipedia: "Nicomedia",
      image: EventImage.ImperialCity,
      desc: () => $t(L.ACourtAtOurDoorDesc),
      condition: { province: new Set(["Bithynia"]), year: [286, 286] },
      buttons: [
         {
            label: () => $t(L.ExpandTheQuaysAndStorehouses),
            resources: { gold: -1000 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.TrainClerksForTheCourtsBusiness),
            resources: { gold: -750, administrative: -30 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Bithynia3: {
      name: () => $t(L.ThePurpleLaidAside),
      wikipedia: "Diocletian",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.ThePurpleLaidAsideDesc),
      condition: { province: new Set(["Bithynia"]), year: [305, 305] },
      buttons: [
         {
            label: () => $t(L.GuaranteeTheGarrisonsDeliveries),
            resources: { gold: -750 },
            modifiers: { WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ReconcileTheOutstandingContracts),
            resources: { administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia4: {
      name: () => $t(L.TheRoadFromChrysopolis),
      wikipedia: "Battle_of_Chrysopolis",
      image: EventImage.WoundedSoldier,
      desc: () => $t(L.TheRoadFromChrysopolisDesc),
      condition: { province: new Set(["Bithynia"]), year: [324, 324] },
      buttons: [
         {
            label: () => $t(L.OpenSheltersForTheWounded),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortTheScatteredTroopsOnward),
            resources: { military: -50, gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia5: {
      name: () => $t(L.DustOverTheGulf),
      wikipedia: "Nicomedia",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.DustOverTheGulfDesc),
      condition: { province: new Set(["Bithynia"]), year: [358, 358] },
      buttons: [
         {
            label: () => $t(L.FundRescueCrewsAndTemporaryHomes),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ClearTheSupplyRoutesFirst),
            resources: { gold: -750, administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia6: {
      name: () => $t(L.TwoSealsOnTheGrainOrders),
      wikipedia: "Procopius_(usurper)",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TwoSealsOnTheGrainOrdersDesc),
      condition: { province: new Set(["Bithynia"]), year: [365, 365] },
      buttons: [
         {
            label: () => $t(L.ReserveGrainForCivilianMarkets),
            resources: { gold: -750, administrative: -30 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateSafePassageForSuppliers),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia7: {
      name: () => $t(L.AFallenFavouritesDebts),
      wikipedia: "Eutropius_(consul_399)",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.AFallenFavouritesDebtsDesc),
      condition: { province: new Set(["Bithynia"]), year: [399, 399] },
      buttons: [
         {
            label: () => $t(L.AuditTheDisputedContracts),
            resources: { administrative: -50 },
            modifiers: { LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.PetitionForOrdinaryDebtors),
            resources: { diplomatic: -50, gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia8: {
      name: () => $t(L.StoneAcrossTheSangarius),
      wikipedia: "Sangarius_Bridge",
      image: EventImage.StoneBridge,
      desc: () => $t(L.StoneAcrossTheSangariusDesc),
      condition: { province: new Set(["Bithynia"]), year: [562, 562] },
      buttons: [
         {
            label: () => $t(L.ImproveTheApproachesAndMarkets),
            resources: { gold: -1000 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.EstablishGuardedSupplyStations),
            resources: { gold: -750, military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Bithynia9: {
      name: () => $t(L.CampfiresAcrossTheStrait),
      wikipedia: "Shahin%27s_invasion_of_Asia_Minor_(615)",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.CampfiresAcrossTheStraitDesc),
      condition: { province: new Set(["Bithynia"]), year: [615, 615] },
      buttons: [
         {
            label: () => $t(L.HireBoatsForEndangeredHouseholds),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardAndProvisionTheLandings),
            resources: { gold: -500, military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia10: {
      name: () => $t(L.AtTheWallsOfNicaea),
      wikipedia: "Siege_of_Nicaea_(727)",
      image: EventImage.RomanWall,
      desc: () => $t(L.AtTheWallsOfNicaeaDesc),
      condition: { province: new Set(["Bithynia"]), year: [727, 727] },
      buttons: [
         {
            label: () => $t(L.SupplyTheMasonsAndWallGuards),
            resources: { gold: -750, military: -50 },
            modifiers: { Defense: { type: "multiply", value: 0.25, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.OrganizeBreadAndCourtyardShelters),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Bithynia11: {
      name: () => $t(L.BeyondOurBorders),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.BeyondOurBordersDesc),
      condition: {
         province: new Set(["Bithynia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(5000, province, save);
            yield* provinceRevenueChecks(100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Asia.name()),
            casusBelli: {
               Asia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cappadocia.name()),
            casusBelli: {
               Cappadocia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Galatia.name()),
            casusBelli: {
               Galatia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Bithynia12: {
      name: () => $t(L.FromTheFarmsToTheStrait),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.FromTheFarmsToTheStraitDesc),
      condition: {
         province: new Set(["Bithynia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10354768, 10289232], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ReserveSuppliesForOurTroops),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.SurveyTheEstatesAndCollectDues),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ImproveFarmRoadsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
      ],
   },
   Bithynia13: {
      name: () => $t(L.LedgersOfThePlateau),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.LedgersOfThePlateauDesc),
      condition: {
         province: new Set(["Bithynia"]),
         annexAndCore: {
            Galatia: 5,
         },
      },
      buttons: [
         {
            label: () => $t(L.BringLocalClerksIntoOurService),
            resources: {
               administrative: 100,
            },
         },
         {
            label: () => $t(L.RecruitLocalMediatorsAsEnvoys),
            resources: {
               diplomatic: 100,
            },
         },
         {
            label: () => $t(L.OrganizeLeviesWithLocalOfficers),
            resources: {
               military: 100,
            },
         },
      ],
   },
   Bithynia14: {
      name: () => $t(L.ServiceFromTheUplands),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ServiceFromTheUplandsDesc),
      condition: {
         province: new Set(["Bithynia"]),
         annexAndCore: {
            Cappadocia: 5,
         },
      },
      buttons: [
         {
            label: () => $t(L.AdvanceAMagistrateToOurCouncil),
            resources: {
               consulPoint: 1,
            },
         },
         {
            label: () => $t(L.PromoteAnExperiencedOfficer),
            resources: {
               generalSkillPoint: 1,
            },
         },
         {
            label: () => $t(L.CollectTheSettledRevenues),
            resources: {
               gold: 1000,
            },
         },
      ],
   },
   Bithynia15: {
      name: () => $t(L.APlaceForTheCivicCouncils),
      image: EventImage.RomanAudience,
      desc: () => $t(L.APlaceForTheCivicCouncilsDesc),
      condition: {
         province: new Set(["Bithynia"]),
         annexAndCore: {
            Asia: 10,
         },
      },
      buttons: [
         {
            label: () => $t(L.ConfirmLocalCivicPrivileges),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.SponsorAGatheringOfTheCities),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.AgreeOnTheCouncilsTaxObligations),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Bithynia16: {
      name: () => $t(L.AnAppealFromAsia),
      image: EventImage.RomanAudience,
      desc: () => $t(L.AnAppealFromAsiaDesc),
      condition: {
         province: new Set(["Bithynia"]),
         onMap: { Asia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(20, "Bithynia", save);
            yield* maxCoreTileChecks(5, "Asia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Asia", save);
            yield* requirePeaceBetweenChecks(province, "Asia", save);
            yield* availableDiplomatChecks(province, "Asia", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.Receive$1AsOurClient, Province.Asia.name()),
            custom: [forcePatronageEffect("Asia")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
