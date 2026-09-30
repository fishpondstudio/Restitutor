import { setFlag } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { ChristianReligions } from "../definitions/Religion";
import { GameStateFlags } from "../GameState";
import { startTimedActionEffect } from "../logic/MissionLogic";
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
      image: EventImage.EucharistDebate,
      desc: () => $t(L.FirstCouncilOfNicaeaDesc),
      condition: {
         year: [325, 325],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheNiceneCreed),
            custom: [startTimedActionEffect("EcumenicalCouncil1")],
         },
      ],
   },
   EcumenicalCouncil2: {
      name: () => $t(L.TheFirstCouncilOfConstantinople),
      wikipedia: "First_Council_of_Constantinople",
      image: EventImage.ChristTeaching,
      desc: () => $t(L.FirstCouncilOfConstantinopleDesc),
      condition: {
         year: [381, 381],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheDivinityOfTheHolySpirit),
            custom: [
               startTimedActionEffect("EcumenicalCouncil2"),
               {
                  desc: () => $t(L.$1BecomesAnApostolicSee, $t(L.TileConstantinople)),
                  execute: (province, save) => {
                     save.state.flags = setFlag(save.state.flags, GameStateFlags.ConstantinopleApostolicSee);
                  },
               },
            ],
         },
      ],
   },
   EcumenicalCouncil3: {
      name: () => $t(L.TheCouncilOfEphesus),
      wikipedia: "Council_of_Ephesus",
      image: EventImage.AugustineDebate,
      desc: () => $t(L.CouncilOfEphesusDesc),
      condition: {
         year: [431, 431],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.RecognizeMaryAsTheotokos),
            custom: [startTimedActionEffect("EcumenicalCouncil3")],
         },
      ],
   },
   EcumenicalCouncil4: {
      name: () => $t(L.TheCouncilOfChalcedon),
      wikipedia: "Council_of_Chalcedon",
      image: EventImage.HusTrial,
      desc: () => $t(L.CouncilOfChalcedonDesc),
      condition: {
         year: [451, 451],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.AcceptTheChalcedonianDefinition),
            custom: [startTimedActionEffect("EcumenicalCouncil4")],
         },
      ],
   },
   EcumenicalCouncil5: {
      name: () => $t(L.TheSecondCouncilOfConstantinople),
      wikipedia: "Second_Council_of_Constantinople",
      image: EventImage.StephenDebate,
      desc: () => $t(L.SecondCouncilOfConstantinopleDesc),
      condition: {
         year: [553, 553],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.CondemnTheThreeChapters),
            custom: [startTimedActionEffect("EcumenicalCouncil5")],
         },
      ],
   },
   EcumenicalCouncil6: {
      name: () => $t(L.TheThirdCouncilOfConstantinople),
      wikipedia: "Third_Council_of_Constantinople",
      image: EventImage.PaulPreaching,
      desc: () => $t(L.ThirdCouncilOfConstantinopleDesc),
      condition: {
         year: [680, 680],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.AffirmTheTwoWillsOfChrist),
            custom: [startTimedActionEffect("EcumenicalCouncil6")],
         },
      ],
   },
   EcumenicalCouncil7: {
      name: () => $t(L.TheSecondCouncilOfNicaea),
      wikipedia: "Second_Council_of_Nicaea",
      image: EventImage.ReligiousTriumph,
      desc: () => $t(L.SecondCouncilOfNicaeaDesc),
      condition: {
         year: [787, 787],
         religion: new Set(ChristianReligions),
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheVenerationOfIcons),
            custom: [startTimedActionEffect("EcumenicalCouncil7")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
