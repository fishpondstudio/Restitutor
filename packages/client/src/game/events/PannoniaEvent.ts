import { $t, L } from "../../utils/i18n";
import {
   forcePatronageEffect,
   makeCoreCountCondition,
   marriageCondition,
   maxCoreTileCondition,
   mediterraneanCoastCondition,
   minCoreTileCondition,
   minTileUpgradeTimesCondition,
   provinceResourceCondition,
   victoryCountCondition,
} from "../logic/MissionLogic";
import { requireAnyTreatyBetween, requireNoTreatyBetween, requirePeaceBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const PannoniaEvent = {
   Pannonia1: {
      name: () => $t(L.AquincumBecomesAColonia),
      wikipedia: "Aquincum",
      image: EventImage.ImperialCity,
      desc: () => $t(L.AquincumBecomesAColoniaDesc),
      condition: {
         province: ["Pannonia"],
         year: [194, 194],
      },
      buttons: [
         {
            label: () => $t(L.FundTheNewColoniasWorks),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConfirmTheLocalCharters),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SellTheMunicipalOffices),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia2: {
      name: () => $t(L.CaracallaOnTheDanube),
      wikipedia: "Caracalla",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.CaracallaOnTheDanubeDesc),
      condition: {
         province: ["Pannonia"],
         year: [214, 214],
      },
      buttons: [
         {
            label: () => $t(L.RepairTheBrigetioDefenses),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RecountTheFrontierHouseholds),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForVeteranSettlers),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia3: {
      name: () => $t(L.IngenuusAtSirmium),
      wikipedia: "Ingenuus",
      image: EventImage.ClaudiusEmperor,
      desc: () => $t(L.IngenuusAtSirmiumDesc),
      condition: {
         province: ["Pannonia"],
         year: [258, 258],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionTheSirmiumGarrison),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureTheTownsForGallienus),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SealTheProvincialTreasury),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia4: {
      name: () => $t(L.TheUnfinishedWorksOfProbus),
      wikipedia: "Probus_(emperor)",
      image: EventImage.MoorlandCanal,
      desc: () => $t(L.TheUnfinishedWorksOfProbusDesc),
      condition: {
         province: ["Pannonia"],
         year: [282, 282],
      },
      buttons: [
         {
            label: () => $t(L.FinishTheCanalWithPaidLabor),
            resources: { gold: -750 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionToPunishTheMutineers),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AbandonProbussReclamation),
            resources: { administrative: 50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia5: {
      name: () => $t(L.TheConferenceAtCarnuntum),
      wikipedia: "Conference_of_Carnuntum",
      image: EventImage.JulianDebate,
      desc: () => $t(L.TheConferenceAtCarnuntumDesc),
      condition: {
         province: ["Pannonia"],
         year: [308, 308],
      },
      buttons: [
         {
            label: () => $t(L.PrepareAnImperialResidence),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.GuardTheRoadsAndDelegates),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForTaxRemissions),
            resources: { diplomatic: -50, gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia6: {
      name: () => $t(L.TheSlaughterAtMursa),
      wikipedia: "Battle_of_Mursa_Major",
      image: EventImage.DeciusDeath,
      desc: () => $t(L.TheSlaughterAtMursaDesc),
      condition: {
         province: ["Pannonia"],
         year: [351, 351],
      },
      buttons: [
         {
            label: () => $t(L.FortifyMursasApproaches),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.OpenHospitalsAndGranaries),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WithholdStoresFromBothArmies),
            resources: { administrative: 50 },
            modifiers: {
               WarPower: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia7: {
      name: () => $t(L.TheMurderOfKingGabinius),
      wikipedia: "Valentinian_I",
      image: EventImage.TribalCrossing,
      desc: () => $t(L.TheMurderOfKingGabiniusDesc),
      condition: {
         province: ["Pannonia"],
         year: [374, 374],
      },
      buttons: [
         {
            label: () => $t(L.ShelterTheFarmsBehindWalls),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MusterMobileFrontierTroops),
            resources: { military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SendEnvoysAcrossTheDanube),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia8: {
      name: () => $t(L.TheRoadsToItalia),
      wikipedia: "Radagaisus",
      image: EventImage.CivilianMigration,
      desc: () => $t(L.TheRoadsToItaliaDesc),
      condition: {
         province: ["Pannonia"],
         year: [405, 405],
      },
      buttons: [
         {
            label: () => $t(L.HoldTheRemainingDanubeForts),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortTheRefugeesToSirmium),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StripTheAbandonedPosts),
            resources: { administrative: 50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Pannonia9: {
      name: () => $t(L.TheHunsDemandOurFrontier),
      wikipedia: "History_of_the_Huns",
      image: EventImage.MountedParley,
      desc: () => $t(L.TheHunsDemandOurFrontierDesc),
      condition: {
         province: ["Pannonia"],
         year: [433, 433],
      },
      buttons: [
         {
            label: () => $t(L.OfferTributeButNoTerritory),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReinforceTheFrontierTowns),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitHunnicBorderGuards),
            resources: { diplomatic: -50, gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia10: {
      name: () => $t(L.TheEarthquakeAtSavaria),
      wikipedia: "Savaria",
      image: EventImage.PompeiiRefugees,
      desc: () => $t(L.TheEarthquakeAtSavariaDesc),
      condition: {
         province: ["Pannonia"],
         year: [456, 456],
      },
      buttons: [
         {
            label: () => $t(L.RebuildThePublicBuildings),
            resources: { gold: -1000 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.HouseSurvivorsOnNearbyEstates),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SalvageStoneForTheFrontier),
            resources: { administrative: 50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Pannonia11: {
      name: () => $t(L.ClaimsOnTheUpperDanube),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.ClaimsOnTheUpperDanubeDesc),
      condition: {
         province: ["Pannonia"],
         conditions: (province, save) => [
            minTileUpgradeTimesCondition(10, province, save),
            provinceResourceCondition("gold", 1000, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.PressOurNoricanClaims),
            resources: { gold: -1000 },
            casusBelli: {
               Noricum: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
            makeCore: [9699398, 9633863],
         },
      ],
   },
   Pannonia12: {
      name: () => $t(L.APannonianCoast),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.APannonianCoastDesc),
      condition: {
         province: ["Pannonia"],
         conditions: (province, save) => [mediterraneanCoastCondition(3, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.AdministerTheCoastalCities),
            resources: { administrative: 100 },
         },
         {
            label: () => $t(L.OpenTheHarborsToEnvoys),
            resources: { diplomatic: 100 },
         },
         {
            label: () => $t(L.MusterTheCoastalGarrisons),
            resources: { military: 100 },
         },
      ],
   },
   Pannonia13: {
      name: () => $t(L.TheNoricanPetition),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.TheNoricanPetitionDesc),
      condition: {
         province: ["Pannonia"],
         conditions: (province, save) => [
            minCoreTileCondition(15, province, save),
            maxCoreTileCondition(5, "Noricum", save),
            marriageCondition(province, "Noricum", save),
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Noricum", save),
            requirePeaceBetween(province, "Noricum", save),
            requireNoTreatyBetween(["Patron"], province, "Noricum", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveNoricumAsOurClient),
            custom: [forcePatronageEffect("Noricum")],
         },
      ],
   },
   Pannonia14: {
      name: () => $t(L.PannoniaAscendant),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.PannoniaAscendantDesc),
      condition: {
         province: ["Pannonia"],
         conditions: (province, save) => [
            victoryCountCondition(5, province, save),
            makeCoreCountCondition(10, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ClaimAMandateToGovern),
            resources: { mandate: 1 },
         },
         {
            label: () => $t(L.HonorOurSenatorsAndGenerals),
            resources: { consulPoint: 2, generalSkillPoint: 2 },
         },
         {
            label: () => $t(L.WelcomeThePeoplesWeNowGovern),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
      ],
   },
   Pannonia15: {
      name: () => $t(L.PannoniaBetweenEastAndWest),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.PannoniaBetweenEastAndWestDesc),
      condition: {
         province: ["Pannonia"],
         annexAndCore: {
            Noricum: Number.POSITIVE_INFINITY,
            Dalmatia: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.PrepareAWesternCampaign),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 10 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
            casusBelli: {
               Raetia: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Italia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.PrepareAnEasternCampaign),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 10 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 10 * 12 },
               Dacia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
