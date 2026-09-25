import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { Tiles } from "../definitions/TileConstants";
import type { ConditionChecks } from "../logic/Calculation";
import {
   allCoreTileChecks,
   isCoreTileChecks,
   mediterraneanCoastChecks,
   minCoreTileChecks,
   resetWarmongerPenaltyEffect,
} from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MoesiaEvents = {
   Moesia1: {
      name: () => $t(L.ACaesarAtViminacium),
      wikipedia: "Viminacium",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.ACaesarAtViminaciumDesc),
      condition: { province: new Set(["Moesia"]), year: [196, 196] },
      buttons: [
         {
            label: () => $t(L.HostTheImperialRetinue),
            resources: { gold: -750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForLocalSupplyContracts),
            resources: { diplomatic: -50 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.LimitCompulsoryBilleting),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia2: {
      name: () => $t(L.TheColoniaSNewCoin),
      wikipedia: "Viminacium",
      image: EventImage.CoinMinting,
      desc: () => $t(L.TheColoniaSNewCoinDesc),
      condition: { province: new Set(["Moesia"]), year: [239, 239] },
      buttons: [
         {
            label: () => $t(L.FundTheMarketAndMintSupply),
            resources: { gold: -750 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AuditTheNewCivicAccounts),
            resources: { administrative: -50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.SellPrivilegedMarketLeases),
            resources: { gold: 500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia3: {
      name: () => $t(L.CnivaAtTheGatesOfNovae),
      wikipedia: "Cniva",
      image: EventImage.BarbariansAtRome,
      desc: () => $t(L.CnivaAtTheGatesOfNovaeDesc),
      condition: { province: new Set(["Moesia"]), year: [250, 250] },
      buttons: [
         {
            label: () => $t(L.StockTheLegionSDefenses),
            resources: { gold: -1000 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.ShelterTheFarmingHouseholds),
            resources: { gold: -750 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortGrainAlongTheRiver),
            resources: { military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               WarPower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia4: {
      name: () => $t(L.TheWoundedFromNaissus),
      wikipedia: "Battle_of_Naissus",
      image: EventImage.WoundedSoldier,
      desc: () => $t(L.TheWoundedFromNaissusDesc),
      condition: { province: new Set(["Moesia"]), year: [269, 269] },
      buttons: [
         {
            label: () => $t(L.PayForCareAndConvalescence),
            resources: { gold: -750 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PatrolTheRoadsAroundNaissus),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RequisitionSuppliesForTheArmy),
            resources: { military: 50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia5: {
      name: () => $t(L.UlfilasAndHisFlock),
      wikipedia: "Ulfilas",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.UlfilasAndHisFlockDesc),
      condition: { province: new Set(["Moesia"]), year: [348, 348] },
      buttons: [
         {
            label: () => $t(L.ProvideSeedAndSettlementGrants),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArbitrateLeasesWithLocalVillages),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SupportTheBishopSTranslators),
            resources: { gold: -500 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 } },
         },
      ],
   },
   Moesia6: {
      name: () => $t(L.TwoMarketsOnTheDanube),
      wikipedia: "Valens",
      image: EventImage.WaterMarket,
      desc: () => $t(L.TwoMarketsOnTheDanubeDesc),
      condition: { province: new Set(["Moesia"]), year: [369, 369] },
      buttons: [
         {
            label: () => $t(L.ExpandTheAuthorizedLandingPlaces),
            resources: { gold: -750 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 } },
         },
         {
            label: () => $t(L.TightenCustomsInspections),
            resources: { administrative: -50, gold: 500 },
            modifiers: { TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.PetitionForDisplacedTraders),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia7: {
      name: () => $t(L.HungerAtTheCrossing),
      wikipedia: "Gothic_War_(376–382)",
      image: EventImage.TribalCrossing,
      desc: () => $t(L.HungerAtTheCrossingDesc),
      condition: { province: new Set(["Moesia"]), year: [376, 376] },
      buttons: [
         {
            label: () => $t(L.BuyGrainForTheArrivingFamilies),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.InvestigateTheCorruptSuppliers),
            resources: { administrative: -75 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ConcentrateGuardsAtTheDepots),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia8: {
      name: () => $t(L.TheAccusationAgainstMargus),
      wikipedia: "Treaty_of_Margus",
      image: EventImage.MountedParley,
      desc: () => $t(L.TheAccusationAgainstMargusDesc),
      condition: { province: new Set(["Moesia"]), year: [441, 441] },
      buttons: [
         {
            label: () => $t(L.SeekAnInquiryAndALocalTruce),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PlaceTheGatesUnderMilitaryGuard),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MoveExposedHouseholdsInland),
            resources: { gold: -750 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia9: {
      name: () => $t(L.RidersFromTheUtus),
      wikipedia: "Battle_of_the_Utus",
      image: EventImage.CavalryCharge,
      desc: () => $t(L.RidersFromTheUtusDesc),
      condition: { province: new Set(["Moesia"]), year: [447, 447] },
      buttons: [
         {
            label: () => $t(L.ConcentrateSuppliesInsideTheForts),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortVillagersAwayFromTheRoads),
            resources: { military: -50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RansomCaptivesThroughLocalEnvoys),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia10: {
      name: () => $t(L.TheArmyBeyondViminacium),
      wikipedia: "Battles_of_Viminacium",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.TheArmyBeyondViminaciumDesc),
      condition: { province: new Set(["Moesia"]), year: [599, 599] },
      buttons: [
         {
            label: () => $t(L.PurchaseSuppliesForPriscus),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RestoreTheRiverDepots),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.KeepFarmTeamsForTheHarvest),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Moesia11: {
      name: () => $t(L.BeyondTheRiverForts),
      image: EventImage.StoneBridge,
      desc: () => $t(L.BeyondTheRiverFortsDesc),
      condition: {
         province: new Set(["Moesia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10092619, 10092618, 10158154], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.HonorTheFrontierGarrisons),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Dacia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.ReassureTheRiverTowns),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Dacia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.SupportTheFrontierFarms),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Dacia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Moesia12: {
      name: () => $t(L.AnOpeningTowardTheAdriatic),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.AnOpeningTowardTheAdriaticDesc),
      condition: {
         province: new Set(["Moesia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* mediterraneanCoastChecks(1, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.LeaseTheNewHarbourStalls),
            resources: { gold: 1000 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.RegisterTheCoastalEstates),
            resources: { administrative: 100 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.CultivateThePortSEnvoys),
            resources: { diplomatic: 100 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Moesia13: {
      name: () => $t(L.RoadsAcrossTheBalkans),
      image: EventImage.RomanAudience,
      desc: () => $t(L.RoadsAcrossTheBalkansDesc),
      condition: {
         province: new Set(["Moesia"]),
         annexAndCore: {
            Thracia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.CollectDuesAtTheRoadStations),
            resources: { gold: 1000 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.AppointLocalRoadMagistrates),
            resources: { administrative: 100 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.RecruitEnvoysFromTheTowns),
            resources: { diplomatic: 100 },
            casusBelli: {
               Dalmatia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Moesia14: {
      name: () => $t(L.AnAudienceInConstantinople),
      image: EventImage.ConstantinopleBuilt,
      desc: () => $t(L.AnAudienceInConstantinopleDesc),
      condition: {
         province: new Set(["Moesia", "Dacia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* isCoreTileChecks(Tiles.Constantinople, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.TrainOfficersAtTheCityGarrison),
            resources: { generalSkillPoint: 2 },
         },
         {
            label: () => $t(L.SponsorTheCivicNotables),
            resources: { consulPoint: 2 },
         },
         {
            label: () => $t(L.SeekAMandateAtCourt),
            resources: { mandate: 1 },
         },
      ],
   },
   Moesia15: {
      name: () => $t(L.ACouncilForTheDanubeRoads),
      image: EventImage.ImperialRescript,
      desc: () => $t(L.ACouncilForTheDanubeRoadsDesc),
      condition: {
         province: new Set(["Moesia"]),
         annexAndCore: {
            Dacia: Number.POSITIVE_INFINITY,
            Dalmatia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishAnotherRegionalCapital),
            modifiers: {
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.RecognizeMoreLocalCustoms),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ProtectMoreLocalShrines),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
   Moesia16: {
      name: () => $t(L.ARealmBeyondTheDanube),
      image: EventImage.ImperialCity,
      desc: () => $t(L.ARealmBeyondTheDanubeDesc),
      condition: {
         province: new Set(["Moesia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province.Moesia.tiles.length * 3, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheProvincialOffices),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
         {
            label: () => $t(L.StrengthenTheMilitaryStaff),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ReconcileOurNeighbours),
            custom: [resetWarmongerPenaltyEffect()],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
