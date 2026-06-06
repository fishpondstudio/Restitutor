import { EmptyString, forEach, formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ManualEvents = {
   Manual1: {
      name: () => $t(L.ANewGovernor),
      image: EventImage.H1,
      desc: () => $t(L.ANewGovernorDesc),
      type: "manual",
      buttons: [
         {
            label: () => $t(L.AllHailTheNewGovernor),
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 12 },
            },
            custom: [
               {
                  desc: (province, save) => {
                     const governor = save.state.provinces[province]?.governor;
                     if (!governor) {
                        return EmptyString;
                     }
                     return $t(
                        L.OldGovernorHeirXAdministrativeYDiplomaticZMilitaryPYearsOldAndQ,
                        governor.male.name.join(" "),
                        formatNumber(governor.male.administrative),
                        formatNumber(governor.male.diplomatic),
                        formatNumber(governor.male.military),
                        formatNumber(governor.male.age),
                        formatNumber(governor.children.length),
                     );
                  },
               },
            ],
         },
      ],
   },
   Manual2: {
      name: () => $t(L.ANewGovernor),
      image: EventImage.H2,
      desc: () => $t(L.TheGovernorDiesWithoutAnHeirAndForAMomentNoOneRulesDesc),
      type: "manual",
      buttons: [
         {
            label: () => $t(L.WeShallManageButAtACost),
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 36 },
               Stability: { type: "add", value: -10, duration: 36 },
            },
            custom: [
               {
                  desc: (province, save) => {
                     const governor = save.state.provinces[province]?.governor;
                     if (!governor) {
                        return EmptyString;
                     }
                     return $t(
                        L.SenateGovernorXAdministrativeYDiplomaticZMilitaryPYearsOldAndQ,
                        governor.male.name.join(" "),
                        formatNumber(governor.male.administrative),
                        formatNumber(governor.male.diplomatic),
                        formatNumber(governor.male.military),
                        formatNumber(governor.male.age),
                        formatNumber(governor.children.length),
                     );
                  },
               },
            ],
         },
      ],
   },
   Manual3: {
      name: () => $t(L.ANewHeirIsBorn),
      image: EventImage.H3,
      desc: () => $t(L.ANewHeirIsBornDesc),
      type: "manual",
      buttons: [
         {
            label: () => $t(L.ItIsASignOfGoodFortune),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.ItIsARewardForOurFaith),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;

forEach(ManualEvents, (event, config) => {
   console.assert(!("condition" in config), `ManualEvent ${event} has a condition, but it should not have one!`);
});
