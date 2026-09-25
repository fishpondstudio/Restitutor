import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import {
   allCoreTileChecks,
   blackSeaCoastChecks,
   forcePatronageEffect,
   manpowerChecks,
   maxCoreTileChecks,
   mediterraneanCoastChecks,
   provinceRevenueChecks,
} from "../logic/MissionLogic";
import { requireNoTreatyBetweenChecks, requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const ThraciaEvents = {
   Thracia1: {
      name: () => $t(L.ThePrizeCrownsOfPhilippopolis),
      wikipedia: "Stadium_of_Philippopolis",
      image: EventImage.AthleticHonours,
      desc: () => $t(L.ThePrizeCrownsOfPhilippopolisDesc),
      condition: { province: new Set(["Thracia"]), year: [214, 214] },
      buttons: [
         {
            label: () => $t(L.SponsorOurCitysCompetitions),
            resources: { gold: -750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PrepareLodgingAndMarketStalls),
            resources: { gold: -500 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.LimitTheCouncilsFestivalLevies),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia2: {
      name: () => $t(L.CnivaBeforePhilippopolis),
      wikipedia: "Siege_of_Philippopolis_(250)",
      image: EventImage.BarbariansAtRome,
      desc: () => $t(L.CnivaBeforePhilippopolisDesc),
      condition: { province: new Set(["Thracia"]), year: [250, 250] },
      buttons: [
         {
            label: () => $t(L.StockOurWallsAndGranaries),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ShelterTheRuralHouseholds),
            resources: { gold: -750 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortTheValleySupplyConvoys),
            resources: { military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               WarPower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia3: {
      name: () => $t(L.TheBishopsWithdrawToPhilippopolis),
      wikipedia: "Council_of_Philippopolis",
      image: EventImage.CouncilOfTrent,
      desc: () => $t(L.TheBishopsWithdrawToPhilippopolisDesc),
      condition: { province: new Set(["Thracia"]), year: [343, 343] },
      buttons: [
         {
            label: () => $t(L.ProvideQuartersForTheBishops),
            resources: { gold: -500 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.MediateAmongOurCongregations),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ProtectMarketsFromFactionalStrife),
            resources: { military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia4: {
      name: () => $t(L.ThePriceOfStrabosSoldiers),
      wikipedia: "Theodoric_Strabo",
      image: EventImage.MountedParley,
      desc: () => $t(L.ThePriceOfStrabosSoldiersDesc),
      condition: { province: new Set(["Thracia"]), year: [473, 473] },
      buttons: [
         {
            label: () => $t(L.PurchaseSuppliesForTheFederates),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateLimitsOnRequisitions),
            resources: { diplomatic: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveStoresForOurTownGuards),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia5: {
      name: () => $t(L.VitaliansUnpaidFederates),
      wikipedia: "Vitalian_(general)",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.VitaliansUnpaidFederatesDesc),
      condition: { province: new Set(["Thracia"]), year: [513, 513] },
      buttons: [
         {
            label: () => $t(L.SettleOurGarrisonsSupplyArrears),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekGuaranteesForOurCommunities),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureOurDepotsAgainstSeizure),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia6: {
      name: () => $t(L.ZabergansRiders),
      wikipedia: "Battle_of_Melantias",
      image: EventImage.VillaRaid,
      desc: () => $t(L.ZabergansRidersDesc),
      condition: { province: new Set(["Thracia"]), year: [559, 559] },
      buttons: [
         {
            label: () => $t(L.SupplyTheForcesNearMelantias),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BringOurVillagersBehindWalls),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OrganizeMountedRoadPatrols),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia7: {
      name: () => $t(L.AShoutInTheNight),
      wikipedia: "Maurice%27s_Balkan_campaigns",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.AShoutInTheNightDesc),
      condition: { province: new Set(["Thracia"]), year: [587, 587] },
      buttons: [
         {
            label: () => $t(L.DrillOurEscortsInClearSignals),
            resources: { military: -50 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.HireLocalGuidesForOurConvoys),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReorganizeOurBaggageDepots),
            resources: { administrative: -50 },
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.1, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia8: {
      name: () => $t(L.SealsAtTheBulgarianMarkets),
      wikipedia: "Byzantine%E2%80%93Bulgarian_treaty_of_716",
      image: EventImage.TaxCollectors,
      desc: () => $t(L.SealsAtTheBulgarianMarketsDesc),
      condition: { province: new Set(["Thracia"]), year: [716, 716] },
      buttons: [
         {
            label: () => $t(L.StaffOurMerchantDocumentOffices),
            resources: { administrative: -50, gold: -300 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.EnforceCargoConfiscations),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ResolveDisputedMerchantClaims),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia9: {
      name: () => $t(L.EasternFamiliesOnThracianSoil),
      wikipedia: "Constantine_V",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.EasternFamiliesOnThracianSoilDesc),
      condition: { province: new Set(["Thracia"]), year: [755, 755] },
      buttons: [
         {
            label: () => $t(L.ProvideSeedAndHomesForSettlers),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ArbitrateOurCommunitiesLandClaims),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PaySettlersToRepairOurForts),
            resources: { gold: -750 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia10: {
      name: () => $t(L.IrenesProgressThroughThrace),
      wikipedia: "Irene_of_Athens",
      image: EventImage.RomanWall,
      desc: () => $t(L.IrenesProgressThroughThraceDesc),
      condition: { province: new Set(["Thracia"]), year: [784, 784] },
      buttons: [
         {
            label: () => $t(L.FundTheRebuildingOfBeroesWalls),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreOurWorkshopsAndMarkets),
            resources: { gold: -750 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForRebuildingTaxRelief),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Thracia11: {
      name: () => $t(L.BeyondTheHaemusPasses),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.BeyondTheHaemusPassesDesc),
      condition: {
         province: new Set(["Thracia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* manpowerChecks(4000, province, save);
            yield* provinceRevenueChecks(150, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimToMoesia),
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Thracia12: {
      name: () => $t(L.TheRoadsThroughTheInterior),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.TheRoadsThroughTheInteriorDesc),
      condition: {
         province: new Set(["Thracia", "Dacia", "Macedonia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10092620, 10158156], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EnlistLocalMagistratesAndEnvoys),
            resources: { administrative: 50, diplomatic: 50 },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.MobilizeGarrisonsAndCollectRevenues),
            resources: { military: 50, gold: 500 },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Thracia13: {
      name: () => $t(L.RootsAlongTheMoesianRoads),
      image: EventImage.RomanAudience,
      desc: () => $t(L.RootsAlongTheMoesianRoadsDesc),
      condition: {
         province: new Set(["Thracia"]),
         annexAndCore: { Moesia: 10 },
      },
      buttons: [
         {
            label: () => $t(L.RecruitExperiencedLocalMagistrates),
            resources: {
               administrative: 100,
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.EnlistInfluentialFamiliesAsEnvoys),
            resources: {
               diplomatic: 100,
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PromoteOfficersFromLocalGarrisons),
            resources: {
               military: 100,
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Thracia14: {
      name: () => $t(L.ASettlementWithMoesia),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ASettlementWithMoesiaDesc),
      condition: {
         province: new Set(["Thracia"]),
         onMap: { Moesia: true },
         annexAndCore: {
            Moesia: Math.ceil(Province.Moesia.tiles.length * 0.7),
         },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(3, "Moesia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Moesia", save);
            yield* requirePeaceBetweenChecks(province, "Moesia", save);
            yield* availableDiplomatChecks(province, "Moesia", save);
            return;
         },
      },
      buttons: [
         {
            label: () => $t(L.ReceiveMoesiaAsOurClient),
            custom: [forcePatronageEffect("Moesia")],
         },
      ],
   },
   Thracia15: {
      name: () => $t(L.MastersOfTheCrossings),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.MastersOfTheCrossingsDesc),
      condition: {
         province: new Set(["Thracia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10354766, 10354767, 10223695, 10289232], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SeekAMandateToAdvanceInto$1, Province.Bithynia.name()),
            resources: { consulPoint: 2 },
            casusBelli: {
               Bithynia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SeekAMandateToAdvanceInto$1, Province.Asia.name()),
            resources: { consulPoint: 2 },
            casusBelli: {
               Asia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SeekAMandateToAdvanceInto$1, Province.Macedonia.name()),
            resources: { consulPoint: 2 },
            casusBelli: {
               Macedonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Thracia16: {
      name: () => $t(L.BetweenTwoSeas),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.BetweenTwoSeasDesc),
      condition: {
         province: new Set(["Thracia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* mediterraneanCoastChecks(5, province, save);
            yield* blackSeaCoastChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SurveyAndRegisterOurCoastalEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.DevelopOurCoastalFarmsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SeekRecognitionOfOurCoastalMandate),
            resources: { mandate: 1 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
