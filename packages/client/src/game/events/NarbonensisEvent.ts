import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { getTileName } from "../definitions/TileName";
import {
   annexTiles,
   marriageCondition,
   provinceResourceCondition,
   provinceRevenueCondition,
} from "../logic/MissionLogic";
import { getProvinceResource } from "../logic/ProvinceLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const NarbonensisEvent = {
   Narbonensis1: {
      name: () => $t(L.TheGarumAndOilTradeOfNarbo),
      image: EventImage.QueenEmbarkation,
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
      image: EventImage.Sailor,
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
      image: EventImage.PontDuGard,
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
      wikipedia: "Genesius_of_Arles",
      image: EventImage.JohnBeheading,
      desc: () => $t(L.TheMartyrdomOfGenesiusAtArelateDesc),
      condition: {
         province: ["Narbonensis"],
         year: [305, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Narbonensis.name(), "10"),
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
      wikipedia: "Synod_of_Arles",
      image: EventImage.CouncilOfTrent,
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
      wikipedia: "Praetorian_prefecture_of_Gaul",
      image: EventImage.IdealCity,
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
      image: EventImage.PonteMolle,
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
      wikipedia: "L%C3%A9rins_Abbey",
      image: EventImage.JeromeWilderness,
      desc: () => $t(L.TheMonksOfLerinsDesc),
      condition: {
         province: ["Narbonensis"],
         year: [412, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Narbonensis.name(), "20"),
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
      wikipedia: "John_Cassian",
      image: EventImage.JohnCassian,
      desc: () => $t(L.CassianBringsTheDesertToMassiliaDesc),
      condition: {
         province: ["Narbonensis"],
         year: [425, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Narbonensis.name(), "20"),
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
      image: EventImage.EmpireDesolation,
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
   Narbonensis11: {
      name: () => $t(L.TheFruitsOfItalianFriendship),
      image: EventImage.DelphiOracle,
      desc: () => $t(L.TheFruitsOfItalianFriendshipDesc),
      condition: {
         province: ["Narbonensis"],
         conditions: (province, save) => {
            return [requireAnyTreatyBetween(["DefensePact", "Alliance", "Patron"], province, "Italia", save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.EngageItaliasSeasonedMagistrates),
            resources: { administrative: 100 },
         },
         {
            label: () => $t(L.LearnFromItaliasPracticedEnvoys),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.InviteItaliasVeteranOfficers),
            resources: { military: 100 },
         },
      ],
   },
   Narbonensis12: {
      name: () => $t(L.TheFruitsOfAquitanianFriendship),
      image: EventImage.DelphiOracle,
      desc: () => $t(L.TheFruitsOfAquitanianFriendshipDesc),
      condition: {
         province: ["Narbonensis"],
         conditions: (province, save) => {
            return [requireAnyTreatyBetween(["DefensePact", "Alliance", "Patron"], province, "Aquitania", save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.ExchangeCraftsmenAndCultivators),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReformTheRollsWithAquitanianAssessors),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.DrillBeneathAlliedStandards),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Narbonensis13: {
      name: () => $t(L.TheGoldenCoffersOfNarbo),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.TheGoldenCoffersOfNarboDesc),
      condition: {
         province: ["Narbonensis"],
         conditions: (province, save) => {
            return [
               provinceRevenueCondition(300, province, save),
               provinceResourceCondition("gold", 10_000, province, save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.FinanceANewGenerationOfMerchants),
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
               TradeProfit: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.InvestInTheGreatEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   Narbonensis14: {
      name: () => $t(L.TheCorsicanMarriageSettlement),
      image: EventImage.Wedding1,
      desc: () => $t(L.TheCorsicanMarriageSettlementDesc),
      condition: {
         province: ["Narbonensis"],
         conditions: (province, save) => {
            return [
               requireNoTreatyBetween(["Patron"], province, "Corsica", save),
               requirePeaceBetween(province, "Corsica", save),
               provinceResourceCondition("gold", 5000, province, save),
               requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Corsica", save),
               marriageCondition(province, "Corsica", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.SealCorsicasLoyaltyWithAPrincelyDowry),
            resources: { gold: -5000 },
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Corsica", save);
                     OfferPatronageAction(province, "Corsica", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Corsica.name()),
               },
            ],
         },
      ],
   },
   Narbonensis15: {
      name: () => $t(L.AnAlpineExchange),
      image: EventImage.EmpireDesolation,
      desc: () => $t(L.AnAlpineExchangeDesc),
      condition: {
         province: ["Narbonensis"],
         conditions: (province, save) => {
            const AugustaPraetoria = save.state.tiles.get(9175112);
            const Taurinorum = save.state.tiles.get(9175113);
            return [
               requireAnyTreatyBetween(["Alliance"], province, "Italia", save),
               {
                  name: $t(L.$1IsCoreTileOf$2, getTileName(9175112), Province.Narbonensis.name()),
                  value: AugustaPraetoria?.province === province && AugustaPraetoria?.coreProvinces.has(province),
               },
               {
                  name: $t(L.$1IsCoreTileOf$2, getTileName(9175113), Province.Italia.name()),
                  value: Taurinorum?.province === "Italia" && Taurinorum?.coreProvinces.has("Italia"),
               },
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.AgreeToTheExchange),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.$1Becomes$2CoreTileAnd$3Becomes$4CoreTile,
                        getTileName(9175112),
                        Province.Italia.name(),
                        getTileName(9175113),
                        Province.Narbonensis.name(),
                     ),
                  effect: (province, save) => {
                     annexTiles({ tiles: [9175112], core: true, province: "Italia", save });
                     annexTiles({ tiles: [9175113], core: true, province, save });
                  },
               },
            ],
         },
         {
            label: () => $t(L.OurLandsAreNotTheirsToBarter),
            modifiers: {
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
            attitudes: {
               Italia: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
