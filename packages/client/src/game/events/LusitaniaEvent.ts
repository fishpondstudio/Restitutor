import { $t, L } from "../../utils/i18n";
import { getTileName } from "../definitions/TileName";
import { minCoreTileCondition, provinceResourceCondition, provinceRevenueCondition } from "../logic/MissionLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { allCoreTileCondition } from "../logic/TileLogic";
import { requireAnyTreatyBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const LusitaniaEvent = {
   Lusitania1: {
      name: () => $t(L.TheWatersOfAugustaEmerita),
      image: EventImage.Aqueduct,
      desc: () => $t(L.TheWatersOfAugustaEmeritaDesc),
      condition: {
         province: ["Lusitania"],
         year: [200, 200],
      },
      buttons: [
         {
            label: () => $t(L.RepairTheAqueductsAndReservoirs),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LeaveTheCostToTheMunicipalities),
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania2: {
      name: () => $t(L.TheHorsesOfTheLusitanianPlains),
      image: EventImage.Aquitania9,
      desc: () => $t(L.TheHorsesOfTheLusitanianPlainsDesc),
      condition: {
         province: ["Lusitania"],
         year: [225, 225],
      },
      buttons: [
         {
            label: () => $t(L.ReserveTheFinestMountsForTheArmy),
            stats: { cavalrySkill: 1 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SellTheHorsesThroughoutHispania),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania3: {
      name: () => $t(L.TheFishSaltingHousesOfOlisipo),
      image: EventImage.Lusitania3,
      desc: () => $t(L.TheFishSaltingHousesOfOlisipoDesc),
      condition: {
         province: ["Lusitania"],
         year: [245, 245],
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheAtlanticTrade),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ImposeAHarborMonopoly),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania4: {
      name: () => $t(L.TheVillasOfTheAlentejo),
      image: EventImage.Lusitania4,
      desc: () => $t(L.TheVillasOfTheAlentejoDesc),
      condition: {
         province: ["Lusitania"],
         year: [275, 275],
      },
      buttons: [
         {
            label: () => $t(L.FavorTheGreatEstates),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReassessTheirLands),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania5: {
      name: () => $t(L.EmeritaSeatOfTheDiocese),
      image: EventImage.Y284,
      desc: () => $t(L.EmeritaSeatOfTheDioceseDesc),
      condition: {
         province: ["Lusitania"],
         year: [298, 298],
      },
      buttons: [
         {
            label: () => $t(L.BuildOfficesWorthyOfHispania),
            resources: { gold: -500, administrative: 100 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SellAccessToTheNewBureaucracy),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania6: {
      name: () => $t(L.EulaliaDefiesTheMagistrate),
      image: EventImage.Lusitania6,
      desc: () => $t(L.EulaliaDefiesTheMagistrateDesc),
      condition: {
         province: ["Lusitania"],
         year: [304, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [provinceResourceCondition("christianity", 10, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.VenerateTheYoungMartyr),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceThePersecution),
            resources: { christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania7: {
      name: () => $t(L.ThePriscillianistControversy),
      image: EventImage.Lusitania7,
      desc: () => $t(L.ThePriscillianistControversyDesc),
      condition: {
         province: ["Lusitania"],
         year: [385, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [provinceResourceCondition("christianity", 30, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.ProtectTheAscetics),
            resources: { christianity: 10 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SupportTheEstablishedBishops),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReferTheDisputeToImperialJudgment),
            resources: { diplomatic: -50, consulPoint: 1 },
         },
      ],
   },
   Lusitania8: {
      name: () => $t(L.LusitaniaIsGrantedToTheAlans),
      image: EventImage.War2,
      desc: () => $t(L.LusitaniaIsGrantedToTheAlansDesc),
      condition: {
         province: ["Lusitania"],
         year: [411, 411],
      },
      buttons: [
         {
            label: () => $t(L.AcceptTheAlansAsFederates),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ResistTheirSettlement),
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania9: {
      name: () => $t(L.GothAndAlanContestTheProvince),
      image: EventImage.Y453,
      desc: () => $t(L.GothAndAlanContestTheProvinceDesc),
      condition: {
         province: ["Lusitania"],
         year: [417, 417],
      },
      buttons: [
         {
            label: () => $t(L.SupportTheGothicCampaign),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PlayTheTwoPeoplesAgainstEachOther),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania10: {
      name: () => $t(L.TheShipyardsOfOlisipo),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheShipyardsOfOlisipoDesc),
      condition: {
         province: ["Lusitania"],
         year: [440, 440],
      },
      buttons: [
         {
            label: () => $t(L.SubsidizeTheMerchantFleet),
            resources: { gold: -500 },
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FitOutGalleysForCoastalPatrols),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxEveryShipLaunched),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania11: {
      name: () => $t(L.TheFruitsOfTarraconensianFriendship),
      image: EventImage.Y453,
      desc: () => $t(L.TheFruitsOfTarraconensianFriendshipDesc),
      condition: {
         province: ["Lusitania"],
         conditions: (province, save) => [
            requireAnyTreatyBetween(["DefensePact", "Alliance", "Patron"], province, "Tarraconensis", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.CoordinateOurArmies),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.StrengthenOurCommonDefenses),
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ExchangeOfficialsEnvoysAndOfficers),
            resources: { administrative: 50, diplomatic: 50, military: 50 },
         },
      ],
   },
   Lusitania12: {
      name: () => $t(L.AFootholdInBaetica),
      image: EventImage.Y453,
      desc: () => $t(L.LusitaniaFootholdInBaeticaDesc),
      condition: {
         province: ["Lusitania"],
         annexAndCore: {
            Baetica: 2,
         },
      },
      buttons: [
         {
            label: () => $t(L.SellSpoilsViaTarraconensianMerchants),
            resources: { gold: 1500 },
            attitudes: {
               Tarraconensis: { type: "add", value: 20, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.LetMauretanianEnvoysStudyOurVictory),
            resources: { diplomatic: 50, administrative: 50, military: 50 },
            attitudes: {
               Mauretania: { type: "add", value: 20, duration: 5 * 12 },
            },
         },
      ],
   },
   Lusitania13: {
      name: () => $t(L.TheDistressOfTarraconensis),
      image: EventImage.Aquitania3,
      desc: () => $t(L.TheDistressOfTarraconensisDesc),
      condition: {
         province: ["Lusitania"],
         conditions: (province, save) => {
            return [
               requireAnyTreatyBetween(["Alliance", "Patron"], province, "Tarraconensis", save),
               provinceResourceCondition("gold", 10_000, province, save),
               allCoreTileCondition([8519758, 8585295], "Tarraconensis", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.PurchaseTheWesternBorderlands),
            resources: { gold: -10_000 },
            custom: [
               {
                  desc: (province, save) => {
                     const tileNames = [8519758, 8585295].map(getTileName).join(", ");
                     return $t(L.$1Annexes$2, getProvinceName(province, save), tileNames);
                  },
                  effect: (province, save) => {
                     [8519758, 8585295].forEach((tile) => {
                        const tileData = save.state.tiles.get(tile);
                        if (tileData) {
                           tileData.province = province;
                        }
                     });
                  },
               },
            ],
         },
         {
            label: () => $t(L.LetTarraconensisPayItsOwnDebts),
            attitudes: {
               Tarraconensis: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Lusitania14: {
      name: () => $t(L.TheWealthOfEmerita),
      image: EventImage.Aquitania3,
      desc: () => $t(L.TheWealthOfEmeritaDesc),
      condition: {
         province: ["Lusitania"],
         conditions: (province, save) => [
            minCoreTileCondition(15, province, save),
            provinceRevenueCondition(200, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.TakeTheWindfallInGold),
            resources: { gold: 5000 },
         },
         {
            label: () => $t(L.RecruitANewGenerationOfOfficials),
            resources: { administrative: 100, diplomatic: 100, military: 100 },
         },
      ],
   },
   Lusitania15: {
      name: () => $t(L.TheGoldenCoffersOfEmerita),
      image: EventImage.Aquitania3,
      desc: () => $t(L.TheGoldenCoffersOfEmeritaDesc),
      condition: {
         province: ["Lusitania"],
         conditions: (province, save) => [
            minCoreTileCondition(20, province, save),
            provinceRevenueCondition(300, province, save),
         ],
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
} as const satisfies Record<string, IGameEventConfig>;
