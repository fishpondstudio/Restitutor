import { filterInPlace, fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { CasusBelli } from "../definitions/CasusBelli";
import { Province } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import { availableDiplomatCondition, getMarriageAlliance, getRelation } from "../logic/DiplomacyLogic";
import {
   getProvinceCoreTileCount,
   getProvinceName,
   getProvinceResource,
   getProvinceStability,
} from "../logic/ProvinceLogic";
import { dissolveAllTreaties, forcePatronage, requireMinimumAttitude } from "../logic/TreatyLogic";
import { hasGeneralCondition } from "../logic/WarLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const LugdunensisEvent = {
   Lugdunensis1: {
      name: () => $t(L.BlitzkriegAgainstBelgica),
      image: EventImage.InvaderConqueredWarGoal,
      desc: () => $t(L.BlitzkriegAgainstBelgicaDesc),
      condition: {
         province: ["Lugdunensis"],
         coreTiles: [{ province: "Belgica", count: 2 }],
         year: [Number.NEGATIVE_INFINITY, 200],
      },
      buttons: [
         {
            label: () => $t(L.WeShallContinueOurCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
            custom: [
               {
                  effect: (province, save) => {
                     const relation = getRelation(province, "Belgica", save);
                     if (relation) {
                        relation.casusBelli.set("ConquestMission", {
                           monthsLeft: 5 * 12,
                        });
                     }
                  },
                  desc: (province, save) => {
                     return $t(
                        L.XGetsAYCasusBelliAgainstZForPYears,
                        getProvinceName(province, save),
                        CasusBelli.ConquestMission.name(),
                        getProvinceName("Belgica", save),
                        "5",
                     );
                  },
               },
            ],
         },
      ],
   },
   Lugdunensis2: {
      name: () => $t(L.AProsperousLugdunensis),
      image: EventImage.Y293,
      desc: () => $t(L.AProsperousLugdunensisDesc),
      condition: {
         province: ["Lugdunensis"],
         monthlyRevenue: 200,
         manpower: 50_000,
         techCount: 6,
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
      image: EventImage.Y262,
      desc: () => $t(L.ThePrideOfGaulRidesForthDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [200, 205],
         warPower: 8000,
         conditions: (province, save) => [hasGeneralCondition(province, save)],
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
      image: EventImage.InvaderConqueredWarGoal,
      desc: () => $t(L.AWeakenedBelgicaDesc),
      condition: {
         province: ["Lugdunensis"],
         coreTiles: [{ province: "Belgica", count: 6 }],
         year: [200, 220],
      },
      buttons: [
         {
            label: () => $t(L.WeShallContinueOurCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
            custom: [
               {
                  effect: (province, save) => {
                     const relation = getRelation(province, "Belgica", save);
                     if (relation) {
                        relation.casusBelli.set("ConquestMission", {
                           monthsLeft: 5 * 12,
                        });
                     }
                  },
                  desc: (province, save) => {
                     return $t(
                        L.XGetsAYCasusBelliAgainstZForPYears,
                        getProvinceName(province, save),
                        CasusBelli.ConquestMission.name(),
                        getProvinceName("Belgica", save),
                        "5",
                     );
                  },
               },
            ],
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
                        L.XNullifiesAllNegativeAttitudesTowardsY,
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
      image: EventImage.Emperor,
      desc: () => $t(L.BoundByBloodAndOathDesc),
      condition: {
         province: ["Lugdunensis"],
         coreTiles: [{ province: "Belgica", count: 6 }],
         year: [220, 250],
         conditions: (province, save) => [
            {
               name: $t(L.XHasAtMostYCoreTiles, Province.Belgica.name(), "3"),
               value: getProvinceCoreTileCount("Belgica", save) <= 3,
            },
            {
               name: $t(L.XHasAMarriageWithY, Province.Lugdunensis.name(), Province.Belgica.name()),
               value: getMarriageAlliance(province, "Belgica", save).length > 0,
            },
            availableDiplomatCondition(province, "Belgica", save),
            requireMinimumAttitude(province, "Belgica", 50, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.BelgicaShallServeAsOurLoyalClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Belgica", save);
                     forcePatronage(province, "Belgica", save);
                  },
                  desc: (province, save) => $t(L.XBecomesOurClient, Province.Belgica.name()),
               },
            ],
         },
      ],
   },
   Lugdunensis6: {
      name: () => $t(L.TheImperialMintInCrisis),
      image: EventImage.Y212,
      desc: () => $t(L.TheImperialMintInCrisisDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [220, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XStabilityIsLessThanY, Province.Lugdunensis.name(), "0"),
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
      image: EventImage.Saint,
      desc: () => $t(L.TheLegacyOfIrenaeusDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [200, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XChristianityInfluenceIsAtLeastY, Province.Lugdunensis.name(), "20"),
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
      image: EventImage.Martyrs,
      desc: () => $t(L.PilgrimsFromAquitaniaDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [240, Number.POSITIVE_INFINITY],
         techs: ["D1"],
         conditions: (province, save) => [
            {
               name: $t(L.XChristianityInfluenceIsAtLeastY, Province.Lugdunensis.name(), "50"),
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
               name: $t(L.XStabilityIsAtLeastY, Province.Lugdunensis.name(), "0"),
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
            label: () => $t(L.RequestAidFromX, Province.Narbonensis.name()),
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
      image: EventImage.Sail,
      desc: () => $t(L.TheArmoricanSmugglersDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [260, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XStabilityIsAtLeastY, Province.Lugdunensis.name(), "0"),
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
      image: EventImage.Y212,
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
            label: () => $t(L.RequestAidFromX, Province.Aquitania.name()),
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
               name: $t(L.XStabilityIsLessThanY, Province.Lugdunensis.name(), "0"),
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
            label: () => $t(L.InviteXToJoinDefenses, Province.Aquitania.name()),
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
      image: EventImage.Bishop,
      desc: () => $t(L.TheShepherdRisesOverLugdunensisDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [300, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XChristianityInfluenceIsAtLeastY, Province.Lugdunensis.name(), "100"),
               value: getProvinceResource("christianity", province, save) >= 100,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.GrantBishopExpandedAuthority),
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
      image: EventImage.Rome,
      desc: () => $t(L.TheBirthOfTheArmoricanConfederacyDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [330, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XStabilityIsLessThanY, Province.Lugdunensis.name(), "0"),
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
      image: EventImage.Saint2,
      desc: () => $t(L.MartinOfToursAndTheCloakDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [350, Number.POSITIVE_INFINITY],
         religion: "Christianity",
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
      image: EventImage.Refugee,
      desc: () => $t(L.TheTideOfRefugeesAtTheRhineDesc),
      condition: {
         province: ["Lugdunensis"],
         year: [380, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.XStabilityIsLessThanY, Province.Lugdunensis.name(), "0"),
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
