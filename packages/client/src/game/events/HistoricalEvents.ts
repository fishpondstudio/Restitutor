import { forEach, fromEntries, hasFlag } from "@project/shared/src/utils/Helper";
import { isPaused, revertSpeed } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { GallicEmpireProvinces, PalmyreneEmpireProvinces } from "../definitions/TileConstants";
import { GameOptionFlag } from "../GameOption";
import { getRelation } from "../logic/DiplomacyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const HistoricalEvents = {
   Y193: {
      name: () => $t(L.YearOfTheFiveEmperors),
      wikipedia: "Year_of_the_Five_Emperors",
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
            custom: [
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
            custom: [
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
            custom: [
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
      wikipedia: "Battle_of_Lugdunum",
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
      wikipedia: "Battle_of_Ctesiphon_(198)",
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
      wikipedia: "Septimius_Severus",
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
      wikipedia: "Constitutio_Antoniniana",
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
      wikipedia: "Caracalla",
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
      wikipedia: "Elagabalus",
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
      wikipedia: "Alexander_Severus",
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
      wikipedia: "Sasanian_Empire",
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
      wikipedia: "Severus_Alexander",
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
      wikipedia: "Year_of_the_Six_Emperors",
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
      wikipedia: "Secular_Games",
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
      wikipedia: "Battle_of_Abritus",
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
      wikipedia: "Valerian_(emperor)",
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
      wikipedia: "Gallic_Empire",
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
      wikipedia: "Palmyrene_Empire",
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
      wikipedia: "Aurelian",
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
      wikipedia: "Diocletian",
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
      wikipedia: "Tetrarchy",
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
      wikipedia: "Diocletianic_Persecution",
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
      wikipedia: "Battle_of_the_Milvian_Bridge",
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
            custom: [
               {
                  desc: (province, save) => $t(L.GainReligiousWarCasusBelliFor$1Years, "10"),
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
      wikipedia: "Edict_of_Milan",
      image: EventImage.Y313,
      desc: () => $t(L.TheEdictOfMilanDesc),
      condition: {
         year: [313, 313],
      },
      buttons: [
         {
            label: () => $t(L.WeGrantChristiansFreedomOfReligion),
            resources: { christianity: 50 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1 },
               ToleratedReligion: { type: "add", value: 1 },
            },
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
      wikipedia: "Constantinople",
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
      wikipedia: "Julian_(emperor)",
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
      wikipedia: "Battle_of_Adrianople",
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
      wikipedia: "Edict_of_Thessalonica",
      image: EventImage.Y380,
      desc: () => $t(L.TheEdictOfThessalonicaDesc),
      condition: {
         year: [380, 380],
      },
      buttons: [
         {
            label: () => $t(L.ChristianityIsTheOneAndOnlyTrueFaith),
            modifiers: {
               ChristianityYearly: { type: "add", value: 1 },
               Prestige: { type: "multiply", value: 0.1, duration: 5 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
            resources: { christianity: 100 },
            custom: [
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
      wikipedia: "Theodosius_I",
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
   Y409: {
      name: () => $t(L.TheSuebiSettleGallaecia),
      wikipedia: "Kingdom_of_the_Suebi",
      image: EventImage.Y409,
      desc: () => $t(L.TheSuebiSettleGallaeciaDesc),
      condition: {
         year: [409, 409],
      },
      buttons: [
         {
            label: () => $t(L.WeShallKeepAnEyeOnThem),
            spawnProvinces: ["Suebi"],
         },
      ],
   },
   Y410: {
      name: () => $t(L.TheEternalCityFalls),
      wikipedia: "Sack_of_Rome_(410)",
      image: EventImage.Y410,
      desc: () => $t(L.TheEternalCityFallsDesc),
      condition: {
         year: [410, 410],
      },
      buttons: [
         {
            label: () => $t(L.WeShallAssistRomeToRebuild),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WeShallFortifyOurOwnDefense),
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RomeIsWhereverLegionsStand),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Y418: {
      name: () => $t(L.AKingdomWithinTheEmpire),
      wikipedia: "Visigothic_Kingdom",
      image: EventImage.Y418,
      desc: () => $t(L.AKingdomWithinTheEmpireDesc),
      condition: {
         year: [418, 418],
      },
      buttons: [
         {
            label: () => $t(L.FineLetThemSettleThere),
            spawnProvinces: ["Visigoths"],
         },
      ],
   },
   Y429: {
      name: () => $t(L.TheVandalsCrossToAfrica),
      wikipedia: "Gaiseric",
      image: EventImage.Y429,
      desc: () => $t(L.TheVandalsCrossToAfricaDesc),
      condition: {
         year: [429, 429],
      },
      buttons: [
         {
            label: () => $t(L.AfricaMustBeDefendedAtAllCost),
            resources: { military: -50 },
         },
         {
            label: () => $t(L.NegotiateAndContainThem),
            resources: { diplomatic: -50 },
         },
      ],
   },
   Y439: {
      name: () => $t(L.CarthageHasFallenAgain),
      wikipedia: "Vandalic_Kingdom",
      image: EventImage.Y439,
      desc: () => $t(L.CarthageHasFallenAgainDesc),
      condition: {
         year: [439, 439],
      },
      buttons: [
         {
            label: () => $t(L.HmmOneMoreThreatToDealWith),
            spawnProvinces: ["Vandals"],
         },
      ],
   },
   Y443: {
      name: () => $t(L.TheBurgundiansOfSapaudia),
      wikipedia: "Kingdom_of_the_Burgundians",
      image: EventImage.Y443,
      desc: () => $t(L.TheBurgundiansOfSapaudiaDesc),
      condition: {
         year: [443, 443],
      },
      buttons: [
         {
            label: () => $t(L.LetsHopeTheyStayPeaceful),
            spawnProvinces: ["Burgundians"],
         },
      ],
   },
   Y445: {
      name: () => $t(L.TheCourtOfAttila),
      wikipedia: "Attila",
      image: EventImage.Y445,
      desc: () => $t(L.TheCourtOfAttilaDesc),
      condition: {
         year: [445, 445],
      },
      buttons: [
         {
            label: () => $t(L.WeShallPrepareForThisNewThreat),
            spawnProvinces: ["Huns"],
         },
      ],
   },
   Y446: {
      name: () => $t(L.TheLongHairedKings),
      wikipedia: "Franks",
      image: EventImage.Y446,
      desc: () => $t(L.TheLongHairedKingsDesc),
      condition: {
         year: [446, 446],
      },
      buttons: [
         {
            label: () => $t(L.LetUsSeeWhatComesOfThis),
            spawnProvinces: ["Franks"],
         },
      ],
   },
   Y449: {
      name: () => $t(L.TheSaxonShoreBreaks),
      wikipedia: "Anglo-Saxon_settlement_of_Britain",
      image: EventImage.Y449,
      desc: () => $t(L.TheSaxonShoreBreaksDesc),
      condition: {
         year: [449, 449],
      },
      buttons: [
         {
            label: () => $t(L.TheSignsAreNotEncouraging),
            spawnProvinces: ["Saxons"],
         },
      ],
   },
   Y451: {
      name: () => $t(L.TheScourgeOfGodIsHalted),
      wikipedia: "Battle_of_the_Catalaunian_Plains",
      image: EventImage.Y451,
      desc: () => $t(L.TheScourgeOfGodIsHaltedDesc),
      condition: {
         year: [451, 451],
      },
      buttons: [
         {
            label: () => $t(L.WeShallHonorOurBarbarianAllies),
            resources: { diplomatic: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TheVictoryBelongsToRomeAlone),
            resources: { military: 100 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Y453: {
      name: () => $t(L.TheAlemanniCrossTheRhine),
      wikipedia: "Alemanni",
      image: EventImage.Y453,
      desc: () => $t(L.TheAlemanniCrossTheRhineDesc),
      condition: {
         year: [453, 453],
      },
      buttons: [
         {
            label: () => $t(L.WeShouldNotUnderestimateThem),
            spawnProvinces: ["Alemanni"],
         },
      ],
   },
   Y455: {
      name: () => $t(L.FourteenDaysOfPlunder),
      wikipedia: "Sack_of_Rome_(455)",
      image: EventImage.Y455,
      desc: () => $t(L.FourteenDaysOfPlunderDesc),
      condition: {
         year: [455, 455],
      },
      buttons: [
         {
            label: () => $t(L.WeShallRansomTheCaptives),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WeHaveNothingLeftToGive),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Y471: {
      name: () => $t(L.TheKingOfTheOstrogoths),
      wikipedia: "Theodoric_the_Great",
      image: EventImage.Y471,
      desc: () => $t(L.TheKingOfTheOstrogothsDesc),
      condition: {
         year: [471, 471],
      },
      buttons: [
         {
            label: () => $t(L.WeShouldNotUnderestimateThem),
            spawnProvinces: ["Ostrogoths"],
         },
      ],
   },
   Y476: {
      name: () => $t(L.AnEmpireEndsInSilence),
      wikipedia: "Fall_of_the_Western_Roman_Empire",
      image: EventImage.Y476,
      achievement: "FallOfTheWesternEmpire",
      desc: () => $t(L.AnEmpireEndsInSilenceDesc),
      condition: {
         year: [476, 476],
      },
      buttons: [
         {
            label: () => $t(L.OurDestinyIsInOurOwnHands),
            resources: { consulPoint: 25, administrative: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 12 },
            },
            provinceUpgrades: ["OurOwnDestiny"],
         },
         {
            label: () => $t(L.OneEmpireOneEmperorInTheEast),
            resources: { diplomatic: 100 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
