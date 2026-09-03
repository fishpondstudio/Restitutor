import { $t, L } from "../../utils/i18n";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import {
   forcePatronageEffect,
   isCoreTileCondition,
   manpowerCondition,
   maxCoreTileCondition,
   mediterraneanCoastCondition,
   minCoreTileCondition,
   provinceRevenueCondition,
} from "../logic/MissionLogic";
import { requireNoTreatyBetween, requirePeaceBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const NoricumEvent = {
   Noricum1: {
      name: () => $t(L.TheRoadsOfNoricum),
      wikipedia: "Danubian_Limes",
      image: EventImage.StoneBridge,
      desc: () => $t(L.TheRoadsOfNoricumDesc),
      condition: {
         province: ["Noricum"],
         year: [195, 195],
      },
      buttons: [
         {
            label: () => $t(L.FundTheWholeRoadProgram),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RequireLaborFromTheRoadTowns),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RepairTheFrontierRouteFirst),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum2: {
      name: () => $t(L.TheCentonariiOfFlaviaSolva),
      wikipedia: "Flavia_Solva",
      image: EventImage.ImperialRescript,
      desc: () => $t(L.TheCentonariiOfFlaviaSolvaDesc),
      condition: {
         province: ["Noricum"],
         year: [205, 205],
      },
      buttons: [
         {
            label: () => $t(L.UpholdTheWorkersPrivileges),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaskTheGuildWithFireDuty),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EndEveryExemption),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum3: {
      name: () => $t(L.RaidsOnTheNoricanFrontier),
      wikipedia: "Alamanni",
      image: EventImage.TribalCrossing,
      desc: () => $t(L.RaidsOnTheNoricanFrontierDesc),
      condition: {
         province: ["Noricum"],
         year: [236, 236],
      },
      buttons: [
         {
            label: () => $t(L.ReinforceTheNoricanLimes),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.MeetThemWithFieldTroops),
            resources: { military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PayTheRaidersToWithdraw),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum4: {
      name: () => $t(L.ValeriansNorthernMuster),
      wikipedia: "Valerian_(emperor)",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.ValeriansNorthernMusterDesc),
      condition: {
         province: ["Noricum"],
         year: [253, 253],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionValeriansArmy),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReinforceLegioIIItalica),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.KeepOurRecruitsAtHome),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               WarPower: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum5: {
      name: () => $t(L.DiocletiansFrontierReforms),
      wikipedia: "Diocletian",
      image: EventImage.RomanWall,
      desc: () => $t(L.DiocletiansFrontierReformsDesc),
      condition: {
         province: ["Noricum"],
         year: [288, 288],
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheFrontierForts),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ExpandTheMilitaryWorkshops),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConcentrateTheGarrisons),
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum6: {
      name: () => $t(L.NoricanBishopsAtSerdica),
      wikipedia: "Council_of_Serdica",
      image: EventImage.NicaeaCouncil,
      desc: () => $t(L.NoricanBishopsAtSerdicaDesc),
      condition: {
         province: ["Noricum"],
         year: [343, 343],
      },
      buttons: [
         {
            label: () => $t(L.FundTheNoricanDelegation),
            resources: { gold: -500, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RecognizeTheProvincialSees),
            resources: { administrative: -50 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepChurchAffairsLocal),
            resources: { christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum7: {
      name: () => $t(L.TheBurgusAtTheYbbs),
      wikipedia: "Danubian_Limes",
      image: EventImage.Watchtower,
      desc: () => $t(L.TheBurgusAtTheYbbsDesc),
      condition: {
         province: ["Noricum"],
         year: [370, 370],
      },
      buttons: [
         {
            label: () => $t(L.RaiseAChainOfStoneBurgi),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.LinkTheTowersByRiverPatrol),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RequireLaborFromNearbyTowns),
            resources: { administrative: 50 },
            modifiers: {
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum8: {
      name: () => $t(L.AlaricWaitsInNoricum),
      wikipedia: "Alaric_I",
      image: EventImage.MountedParley,
      desc: () => $t(L.AlaricWaitsInNoricumDesc),
      condition: {
         province: ["Noricum"],
         year: [408, 408],
      },
      buttons: [
         {
            label: () => $t(L.SupplyTheGothicCamp),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CloseTheRoadsAndPasses),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionTheCourtToPay),
            resources: { diplomatic: -50, gold: -500, consulPoint: 1 },
         },
      ],
   },
   Noricum9: {
      name: () => $t(L.TheDeathOfSeverinus),
      wikipedia: "Severinus_of_Noricum",
      image: EventImage.AugustineDeath,
      desc: () => $t(L.TheDeathOfSeverinusDesc),
      condition: {
         province: ["Noricum"],
         year: [482, 482],
      },
      buttons: [
         {
            label: () => $t(L.EndowTheMonasteryAtFavianis),
            resources: { gold: -500, christianity: 15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StockTheFortifiedTowns),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeizeTheMonasticStores),
            resources: { administrative: 50, christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum10: {
      name: () => $t(L.TheEvacuationOfNoricum),
      wikipedia: "Odoacer",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.TheEvacuationOfNoricumDesc),
      condition: {
         province: ["Noricum"],
         year: [488, 488],
      },
      buttons: [
         {
            label: () => $t(L.OrganizeTheMarchToItalia),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.HoldTheFortifiedTowns),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateTermsWithOdoacer),
            resources: { diplomatic: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.15, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum11: {
      name: () => $t(L.ThreeRoadsToWar),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ThreeRoadsToWarDesc),
      condition: {
         province: ["Noricum"],
         conditions: (province, save) => [
            manpowerCondition(40_000, province, save),
            provinceRevenueCondition(120, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.PetitionForARaetianCampaign),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Raetia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PetitionForAnItalianCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PetitionForAPannonianCampaign),
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 2 * 12 },
            },
            casusBelli: {
               Pannonia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Noricum12: {
      name: () => $t(L.TheSeawardGate),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheSeawardGateDesc),
      condition: {
         province: ["Noricum"],
         conditions: (province, save) => [mediterraneanCoastCondition(4, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.CollectTheHarborCustoms),
            resources: { gold: 500 },
         },
         {
            label: () => $t(L.OpenTheCoastalMarkets),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ExtendTheTaxOffices),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Noricum13: {
      name: () => $t(L.TheAlpineBalance),
      image: EventImage.Alps,
      desc: () => $t(L.TheAlpineBalanceDesc),
      condition: {
         province: ["Noricum"],
         onMap: { Raetia: true },
         playerOnly: true,
         conditions: (province, save) => [
            minCoreTileCondition(15, "Noricum", save),
            maxCoreTileCondition(5, "Raetia", save),
            isCoreTileCondition(9437254, province, save),
            requireNoTreatyBetween(["Patron"], province, "Raetia", save),
            requirePeaceBetween(province, "Raetia", save),
            availableDiplomatCondition(province, "Raetia", save),
            availableDiplomatCondition("Raetia", province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.OfferRaetiaOurProtection),
            custom: [forcePatronageEffect("Raetia")],
         },
         {
            label: () => $t(L.PetitionForWarOverThePasses),
            provinceModifiers: [
               { province: "Raetia", modifier: "WarPower", type: "multiply", value: -0.4, duration: 5 * 12 },
            ],
            casusBelli: {
               Raetia: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Noricum14: {
      name: () => $t(L.ARealmOfManyPeoples),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.OurRealmOfManyPeoplesDesc),
      condition: {
         province: ["Noricum"],
         conditions: (province, save) => [minCoreTileCondition(20, "Noricum", save)],
         annexAndCore: { Italia: 5, Raetia: 5, Pannonia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.PetitionForAMandateToRule),
            resources: { mandate: 1 },
         },
         {
            label: () => $t(L.TolerateTheGatheredFaiths),
            modifiers: { ToleratedReligion: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.TolerateTheGatheredCultures),
            modifiers: { ToleratedCulture: { type: "add", value: 1 } },
         },
      ],
   },
   Noricum15: {
      name: () => $t(L.TheDalmatianFrontier),
      image: EventImage.RomanTriumph2,
      desc: () => $t(L.TheDalmatianFrontierDesc),
      condition: {
         province: ["Noricum"],
         annexAndCore: { Dalmatia: 3 },
      },
      buttons: [
         {
            label: () => $t(L.SecureTheSouthernFrontier),
            modifiers: { Stability: { type: "add", value: 10, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.CelebrateOurAdriaticVictory),
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.PrepareTheNextCampaign),
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 } },
         },
      ],
   },
   Noricum16: {
      name: () => $t(L.BeyondTheDanube),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.BeyondTheDanubeDesc),
      condition: {
         province: ["Noricum"],
         annexAndCore: { Germania: 3 },
      },
      buttons: [
         {
            label: () => $t(L.BuildTheNewAdministration),
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.SendEnvoysAcrossTheDanube),
            modifiers: { DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 } },
         },
         {
            label: () => $t(L.PutTheFrontierUnderArms),
            modifiers: { MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
