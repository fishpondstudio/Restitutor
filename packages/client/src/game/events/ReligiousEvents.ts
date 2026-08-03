import { $t, L } from "../../utils/i18n";
import { durationToString } from "../definitions/Modifier";
import { ChristianReligions } from "../definitions/Religion";
import { TimedActions } from "../definitions/TimedAction";
import { startTimedAction } from "../logic/TimedActionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ReligiousEvents = {
   Donatism: {
      name: () => $t(L.TheSchismAtCarthage),
      wikipedia: "Donatism",
      image: EventImage.Donatism,
      desc: () => $t(L.TheSchismAtCarthageDesc),
      condition: {
         year: [311, 311],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheAfricanChurchIsDivided),
            spawnHeresies: ["Donatism"],
         },
      ],
   },
   Arianism: {
      name: () => $t(L.AriusChallengesTheBishops),
      wikipedia: "Arianism",
      image: EventImage.Arianism,
      desc: () => $t(L.AriusChallengesTheBishopsDesc),
      condition: {
         year: [318, 318],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheControversySpreads),
            spawnHeresies: ["Arianism"],
         },
      ],
   },
   Macedonianism: {
      name: () => $t(L.TheSpiritIsCalledIntoQuestion),
      wikipedia: "Pneumatomachi",
      image: EventImage.Macedonianism,
      desc: () => $t(L.TheSpiritIsCalledIntoQuestionDesc),
      condition: {
         year: [360, 360],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheCreedIsContestedOnceMore),
            spawnHeresies: ["Macedonianism"],
         },
      ],
   },
   Pelagianism: {
      name: () => $t(L.TheTeachingsOfPelagius),
      wikipedia: "Pelagianism",
      image: EventImage.Pelagianism,
      desc: () => $t(L.TheTeachingsOfPelagiusDesc),
      condition: {
         year: [412, 412],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheDebateOverGraceBegins),
            spawnHeresies: ["Pelagianism"],
         },
      ],
   },
   Nestorianism: {
      name: () => $t(L.NestoriusRejectsTheotokos),
      wikipedia: "Nestorianism",
      image: EventImage.Nestorianism,
      desc: () => $t(L.NestoriusRejectsTheotokosDesc),
      condition: {
         year: [428, 428],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.ThePulpitsRingWithControversy),
            spawnHeresies: ["Nestorianism"],
         },
      ],
   },
   Miaphysitism: {
      name: () => $t(L.ChalcedonDividesTheEast),
      wikipedia: "Miaphysitism",
      image: EventImage.Miaphysitism,
      desc: () => $t(L.ChalcedonDividesTheEastDesc),
      condition: {
         year: [452, 452],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheCouncilHasNotBroughtPeace),
            spawnHeresies: ["Miaphysitism"],
         },
      ],
   },
   Monothelitism: {
      name: () => $t(L.OneWillInChrist),
      wikipedia: "Monothelitism",
      image: EventImage.Monothelitism,
      desc: () => $t(L.OneWillInChristDesc),
      condition: {
         year: [638, 638],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.TheCompromiseSatisfiesNoOne),
            spawnHeresies: ["Monothelitism"],
         },
      ],
   },
   Iconoclasm: {
      name: () => $t(L.TheWarAgainstTheIcons),
      wikipedia: "Byzantine_Iconoclasm",
      image: EventImage.Iconoclasm,
      desc: () => $t(L.TheWarAgainstTheIconsDesc),
      condition: {
         year: [726, 726],
         playerOnly: true,
      },
      buttons: [
         {
            label: () => $t(L.SacredImagesBecomeABattleground),
            spawnHeresies: ["Iconoclasm"],
         },
      ],
   },
   EcumenicalCouncil1: {
      name: () => $t(L.TheFirstCouncilOfNicaea),
      wikipedia: "First_Council_of_Nicaea",
      image: EventImage.Aquitania5,
      desc: () => $t(L.FirstCouncilOfNicaeaDesc),
      condition: {
         year: [325, 325],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheNiceneCreed),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil1.name(),
                        durationToString(TimedActions.EcumenicalCouncil1.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil1", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil2: {
      name: () => $t(L.TheFirstCouncilOfConstantinople),
      wikipedia: "First_Council_of_Constantinople",
      image: EventImage.EcumenicalCouncil2,
      desc: () => $t(L.FirstCouncilOfConstantinopleDesc),
      condition: {
         year: [381, 381],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheDivinityOfTheHolySpirit),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil2.name(),
                        durationToString(TimedActions.EcumenicalCouncil2.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil2", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil3: {
      name: () => $t(L.TheCouncilOfEphesus),
      wikipedia: "Council_of_Ephesus",
      image: EventImage.EcumenicalCouncil3,
      desc: () => $t(L.CouncilOfEphesusDesc),
      condition: {
         year: [431, 431],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.RecognizeMaryAsTheotokos),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil3.name(),
                        durationToString(TimedActions.EcumenicalCouncil3.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil3", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil4: {
      name: () => $t(L.TheCouncilOfChalcedon),
      wikipedia: "Council_of_Chalcedon",
      image: EventImage.EcumenicalCouncil4,
      desc: () => $t(L.CouncilOfChalcedonDesc),
      condition: {
         year: [451, 451],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.AcceptTheChalcedonianDefinition),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil4.name(),
                        durationToString(TimedActions.EcumenicalCouncil4.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil4", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil5: {
      name: () => $t(L.TheSecondCouncilOfConstantinople),
      wikipedia: "Second_Council_of_Constantinople",
      image: EventImage.Lusitania7,
      desc: () => $t(L.SecondCouncilOfConstantinopleDesc),
      condition: {
         year: [553, 553],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.CondemnTheThreeChapters),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil5.name(),
                        durationToString(TimedActions.EcumenicalCouncil5.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil5", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil6: {
      name: () => $t(L.TheThirdCouncilOfConstantinople),
      wikipedia: "Third_Council_of_Constantinople",
      image: EventImage.EcumenicalCouncil6,
      desc: () => $t(L.ThirdCouncilOfConstantinopleDesc),
      condition: {
         year: [680, 680],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheTwoWillsOfChrist),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil6.name(),
                        durationToString(TimedActions.EcumenicalCouncil6.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil6", province, save),
               },
            ],
         },
      ],
   },
   EcumenicalCouncil7: {
      name: () => $t(L.TheSecondCouncilOfNicaea),
      wikipedia: "Second_Council_of_Nicaea",
      image: EventImage.EcumenicalCouncil7,
      desc: () => $t(L.SecondCouncilOfNicaeaDesc),
      condition: {
         year: [787, 787],
         religion: ChristianReligions,
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheVenerationOfIcons),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1CommencesAndLastsFor$2,
                        TimedActions.EcumenicalCouncil7.name(),
                        durationToString(TimedActions.EcumenicalCouncil7.duration),
                     ),
                  effect: (province, save) => startTimedAction("EcumenicalCouncil7", province, save),
               },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
