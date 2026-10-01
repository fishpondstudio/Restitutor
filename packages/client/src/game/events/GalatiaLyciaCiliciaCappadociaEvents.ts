import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import {
   allCoreTileChecks,
   forcePatronageEffect,
   makeCoreCountChecks,
   marriageChecks,
   maxCoreTileChecks,
   provinceResourceChecks,
   provinceRevenueChecks,
   resetWarmongerPenaltyEffect,
   victoryCountChecks,
   warPowerChecks,
} from "../logic/MissionLogic";
import {
   requireAnyTreatyBetweenChecks,
   requireHigherPrestigeChecks,
   requireNoTreatyBetweenChecks,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const GalatiaLyciaCiliciaCappadociaEvents = {
   GalatiaLyciaCiliciaCappadocia1: {
      name: () => $t(L.WagonsForTheImperialRoad),
      wikipedia: "Caracalla",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.WagonsForTheImperialRoadDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [215, 215] },
      buttons: [
         {
            label: () => $t(L.HireTeamsForTheImperialTrain),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveTeamsForFarmsAndMarkets),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia2: {
      name: () => $t(L.TremorsAndAccusations),
      wikipedia: "Firmilian",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.TremorsAndAccusationsDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [234, 234] },
      buttons: [
         {
            label: () => $t(L.FundShelterAndSharedRepairCrews),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProtectTheAccusedAndPatrolStreets),
            resources: { military: -50, administrative: -30 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia3: {
      name: () => $t(L.TheDoorsOpenAgain),
      wikipedia: "Synod_of_Ancyra",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheDoorsOpenAgainDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [314, 314] },
      buttons: [
         {
            label: () => $t(L.FundLocalReconciliationMeetings),
            resources: { gold: -500, diplomatic: -30 },
            modifiers: { Stability: { type: "add", value: 15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ProtectHouseholdsFromReprisals),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 2 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia4: {
      name: () => $t(L.TheBishopsEmptyChair),
      wikipedia: "Saint_Nicholas",
      image: EventImage.SaintCharity,
      desc: () => $t(L.TheBishopsEmptyChairDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [343, 343] },
      buttons: [
         {
            label: () => $t(L.EndowReliefForIndebtedFamilies),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReviewAbusiveDebtClaims),
            resources: { administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia5: {
      name: () => $t(L.EmptyCartsFromTheMountains),
      wikipedia: "Isauria",
      image: EventImage.Watchtower,
      desc: () => $t(L.EmptyCartsFromTheMountainsDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [354, 354] },
      buttons: [
         {
            label: () => $t(L.EscortTheMountainCaravans),
            resources: { military: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BuySuppliesAlongSaferRoutes),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia6: {
      name: () => $t(L.SoupOutsideTheStorehouses),
      wikipedia: "Basil_of_Caesarea",
      image: EventImage.SaintCharity,
      desc: () => $t(L.SoupOutsideTheStorehousesDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [368, 368] },
      buttons: [
         {
            label: () => $t(L.BuyGrainForPublicKitchens),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureSeedAndFeedForTheVillages),
            resources: { gold: -750, administrative: -50 },
            modifiers: { TileOutput: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia7: {
      name: () => $t(L.APretenderOnThePlateau),
      wikipedia: "Marcianus_(son_of_Anthemius)",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.APretenderOnThePlateauDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [480, 480] },
      buttons: [
         {
            label: () => $t(L.StrengthenRoadPostsAndGranaries),
            resources: { gold: -750, military: -50 },
            modifiers: { Defense: { type: "multiply", value: 0.25, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.GuaranteeSafePassageForTraders),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia8: {
      name: () => $t(L.StolenFieldsAndSealedLedgers),
      wikipedia: "Cappadocia_(Roman_province)",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.StolenFieldsAndSealedLedgersDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [536, 536] },
      buttons: [
         {
            label: () => $t(L.SurveyTheEstatesAndRecoverDues),
            resources: { administrative: -50, gold: -500 },
            modifiers: { LandTax: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ProtectTenantsAndHearTheirClaims),
            resources: { gold: -750, military: -30 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia9: {
      name: () => $t(L.WreckageOffTheLycianShore),
      wikipedia: "Battle_of_the_Masts",
      image: EventImage.NavalDisaster,
      desc: () => $t(L.WreckageOffTheLycianShoreDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [655, 655] },
      buttons: [
         {
            label: () => $t(L.FundRescueAndSailorsRelief),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureAlternativeSupplyRoutes),
            resources: { gold: -750, military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia10: {
      name: () => $t(L.WinterStoresForTyana),
      wikipedia: "Siege_of_Tyana",
      image: EventImage.RomanWall,
      desc: () => $t(L.WinterStoresForTyanaDesc),
      condition: { province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]), year: [707, 707] },
      buttons: [
         {
            label: () => $t(L.OrganizeGuardedSupplyConvoys),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MoveExposedHouseholdsToSafety),
            resources: { gold: -750, administrative: -50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Galatia1: {
      name: () => $t(L.ClaimsAlongTheCaravanRoads),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ClaimsAlongTheCaravanRoadsDesc),
      condition: {
         province: new Set(["Galatia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceRevenueChecks(100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Bithynia.name()),
            casusBelli: {
               Bithynia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cilicia.name()),
            casusBelli: {
               Cilicia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Galatia2: {
      name: () => $t(L.ARoadBetweenTwoSeas),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.ARoadBetweenTwoSeasDesc),
      condition: {
         province: new Set(["Galatia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10616910, 10682451], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ReserveCargoSpaceForArmySupplies),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SponsorAGatheringOfThePortTowns),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SettleTheHarbourCommunitiesDisputes),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 5 * 12 },
            },
         },
      ],
   },
   Cilicia1: {
      name: () => $t(L.StandardsAtTheMountainGates),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.StandardsAtTheMountainGatesDesc),
      condition: {
         province: new Set(["Cilicia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(7000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Galatia.name()),
            casusBelli: {
               Galatia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cappadocia.name()),
            casusBelli: {
               Cappadocia: { casusBelli: "ConquestMission", duration: 12 * 5 },
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
   Lycia1: {
      name: () => $t(L.PetitionsFromBeyondTheHarbours),
      image: EventImage.RomanAudience,
      desc: () => $t(L.PetitionsFromBeyondTheHarboursDesc),
      condition: {
         province: new Set(["Lycia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Galatia.name()),
            casusBelli: {
               Galatia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Asia.name()),
            casusBelli: {
               Asia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cilicia.name()),
            casusBelli: {
               Cilicia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Lycia2: {
      name: () => $t(L.KinshipAcrossTheGulf),
      image: EventImage.Wedding1,
      desc: () => $t(L.CilicianKinshipAcrossTheGulfDesc),
      condition: {
         playerOnly: true,
         province: new Set(["Lycia"]),
         onMap: { Cilicia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireHigherPrestigeChecks(province, "Cilicia", 2, save);
            yield* requirePeaceBetweenChecks(province, "Cilicia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Cilicia", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "Cilicia", save);
            yield* marriageChecks(province, "Cilicia", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.Receive$1AsOurClient, Province.Cilicia.name()),
            custom: [forcePatronageEffect("Cilicia")],
         },
      ],
   },
   Cappadocia1: {
      name: () => $t(L.OrdersFromTheUplandDepots),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.OrdersFromTheUplandDepotsDesc),
      condition: {
         province: new Set(["Cappadocia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Bithynia.name()),
            casusBelli: {
               Bithynia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Galatia.name()),
            casusBelli: {
               Galatia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Cilicia.name()),
            casusBelli: {
               Cilicia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Cappadocia2: {
      name: () => $t(L.VeteransAtTheMusterGround),
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.VeteransAtTheMusterGroundDesc),
      condition: {
         province: new Set(["Cappadocia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(5, province, save);
            yield* makeCoreCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AppointVeteranInfantryInstructors),
            stats: { infantrySkill: 1 },
         },
         {
            label: () => $t(L.AppointVeteranArcheryInstructors),
            stats: { rangedSkill: 1 },
         },
         {
            label: () => $t(L.AppointVeteranCavalryInstructors),
            stats: { cavalrySkill: 1 },
         },
      ],
   },
   GalatiaCappadocia1: {
      name: () => $t(L.TheNorthernDistrictAccounts),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TheNorthernDistrictAccountsDesc),
      condition: {
         province: new Set(["Galatia", "Cappadocia"]),
         annexAndCore: { Bithynia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.CoordinateMarketsAndCargoDues),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTheEstateTaxRolls),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ConfirmTheTownsCivicPrivileges),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 5 * 12 },
            },
         },
      ],
   },
   GalatiaLyciaCappadocia1: {
      name: () => $t(L.ServiceBeneathTheTaurus),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ServiceBeneathTheTaurusDesc),
      condition: {
         province: new Set(["Galatia", "Lycia", "Cappadocia"]),
         annexAndCore: { Cilicia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.EnlistTheDistrictClerks),
            resources: { administrative: 50 },
         },
         {
            label: () => $t(L.RecruitLocalMediatorsAsEnvoys),
            resources: { diplomatic: 50 },
         },
         {
            label: () => $t(L.BringCaravanOfficersOntoOurStaff),
            resources: { military: 50 },
         },
      ],
   },
   CiliciaCappadocia1: {
      name: () => $t(L.TheSyrianServiceRolls),
      image: EventImage.TaxCollectors,
      desc: () => $t(L.TheSyrianServiceRollsDesc),
      condition: {
         province: new Set(["Cilicia", "Cappadocia"]),
         annexAndCore: { Syria: 5 },
      },
      buttons: [
         {
            label: () => $t(L.EmployTheTownSecretaries),
            resources: { administrative: 50 },
         },
         {
            label: () => $t(L.RecruitTheCaravanNegotiators),
            resources: { diplomatic: 50 },
         },
         {
            label: () => $t(L.CommissionExperiencedLocalOfficers),
            resources: { military: 50 },
         },
      ],
   },
   LyciaCiliciaCappadocia1: {
      name: () => $t(L.RecruitsFromThePlateau),
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.RecruitsFromThePlateauDesc),
      condition: {
         province: new Set(["Lycia", "Cilicia", "Cappadocia"]),
         annexAndCore: { Galatia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.TrainTheInfantryCompanies),
            stats: { infantrySkill: 1 },
         },
         {
            label: () => $t(L.TrainTheArcheryCompanies),
            stats: { rangedSkill: 1 },
         },
         {
            label: () => $t(L.TrainTheCavalryCompanies),
            stats: { cavalrySkill: 1 },
         },
      ],
   },
   GalatiaLyciaCiliciaCappadocia11: {
      name: () => $t(L.AVictorsOpenHand),
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.AVictorsOpenHandDesc),
      condition: {
         province: new Set(["Galatia", "Lycia", "Cilicia", "Cappadocia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(10, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ProclaimReconciliationWithOurRivals),
            custom: [resetWarmongerPenaltyEffect()],
         },
      ],
   },
   GalatiaCilicia1: {
      name: () => $t(L.OfficesForTheUplandDistricts),
      image: EventImage.RomanAudience,
      desc: () => $t(L.OfficesForTheUplandDistrictsDesc),
      condition: {
         province: new Set(["Galatia", "Cilicia"]),
         annexAndCore: { Cappadocia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.StaffADistrictRecordsOffice),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.EstablishABureauForLocalEnvoys),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeAPermanentMusterStaff),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
      ],
   },
   GalatiaLycia1: {
      name: () => $t(L.VoicesFromTheAegeanTowns),
      image: EventImage.RomanAudience,
      desc: () => $t(L.VoicesFromTheAegeanTownsDesc),
      condition: {
         province: new Set(["Galatia", "Lycia"]),
         annexAndCore: { Asia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.PromoteTheOfficersNamedByTheTowns),
            resources: { generalSkillPoint: 2 },
         },
         {
            label: () => $t(L.AdvanceTrustedMagistratesToCouncil),
            resources: { consulPoint: 2 },
         },
         {
            label: () => $t(L.PetitionForAnImperialMandate),
            resources: { mandate: 1 },
         },
      ],
   },
   GalatiaCilicia2: {
      name: () => $t(L.AHarbourBeneathOurProtection),
      image: EventImage.RomanAudience,
      desc: () => $t(L.AHarbourBeneathOurProtectionDesc),
      condition: {
         province: new Set(["Galatia", "Cilicia"]),
         onMap: { Lycia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(3, "Lycia", save);
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
   GalatiaLyciaCilicia14: {
      name: () => $t(L.FromThePlateauToTheSouthernQuays),
      image: EventImage.RomanAudience,
      desc: () => $t(L.FromThePlateauToTheSouthernQuaysDesc),
      condition: {
         province: new Set(["Galatia", "Lycia", "Cilicia"]),
         annexAndCore: {
            Galatia: Number.POSITIVE_INFINITY,
            Lycia: Number.POSITIVE_INFINITY,
            Cilicia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishARegionalTreasuryAndSeat),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 5 * 12 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ProtectLocalCustomsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.2, duration: 5 * 12 },
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ConfirmTempleRightsAndSettleDues),
            resources: { gold: 1000 },
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
