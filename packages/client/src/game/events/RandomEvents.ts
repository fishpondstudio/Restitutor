import { $t, L } from "../../utils/i18n";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const RandomEvents = {
   Random2: {
      name: () => $t(L.ALearnedStrangerArrives),
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.ALearnedStrangerArrivesDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.InviteTheScholarIntoOurService),
            resources: { gold: -1000, administrative: 100 },
         },
         {
            label: () => $t(L.RejectAnyForeignInfluence),
            resources: { diplomatic: -25 },
         },
      ],
   },
   Random3: {
      name: () => $t(L.HiddenLandsUnveiled),
      image: EventImage.RomanCampagna,
      desc: () => $t(L.HiddenLandsUnveiledDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.WeShallSeizeThoseEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 12 * 2 },
               Stability: { type: "add", value: -10, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.WeShallLetTheMatterRest),
            modifiers: {
               LandTax: { type: "multiply", value: -0.1, duration: 12 * 2 },
               Stability: { type: "add", value: 10, duration: 12 * 2 },
            },
         },
      ],
   },
   Random4: {
      name: () => $t(L.MerchantsAccusedOfMalfeasance),
      image: EventImage.Merchant1,
      desc: () => $t(L.MerchantsAccusedOfMalfeasanceDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.MakeAnExampleOfTheGuilty),
            modifiers: {
               TradeProfit: { type: "multiply", value: -0.1, duration: 12 * 2 },
               Prestige: { type: "add", value: 10, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.TurnABlindEyeForNow),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 12 * 2 },
               Prestige: { type: "add", value: -10, duration: 12 * 2 },
            },
         },
      ],
   },
   Random5: {
      name: () => $t(L.TheArmyDemandsItsDue),
      image: EventImage.GermanicusDeath,
      desc: () => $t(L.TheArmyDemandsItsDueDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.WeShallGrantTheirDemands),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 12 * 2 },
               ArmyMaintenance: { type: "multiply", value: 0.1, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.IgnoreTheirDemandsForNow),
            modifiers: {
               WarPower: { type: "multiply", value: -0.1, duration: 12 * 2 },
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 12 * 2 },
            },
         },
      ],
   },
   Random6: {
      name: () => $t(L.ThePriceOfWiseCounsel),
      image: EventImage.ConstantinopleBuilt,
      desc: () => $t(L.ThePriceOfWiseCounselDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.GrantAdvisorsHigherSalaries),
            resources: { administrative: 50, diplomatic: 50, military: 50 },
            modifiers: {
               AdvisorCost: { type: "multiply", value: 0.2, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.RefuseToIndulgeTheirRequest),
            resources: { administrative: -50, diplomatic: -50, military: -50 },
            modifiers: {
               AdvisorCost: { type: "multiply", value: -0.2, duration: 12 * 2 },
            },
         },
      ],
   },
   Random7: {
      name: () => $t(L.AnIntriguingOfferFromTheShadows),
      image: EventImage.Merchant2,
      desc: () => $t(L.AnIntriguingOfferFromTheShadowsDesc),
      type: "random",
      condition: {},
      buttons: [
         {
            label: () => $t(L.LetUsSeizeThisOpportunity),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 12 * 3 },
               TileOutput: { type: "multiply", value: 0.2, duration: 12 * 3 },
            },
         },
         {
            label: () => $t(L.WeShallExposeHisDeception),
            resources: {
               administrative: -25,
               diplomatic: -25,
            },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 12 * 3 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
