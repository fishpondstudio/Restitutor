import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { getProvinceResource } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const NarbonensisEvent = {
   Narbonensis1: {
      name: () => $t(L.TheGarumAndOilTradeOfNarbo),
      image: EventImage.Narbonensis1,
      desc: () => $t(L.TheGarumAndOilTradeOfNarboDesc),
      condition: {
         province: ["Narbonensis"],
         year: [196, 196],
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheMediterraneanTrade),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LevyDutiesUponTheHarbor),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis2: {
      name: () => $t(L.TheGreekMerchantsOfMassilia),
      image: EventImage.Narbonensis2,
      desc: () => $t(L.TheGreekMerchantsOfMassiliaDesc),
      condition: {
         province: ["Narbonensis"],
         year: [230, 230],
      },
      buttons: [
         {
            label: () => $t(L.RespectTheOldGreekPrivileges),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BringMassiliaToHeel),
            resources: { gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis3: {
      name: () => $t(L.TheWatersOfNemausus),
      image: EventImage.Narbonensis3,
      desc: () => $t(L.TheWatersOfNemaususDesc),
      condition: {
         province: ["Narbonensis"],
         year: [350, 350],
      },
      buttons: [
         {
            label: () => $t(L.FundTheAqueductsRepair),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheChannelsDecay),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis4: {
      name: () => $t(L.TheMartyrdomOfGenesiusAtArelate),
      image: EventImage.Narbonensis4,
      desc: () => $t(L.TheMartyrdomOfGenesiusAtArelateDesc),
      condition: {
         province: ["Narbonensis"],
         year: [305, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Narbonensis.name(), "10"),
               value: getProvinceResource("christianity", province, save) >= 10,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.RaiseAShrineToTheMartyr),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceTheEmperorsEdict),
            resources: { christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis5: {
      name: () => $t(L.TheCouncilOfArles),
      image: EventImage.Narbonensis5,
      desc: () => $t(L.TheCouncilOfArlesDesc),
      condition: {
         province: ["Narbonensis"],
         year: [314, 314],
      },
      buttons: [
         {
            label: () => $t(L.HostTheAssembledBishops),
            resources: { christianity: 10, diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheChurchAtaDistance),
            resources: { christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis6: {
      name: () => $t(L.ArelateTheRomeOfGaul),
      image: EventImage.Narbonensis6,
      desc: () => $t(L.ArelateTheRomeOfGaulDesc),
      condition: {
         province: ["Narbonensis"],
         year: [400, 400],
      },
      buttons: [
         {
            label: () => $t(L.WelcomeThePrefectureToArelate),
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            resources: { administrative: 50 },
         },
         {
            label: () => $t(L.PetitionForImperialPatronage),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis7: {
      name: () => $t(L.TheBridgeOfBoatsAtArelate),
      image: EventImage.Narbonensis7,
      desc: () => $t(L.TheBridgeOfBoatsAtArelateDesc),
      condition: {
         province: ["Narbonensis"],
         year: [265, 265],
      },
      buttons: [
         {
            label: () => $t(L.MaintainTheGreatBridge),
            resources: { gold: -300 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LevyATollUponTheCrossing),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis8: {
      name: () => $t(L.TheMonksOfLerins),
      image: EventImage.Narbonensis8,
      desc: () => $t(L.TheMonksOfLerinsDesc),
      condition: {
         province: ["Narbonensis"],
         year: [412, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Narbonensis.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.EndowTheIslandMonastery),
            resources: { gold: -500, christianity: 10 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.DrawOurBishopsFromLerins),
            resources: { christianity: 10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis9: {
      name: () => $t(L.CassianBringsTheDesertToMassilia),
      image: EventImage.Narbonensis9,
      desc: () => $t(L.CassianBringsTheDesertToMassiliaDesc),
      condition: {
         province: ["Narbonensis"],
         year: [425, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Narbonensis.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.EmbraceTheMonasticRule),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FavorTheWorldlyClergyInstead),
            resources: { christianity: -10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis10: {
      name: () => $t(L.TheSiltingOfTheHarbor),
      image: EventImage.Narbonensis10,
      desc: () => $t(L.TheSiltingOfTheHarborDesc),
      condition: {
         province: ["Narbonensis"],
         year: [440, 440],
      },
      buttons: [
         {
            label: () => $t(L.DredgeTheChannels),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTradeMoveToOtherPorts),
            resources: { gold: 300 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
