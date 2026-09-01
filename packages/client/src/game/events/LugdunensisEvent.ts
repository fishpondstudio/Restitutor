import { filterInPlace, fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import { getOriginalTileCount } from "../GameState";
import { availableDiplomatCondition, getRelation } from "../logic/DiplomacyLogic";
import {
   allCoreTileCondition,
   anyCoreTileCondition,
   manpowerCondition,
   marriageCondition,
   maxCoreTileCondition,
   minCoreCoastalTileCondition,
   provinceRevenueCondition,
   provinceUsedResourceCondition,
   techCountCondition,
   victoryCountCondition,
   warPowerCondition,
} from "../logic/MissionLogic";
import { getProvinceResource, getProvinceStability } from "../logic/ProvinceLogic";
import {
   dissolveAllTreaties,
   requireMinimumAttitude,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { hasGeneralCondition } from "../logic/WarLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const LugdunensisEvent = {
   Lugdunensis1: {
      name: () => $t(L.BlitzkriegAgainstBelgica),
      image: EventImage.CarthageCaptured,
      desc: () => $t(L.BlitzkriegAgainstBelgicaDesc),
      condition: {
         province: ["Lugdunensis"],
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
         province: ["Lugdunensis"],
         conditions: (province, save) => [
            provinceRevenueCondition(200, province, save),
            manpowerCondition(50_000, province, save),
            techCountCondition(6, province, save),
         ],
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
         province: ["Lugdunensis"],
         conditions: (province, save) => [
            victoryCountCondition(2, province, save),
            warPowerCondition(10_000, province, save),
            hasGeneralCondition(province, save),
         ],
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
         province: ["Lugdunensis"],
         annexAndCore: { Belgica: 6 },
         conditions: (province, save) => [maxCoreTileCondition(4, "Belgica", save)],
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
            custom: [
               {
                  effect: (province, save) => {
                     const relation = getRelation("Belgica", province, save);
                     if (relation) {
                        filterInPlace(relation.attitudeModifier, (modifier) => {
                           return modifier.value > 0;
                        });
                     }
                  },
                  desc: (province, save) => {
                     return $t(
                        L.$1NullifiesAllNegativeAttitudesTowards$2,
                        Province.Belgica.name(),
                        Province.Lugdunensis.name(),
                     );
                  },
               },
            ],
         },
      ],
   },
   Lugdunensis5: {
      name: () => $t(L.BoundByBloodAndOath),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.BoundByBloodAndOathDesc),
      condition: {
         province: ["Lugdunensis"],
         conditions: (province, save) => [
            requireNoTreatyBetween(["Patron"], province, "Belgica", save),
            requirePeaceBetween(province, "Belgica", save),
            maxCoreTileCondition(3, "Belgica", save),
            marriageCondition(province, "Belgica", save),
            availableDiplomatCondition(province, "Belgica", save),
            requireMinimumAttitude("Belgica", province, 50, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.BelgicaShallServeAsOurLoyalClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Belgica", save);
                     OfferPatronageAction(province, "Belgica", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Belgica.name()),
               },
            ],
         },
      ],
   },
   Lugdunensis17: {
      name: () => $t(L.MastersOfTheRhineFrontier),
      image: EventImage.CaptiveTriumph,
      desc: () => $t(L.MastersOfTheRhineFrontierDesc),
      condition: {
         province: ["Lugdunensis"],
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
         province: ["Lugdunensis"],
         annexAndCore: { Narbonensis: 5 },
         conditions: (province, save) => [
            anyCoreTileCondition([8978508, 8978507, 9044043, 9109579, 9175115], province, save),
         ],
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
         province: ["Lugdunensis"],
         conditions: (province, save) => [
            allCoreTileCondition([9109568, 9044033, 8978497, 8978498, 8912963, 8847427], province, save),
         ],
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
         province: ["Lugdunensis"],
         conditions: (province, save) => [
            minCoreCoastalTileCondition(15, province, save),
            provinceUsedResourceCondition("gold", 20_000, province, save),
            provinceUsedResourceCondition("administrative", 2000, province, save),
            provinceUsedResourceCondition("diplomatic", 2000, province, save),
            provinceUsedResourceCondition("military", 2000, province, save),
         ],
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
         province: ["Lugdunensis"],
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
         province: ["Lugdunensis"],
         year: [220, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value < 0,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [200, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [240, Number.POSITIVE_INFINITY],
         techs: ["D1"],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "50"),
               value: getProvinceResource("christianity", province, save) >= 50,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [250, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsAtLeast$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value >= 0,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [260, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsAtLeast$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value >= 0,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [260, Number.POSITIVE_INFINITY],
         provinceUpgrades: ["Tetrarchy"],
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
         province: ["Lugdunensis"],
         year: [280, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value < 0,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [300, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Lugdunensis.name(), "100"),
               value: getProvinceResource("christianity", province, save) >= 100,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [330, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value < 0,
            },
         ],
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
         province: ["Lugdunensis"],
         year: [350, Number.POSITIVE_INFINITY],
         religion: ["Christianity"],
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
         province: ["Lugdunensis"],
         year: [380, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1StabilityIsLessThan$2, Province.Lugdunensis.name(), "0"),
               value: getProvinceStability(province, save).value < 0,
            },
         ],
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
