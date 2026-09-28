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

export const AchaiaEvents = {
   Achaia1: {
      name: () => $t(L.TheSpartanLevy),
      wikipedia: "Sparta",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.SpartanLevyDesc),
      condition: { province: new Set(["Achaia"]), year: [214, 214] },
      buttons: [
         {
            label: () => $t(L.FundTheSpartanContingentsEquipment),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SupportTheRecruitsDependents),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia2: {
      name: () => $t(L.SmokeBelowTheAcropolis),
      wikipedia: "Sack_of_Athens_(267_AD)",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.SmokeBelowTheAcropolisDesc),
      condition: { province: new Set(["Achaia"]), year: [267, 267] },
      buttons: [
         {
            label: () => $t(L.BuildDefensesFromTheFallenStone),
            resources: { gold: -1000 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.RestoreHomesAndNeighborhoodWorkshops),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia3: {
      name: () => $t(L.AnImperialStudent),
      wikipedia: "Julian_(emperor)",
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.AnImperialStudentDesc),
      condition: { province: new Set(["Achaia"]), year: [355, 355] },
      buttons: [
         {
            label: () => $t(L.SponsorLecturesAndScholarlyVisitors),
            resources: { gold: -750 },
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.SettleDisputesOverStudentLodgings),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia4: {
      name: () => $t(L.AlaricAtThePasses),
      wikipedia: "Alaric_I",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.AlaricAtThePassesDesc),
      condition: { province: new Set(["Achaia"]), year: [396, 396] },
      buttons: [
         {
            label: () => $t(L.SupplyGuardsAtTheIsthmusCrossings),
            resources: { gold: -750, military: -30 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ShelterHouseholdsInTheCoastalTowns),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia5: {
      name: () => $t(L.TheChairAfterProclus),
      wikipedia: "Marinus_of_Neapolis",
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.TheChairAfterProclusDesc),
      condition: { province: new Set(["Achaia"]), year: [485, 485] },
      buttons: [
         {
            label: () => $t(L.PreserveTheMastersCommentaries),
            resources: { gold: -500 },
            modifiers: { Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.EndowTeachingForOurFutureClerks),
            resources: { gold: -750 },
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 } },
         },
      ],
   },
   Achaia6: {
      name: () => $t(L.CrackedStonesAtCorinth),
      wikipedia: "Ancient_Corinth",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.CrackedStonesAtCorinthDesc),
      condition: { province: new Set(["Achaia"]), year: [551, 551] },
      buttons: [
         {
            label: () => $t(L.ReopenTheShopsAndMarketLanes),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.HouseTheDisplacedAndSuspendDues),
            resources: { administrative: -50, gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia7: {
      name: () => $t(L.WinterQuartersInAthens),
      wikipedia: "Constans_II",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.WinterQuartersInAthensDesc),
      condition: { province: new Set(["Achaia"]), year: [662, 662] },
      buttons: [
         {
            label: () => $t(L.ProvisionOrganizedWinterDepots),
            resources: { gold: -1000 },
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateLimitsOnCompulsoryBillets),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia8: {
      name: () => $t(L.TheFleetThatDidNotReturn),
      wikipedia: "Agallianos_Kontoskeles",
      image: EventImage.NavalDisaster,
      desc: () => $t(L.TheFleetThatDidNotReturnDesc),
      condition: { province: new Set(["Achaia"]), year: [727, 727] },
      buttons: [
         {
            label: () => $t(L.PetitionForOrdinaryCrewsAndTraders),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RebuildTheHarborPatrols),
            resources: { gold: -750, military: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia9: {
      name: () => $t(L.StaurakiosOnTheSouthernRoads),
      wikipedia: "Staurakios_(eunuch)",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.StaurakiosOnTheSouthernRoadsDesc),
      condition: { province: new Set(["Achaia"]), year: [783, 783] },
      buttons: [
         {
            label: () => $t(L.SurveyThePromisedTributeWithElders),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateHarvestTimeSupplyContracts),
            resources: { diplomatic: -50, gold: -300 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               ArmyMaintenance: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia10: {
      name: () => $t(L.AkamerossConspiracy),
      wikipedia: "Akameros",
      image: EventImage.RomanAudience,
      desc: () => $t(L.AkamerossConspiracyDesc),
      condition: { province: new Set(["Achaia"]), year: [799, 799] },
      buttons: [
         {
            label: () => $t(L.SecureTheBarracksAndPublicStores),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.HearAccusationsBeforeCivicWitnesses),
            resources: { administrative: -50, gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia11: {
      name: () => $t(L.KinshipAcrossTheGulf),
      image: EventImage.Wedding1,
      desc: () => $t(L.KinshipAcrossTheGulfDesc),
      condition: {
         playerOnly: true,
         province: new Set(["Achaia"]),
         onMap: { Epirus: true },
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province.Achaia.tiles.length, "Achaia", save);
            yield* requirePeaceBetweenChecks(province, "Epirus", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Epirus", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "Epirus", save);
            yield* marriageChecks(province, "Epirus", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Epirus.name()),
            custom: [forcePatronageEffect("Epirus")],
         },
      ],
   },
   Achaia12: {
      name: () => $t(L.BeyondTheMountainPasses),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.BeyondTheMountainPassesDesc),
      condition: {
         province: new Set(["Achaia", "Epirus"]),
         annexAndCore: { Macedonia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.PrepareClaimsToTheRestOfMacedonia),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 5 * 12 },
            },
            casusBelli: {
               Macedonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SeekBackingForOurClaimsInItalia),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PrepareAnExpeditionToAsia),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
            casusBelli: {
               Asia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Achaia13: {
      name: () => $t(L.TheNorthernRoads),
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.TheNorthernRoadsDesc),
      condition: {
         province: new Set(["Achaia", "Epirus"]),
         annexAndCore: { Macedonia: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.TrainCommandersForAThracianCampaign),
            resources: {
               generalSkillPoint: 2,
            },
            casusBelli: {
               Thracia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.CourtSenatorsForOurDalmatianClaims),
            resources: {
               consulPoint: 2,
            },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.AssembleAStaffForAMoesianCampaign),
            resources: {
               administrative: 20,
               diplomatic: 20,
               military: 20,
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Achaia14: {
      name: () => $t(L.RootsInItalianSoil),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.RootsInItalianSoilDesc),
      condition: {
         province: new Set(["Achaia", "Epirus", "Macedonia"]),
         annexAndCore: { Italia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.MusterForAFurtherItalianCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeEstateDuesAndProduction),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia15: {
      name: () => $t(L.AGreaterProvincialAssembly),
      image: EventImage.ImperialCity,
      desc: () => $t(L.AGreaterProvincialAssemblyDesc),
      condition: {
         province: new Set(["Achaia", "Epirus"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(30, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ReceiveCivicGiftsIntoOurTreasury),
            resources: {
               gold: 2000,
            },
         },
         {
            label: () => $t(L.RecruitCivicClerksAndEnvoys),
            resources: {
               administrative: 100,
               diplomatic: 100,
            },
         },
         {
            label: () => $t(L.CallUpTheDistrictsMilitaryCadres),
            resources: {
               military: 200,
            },
         },
      ],
   },
   Achaia16: {
      name: () => $t(L.TheThracianEstateRolls),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TheThracianEstateRollsDesc),
      condition: {
         province: new Set(["Achaia", "Epirus"]),
         annexAndCore: { Thracia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.CollectTheOutstandingEstateDues),
            resources: {
               gold: 1000,
            },
         },
         {
            label: () => $t(L.OrganizeFarmsAndRegularAssessments),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Achaia17: {
      name: () => $t(L.ServiceAlongTheAdriatic),
      image: EventImage.CoastalPalace,
      desc: () => $t(L.ServiceAlongTheAdriaticDesc),
      condition: {
         province: new Set(["Achaia", "Epirus", "Macedonia"]),
         annexAndCore: { Dalmatia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.EnlistTheCoastalMagistrates),
            resources: {
               administrative: 100,
            },
         },
         {
            label: () => $t(L.RecruitEnvoysFromMaritimeFamilies),
            resources: {
               diplomatic: 100,
            },
         },
         {
            label: () => $t(L.BringLocalVeteransOntoOurStaff),
            resources: {
               military: 100,
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
