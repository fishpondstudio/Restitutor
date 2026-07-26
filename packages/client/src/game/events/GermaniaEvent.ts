import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { getTileName } from "../definitions/TileName";
import { coreTileCountCondition, warPowerCondition } from "../logic/MissionLogic";
import { getProvinceCoreTileCount, getProvinceResource } from "../logic/ProvinceLogic";
import { dissolveAllTreaties, requireAnyTreatyBetween } from "../logic/TreatyLogic";
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
   Germania11: {
      name: () => $t(L.BeyondTheRhineFrontier),
      image: EventImage.Expedition,
      desc: () => $t(L.BeyondTheRhineFrontierDesc),
      condition: {
         province: ["Germania"],
         conditions: (province, save) => [warPowerCondition(10_000, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.TurnOurStandardsTowardBelgica),
            attitudes: {
               Raetia: { type: "add", value: 20, duration: 2 * 12 },
            },
            casusBelli: {
               Belgica: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.MarchIntoTheHeartOfLugdunensis),
            attitudes: {
               Belgica: { type: "add", value: 20, duration: 2 * 12 },
            },
            casusBelli: {
               Lugdunensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.AdvanceAlongTheUpperRhineIntoRaetia),
            attitudes: {
               Lugdunensis: { type: "add", value: 20, duration: 2 * 12 },
            },
            casusBelli: {
               Raetia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Germania12: {
      name: () => $t(L.$1SeeksOurProtection, Province.Raetia.name()),
      image: EventImage.Annex,
      desc: () => $t(L.RaetiaSeeksOurProtectionDesc),
      condition: {
         province: ["Germania"],
         conditions: (province, save) => [
            {
               name: $t(L.$1HasAtMost$2CoreTiles, Province.Raetia.name(), "3"),
               value: getProvinceCoreTileCount("Raetia", save) <= 3,
            },
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Raetia", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Raetia.name()),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Raetia", save);
                     OfferPatronageAction(province, "Raetia", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Raetia.name()),
               },
            ],
         },
      ],
   },
   Germania13: {
      name: () => $t(L.$1SeeksOurProtection, Province.Belgica.name()),
      image: EventImage.Emperor,
      desc: () => $t(L.BelgicaSeeksOurProtectionDesc),
      condition: {
         province: ["Germania"],
         conditions: (province, save) => [
            {
               name: $t(L.$1HasAtMost$2CoreTiles, Province.Belgica.name(), "3"),
               value: getProvinceCoreTileCount("Belgica", save) <= 3,
            },
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Belgica", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Belgica.name()),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Belgica", save);
                     OfferPatronageAction(province, "Belgica", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Belgica.name()),
               },
            ],
         },
      ],
   },
   Germania14: {
      name: () => $t(L.ThePassesToTheSouth),
      image: EventImage.Alps,
      desc: () => $t(L.ThePassesToTheSouthDesc),
      condition: {
         province: ["Germania"],
         conditions: (province, save) => [coreTileCountCondition(25, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.DescendUponNarbonensis),
            casusBelli: {
               Narbonensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
            custom: [
               {
                  desc: () =>
                     $t(L.$1TileDefenseFor$2And$3For$4Years, "-10%", getTileName(9175112), getTileName(9109577), "5"),
                  effect: (province, save) => {
                     save.state.tiles.get(9175112)?.modifiers.Defense.push({
                        type: "multiply",
                        value: -0.1,
                        duration: 5 * 12,
                        name: GermaniaEvent.Germania13.name(),
                     });
                     save.state.tiles.get(9109577)?.modifiers.Defense.push({
                        type: "multiply",
                        value: -0.1,
                        duration: 5 * 12,
                        name: GermaniaEvent.Germania13.name(),
                     });
                  },
               },
            ],
         },
         {
            label: () => $t(L.CarryOurStandardsIntoItalia),
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
            custom: [
               {
                  desc: () =>
                     $t(L.$1TileDefenseFor$2And$3For$4Years, "-10%", getTileName(9240648), getTileName(9175113), "5"),
                  effect: (province, save) => {
                     save.state.tiles.get(9240648)?.modifiers.Defense.push({
                        type: "multiply",
                        value: -0.1,
                        duration: 5 * 12,
                        name: GermaniaEvent.Germania12.name(),
                     });
                     save.state.tiles.get(9175113)?.modifiers.Defense.push({
                        type: "multiply",
                        value: -0.1,
                        duration: 5 * 12,
                        name: GermaniaEvent.Germania12.name(),
                     });
                  },
               },
            ],
         },
      ],
   },
   Germania15: {
      name: () => $t(L.GermaniaAscendant),
      image: EventImage.Empire,
      desc: () => $t(L.GermaniaAscendantDesc),
      condition: {
         province: ["Germania"],
         conditions: (province, save) => [coreTileCountCondition(30, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.EntrustTheRealmToSeasonedMagistrates),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.SendEnvoysToEveryCourt),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.PlaceTheLegionsAboveAll),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
