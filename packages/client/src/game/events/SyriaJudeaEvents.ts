import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { ProvinceNameOverrides } from "../definitions/ProvinceNameOverrides";
import { LevantProvinces } from "../definitions/TileConstants";
import { TileName } from "../definitions/TileName";
import type { ConditionChecks } from "../logic/Calculation";
import {
   annexTileEffect,
   apostolicSeeCountChecks,
   blackSeaCoastChecks,
   coreTileReligionCountChecks,
   isCoreTileChecks,
   manpowerChecks,
   maxCoreTileChecks,
   mediterraneanCoastChecks,
   minCoreCoastalTileChecks,
   notAnnexedChecks,
   provinceResourceChecks,
   redSeaCoastChecks,
   religionChecks,
   setProvinceNameOverrideEffect,
   warPowerChecks,
} from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const SyriaJudeaEvents = {
   SyriaJudea1: {
      name: () => $t(L.ASchoolBesideTheSea),
      wikipedia: "Origen",
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.ASchoolBesideTheSeaDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [232, 232] },
      buttons: [
         {
            label: () => $t(L.FundTeachingRoomsAndCopyists),
            resources: { gold: -1000, administrative: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ArrangeLodgingsAlongTheRoute),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea2: {
      name: () => $t(L.EarthAgainstTheWalls),
      wikipedia: "Siege_of_Dura-Europos_(256)",
      image: EventImage.RomanWall,
      desc: () => $t(L.EarthAgainstTheWallsDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [256, 256] },
      buttons: [
         {
            label: () => $t(L.SupplyTheFrontierGarrisons),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortCaravansOnSaferRoads),
            resources: { military: -50, gold: -500 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
      ],
   },
   SyriaJudea3: {
      name: () => $t(L.ATravellersListOfWells),
      wikipedia: "Itinerarium_Burdigalense",
      image: EventImage.DesertCaravan,
      desc: () => $t(L.ATravellersListOfWellsDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [333, 333] },
      buttons: [
         {
            label: () => $t(L.RepairWellsAndRoadsideShelters),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.InspectInnsAndProtectTravellers),
            resources: { administrative: -30, military: -30 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea4: {
      name: () => $t(L.ToolsOnTheTempleMount),
      wikipedia: "Julian_(emperor)",
      image: EventImage.RuinsWithPeasants,
      desc: () => $t(L.ToolsOnTheTempleMountDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [363, 363] },
      buttons: [
         {
            label: () => $t(L.FundTransportForTheBuildingCrews),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MediateDisputesAndGuardGatherings),
            resources: { administrative: -50, military: -30 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
      ],
   },
   SyriaJudea5: {
      name: () => $t(L.BrokenBronzeInTheStreet),
      wikipedia: "John_Chrysostom",
      image: EventImage.RomanAudience,
      desc: () => $t(L.BrokenBronzeInTheStreetDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [387, 387] },
      buttons: [
         {
            label: () => $t(L.SendAPetitionForClemency),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReviewCollectionsAndReopenMarkets),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
      ],
   },
   SyriaJudea6: {
      name: () => $t(L.TheTranslatorsEmptyDesk),
      wikipedia: "Jerome",
      image: EventImage.JeromeStudy,
      desc: () => $t(L.TheTranslatorsEmptyDeskDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [420, 420] },
      buttons: [
         {
            label: () => $t(L.SupportCopyistsAndCirculateBooks),
            resources: { gold: -1000, administrative: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.EndowTheTravellersGuesthouses),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea7: {
      name: () => $t(L.SmokeOverTheOrontes),
      wikipedia: "526_Antioch_earthquake",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.SmokeOverTheOrontesDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [526, 526] },
      buttons: [
         {
            label: () => $t(L.SendGrainAndShelterMaterials),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeRoadClearanceAndRepairs),
            resources: { gold: -500, administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea8: {
      name: () => $t(L.LawBooksInTheRubble),
      wikipedia: "Law_school_of_Berytus",
      image: EventImage.RuinsWithPeasants,
      desc: () => $t(L.LawBooksInTheRubbleDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [551, 551] },
      buttons: [
         {
            label: () => $t(L.ProvideRoomsForDisplacedScholars),
            resources: { gold: -1000, administrative: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.HireJuristsForLocalHearings),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea9: {
      name: () => $t(L.FamiliesAtTheRoadPosts),
      wikipedia: "Sasanian_conquest_of_Jerusalem",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.FamiliesAtTheRoadPostsDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [614, 614] },
      buttons: [
         {
            label: () => $t(L.SettleFamiliesNearStockedGranaries),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardTheRoadsAndSupplyStrongholds),
            resources: { gold: -500, military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   SyriaJudea10: {
      name: () => $t(L.StonesAcrossTheJordanRoad),
      wikipedia: "749_Galilee_earthquake",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.StonesAcrossTheJordanRoadDesc),
      condition: { province: new Set(["Syria", "Judea"]), year: [749, 749] },
      buttons: [
         {
            label: () => $t(L.RestoreWaterChannelsAndSeedStores),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ClearRoadsAndShelterCaravanCrews),
            resources: { gold: -500, administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Syria1: {
      name: () => $t(L.ClaimsAtTheCrossroads),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ClaimsAtTheCrossroadsDesc),
      condition: {
         province: new Set(["Syria"]),
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(6000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cilicia.name()),
            casusBelli: {
               Cilicia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cappadocia.name()),
            casusBelli: {
               Cappadocia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Judea.name()),
            casusBelli: {
               Judea: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Syria2: {
      name: () => $t(L.ASealAcrossTheWater),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.ASealAcrossTheWaterDesc),
      condition: {
         province: new Set(["Syria"]),
         onMap: { Cilicia: true },
         annexAndCore: { Cilicia: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* notAnnexedChecks(10616918, province, save);
            yield* maxCoreTileChecks(5, "Cilicia", save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SettleTheArrearsAndReceive$1, TileName[10616918]?.() ?? ""),
            resources: { gold: -1000 },
            custom: [annexTileEffect(10616918, true)],
         },
      ],
   },
   Syria3: {
      name: () => $t(L.PetitionersFromJerusalem),
      image: EventImage.RomanAudience,
      desc: () => $t(L.PetitionersFromJerusalemDesc),
      condition: {
         province: new Set(["Syria"]),
         annexAndCore: { Judea: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* isCoreTileChecks(10747993, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveTheChurchEldersOurPatronage),
            resources: { christianity: 10 },
         },
         {
            label: () => $t(L.BringLocalOfficialsOntoOurStaff),
            resources: { administrative: 20, diplomatic: 20, military: 20 },
         },
         {
            label: () => $t(L.WelcomeCivicLeadersToOurCouncil),
            resources: { consulPoint: 2 },
         },
      ],
   },
   Judea1: {
      name: () => $t(L.BeyondTheRoadStations),
      image: EventImage.ArabCouncil,
      desc: () => $t(L.BeyondTheRoadStationsDesc),
      condition: {
         province: new Set(["Judea"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Aegyptus.name()),
            casusBelli: {
               Aegyptus: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Syria.name()),
            casusBelli: {
               Syria: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Judea2: {
      name: () => $t(L.VoicesInTheCourtyards),
      image: EventImage.PaulPreaching,
      desc: () => $t(L.VoicesInTheCourtyardsDesc),
      condition: {
         province: new Set(["Judea"]),
         conditions: function* (province, save): ConditionChecks {
            yield* manpowerChecks(5000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishARegularPreachingCircuit),
            modifiers: { ChristianityYearly: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.SponsorAGatheringOfTheFaithful),
            resources: { christianity: 50 },
         },
      ],
   },
   Judea3: {
      name: () => $t(L.ServiceBesideTheHolyPlaces),
      image: EventImage.SaintCharity,
      desc: () => $t(L.ServiceBesideTheHolyPlacesDesc),
      condition: {
         province: new Set(["Judea"]),
         conditions: function* (province, save): ConditionChecks {
            yield* religionChecks("Christianity", province, save);
            yield* isCoreTileChecks(10747993, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PutChurchStewardsInOurOffices),
            resources: { administrative: 100 },
            modifiers: { ChristianityYearly: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.RecruitEnvoysFromTheCongregations),
            resources: { diplomatic: 100 },
            modifiers: { ChristianityYearly: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.EnlistChristianSupplyOfficers),
            resources: { military: 100 },
            modifiers: { ChristianityYearly: { type: "add", value: 1 } },
         },
      ],
   },
   Judea4: {
      name: () => $t(L.ManyTownsOneHymn),
      image: EventImage.ReligiousTriumph,
      desc: () => $t(L.ManyTownsOneHymnDesc),
      condition: {
         province: new Set(["Judea"]),
         conditions: function* (province, save): ConditionChecks {
            yield* coreTileReligionCountChecks("Christianity", 20, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PatronizeAPublicFestivalOfFaith),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ArrangeHearingsToReconcileNeighbours),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.CoordinateSuppliesForOurSoldiers),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Judea5: {
      name: () => $t(L.TheHarbourRolls),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheHarbourRollsDesc),
      condition: {
         province: new Set(["Judea"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreCoastalTileChecks(10, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CollectTheAccumulatedHarbourDues),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.RecruitPortClerksAndInterpreters),
            resources: { administrative: 50, diplomatic: 50 },
         },
         {
            label: () => $t(L.EnlistPilotsAndNavalSupplyOfficers),
            resources: { military: 100 },
         },
      ],
   },
   SyriaJudea11: {
      name: () => $t(L.ACommonSealForTheLevant),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.ACommonSealForTheLevantDesc),
      condition: {
         province: new Set(LevantProvinces),
         annexAndCore: fromEntries(LevantProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "RestoreLevant",
      buttons: [
         {
            label: () => $t(L.EstablishThe$1, ProvinceNameOverrides.LevantineLeague()),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               ChristianityYearly: { type: "add", value: 2 },
            },
            custom: [setProvinceNameOverrideEffect("LevantineLeague")],
         },
      ],
   },
   SyriaJudea12: {
      name: () => $t(L.ThreeApostolicSeals),
      image: EventImage.CouncilOfTrent,
      desc: () => $t(L.ThreeApostolicSealsDesc),
      condition: {
         province: new Set(["Syria", "Judea", "Aegyptus"]),
         conditions: function* (province, save): ConditionChecks {
            yield* apostolicSeeCountChecks(3, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SupportAJointPreachingMission),
            resources: { christianity: 30 },
         },
         {
            label: () => $t(L.RecruitChurchClerksAndMediators),
            resources: { administrative: 100, diplomatic: 100 },
         },
         {
            label: () => $t(L.ReconcileEstateRollsAndTaxDues),
            modifiers: { LandTax: { type: "multiply", value: 0.1 } },
         },
      ],
   },
   SyriaJudea13: {
      name: () => $t(L.CargoesFromThreeSeas),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.CargoesFromThreeSeasDesc),
      condition: {
         province: new Set(["Syria", "Judea", "Aegyptus", "Cilicia", "Cappadocia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* mediterraneanCoastChecks(1, province, save);
            yield* blackSeaCoastChecks(1, province, save);
            yield* redSeaCoastChecks(1, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CollectRegularDuesAtAllThreeSeas),
            modifiers: {
               MonthlyGold: { type: "add", value: 100, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.AcceptAnAdvanceForTheCustomsLease),
            resources: { gold: 6000 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
