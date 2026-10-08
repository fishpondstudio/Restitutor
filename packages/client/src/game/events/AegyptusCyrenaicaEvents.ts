import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { AegyptusProvinces } from "../definitions/TileConstants";
import type { ConditionChecks } from "../logic/Calculation";
import {
   annexTileEffect,
   minCoreTileChecks,
   notAnnexedChecks,
   provinceResourceChecks,
   redSeaCoastChecks,
   settleCountChecks,
   warPowerChecks,
} from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const AegyptusCyrenaicaEvents = {
   AegyptusCyrenaica1: {
      name: () => $t(L.NewSeatsInTheCouncilHouse),
      wikipedia: "Septimius_Severus",
      image: EventImage.RomanAudience,
      desc: () => $t(L.NewSeatsInTheCouncilHouseDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [200, 200] },
      buttons: [
         {
            label: () => $t(L.TrainClerksForCivicBusiness),
            resources: { gold: -1000, administrative: 50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.BrokerAgreementsBetweenThePorts),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica2: {
      name: () => $t(L.BloodBehindTheHarbourGates),
      wikipedia: "Caracalla",
      image: EventImage.RomanMassacre,
      desc: () => $t(L.BloodBehindTheHarbourGatesDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [215, 215] },
      buttons: [
         {
            label: () => $t(L.CharterPassageAndShelterFamilies),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardWarehousesAndRestoreSailings),
            resources: { military: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica3: {
      name: () => $t(L.ACertificateAtTheAltar),
      wikipedia: "Libellus",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.ACertificateAtTheAltarDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [250, 250] },
      buttons: [
         {
            label: () => $t(L.AuditCertificatesAndBriberyClaims),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProtectHouseholdsFromDenunciations),
            resources: { military: -30, diplomatic: -30 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica4: {
      name: () => $t(L.EmptyHoldsOutsideAlexandria),
      wikipedia: "Siege_of_Alexandria_(297–298)",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.EmptyHoldsOutsideAlexandriaDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [298, 298] },
      buttons: [
         {
            label: () => $t(L.BuyGrainForTheCoastalTowns),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeGuardedSupplySailings),
            resources: { military: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica5: {
      name: () => $t(L.TheSeaReturns),
      wikipedia: "365_Crete_earthquake",
      image: EventImage.Flood,
      desc: () => $t(L.TheSeaReturnsDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [365, 365] },
      buttons: [
         {
            label: () => $t(L.FundRescueBoatsAndEmergencyBread),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RepairQuaysAndReplaceLostBoats),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica6: {
      name: () => $t(L.SilenceOnTheSerapeumSteps),
      wikipedia: "Serapeum_of_Alexandria",
      image: EventImage.RuinsWithPeasants,
      desc: () => $t(L.SilenceOnTheSerapeumStepsDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [391, 391] },
      buttons: [
         {
            label: () => $t(L.GuardHomesAndStopReprisals),
            resources: { military: -50, gold: -500 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.HearClaimsAndEmployIdleCraftsmen),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica7: {
      name: () => $t(L.RidersForThePentapolis),
      wikipedia: "Synesius",
      image: EventImage.Watchtower,
      desc: () => $t(L.RidersForThePentapolisDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [411, 411] },
      buttons: [
         {
            label: () => $t(L.ProvisionPatrolsAndRemounts),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureVillageStoresAndHarvestCrews),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica8: {
      name: () => $t(L.TheTeachersVacantChair),
      wikipedia: "Hypatia",
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.TheTeachersVacantChairDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [415, 415] },
      buttons: [
         {
            label: () => $t(L.ProtectTeachersAndReopenSchools),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OfferScholarsStipendsAndPassage),
            resources: { gold: -1000, administrative: 75 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 } },
         },
      ],
   },
   AegyptusCyrenaica9: {
      name: () => $t(L.SailsBeneathAPersianThreat),
      wikipedia: "Sasanian_conquest_of_Egypt",
      image: EventImage.RomanGalley,
      desc: () => $t(L.SailsBeneathAPersianThreatDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [619, 619] },
      buttons: [
         {
            label: () => $t(L.CharterShipsForFamiliesAndGrain),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveShipsForDefendedSupplyRuns),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   AegyptusCyrenaica10: {
      name: () => $t(L.DemandsOnTheWesternRoad),
      wikipedia: "Muslim_conquest_of_the_Maghreb",
      image: EventImage.DesertCaravan,
      desc: () => $t(L.DemandsOnTheWesternRoadDesc),
      condition: { province: new Set(["Aegyptus", "Cyrenaica"]), year: [643, 643] },
      buttons: [
         {
            label: () => $t(L.StockStrongpointsAndGuardWells),
            resources: { military: -50, gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekSafeConductForLocalCaravans),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Aegyptus1: {
      name: () => $t(L.ClaimsBeyondTheDelta),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ClaimsBeyondTheDeltaDesc),
      condition: {
         province: new Set(["Aegyptus"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Judea.name()),
            casusBelli: {
               Judea: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cyrenaica.name()),
            casusBelli: {
               Cyrenaica: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Aegyptus2: {
      name: () => $t(L.NewHandsAtTheWritingTables),
      image: EventImage.RomanAudience,
      desc: () => $t(L.NewHandsAtTheWritingTablesDesc),
      condition: {
         province: new Set(["Aegyptus"]),
         annexAndCore: {
            Judea: 5,
         },
      },
      buttons: [
         {
            label: () => $t(L.TrainLocalClerksForOurOffices),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RetainMediatorsForTheCaravanRoads),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitLocalQuartermasters),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 3 * 12 },
            },
         },
      ],
   },
   Aegyptus3: {
      name: () => $t(L.BetweenTheWellsAndTheQuays),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.BetweenTheWellsAndTheQuaysDesc),
      condition: {
         province: new Set(["Aegyptus"]),
         conditions: function* (province, save): ConditionChecks {
            yield* redSeaCoastChecks(7, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SurveyAndAssessTheCoastalEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.SupplyWorkshopsAlongTheCoast),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.SettleWorkersAndTheirFamilies),
            modifiers: {
               Manpower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
      ],
   },
   Aegyptus4: {
      name: () => $t(L.FromTheNileToTheJudaeanHills),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.FromTheNileToTheJudaeanHillsDesc),
      condition: {
         province: new Set(["Aegyptus"]),
         annexAndCore: {
            Judea: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.CommissionTheDistrictAdministrators),
            resources: {
               administrative: 200,
            },
         },
         {
            label: () => $t(L.AppointTheCivicNegotiators),
            resources: {
               diplomatic: 200,
            },
         },
         {
            label: () => $t(L.BringVeteranOfficersOntoOurStaff),
            resources: {
               military: 200,
            },
         },
      ],
   },
   Aegyptus5: {
      name: () => $t(L.HearthsBeyondTheOldBoundary),
      image: EventImage.CivilianMigration,
      desc: () => $t(L.HearthsBeyondTheOldBoundaryDesc),
      condition: {
         province: new Set(["Aegyptus"]),
         conditions: function* (province, save): ConditionChecks {
            yield* settleCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CharterAnotherRegionalCapital),
            modifiers: {
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.RecognizeTheSettlersCustoms),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ProtectTheSettlersWorship),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
   Cyrenaica1: {
      name: () => $t(L.StandardsOnTheCoastalRoad),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.StandardsOnTheCoastalRoadDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(7000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Aegyptus.name()),
            casusBelli: {
               Aegyptus: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Africa.name()),
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Cyrenaica2: {
      name: () => $t(L.TheEgyptianRevenueChest),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TheEgyptianRevenueChestDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         annexAndCore: {
            Aegyptus: 5,
         },
      },
      buttons: [
         {
            label: () => $t(L.AcceptTheContractorsAdvance),
            resources: {
               gold: 600,
            },
         },
         {
            label: () => $t(L.CollectTheRevenuesInInstalments),
            modifiers: {
               MonthlyGold: { type: "add", value: 50, duration: 2 * 12 },
            },
         },
      ],
   },
   Cyrenaica3: {
      name: () => $t(L.LettersAlongTheAfricanRoad),
      image: EventImage.RomanAudience,
      desc: () => $t(L.LettersAlongTheAfricanRoadDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         annexAndCore: {
            Africa: 5,
         },
      },
      buttons: [
         {
            label: () => $t(L.AssignClerksToPrepareFurtherClaims),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.BuildANetworkOfCivicEnvoys),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitGuidesForTheNextCampaign),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Cyrenaica4: {
      name: () => $t(L.AFootholdAmongTheOliveGroves),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.AFootholdAmongTheOliveGrovesDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         annexAndCore: {
            Africa: 10,
         },
      },
      buttons: [
         {
            label: () => $t(L.PrepareSupplyDepotsForOurAdvance),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTownsBehindOurLines),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SponsorCivicHonoursForOurCause),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Cyrenaica5: {
      name: () => $t(L.AnOfferAcrossTheCretanSea),
      image: EventImage.MediterraneanIsland,
      desc: () => $t(L.AnOfferAcrossTheCretanSeaDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         conditions: function* (province, save): ConditionChecks {
            yield* notAnnexedChecks(10158165, province, save);
            yield* notAnnexedChecks(10092629, province, save);
            yield* provinceResourceChecks("gold", 5000, province, save);
            yield* provinceResourceChecks("diplomatic", 200, province, save);
            yield* minCoreTileChecks(Math.ceil(Province.Cyrenaica.tiles.length * 1.5), province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SettleTheDebtsAndReceiveBothTowns),
            resources: {
               gold: -5000,
               diplomatic: -200,
            },
            custom: [annexTileEffect(10092629, true), annexTileEffect(10158165, true)],
         },
      ],
   },
   Cyrenaica6: {
      name: () => $t(L.LaurelsFromCarthage),
      image: EventImage.RomanTriumph2,
      desc: () => $t(L.LaurelsFromCarthageDesc),
      condition: {
         province: new Set(["Cyrenaica"]),
         annexAndCore: { Africa: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.BringAfricanNotablesIntoOurCouncil),
            resources: {
               consulPoint: 2,
            },
         },
         {
            label: () => $t(L.PromoteTheCampaignsVeteranOfficers),
            resources: {
               generalSkillPoint: 2,
            },
         },
         {
            label: () => $t(L.SeekRecognitionOfOurWiderMandate),
            resources: {
               mandate: 1,
            },
         },
      ],
   },
   AegyptusCyrenaica11: {
      name: () => $t(L.OneSealFromCyreneToTheNile),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.OneSealFromCyreneToTheNileDesc),
      condition: {
         province: new Set(AegyptusProvinces),
         annexAndCore: fromEntries(AegyptusProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => $t(L.CharterARegionalSeatOfGovernment),
            modifiers: {
               RegionalCapitalCount: { type: "add", value: 1 },
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
         {
            label: () => $t(L.SecureAWiderGoverningCommission),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            resources: {
               mandate: 1,
            },
         },
         {
            label: () => $t(L.EnshrineLocalCustomsInOurCharter),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
