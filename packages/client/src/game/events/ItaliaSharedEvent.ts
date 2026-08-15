import { $t, L } from "../../utils/i18n";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ItaliaSharedEvent = {
   ItaliaShared1: {
      name: () => $t(L.AnAfricanBridgehead),
      image: EventImage.NavalBattle,
      desc: () => $t(L.AnAfricanBridgeheadDesc),
      condition: {
         province: ["Italia", "Sicilia", "Corsica", "Sardinia"],
         annexAndCore: { Africa: 2 },
      },
      buttons: [
         {
            label: () => $t(L.PlantEstatesAlongTheAfricanShore),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BuildASecondCenterOfGovernment),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheAfricanBridgehead),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   ItaliaShared2: {
      name: () => $t(L.AFootholdInNarbonensis),
      image: EventImage.NavalBattle,
      desc: () => $t(L.AFootholdInNarbonensisDesc),
      condition: {
         province: ["Italia", "Sicilia", "Corsica", "Sardinia"],
         annexAndCore: { Narbonensis: 2 },
      },
      buttons: [
         {
            label: () => $t(L.SurveyAndTaxTheNewProvince),
            resources: { gold: 1000, administrative: 50 },
         },
         {
            label: () => $t(L.WelcomeTheProvincialNotables),
            resources: { consulPoint: 2, diplomatic: 50 },
         },
         {
            label: () => $t(L.RewardTheConqueringCommanders),
            resources: { generalSkillPoint: 2, military: 50 },
         },
      ],
   },
   ItaliaShared3: {
      name: () => $t(L.GatewayToHispania),
      image: EventImage.NavalBattle,
      desc: () => $t(L.GatewayToHispaniaDesc),
      condition: {
         province: ["Italia", "Sicilia", "Corsica", "Sardinia"],
         annexAndCore: { Tarraconensis: 2 },
      },
      buttons: [
         {
            label: () => $t(L.PressDeeperIntoHispania),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTheConqueredCommunities),
            modifiers: {
               Stability: { type: "add", value: 20, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProclaimOurWesternTriumph),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
