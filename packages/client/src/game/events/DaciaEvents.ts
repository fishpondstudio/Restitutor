import { $t, L } from "../../utils/i18n";
import { HunsSpawnYear } from "../definitions/Constant";
import { Culture } from "../definitions/Culture";
import { Province } from "../definitions/Province";
import { TimedActions } from "../definitions/TimedAction";
import type { ConditionChecks } from "../logic/Calculation";
import { changeProvinceCulture } from "../logic/InternalAffairsLogic";
import {
   allCoreTileChecks,
   blackSeaCoastChecks,
   manpowerChecks,
   mediterraneanCoastChecks,
   provinceRevenueChecks,
   setProvinceNameOverrideEffect,
} from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const DaciaEvents = {
   Dacia1: {
      name: () => $t(L.CaracallaSNameAboveTheGates),
      wikipedia: "Porolissum",
      image: EventImage.RomanWall,
      desc: () => $t(L.CaracallaSNameAboveTheGatesDesc),
      condition: { province: new Set(["Dacia"]), year: [213, 213] },
      buttons: [
         {
            label: () => $t(L.EquipTheFortifiedGateways),
            resources: { gold: -750 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ImproveTheMarketApproachRoads),
            resources: { gold: -500 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.RotateLaborersBackToTheirFields),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Defense: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia2: {
      name: () => $t(L.WagonsForMaximinus),
      wikipedia: "Maximinus_Thrax",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.WagonsForMaximinusDesc),
      condition: { province: new Set(["Dacia"]), year: [236, 236] },
      buttons: [
         {
            label: () => $t(L.PaySuppliersForTheArmySGrain),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SetHouseholdGrainExemptions),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LevyTransportTeamsFromEstates),
            resources: { military: 50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia3: {
      name: () => $t(L.BronzeForTheProvincialMarkets),
      wikipedia: "Roman_provincial_currency",
      image: EventImage.CoinMinting,
      desc: () => $t(L.BronzeForTheProvincialMarketsDesc),
      condition: { province: new Set(["Dacia"]), year: [246, 246] },
      buttons: [
         {
            label: () => $t(L.DistributeCoinThroughTownMarkets),
            resources: { gold: -500 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.PrioritizeTheGarrisonPayChests),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AuditExchangesAndPublicPayments),
            resources: { administrative: -50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
      ],
   },
   Dacia4: {
      name: () => $t(L.TheCarpiAskForPeace),
      wikipedia: "Carpi_(people)",
      image: EventImage.MountedParley,
      desc: () => $t(L.TheCarpiAskForPeaceDesc),
      condition: { province: new Set(["Dacia"]), year: [247, 247] },
      buttons: [
         {
            label: () => $t(L.FundTheRecoveryOfCaptives),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreFarmsAndLocalMarkets),
            resources: { gold: -750 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepPatrolsOnTheFrontierRoads),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia5: {
      name: () => $t(L.OrdersForTheSouthernBank),
      wikipedia: "Dacia_Aureliana",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.OrdersForTheSouthernBankDesc),
      condition: { province: new Set(["Dacia"]), year: [271, 271] },
      buttons: [
         {
            label: () => $t(L.PetitionToRetainFrontierSupport),
            resources: { diplomatic: -75 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FundEscortsAndHouseholdRelief),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeLocalGarrisons),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia6: {
      name: () => $t(L.ABridgeAtSucidava),
      wikipedia: "Constantine's_Bridge_(Danube)",
      image: EventImage.PonteMolle,
      desc: () => $t(L.ABridgeAtSucidavaDesc),
      condition: { province: new Set(["Dacia"]), year: [328, 328] },
      buttons: [
         {
            label: () => $t(L.RepairTheRoadTowardRomula),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.05, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.StrengthenTheBridgeheadDepots),
            resources: { gold: -750 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.LeaseWarehousesAtTheCrossing),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia7: {
      name: () => $t(L.PeaceAfterTheGothicWinter),
      wikipedia: "Constantine_the_Great",
      image: EventImage.MountedParley,
      desc: () => $t(L.PeaceAfterTheGothicWinterDesc),
      condition: { province: new Set(["Dacia"]), year: [332, 332] },
      buttons: [
         {
            label: () => $t(L.SubsidizeGrainAtTheRiverMarkets),
            resources: { gold: -750 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArrangeServiceWithGothicCaptains),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RequireEscortsOnTheTradeRoads),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia8: {
      name: () => $t(L.RefugeInTheCarpathians),
      wikipedia: "Gothic_War_(367–369)",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.RefugeInTheCarpathiansDesc),
      condition: { province: new Set(["Dacia"]), year: [367, 367] },
      buttons: [
         {
            label: () => $t(L.NegotiateTemporaryGrazingRights),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardTheValleyGranaries),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PurchaseFodderForCrowdedVillages),
            resources: { gold: -750 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia9: {
      name: () => $t(L.AMartyrBesideTheMusaeus),
      wikipedia: "Sabbas_the_Goth",
      image: EventImage.ChristianBurial,
      desc: () => $t(L.AMartyrBesideTheMusaeusDesc),
      condition: { province: new Set(["Dacia"]), year: [372, 372] },
      buttons: [
         {
            label: () => $t(L.ShelterFamiliesFleeingPersecution),
            resources: { gold: -750 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekGuaranteesFromVillageElders),
            resources: { diplomatic: -50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ProtectBurialPartiesAndTravelers),
            resources: { military: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia10: {
      name: () => $t(L.GepidClaimsAfterNedao),
      wikipedia: "Battle_of_Nedao",
      image: EventImage.MountedParley,
      desc: () => $t(L.GepidClaimsAfterNedaoDesc),
      condition: { province: new Set(["Dacia"]), year: [454, 454] },
      buttons: [
         {
            label: () => $t(L.NegotiateSafeConductForMerchants),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReinforceTheValleyApproaches),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeMarketsWithinOurValleys),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dacia11: {
      name: () => $t(L.TheEmptySeatOnTheTisza),
      image: EventImage.AttilasFeast,
      desc: () => $t(L.TheEmptySeatOnTheTiszaDesc),
      condition: {
         province: new Set(["Dacia", "Pannonia"]),
         year: [HunsSpawnYear + 5, Number.POSITIVE_INFINITY],
         onMap: { Huns: false },
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks(Province.Huns.tiles, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ProclaimTheHunnicEmpire),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            custom: [
               setProvinceNameOverrideEffect("HunnicEmpire"),
               {
                  desc: () =>
                     `${TimedActions.ProclaimConquest.name()}: ${TimedActions.ProclaimConquest.desc?.() ?? ""}`,
               },
            ],
         },
      ],
   },
   Dacia12: {
      name: () => $t(L.BeyondTheCarpathianRoads),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.BeyondTheCarpathianRoadsDesc),
      condition: {
         province: new Set(["Dacia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* manpowerChecks(35_000, province, save);
            yield* provinceRevenueChecks(120, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimAcrossTheDanube),
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PressOurClaimToPannonia),
            casusBelli: {
               Pannonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.InvestInFrontierEnvoys),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 5 * 12 },
            },
         },
      ],
   },
   Dacia13: {
      name: () => $t(L.HarboursOnTheBlackSea),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.HarboursOnTheBlackSeaDesc),
      condition: {
         province: new Set(["Dacia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* blackSeaCoastChecks(3, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ImproveTheCoastalEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AppointPortClerksAndEnvoys),
            resources: { administrative: 30, diplomatic: 30 },
         },
         {
            label: () => $t(L.RecruitTheHarbourGuards),
            resources: { military: 60 },
         },
      ],
   },
   Dacia14: {
      name: () => $t(L.TwoPeoplesAtTheCouncilTable),
      image: EventImage.RomanAudience,
      desc: () => $t(L.TwoPeoplesAtTheCouncilTableDesc),
      condition: {
         province: new Set(["Dacia"]),
         annexAndCore: {
            Moesia: 10,
         },
      },
      buttons: [
         {
            label: () => $t(L.AdoptThracianRespectDacian),
            custom: [
               {
                  desc: () =>
                     $t(
                        L.Adopt$1AsOurDominantCultureAndMake$2AToleratedCulture,
                        Culture.Thracian.name(),
                        Culture.Dacian.name(),
                     ),
                  execute: (province, save) => {
                     const state = save.state.provinces[province];
                     if (state) {
                        changeProvinceCulture("Thracian", province, save);
                        state.toleratedCultures.add("Dacian");
                     }
                  },
               },
            ],
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
      ],
   },
   Dacia15: {
      name: () => $t(L.FromOneSeaToTheOther),
      image: EventImage.RomanGalley,
      desc: () => $t(L.FromOneSeaToTheOtherDesc),
      condition: {
         province: new Set(["Dacia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* mediterraneanCoastChecks(5, province, save);
            yield* blackSeaCoastChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheCustomsOffices),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.EmpowerTheCoastalGovernors),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
         {
            label: () => $t(L.ProtectThePortsManyShrines),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
            resources: { mandate: 1 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
