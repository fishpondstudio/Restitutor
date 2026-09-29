import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import { forcePatronageEffect, minCoreTileChecks, provinceRevenueChecks, warPowerChecks } from "../logic/MissionLogic";
import {
   requireHigherPrestigeChecks,
   requireNoTreatyBetweenChecks,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const AsiaEvents = {
   Asia1: {
      name: () => $t(L.AnEmperorAtTheHealingShrine),
      wikipedia: "Pergamon",
      image: EventImage.RomanAudience,
      desc: () => $t(L.AnEmperorAtTheHealingShrineDesc),
      condition: { province: new Set(["Asia"]), year: [214, 214] },
      buttons: [
         {
            label: () => $t(L.ExpandLodgingForOrdinaryPatients),
            resources: { gold: -750 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SponsorTheSanctuarysReception),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia2: {
      name: () => $t(L.PioniusBeforeTheCrowd),
      wikipedia: "Pionius",
      image: EventImage.RomanAudience,
      desc: () => $t(L.PioniusBeforeTheCrowdDesc),
      condition: { province: new Set(["Asia"]), year: [250, 250] },
      buttons: [
         {
            label: () => $t(L.PostGuardsAgainstStreetViolence),
            resources: { military: -40, gold: -300 },
            modifiers: { Stability: { type: "add", value: 10, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.HearTheHouseholdsPetitions),
            resources: { administrative: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia3: {
      name: () => $t(L.AStudentOfMaximus),
      wikipedia: "Maximus_of_Ephesus",
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.AStudentOfMaximusDesc),
      condition: { province: new Set(["Asia"]), year: [351, 351] },
      buttons: [
         {
            label: () => $t(L.EndowPublicLecturesAndDebates),
            resources: { gold: -750 },
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.FundCopyistsAndStudentPlaces),
            resources: { gold: -1000 },
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 3 * 12 } },
         },
      ],
   },
   Asia4: {
      name: () => $t(L.StandardsLoweredAtThyatira),
      wikipedia: "Battle_of_Thyatira",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.StandardsLoweredAtThyatiraDesc),
      condition: { province: new Set(["Asia"]), year: [366, 366] },
      buttons: [
         {
            label: () => $t(L.CompensateTheRequisitionedFarms),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeDepotsForTheMarchingArmy),
            resources: { gold: -500, military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia5: {
      name: () => $t(L.ThePriceOfABishopsSeat),
      wikipedia: "John_Chrysostom",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.ThePriceOfABishopsSeatDesc),
      condition: { province: new Set(["Asia"]), year: [401, 401] },
      buttons: [
         {
            label: () => $t(L.ExamineTheDisputedEndowments),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuaranteeThePoorTheirBread),
            resources: { gold: -750 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
      ],
   },
   Asia6: {
      name: () => $t(L.PreachersOnTheVillageRoads),
      wikipedia: "John_of_Ephesus",
      image: EventImage.PaulPreaching,
      desc: () => $t(L.PreachersOnTheVillageRoadsDesc),
      condition: { province: new Set(["Asia"]), year: [542, 542] },
      buttons: [
         {
            label: () => $t(L.FundVillageSchoolsAndRelief),
            resources: { gold: -1000 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.MediateVillagePropertyClaims),
            resources: { administrative: -50, diplomatic: -30 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia7: {
      name: () => $t(L.RefugeAboveTheHarbour),
      wikipedia: "Ephesus",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.RefugeAboveTheHarbourDesc),
      condition: { province: new Set(["Asia"]), year: [700, 700] },
      buttons: [
         {
            label: () => $t(L.ProvisionTheHilltopRefuge),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortCargoOutOfTheLowerTown),
            resources: { military: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia8: {
      name: () => $t(L.ATaxCollectorInPurple),
      wikipedia: "Theodosius_III",
      image: EventImage.ClaudiusEmperor,
      desc: () => $t(L.ATaxCollectorInPurpleDesc),
      condition: { province: new Set(["Asia"]), year: [715, 715] },
      buttons: [
         {
            label: () => $t(L.KeepTheTaxOfficesWorking),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArrangeSuppliesToSpeedDeparture),
            resources: { gold: -750, diplomatic: -30 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia9: {
      name: () => $t(L.TheHeightsOfPergamum),
      wikipedia: "Pergamon",
      image: EventImage.RomanWall,
      desc: () => $t(L.TheHeightsOfPergamumDesc),
      condition: { province: new Set(["Asia"]), year: [716, 716] },
      buttons: [
         {
            label: () => $t(L.StrengthenTheAcropolisDefenses),
            resources: { gold: -750, military: -50 },
            modifiers: { Defense: { type: "multiply", value: 0.25, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.MoveArtisansAndStoresToSafety),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia10: {
      name: () => $t(L.TheMonasteriesPetitioners),
      wikipedia: "Michael_Lachanodrakon",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheMonasteriesPetitionersDesc),
      condition: { province: new Set(["Asia"]), year: [770, 770] },
      buttons: [
         {
            label: () => $t(L.PetitionForTheThreatenedFamilies),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SafeguardTenantsAndReliefAccounts),
            resources: { administrative: -50, gold: -300 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Asia11: {
      name: () => $t(L.ClaimsBeyondTheValleys),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ClaimsBeyondTheValleysDesc),
      condition: {
         province: new Set(["Asia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(6000, province, save);
            yield* provinceRevenueChecks(120, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Bithynia.name()),
            casusBelli: {
               Bithynia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Galatia.name()),
            casusBelli: {
               Galatia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Lycia.name()),
            casusBelli: {
               Lycia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Asia12: {
      name: () => $t(L.ShelterBeneathOurSeal),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ShelterBeneathOurSealDesc),
      condition: {
         province: new Set(["Asia"]),
         onMap: { Lycia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireHigherPrestigeChecks(province, "Lycia", 3, save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Lycia", save);
            yield* requirePeaceBetweenChecks(province, "Lycia", save);
            yield* availableDiplomatChecks(province, "Lycia", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.Receive$1AsOurClient, Province.Lycia.name()),
            custom: [forcePatronageEffect("Lycia")],
         },
      ],
   },
   Asia13: {
      name: () => $t(L.ThePlateauInOurCouncil),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.ThePlateauInOurCouncilDesc),
      condition: {
         province: new Set(["Asia"]),
         annexAndCore: {
            Galatia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishARegionalSeatOnThePlateau),
            modifiers: {
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.RecognizeTheEldersCivicCustoms),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.GuaranteeFreedomForLocalWorship),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
   Asia14: {
      name: () => $t(L.TheNorthernServiceRolls),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TheNorthernServiceRollsDesc),
      condition: {
         province: new Set(["Asia"]),
         annexAndCore: {
            Bithynia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.EnlistTheDistrictClerks),
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
            label: () => $t(L.BringVeteranOfficersOntoOurStaff),
            resources: {
               military: 100,
            },
         },
      ],
   },
   Asia15: {
      name: () => $t(L.RoadsToACommonMarket),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.RoadsToACommonMarketDesc),
      condition: {
         province: new Set(["Asia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length * 3, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.StandardizeTheDistrictsTaxRolls),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.ImproveRoadsToFarmsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.CoordinateMarketsAndHarbourTraffic),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
