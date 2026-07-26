import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { getProvinceResource } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const GermaniaEvent = {
   Germania1: {
      name: () => $t(L.TheKilnsOfRheinzabern),
      image: EventImage.Germania1,
      desc: () => $t(L.TheKilnsOfRheinzabernDesc),
      condition: {
         province: ["Germania"],
         year: [205, 205],
      },
      buttons: [
         {
            label: () => $t(L.ExpandThePottersWorkshops),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxTheProsperousKilns),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania2: {
      name: () => $t(L.TheRhineFleetAtColonia),
      image: EventImage.Galley,
      desc: () => $t(L.TheRhineFleetAtColoniaDesc),
      condition: {
         province: ["Germania"],
         year: [230, 230],
      },
      buttons: [
         {
            label: () => $t(L.RefitTheRhineFlotilla),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LeaveTheRiverToLocalCraft),
            resources: { gold: 500 },
            modifiers: {
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania3: {
      name: () => $t(L.PostumusIsRaisedUponTheShield),
      image: EventImage.Germania3,
      desc: () => $t(L.PostumusIsRaisedUponTheShieldDesc),
      condition: {
         province: ["Germania"],
         year: [261, 261],
      },
      buttons: [
         {
            label: () => $t(L.AcclaimTheEmperorOfTheRhine),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RemainLoyalToTheLawfulEmperor),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania4: {
      name: () => $t(L.TheLimesGivesWay),
      image: EventImage.Germania4,
      desc: () => $t(L.TheLimesGivesWayDesc),
      condition: {
         province: ["Germania"],
         year: [275, 275],
      },
      buttons: [
         {
            label: () => $t(L.ReoccupyTheFrontierForts),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.WithdrawBehindTheRhine),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SettleArmedFarmersOnTheMarches),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania5: {
      name: () => $t(L.VinesBeyondTheAlps),
      image: EventImage.Aquitania1,
      desc: () => $t(L.VinesBeyondTheAlpsDesc),
      condition: {
         province: ["Germania"],
         year: [280, 280],
      },
      buttons: [
         {
            label: () => $t(L.PlantTheRhineHillsides),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            trades: {
               Belgica: { offer: { theyOffer: "gold", weOffer: "grain" }, extraProfit: 0.5 },
            },
         },
         {
            label: () => $t(L.ProtectTheEstablishedMerchants),
            resources: { consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania6: {
      name: () => $t(L.GereonAndTheMartyrsOfColonia),
      image: EventImage.Germania6,
      desc: () => $t(L.GereonAndTheMartyrsOfColoniaDesc),
      condition: {
         province: ["Germania"],
         year: [305, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianityInfluenceIsAtLeast$2, Province.Germania.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.RaiseAShrineToTheMartyrs),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PermitTheirCultQuietly),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SuppressThisDefiance),
            resources: { christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania7: {
      name: () => $t(L.ConstantineBridgesTheRhine),
      image: EventImage.Germania7,
      desc: () => $t(L.ConstantineBridgesTheRhineDesc),
      condition: {
         province: ["Germania"],
         year: [310, 310],
      },
      buttons: [
         {
            label: () => $t(L.CompleteTheBridgeAndFort),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CarryTheWarAcrossTheRhine),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania8: {
      name: () => $t(L.TheVictoryAtArgentoratum),
      image: EventImage.Germania8,
      desc: () => $t(L.TheVictoryAtArgentoratumDesc),
      condition: {
         province: ["Germania"],
         year: [357, 357],
      },
      buttons: [
         {
            label: () => $t(L.CelebrateTheVictoriousLegions),
            resources: { generalSkillPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitTheDefeatedWarriors),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania9: {
      name: () => $t(L.ValentiniansChainOfForts),
      image: EventImage.Watchtower,
      desc: () => $t(L.ValentiniansChainOfFortsDesc),
      condition: {
         province: ["Germania"],
         year: [369, 369],
      },
      buttons: [
         {
            label: () => $t(L.FortifyEveryCrossing),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.MaintainAMobileFieldArmy),
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Germania10: {
      name: () => $t(L.TheRhineIsCrossed),
      image: EventImage.Germania10,
      desc: () => $t(L.TheRhineIsCrossedDesc),
      condition: {
         province: ["Germania"],
         year: [406, 406],
      },
      buttons: [
         {
            label: () => $t(L.ContestEveryCrossing),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AdmitSelectedFederates),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EvacuateTheExposedFrontier),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
