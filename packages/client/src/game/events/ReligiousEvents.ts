import { $t, L } from "../../utils/i18n";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ReligiousEvents = {
   Donatism: {
      name: () => $t(L.TheSchismAtCarthage),
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
} as const satisfies Record<string, IGameEventConfig>;
