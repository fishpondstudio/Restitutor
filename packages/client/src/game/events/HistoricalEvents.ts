import { forEach, fromEntries, hasFlag } from "@project/shared/src/utils/Helper";
import { isPaused, revertSpeed } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { HunsSpawnYear } from "../definitions/Constant";
import { GallicEmpireProvinces, PalmyreneEmpireProvinces, Tiles } from "../definitions/TileConstants";
import { GameOptionFlag } from "../GameOption";
import { getRelation } from "../logic/DiplomacyLogic";
import { setTileNameOverrideEffect, startTimedActionEffect } from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const HistoricalEvents = {
   Y193: {
      name: () => $t(L.YearOfTheFiveEmperors),
      wikipedia: "Year_of_the_Five_Emperors",
      image: EventImage.CommodusDeath,
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
                  execute: (province, save) => {
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
                  execute: (province, save) => {
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
                  execute: (province, save) => {
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
      image: EventImage.TeutoburgBattle,
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
      image: EventImage.RomanTriumph1,
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
            label: () => $t(L.ShareTheSpoilsWithThePeople),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 12 },
            },
         },
      ],
   },
   Y211: {
      name: () => $t(L.LongLiveTheEmperorSeptimiusSeverus),
      wikipedia: "Septimius_Severus",
      image: EventImage.GermanicusDeath,
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
      image: EventImage.RomanForum1,
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
      image: EventImage.CaesarDeath1,
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
      image: EventImage.HeliogabalusRoses,
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
      image: EventImage.ClaudiusEmperor,
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
      image: EventImage.ValerianHumiliation,
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
      wikipedia: "Crisis_of_the_Third_Century",
      image: EventImage.CaesarDeath2,
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
            custom: [startTimedActionEffect("ThirdCenturyCrisis")],
         },
         {
            label: () => $t(L.WeShallMindOurOwnBusinessInstead),
            resources: { administrative: 50, diplomatic: 50 },
            custom: [startTimedActionEffect("ThirdCenturyCrisis")],
         },
      ],
   },
   Y238: {
      name: () => $t(L.YearOfTheSixEmperors),
      wikipedia: "Year_of_the_Six_Emperors",
      image: EventImage.RomanRuins1,
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
      image: EventImage.RomanTriumph2,
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
      image: EventImage.DeciusDeath,
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
      image: EventImage.ValerianHumiliation,
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
      image: EventImage.VercingetorixSurrenders,
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
      image: EventImage.ZenobiaSpeech,
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
      image: EventImage.ZenobiaCaptured,
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
      image: EventImage.DiocletianStatue,
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
      image: EventImage.RomanBathsPlan,
      desc: () => $t(L.TheRuleOfFourDesc),
      condition: {
         year: [293, 293],
      },
      buttons: [
         {
            label: () => $t(L.ConsolidateOurProvincialCommand),
            modifiers: {
               MakeCoreCost: { type: "multiply", value: -0.5 },
               ArmyMaintenance: { type: "multiply", value: -0.25 },
            },
            custom: [startTimedActionEffect("Tetrarchy")],
         },
         {
            label: () => $t(L.ReformOurProvincialAdministration),
            modifiers: {
               InfrastructureUpgradeCost: { type: "multiply", value: -0.5 },
               ProductionUpgradeCost: { type: "multiply", value: -0.5 },
               PopulationUpgradeCost: { type: "multiply", value: -0.5 },
               AdvisorCost: { type: "multiply", value: -0.25 },
            },
            custom: [startTimedActionEffect("Tetrarchy")],
         },
      ],
   },
   Y303: {
      name: () => $t(L.TheGreatPersecution),
      wikipedia: "Diocletianic_Persecution",
      image: EventImage.MartyrsPrayer,
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
      image: EventImage.MilvianBridge,
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
                  execute: (province, save) => {
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
      image: EventImage.ConstantineBaptism,
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
            custom: [startTimedActionEffect("ChristianEmpire")],
         },
         {
            label: () => $t(L.TheEmperorsDivinityMustBeRespected),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1 },
               WarPower: { type: "multiply", value: 0.1 },
            },
            custom: [startTimedActionEffect("ChristianEmpire")],
         },
      ],
   },
   Y330: {
      name: () => $t(L.TheNewRomeRises),
      wikipedia: "Constantinople",
      image: EventImage.ConstantinopleBuilt,
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
            custom: [setTileNameOverrideEffect(Tiles.Constantinople, "Constantinople")],
         },
         {
            label: () => $t(L.TheEternalCityCannotBeReplaced),
            resources: { administrative: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
            custom: [setTileNameOverrideEffect(Tiles.Constantinople, "Constantinople")],
         },
      ],
   },
   Y361: {
      name: () => $t(L.TheLastPaganEmperor),
      wikipedia: "Julian_(emperor)",
      image: EventImage.JulianDebate,
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
      image: EventImage.RomanDefeat,
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
      image: EventImage.AmbroseBarsTheodosius,
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
      image: EventImage.RomanForum2,
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
      image: EventImage.BarbarianCaptives,
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
      image: EventImage.SackOfRome1,
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
      image: EventImage.VisigothKing,
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
      image: EventImage.AugustineDeath,
      desc: () => $t(L.TheVandalsCrossToAfricaDesc),
      condition: {
         year: [429, 429],
      },
      buttons: [
         {
            label: () => $t(L.AfricaMustBeDefendedAtAllCosts),
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
      image: EventImage.CarthageDecline,
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
      image: EventImage.BuriedTreasure,
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
      image: EventImage.AttilasFeast,
      desc: () => $t(L.TheCourtOfAttilaDesc),
      condition: {
         year: [HunsSpawnYear, HunsSpawnYear],
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
      image: EventImage.ClovisBaptism,
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
      image: EventImage.VortigernAndRowena,
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
      image: EventImage.HunnicBattle,
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
      image: EventImage.TolbiacBattle,
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
      image: EventImage.SackOfRome2,
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
      image: EventImage.BenedictAndTotila,
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
      image: EventImage.Colosseum,
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
   Y482: {
      name: () => $t(L.ACreedToMendTheEmpire),
      wikipedia: "Henotikon",
      image: EventImage.AugustineDebate,
      desc: () => $t(L.ACreedToMendTheEmpireDesc),
      condition: {
         year: [482, 482],
      },
      buttons: [
         {
            label: () => $t(L.SeekConcordAmongOurCongregations),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Prestige: { type: "multiply", value: -0.05, duration: 36 },
            },
         },
         {
            label: () => $t(L.UpholdAClearConfessionOfFaith),
            resources: { administrative: -50, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
      ],
   },
   Y498: {
      name: () => $t(L.SoundCoinStrongTreasury),
      wikipedia: "Byzantine_coinage",
      image: EventImage.Merchant2,
      desc: () => $t(L.SoundCoinStrongTreasuryDesc),
      condition: {
         year: [498, 498],
      },
      buttons: [
         {
            label: () => $t(L.FundOurCurrencyExchange),
            resources: { gold: -500 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 36 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.EaseTheBurdenOnOurMerchants),
            modifiers: {
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
               TradeProfit: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: 5, duration: 36 },
            },
         },
      ],
   },
   Y518: {
      name: () => $t(L.ASoldierTakesThePurple),
      wikipedia: "Justin_I",
      image: EventImage.ClaudiusEmperor,
      desc: () => $t(L.ASoldierTakesThePurpleDesc),
      condition: {
         year: [518, 518],
      },
      buttons: [
         {
            label: () => $t(L.CultivateOurMilitaryPatrons),
            resources: { military: 75 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 24 } },
         },
         {
            label: () => $t(L.StrengthenOurCivilService),
            resources: { administrative: 75 },
            modifiers: { TileMaintenance: { type: "multiply", value: -0.1, duration: 24 } },
         },
      ],
   },
   Y527: {
      name: () => $t(L.TheDreamOfJustinian),
      wikipedia: "Justinian_I",
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.TheDreamOfJustinianDesc),
      condition: {
         year: [527, 527],
      },
      buttons: [
         {
            label: () => $t(L.ContributeToImperialAmbitions),
            resources: { gold: -500, diplomatic: 75 },
            modifiers: { Prestige: { type: "multiply", value: 0.15, duration: 36 } },
            custom: [startTimedActionEffect("JustinianReconquest")],
         },
         {
            label: () => $t(L.InvestInOurProvincialWorks),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 36 },
               InfrastructureUpgradeCost: { type: "multiply", value: -0.1, duration: 36 },
            },
            custom: [startTimedActionEffect("JustinianReconquest")],
         },
      ],
   },
   Y529: {
      name: () => $t(L.RomeWrittenIntoLaw),
      wikipedia: "Code_of_Justinian",
      image: EventImage.ImperialRescript,
      desc: () => $t(L.RomeWrittenIntoLawDesc),
      condition: {
         year: [529, 529],
      },
      buttons: [
         {
            label: () => $t(L.TrainOurMagistratesInTheCode),
            resources: { administrative: -100, gold: -500 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.PreserveOurLocalSettlements),
            resources: { diplomatic: -100 },
            modifiers: { Stability: { type: "add", value: 5 } },
         },
      ],
   },
   Y532: {
      name: () => $t(L.TheCityCriesNika),
      wikipedia: "Nika_riots",
      image: EventImage.PeasantRevolt,
      desc: () => $t(L.TheCityCriesNikaDesc),
      condition: {
         year: [532, 532],
      },
      buttons: [
         {
            label: () => $t(L.SendReliefFromOurProvince),
            resources: { gold: -500, diplomatic: 75 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 24 } },
         },
         {
            label: () => $t(L.KeepOrderInOurTowns),
            resources: { military: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 24 },
               Defense: { type: "multiply", value: 0.1, duration: 24 },
            },
         },
      ],
   },
   Y534: {
      name: () => $t(L.TheTriumphOfBelisarius),
      wikipedia: "Vandalic_War",
      image: EventImage.CaptiveTriumph,
      desc: () => $t(L.TheTriumphOfBelisariusDesc),
      condition: {
         year: [534, 534],
      },
      buttons: [
         {
            label: () => $t(L.CelebrateTheImperialVictory),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.RewardOurProvincialSoldiers),
            resources: { gold: -500 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: 0.15, duration: 36 },
            },
         },
      ],
   },
   Y541: {
      name: () => $t(L.DeathAlongTheTradeRoads),
      wikipedia: "Plague_of_Justinian",
      image: EventImage.PlagueBurial,
      desc: () => $t(L.DeathAlongTheTradeRoadsDesc),
      condition: {
         year: [541, 541],
      },
      buttons: [
         {
            label: () => $t(L.FundCareForOurSick),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
               TileMaintenance: { type: "multiply", value: 0.1, duration: 36 },
               Manpower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.RelieveOurStrugglingHouseholds),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
               TileOutput: { type: "multiply", value: -0.1, duration: 36 },
               Manpower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   Y565: {
      name: () => $t(L.TheRestorerIsGone),
      wikipedia: "Justinian_I",
      image: EventImage.MarcusAureliusDeath,
      desc: () => $t(L.TheRestorerIsGoneDesc),
      condition: {
         year: [565, 565],
      },
      buttons: [
         {
            label: () => $t(L.HonorHisMemoryInOurCities),
            resources: { gold: -300 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: 5, duration: 36 },
            },
         },
         {
            label: () => $t(L.PrepareOurOfficialsForSuccession),
            resources: { administrative: 75 },
            modifiers: { AdvisorCost: { type: "multiply", value: -0.1, duration: 36 } },
         },
      ],
   },
   Y567: {
      name: () => $t(L.TheKhaganOnTheDanube),
      wikipedia: "Pannonian_Avars",
      image: EventImage.AttilasFeast,
      desc: () => $t(L.TheKhaganOnTheDanubeDesc),
      condition: {
         year: [567, 567],
      },
      buttons: [
         {
            label: () => $t(L.WeMustReckonWithTheKhagan),
            spawnProvinces: ["Avars"],
         },
      ],
   },
   Y568: {
      name: () => $t(L.TheLombardsEnterItaly),
      wikipedia: "Lombards",
      image: EventImage.TribalCrossing,
      desc: () => $t(L.TheLombardsEnterItalyDesc),
      condition: {
         year: [568, 568],
      },
      buttons: [
         {
            label: () => $t(L.WeMustWatchTheirAdvance),
            spawnProvinces: ["Lombards"],
         },
      ],
   },
   Y582: {
      name: () => $t(L.TheReignOfMaurice),
      wikipedia: "Maurice_(emperor)",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.TheReignOfMauriceDesc),
      condition: {
         year: [582, 582],
      },
      buttons: [
         {
            label: () => $t(L.StrengthenOurMilitaryAdministration),
            resources: { administrative: -50 },
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.15, duration: 36 },
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.GiveOurTaxpayersBreathingRoom),
            modifiers: {
               LandTax: { type: "multiply", value: -0.15, duration: 36 },
               TileOutput: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
      ],
   },
   Y591: {
      name: () => $t(L.APersianKingInOurDebt),
      wikipedia: "Khosrow_II",
      image: EventImage.MountedParley,
      desc: () => $t(L.APersianKingInOurDebtDesc),
      condition: {
         year: [591, 591],
      },
      buttons: [
         {
            label: () => $t(L.CultivateOurEasternConnections),
            resources: { diplomatic: 75 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.StrengthenOurFrontierDefenses),
            resources: { military: 75 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   Y602: {
      name: () => $t(L.MutinyOnTheDanube),
      wikipedia: "Phocas",
      image: EventImage.CaesarDeath2,
      desc: () => $t(L.MutinyOnTheDanubeDesc),
      condition: {
         year: [602, 602],
      },
      buttons: [
         {
            label: () => $t(L.SettleOurSoldiersGrievances),
            resources: { gold: -500 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.SecureOurCivilAdministration),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: -0.05, duration: 36 },
            },
         },
      ],
   },
   Y610: {
      name: () => $t(L.DeliveranceFromAfrica),
      wikipedia: "Heraclius",
      image: EventImage.RomanGalley,
      desc: () => $t(L.DeliveranceFromAfricaDesc),
      condition: {
         year: [610, 610],
      },
      buttons: [
         {
            label: () => $t(L.SendOurSupportToTheNewCourt),
            resources: { gold: -300, diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 24 } },
         },
         {
            label: () => $t(L.RestoreConfidenceInOurGovernment),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 36 },
               TileMaintenance: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   Y622: {
      name: () => $t(L.TheHijra),
      wikipedia: "Hijra",
      image: EventImage.DesertCaravan,
      desc: () => $t(L.TheHijraDesc),
      achievement: "Hijra",
      condition: {
         year: [622, 622],
      },
      buttons: [
         {
            label: () => $t(L.WeShallFollowTheseDevelopments),
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
      ],
   },
   Y632: {
      name: () => $t(L.TheFirstCaliph),
      wikipedia: "Abu_Bakr",
      image: EventImage.ArabCouncil,
      desc: () => $t(L.TheFirstCaliphDesc),
      condition: {
         year: [632, 632],
      },
      buttons: [
         {
            label: () => $t(L.WeMustHeedThisEmergingPower),
            spawnProvinces: ["Caliphate"],
         },
      ],
   },
   Y663: {
      name: () => $t(L.AnEmperorInTheEternalCity),
      wikipedia: "Constans_II",
      image: EventImage.RomanAudience,
      desc: () => $t(L.AnEmperorInTheEternalCityDesc),
      condition: {
         year: [663, 663],
      },
      buttons: [
         {
            label: () => $t(L.SendOurRepresentativesToRome),
            resources: { gold: -300, diplomatic: 75 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 24 } },
         },
         {
            label: () => $t(L.RepairOurProvincialRoads),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 36 },
               InfrastructureUpgradeCost: { type: "multiply", value: -0.15, duration: 36 },
            },
         },
      ],
   },
   Y681: {
      name: () => $t(L.TheRiseOfBulgaria),
      wikipedia: "Asparuh_of_Bulgaria",
      image: EventImage.MountedParley,
      desc: () => $t(L.TheRiseOfBulgariaDesc),
      condition: {
         year: [681, 681],
      },
      buttons: [
         {
            label: () => $t(L.WeMustReckonWithTheBulgars),
            spawnProvinces: ["Bulgars"],
         },
      ],
   },
   Y692: {
      name: () => $t(L.TheCanonsOfTrullo),
      wikipedia: "Quinisext_Council",
      image: EventImage.CouncilOfTrent,
      desc: () => $t(L.TheCanonsOfTrulloDesc),
      condition: {
         year: [692, 692],
      },
      buttons: [
         {
            label: () => $t(L.SupportDisciplineInOurChurches),
            resources: { administrative: -50, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
         {
            label: () => $t(L.MediateAmongOurCongregations),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               ChristianityYearly: { type: "add", value: -1, duration: 36 },
            },
         },
      ],
   },
   Y695: {
      name: () => $t(L.ThePurpleChangesHands),
      wikipedia: "Twenty_Years'_Anarchy",
      image: EventImage.HonoriusCourt,
      desc: () => $t(L.ThePurpleChangesHandsDesc),
      condition: {
         year: [695, 695],
      },
      buttons: [
         {
            label: () => $t(L.BindOurOfficialsToOneAnother),
            resources: { administrative: -50 },
            modifiers: { Stability: { type: "add", value: 15, duration: 36 } },
            custom: [startTimedActionEffect("TwentyYearsAnarchy")],
         },
         {
            label: () => $t(L.SecureTheLoyaltyOfOurSoldiers),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 36 },
               Manpower: { type: "multiply", value: 0.1, duration: 36 },
            },
            custom: [startTimedActionEffect("TwentyYearsAnarchy")],
         },
      ],
   },
   Y705: {
      name: () => $t(L.TheEmperorReturnsFromExile),
      wikipedia: "Justinian_II",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.TheEmperorReturnsFromExileDesc),
      condition: {
         year: [705, 705],
      },
      buttons: [
         {
            label: () => $t(L.RenewOurTiesWithTheCourt),
            resources: { diplomatic: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
         {
            label: () => $t(L.ReconcileOurDividedCommunities),
            resources: { gold: -300 },
            modifiers: { Stability: { type: "add", value: 15, duration: 36 } },
         },
      ],
   },
   Y717: {
      name: () => $t(L.TheRiseOfLeoIII),
      wikipedia: "Leo_III_the_Isaurian",
      image: EventImage.ClaudiusEmperor,
      desc: () => $t(L.TheRiseOfLeoIIIDesc),
      condition: {
         year: [717, 717],
      },
      buttons: [
         {
            label: () => $t(L.RebuildOurAdministration),
            resources: { administrative: 75 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.MakeOurDefensesReady),
            resources: { military: 75 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 36 } },
         },
      ],
   },
   Y750: {
      name: () => $t(L.BlackBannersInTheEast),
      wikipedia: "Abbasid_Revolution",
      image: EventImage.ArabCouncil,
      desc: () => $t(L.BlackBannersInTheEastDesc),
      condition: {
         year: [750, 750],
      },
      buttons: [
         {
            label: () => $t(L.SeekContactsWithTheNewCourt),
            resources: { gold: -300, diplomatic: 100 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.StrengthenOurProvincialDefenses),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 36 },
               Manpower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   Y756: {
      name: () => $t(L.LandsForSaintPeter),
      wikipedia: "Donation_of_Pepin",
      image: EventImage.PapalGrant,
      desc: () => $t(L.LandsForSaintPeterDesc),
      condition: {
         year: [756, 756],
      },
      buttons: [
         {
            label: () => $t(L.SupportTheClaimsOfSaintPeter),
            resources: { gold: -300, christianity: 15 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => $t(L.PetitionForRomanRights),
            resources: { diplomatic: -50, administrative: 75 },
            modifiers: { Prestige: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   Y768: {
      name: () => $t(L.TheRiseOfCharlemagne),
      wikipedia: "Charlemagne",
      image: EventImage.FrankishKing,
      desc: () => $t(L.TheRiseOfCharlemagneDesc),
      condition: {
         year: [768, 768],
      },
      buttons: [
         {
            label: () => $t(L.CultivateOurFrankishConnections),
            resources: { diplomatic: 75 },
            modifiers: { ImproveRelationsRate: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => $t(L.AffirmOurOwnProvincialStanding),
            resources: { administrative: 75 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   Y797: {
      name: () => $t(L.TheThroneBelongsToIrene),
      wikipedia: "Irene_of_Athens",
      image: EventImage.ZenobiaSpeech,
      desc: () => $t(L.TheThroneBelongsToIreneDesc),
      condition: {
         year: [797, 797],
      },
      buttons: [
         {
            label: () => $t(L.SendOurRecognitionToIrene),
            resources: { diplomatic: 75 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => $t(L.CondemnTheViolenceAtCourt),
            resources: { administrative: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
      ],
   },
   Y800: {
      name: () => $t(L.TwoEmperorsOneRomanLegacy),
      wikipedia: "Charlemagne",
      image: EventImage.Coronation,
      desc: () => $t(L.TwoEmperorsOneRomanLegacyDesc),
      achievement: "CharlemagneCoronation",
      condition: {
         year: [800, 800],
      },
      buttons: [
         {
            label: () => $t(L.StandByTheEmperorInTheEast),
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1 } },
         },
         {
            label: () => $t(L.RecognizeTheWesternImperialCrown),
            resources: { administrative: 100 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.1 } },
         },
         {
            label: () => $t(L.LetOurOwnDeedsProclaimRome),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
