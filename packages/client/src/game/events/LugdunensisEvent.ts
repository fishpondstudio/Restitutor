import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import { getOriginalTileCount } from "../GameState";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import {
   allCoreTileChecks,
   anyCoreTileChecks,
   forcePatronageEffect,
   manpowerChecks,
   marriageChecks,
   maxCoreTileChecks,
   minCoreCoastalTileChecks,
   nullifyNegativeAttitudesEffect,
   provinceRevenueChecks,
   provinceUsedResourceChecks,
   techCountChecks,
   victoryCountChecks,
   warPowerChecks,
} from "../logic/MissionLogic";
import { getProvinceResource, getProvinceStability } from "../logic/ProvinceLogic";
import {
   requireMinimumAttitudeChecks,
   requireNoTreatyBetweenChecks,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { hasGeneralChecks } from "../logic/WarLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const LugdunensisEvent = {
   Lugdunensis1: {
      name: () => $t(L.BlitzkriegAgainstBelgica),
      image: EventImage.CarthageCaptured,
      desc: () => $t(L.BlitzkriegAgainstBelgicaDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         annexAndCore: { Belgica: 2 },
         year: [Number.NEGATIVE_INFINITY, 220],
      },
      buttons: [
         {
            label: () => $t(L.WeShallContinueOurCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
            casusBelli: {
               Belgica: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.WeShallFocusOnOurInternalAffairs),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Lugdunensis2: {
      name: () => $t(L.AProsperousLugdunensis),
      image: EventImage.RomanBathsPlan,
      desc: () => $t(L.AProsperousLugdunensisDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceRevenueChecks(200, province, save);
            yield* manpowerChecks(50_000, province, save);
            yield* techCountChecks(6, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.LetUsBaskInProsperity),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis3: {
      name: () => $t(L.ThePrideOfGaulRidesForth),
      image: EventImage.VercingetorixSurrenders,
      desc: () => $t(L.ThePrideOfGaulRidesForthDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(2, province, save);
            yield* warPowerChecks(10_000, province, save);
            yield* hasGeneralChecks(province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.OurCavalryShallRideForthToGlory),
            stats: {
               cavalrySkill: 1,
            },
         },
      ],
   },
   Lugdunensis4: {
      name: () => $t(L.AWeakenedBelgica),
      image: EventImage.CarthageCaptured,
      desc: () => $t(L.AWeakenedBelgicaDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         annexAndCore: { Belgica: 6 },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(4, "Belgica", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.WeShallContinueOurCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
            casusBelli: {
               Belgica: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.WeShallAnnexThemViaDiplomacy),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
            custom: [nullifyNegativeAttitudesEffect("Belgica")],
         },
      ],
   },
   Lugdunensis5: {
      name: () => $t(L.BoundByBloodAndOath),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.BoundByBloodAndOathDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Belgica", save);
            yield* requirePeaceBetweenChecks(province, "Belgica", save);
            yield* maxCoreTileChecks(3, "Belgica", save);
            yield* marriageChecks(province, "Belgica", save);
            yield* availableDiplomatChecks(province, "Belgica", save);
            yield* requireMinimumAttitudeChecks("Belgica", province, 50, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.BelgicaShallServeAsOurLoyalClient),
            custom: [forcePatronageEffect("Belgica")],
         },
      ],
   },
   Lugdunensis17: {
      name: () => $t(L.MastersOfTheRhineFrontier),
      image: EventImage.CaptiveTriumph,
      desc: () => $t(L.MastersOfTheRhineFrontierDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         annexAndCore: { Germania: 8 },
      },
      buttons: [
         {
            label: () => $t(L.RewardTheFrontierCommanders),
            resources: {
               generalSkillPoint: 2,
            },
         },
         {
            label: () => $t(L.SeekInfluenceInTheSenate),
            resources: {
               consulPoint: 2,
            },
         },
         {
            label: () => $t(L.CollectTributeFromGermania),
            resources: {
               gold: 10_000,
            },
         },
      ],
   },
   Lugdunensis18: {
      name: () => $t(L.TheSouthernGateway),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheSouthernGatewayDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         annexAndCore: { Narbonensis: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* anyCoreTileChecks([8978508, 8978507, 9044043, 9109579, 9175115], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GrantPrivilegesToTheMerchants),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.UnifyThePortsCivicInstitutions),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BuildArsenalsAlongTheWaterfront),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis19: {
      name: () => $t(L.TheRoadToBritannia),
      image: EventImage.RomanInvasion,
      desc: () => $t(L.TheRoadToBritanniaDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([9109568, 9044033, 8978497, 8978498, 8912963, 8847427], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.DrillTheInvasionLegions),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Britannia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.RallyGaulBehindTheExpedition),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Britannia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.StockpileSuppliesForTheCrossing),
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Britannia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Lugdunensis20: {
      name: () => $t(L.ACoastBoundTogether),
      image: EventImage.QueenEmbarkation,
      desc: () => $t(L.ACoastBoundTogetherDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreCoastalTileChecks(15, province, save);
            yield* provinceUsedResourceChecks("gold", 20_000, province, save);
            yield* provinceUsedResourceChecks("administrative", 2000, province, save);
            yield* provinceUsedResourceChecks("diplomatic", 2000, province, save);
            yield* provinceUsedResourceChecks("military", 2000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.OpenTheHarboursToCommerce),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StandardizeLawAlongTheCoast),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StationFleetsInEveryHarbour),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis21: {
      name: () => $t(L.TheIntegrationOfAquitania),
      image: EventImage.RomanVilla,
      desc: () => $t(L.TheIntegrationOfAquitaniaDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         annexAndCore: { Aquitania: Math.floor(getOriginalTileCount("Aquitania") * 0.8) },
      },
      buttons: [
         {
            label: () => $t(L.KeepTheAquitanianCivilService),
            modifiers: {
               InfrastructureUpgradeCost: { type: "multiply", value: -0.2, duration: 2 * 12 },
               AdvisorCost: { type: "multiply", value: -0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SupplyTheArmyFromLocalWorkshops),
            modifiers: {
               ProductionUpgradeCost: { type: "multiply", value: -0.2, duration: 2 * 12 },
               ArmyMaintenance: { type: "multiply", value: -0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SurveyAndSettleTheCountryside),
            modifiers: {
               PopulationUpgradeCost: { type: "multiply", value: -0.2, duration: 2 * 12 },
               TileMaintenance: { type: "multiply", value: -0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis6: {
      name: () => $t(L.TheImperialMintInCrisis),
      image: EventImage.RomanForum1,
      desc: () => $t(L.TheImperialMintInCrisisDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [220, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value < 0)?.describe(
               $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.CallForImperialInspectorsToInvestigate),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            attitudes: {
               ...fromEntries(GallicEmpireProvinces.map((p) => [p, { type: "add", value: 20, duration: 2 * 12 }])),
            },
            resources: {
               gold: -1000,
            },
         },
         {
            label: () => $t(L.ConcealTheScandalAndHopeItFadesAway),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis7: {
      name: () => $t(L.TheLegacyOfIrenaeus),
      wikipedia: "Irenaeus",
      image: EventImage.SaintHealing,
      desc: () => $t(L.TheLegacyOfIrenaeusDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceResource("christianity", province, save) >= 20)?.describe(
               $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "20"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.LetHisMemoryGuideUsTowardVirtue),
            resources: { administrative: -50, christianity: 10 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WeMustRemainBalancedInOurPolicies),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            resources: { diplomatic: -100 },
         },
         {
            label: () => $t(L.WeAreNotRuledByBishopsLivingOrDead),
            resources: { christianity: -10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis8: {
      name: () => $t(L.PilgrimsFromAquitania),
      image: EventImage.StephenStoning,
      desc: () => $t(L.PilgrimsFromAquitaniaDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [240, Number.POSITIVE_INFINITY],
         techs: new Set(["D1"]),
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceResource("christianity", province, save) >= 50)?.describe(
               $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "50"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.OpenOurGatesInWelcome),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
            resources: { christianity: 10 },
            trades: {
               Aquitania: { offer: { theyOffer: "gold", weOffer: "bread" }, extraProfit: 0.5 },
            },
         },
         {
            label: () => $t(L.DiscreetlyDiscourageThisFervor),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            resources: { christianity: -10 },
         },
         {
            label: () => $t(L.ImposeALevyUponThePilgrims),
            attitudes: {
               Aquitania: { type: "add", value: -20, duration: 2 * 12 },
            },
            resources: { gold: 500, christianity: 5 },
         },
      ],
   },
   Lugdunensis9: {
      name: () => $t(L.TheLoireFloods),
      image: EventImage.Flood,
      desc: () => $t(L.TheLoireFloodsDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [250, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value >= 0)?.describe(
               $t(L.$1StabilityIsAtLeast$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.HelpRebuildTheRiverWorks),
            resources: {
               gold: -500,
            },
         },
         {
            label: () => $t(L.LeaveItToTheLocalsToDealWith),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RequestAidFrom$1, Province.Narbonensis.name()),
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
            attitudes: {
               Narbonensis: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis10: {
      name: () => $t(L.TheArmoricanSmugglers),
      image: EventImage.Sailor,
      desc: () => $t(L.TheArmoricanSmugglersDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [260, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value >= 0)?.describe(
               $t(L.$1StabilityIsAtLeast$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.WeShallCrackDownOnTheSmugglers),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WeShallCoOptThemToRaidBritannia),
            attitudes: {
               Britannia: { type: "add", value: -50, duration: 2 * 12 },
            },
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
            resources: { gold: 500 },
         },
         {
            label: () => $t(L.WeShallTurnABlindEyeToThem),
            modifiers: {
               Stability: { type: "add", value: +10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis11: {
      name: () => $t(L.TheDeclineOfLugdunum),
      image: EventImage.RomanForum1,
      desc: () => $t(L.TheDeclineOfLugdunumDesc),

      condition: {
         province: new Set(["Lugdunensis"]),
         year: [260, Number.POSITIVE_INFINITY],
         provinceUpgrades: new Set(["Tetrarchy"]),
      },
      buttons: [
         {
            label: () => $t(L.InvestInLugdunumsRenewal),
            resources: { gold: -1000 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AcceptTheDeclineAndMoveOn),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
            resources: { administrative: 50 },
         },
         {
            label: () => $t(L.RequestAidFrom$1, Province.Aquitania.name()),
            modifiers: {
               Prestige: { type: "add", value: -10, duration: 2 * 12 },
            },
            attitudes: {
               Aquitania: { type: "add", value: 10, duration: 2 * 12 },
            },
            resources: { gold: 500 },
         },
      ],
   },
   Lugdunensis12: {
      name: () => $t(L.AutonomyAlongTheLoireFrontier),
      image: EventImage.Watchtower,
      desc: () => $t(L.AutonomyAlongTheLoireFrontierDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [280, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value < 0)?.describe(
               $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.EndorseTheVillagersWatchtowers),
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AssertDirectProvincialRuleAgain),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.Invite$1ToJoinDefenses, Province.Aquitania.name()),
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "add", value: -10, duration: 2 * 12 },
            },
            attitudes: {
               Aquitania: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis13: {
      name: () => $t(L.TheShepherdRisesOverLugdunensis),
      image: EventImage.SaintConsecration,
      desc: () => $t(L.TheShepherdRisesOverLugdunensisDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [300, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceResource("christianity", province, save) >= 100)?.describe(
               $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "100"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.GrantTheBishopExpandedAuthority),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
            resources: { christianity: 20 },
         },
         {
            label: () => $t(L.CurbTheBishopsWorldlyAmbitions),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            resources: { christianity: -20 },
         },
         {
            label: () => $t(L.AppealToTheEmperorForMediation),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            resources: { diplomatic: -50, consulPoint: 1 },
         },
      ],
   },
   Lugdunensis14: {
      name: () => $t(L.TheBirthOfTheArmoricanConfederacy),
      image: EventImage.RomanRuins2,
      desc: () => $t(L.TheBirthOfTheArmoricanConfederacyDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [330, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value < 0)?.describe(
               $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.NegotiateWithArmoricans),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CrushTheLeagueWithoutMercy),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AppealToImperialAuthority),
            resources: { diplomatic: -50, consulPoint: 1 },
         },
      ],
   },
   Lugdunensis15: {
      name: () => $t(L.MartinOfToursAndTheCloak),
      wikipedia: "Martin_of_Tours",
      image: EventImage.SaintCharity,
      desc: () => $t(L.MartinOfToursAndTheCloakDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [350, Number.POSITIVE_INFINITY],
         religion: new Set(["Christianity"]),
      },
      buttons: [
         {
            label: () => $t(L.MartinShallLeadOurPeopleToVirtue),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MartinShallBeVeneratedButThatsAll),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            resources: { administrative: -50 },
         },
         {
            label: () => $t(L.AsceticismHasNoPlaceInOurProvince),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lugdunensis16: {
      name: () => $t(L.TheTideOfRefugeesAtTheRhine),
      image: EventImage.PompeiiRefugees,
      desc: () => $t(L.TheTideOfRefugeesAtTheRhineDesc),
      condition: {
         province: new Set(["Lugdunensis"]),
         year: [380, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            (yield getProvinceStability(province, save).value < 0)?.describe(
               $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
            );
         },
      },
      buttons: [
         {
            label: () => $t(L.GrantThemHomesteadsOnOurLands),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EmployThemInOurRuralEstates),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BarTheGatesToAllRefugees),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
