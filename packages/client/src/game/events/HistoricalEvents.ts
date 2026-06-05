import { forEach, fromEntries, hasFlag } from "@project/shared/src/utils/Helper";
import { isPaused, revertSpeed } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { addProvinceUpgrade } from "../actions/ProvinceUpgrades";
import { GallicEmpireProvinces, PalmyreneEmpireProvinces } from "../definitions/TileConstants";
import { GameOptionFlag } from "../GameOption";
import { getRelation } from "../logic/DiplomacyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const HistoricalEvents = {
   Y193: {
      name: () => $t(L.YearOfTheFiveEmperors),
      image: EventImage.Y193,
      desc: () => $t(L.YearOfTheFiveEmperorsDesc),
      condition: {
         year: [193, 193],
      },
      buttons: [
         {
            label: () => $t(L.LetEdictAndStatuteRestoreTheEmpiresOrder),
            resources: {
               administrative: 100,
            },
            effects: [
               {
                  effect: (province, save) => {
                     if (!hasFlag(save.options.flag, GameOptionFlag.PauseGameOnEvent) && isPaused()) {
                        revertSpeed();
                     }
                  },
               },
            ],
         },
         {
            label: () => $t(L.LetEnvoysAndTreatiesBindTheProvincesAgain),
            resources: {
               diplomatic: 100,
            },
            effects: [
               {
                  effect: (province, save) => {
                     if (!hasFlag(save.options.flag, GameOptionFlag.PauseGameOnEvent) && isPaused()) {
                        revertSpeed();
                     }
                  },
               },
            ],
         },
         {
            label: () => $t(L.LetTheEaglesMarchAndUnityFollowInTheirWake),
            resources: {
               military: 100,
            },
            effects: [
               {
                  effect: (province, save) => {
                     if (!hasFlag(save.options.flag, GameOptionFlag.PauseGameOnEvent) && isPaused()) {
                        revertSpeed();
                     }
                  },
               },
            ],
         },
      ],
   },
   Y197: {
      name: () => $t(L.BattleOfLugdunum),
      image: EventImage.Y197,
      desc: () => $t(L.BattleOfLugdunumDesc),
      condition: {
         year: [197, 197],
      },
      buttons: [
         {
            label: () => $t(L.PeopleWillRecover),
            modifiers: {
               Manpower: { type: "multiply", value: -0.2, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallHelpThem),
            modifiers: {
               TileMaintenance: { type: "multiply", value: 0.2, duration: 12 },
            },
         },
      ],
   },
   Y198: {
      name: () => $t(L.GoodNewsFromTheEast),
      image: EventImage.Y198,
      desc: () => $t(L.GoodNewsFromTheEastDesc),
      condition: {
         year: [198, 198],
      },
      buttons: [
         {
            label: () => $t(L.TheWarSpoilsBelongToUs),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.ShareWarSpoilsWithPeople),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 12 },
            },
         },
      ],
   },
   Y211: {
      name: () => $t(L.LongLiveTheEmperorSeptimiusSeverus),
      image: EventImage.Y211,
      desc: () => $t(L.LongLiveTheEmperorSeptimiusSeverusDesc),
      condition: {
         year: [211, 211],
      },
      buttons: [
         {
            label: () => $t(L.WeShallEnrichTheSoldiers),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 12 },
               Stability: { type: "add", value: -5, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallFocusOnOurPeople),
            modifiers: {
               WarPower: { type: "multiply", value: -0.05, duration: 12 },
               Stability: { type: "add", value: 10, duration: 12 },
            },
         },
      ],
   },
   Y212: {
      name: () => $t(L.AllAreRomanCitizens),
      image: EventImage.Y212,
      desc: () => $t(L.AllAreRomanCitizensDesc),
      condition: {
         year: [212, 212],
      },
      buttons: [
         {
            label: () => $t(L.ImmediatelyGrantCitizenship),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.GraduallyRollOutCitizenship),
            modifiers: {
               LandTax: { type: "multiply", value: 0.5, duration: 12 },
               TileOutput: { type: "multiply", value: 0.5, duration: 12 },
            },
         },
      ],
   },
   Y217: {
      name: () => $t(L.BloodOnTheRoadToCarrhae),
      image: EventImage.Y217,
      desc: () => $t(L.BloodOnTheRoadToCarrhaeDesc),
      condition: {
         year: [217, 217],
      },
      buttons: [
         {
            label: () => $t(L.CondemnTheAssassinationOfCaracalla),
            resources: { diplomatic: -25 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 12 },
            },
         },
         {
            label: () => $t(L.CelebrateTheDeathOfTheTyrant),
            resources: { administrative: -25 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 12 },
            },
         },
      ],
   },
   Y218: {
      name: () => $t(L.TheGodFromTheEast),
      image: EventImage.Y218,
      desc: () => $t(L.TheGodFromTheEastDesc),
      condition: {
         year: [218, 218],
      },
      buttons: [
         {
            label: () => $t(L.AllHailTheEmperorElagabalus),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.WeShallStandByOurTraditions),
            resources: { administrative: 50, diplomatic: 50 },
         },
      ],
   },
   Y222: {
      name: () => $t(L.ThePraetoriansDecide),
      image: EventImage.Y222,
      desc: () => $t(L.ThePraetoriansDecideDesc),
      condition: {
         year: [222, 222],
      },
      buttons: [
         {
            label: () => $t(L.AllHailTheEmperorAlexanderSeverus),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.AcceptTheGiftFromTheNewEmperor),
            resources: { gold: 1000 },
         },
      ],
   },
   Y224: {
      name: () => $t(L.ANewPersiaRises),
      image: EventImage.Y224,
      desc: () => $t(L.ANewPersiaRisesDesc),
      condition: {
         year: [224, 224],
      },
      buttons: [
         {
            label: () => $t(L.WeShallStrengthenOurDefense),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 12 },
               LandTax: { type: "multiply", value: 0.15, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallStrengthenOurArmy),
            modifiers: {
               WarPower: { type: "multiply", value: 0.25, duration: 12 },
            },
         },
      ],
   },
   Y235: {
      name: () => $t(L.TheAgeOfSoldiers),
      image: EventImage.Y235,
      desc: () => $t(L.TheAgeOfSoldiersDesc),
      condition: {
         year: [235, 235],
      },
      buttons: [
         {
            label: () => $t(L.CondemnTheAssassinationOfAlexanderSeverus),
            modifiers: {
               Prestige: { type: "multiply", value: 0.25, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallMindOurOwnBusinessInstead),
            resources: { administrative: 50, diplomatic: 50 },
         },
      ],
   },
   Y238: {
      name: () => $t(L.YearOfTheSixEmperors),
      image: EventImage.Y238,
      desc: () => $t(L.YearOfTheSixEmperorsDesc),
      condition: {
         year: [238, 238],
      },
      buttons: [
         {
            label: () => $t(L.WeShallSurviveJustBarely),
            modifiers: {
               Stability: { type: "add", value: -5, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallOvercomeAtAnyCost),
            resources: { administrative: -50 },
         },
      ],
   },
   Y248: {
      name: () => $t(L.OneThousandYearsOfRome),
      image: EventImage.Y248,
      desc: () => $t(L.OneThousandYearsOfRomeDesc),
      condition: {
         year: [248, 248],
      },
      buttons: [
         {
            label: () => $t(L.WeShallCelebrateAndSpareNoCost),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 20, duration: 12 },
            },
         },
         {
            label: () => $t(L.WeShallCommemorateWithRestraint),
            resources: { gold: -100 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 12 },
            },
         },
      ],
   },
   Y251: {
      name: () => $t(L.TheEmperorWhoFellInBattle),
      image: EventImage.Y251,
      desc: () => $t(L.TheEmperorWhoFellInBattleDesc),
      condition: {
         year: [251, 251],
      },
      buttons: [
         {
            label: () => $t(L.WeMournTheLossOfOurBraveEmperor),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 12 },
            },
         },
         {
            label: () => $t(L.HeIsAUsurperAnyway),
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 12 },
            },
         },
      ],
   },
   Y260: {
      name: () => $t(L.TheCaptiveEmperor),
      image: EventImage.Y224,
      desc: () => $t(L.TheCaptiveEmperorDesc),
      condition: {
         year: [260, 260],
      },
      buttons: [
         {
            label: () => $t(L.WeMustPrepareForOurRevenge),
            resources: { military: -100 },
         },
         {
            label: () => $t(L.WeShallBuryThisUnfortunateNews),
            resources: { administrative: -100 },
         },
      ],
   },
   Y262: {
      name: () => $t(L.TheSunderingOfTheWest),
      image: EventImage.Y262,
      desc: () => $t(L.TheSunderingOfTheWestDesc),
      condition: {
         year: [262, 262],
      },
      buttons: [
         {
            label: () => $t(L.WeSupportAnIndependentGallia),
            attitudes: {
               ...fromEntries(GallicEmpireProvinces.map((p) => [p, { type: "add", value: 20, duration: 12 * 10 }])),
            },
         },
         {
            label: () => $t(L.WeSwearOurAllegianceToRome),
            infiltration: { ...fromEntries(GallicEmpireProvinces.map((p) => [p, 20])) },
            casusBelli: {
               ...fromEntries(
                  GallicEmpireProvinces.map((p) => [p, { casusBelli: "ConquestMission", duration: 12 * 10 }]),
               ),
            },
         },
      ],
   },
   Y270: {
      name: () => $t(L.TheQueenOfTheEast),
      image: EventImage.Y270,
      desc: () => $t(L.TheQueenOfTheEastDesc),
      condition: {
         year: [270, 270],
      },
      buttons: [
         {
            label: () => $t(L.WeSupportAnIndependentPalmyra),
            attitudes: {
               ...fromEntries(PalmyreneEmpireProvinces.map((p) => [p, { type: "add", value: 20, duration: 12 * 10 }])),
            },
         },
         {
            label: () => $t(L.WeSwearOurAllegianceToRome),
            infiltration: { ...fromEntries(PalmyreneEmpireProvinces.map((p) => [p, 20])) },
            casusBelli: {
               ...fromEntries(
                  PalmyreneEmpireProvinces.map((p) => [p, { casusBelli: "ConquestMission", duration: 12 * 10 }]),
               ),
            },
         },
      ],
   },
   Y272: {
      name: () => $t(L.RestitutorOrbis),
      image: EventImage.Y272,
      desc: () => $t(L.RestitutorOrbisDesc),
      condition: {
         year: [272, 272],
      },
      buttons: [
         {
            label: () => $t(L.AllHailTheEmperorAurelian),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.WeShallBeOurOwnRestorer),
            resources: { military: 100 },
         },
      ],
   },
   Y284: {
      name: () => $t(L.TheRiseOfDiocletian),
      image: EventImage.Y284,
      desc: () => $t(L.TheRiseOfDiocletianDesc),
      condition: {
         year: [284, 284],
      },
      buttons: [
         {
            label: () => $t(L.AllHailTheEmperorDiocletian),
            resources: { administrative: 100, diplomatic: 100, military: 100 },
         },
         {
            label: () => $t(L.TheEmperorWillBringStability),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.TheEmperorWillRestoreOurGlory),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
      ],
   },
   Y293: {
      name: () => $t(L.TheRuleOfFour),
      image: EventImage.Y293,
      desc: () => $t(L.TheRuleOfFourDesc),
      condition: {
         year: [293, 293],
      },
      buttons: [
         {
            label: () => $t(L.ItsTimeWeAdoptTheTetrarchy),
            modifiers: {
               MakeCoreCost: { type: "multiply", value: -0.5 },
               ArmyMaintenance: { type: "multiply", value: -0.25 },
            },
            provinceUpgrades: ["Tetrarchy"],
         },
         {
            label: () => $t(L.RomeOnlyNeedsOneEmperor),
            modifiers: {
               InfrastructureUpgradeCost: { type: "multiply", value: -0.5 },
               ProductionUpgradeCost: { type: "multiply", value: -0.5 },
               PopulationUpgradeCost: { type: "multiply", value: -0.5 },
               AdvisorCost: { type: "multiply", value: -0.25 },
            },
         },
      ],
   },
   Y303: {
      name: () => $t(L.TheGreatPersecution),
      image: EventImage.Y303,
      desc: () => $t(L.TheGreatPersecutionDesc),
      condition: {
         year: [303, 303],
      },
      buttons: [
         {
            label: () => $t(L.ToleranceIsWhatUnitesOurEmpire),
            resources: { christianity: 20 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 10 * 12 },
               Stability: { type: "add", value: 10, duration: 10 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 10 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.ChristianityHasNoPlaceInOurEmpire),
            resources: { christianity: -20 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 10 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 10 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 10 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
      ],
   },
   Y312: {
      name: () => $t(L.InThisSignYouShallConquer),
      image: EventImage.Y312,
      desc: () => $t(L.InThisSignYouShallConquerDesc),
      condition: {
         year: [312, 312],
      },
      buttons: [
         {
            label: () => $t(L.WeShallConquerInTheNameOfTheGod),
            modifiers: {
               WarPower: { type: "multiply", value: 0.25, duration: 10 * 12 },
            },
            effects: [
               {
                  desc: (province, save) => $t(L.GainReligiousWarCasusBelliForXYears, "10"),
                  effect: (province, save) => {
                     const state = save.state.provinces[province];
                     if (!state) {
                        return;
                     }
                     forEach(save.state.provinces, (otherProvince, otherState) => {
                        if (otherProvince === province) {
                           return;
                        }
                        if (state.religion !== otherState.religion) {
                           const relation = getRelation(province, otherProvince, save);
                           if (relation) {
                              relation.casusBelli.set("ReligiousWar", {
                                 monthsLeft: 10 * 12,
                              });
                           }
                        }
                     });
                  },
               },
            ],
         },
         {
            label: () => $t(L.WeShallFocusOnOurOwnAffairs),
            modifiers: {
               LandTax: { type: "multiply", value: 0.25, duration: 10 * 12 },
               TileOutput: { type: "multiply", value: 0.25, duration: 10 * 12 },
            },
         },
      ],
   },
   Y313: {
      name: () => $t(L.TheEdictOfMilan),
      image: EventImage.Y313,
      desc: () => $t(L.TheEdictOfMilanDesc),
      condition: {
         year: [313, 313],
      },
      buttons: [
         {
            label: () => $t(L.WeGrantChristiansFreedomOfReligion),
            resources: { christianity: 50 },
            stats: { christianityYearly: 1 },
            effects: [
               {
                  desc: (province, save) => $t(L.EdictOfMilanRemovesMinorReligionPenalties),
                  effect: (province, save) => {
                     addProvinceUpgrade("EdictOfMilan", province, save);
                  },
               },
            ],
         },
         {
            label: () => $t(L.TheEmperorsDivinityMustBeRespected),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1 },
               WarPower: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   Y330: {
      name: () => $t(L.TheNewRomeRises),
      image: EventImage.Y330,
      desc: () => $t(L.TheNewRomeRisesDesc),
      condition: {
         year: [330, 330],
      },
      buttons: [
         {
            label: () => $t(L.RomeFollowsWhereTheEmperorLeads),
            resources: { diplomatic: 100 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.TheEternalCityCannotBeReplaced),
            resources: { administrative: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
      ],
   },
   Y361: {
      name: () => $t(L.TheLastPaganEmperor),
      image: EventImage.Y361,
      desc: () => $t(L.TheLastPaganEmperorDesc),
      condition: {
         year: [361, 361],
      },
      buttons: [
         {
            label: () => $t(L.WeShallFollowEmperorJuliansLead),
            resources: { christianity: -20 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 5 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.TheShipHasSailedChristianityIsHereToStay),
            resources: { christianity: 20 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 5 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
      ],
   },
   Y378: {
      name: () => $t(L.TheCatastropheAtAdrianople),
      image: EventImage.Y378,
      desc: () => $t(L.TheCatastropheAtAdrianopleDesc),
      condition: {
         year: [378, 378],
      },
      buttons: [
         {
            label: () => $t(L.WeMustAvengeEmperorValenssDeath),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 10 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.HeIsAnUndistinguishedEmperorAnyway),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 10 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
      ],
   },
   Y380: {
      name: () => $t(L.TheEdictOfThessalonica),
      image: EventImage.Y380,
      desc: () => $t(L.TheEdictOfThessalonicaDesc),
      condition: {
         year: [380, 380],
      },
      buttons: [
         {
            label: () => $t(L.ChristianityIsTheOneAndOnlyTrueFaith),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 5 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
            resources: { christianity: 100 },
            stats: { christianityYearly: 1 },
            effects: [
               {
                  desc: (province, save) => $t(L.EdictOfThessalonicaChristianityProvinceEffects),
               },
            ],
         },
         {
            label: () => $t(L.PeopleShouldBeFreeToChooseTheirFaith),
            modifiers: {
               Stability: { type: "add", value: 10 },
               Prestige: { type: "multiply", value: 0.1 },
               WarPower: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   Y395: {
      name: () => $t(L.TheFinalDivision),
      image: EventImage.Y395,
      desc: () => $t(L.TheFinalDivisionDesc),
      condition: {
         year: [395, 395],
      },
      buttons: [
         {
            label: () => $t(L.DiplomacyWillReuniteTheEmpireOnceMore),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.OnlyWithTheSwordCanUnityBeRestored),
            resources: { military: 100 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
