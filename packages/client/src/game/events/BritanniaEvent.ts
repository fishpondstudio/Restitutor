import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import {
   allCoreTileCondition,
   isCoreTileCondition,
   manpowerCondition,
   maxCoreTileCondition,
   mediterraneanCoastCondition,
   minCoreTileCondition,
   provinceRevenueCondition,
} from "../logic/MissionLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const BritanniaEvent = {
   Britannia1: {
      name: () => $t(L.TheEmperorAtEboracum),
      wikipedia: "Septimius_Severus",
      image: EventImage.RomanWall,
      desc: () => $t(L.TheEmperorAtEboracumDesc),
      condition: {
         province: ["Britannia"],
         year: [208, 208],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionTheEmperorSArmy),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StrengthenTheFrontierForts),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepGrainForBritannia),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia2: {
      name: () => $t(L.TheImperialDivisionOfBritannia),
      wikipedia: "Roman_Britain",
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheImperialDivisionOfBritanniaDesc),
      condition: {
         province: ["Britannia"],
         year: [214, 214],
      },
      buttons: [
         {
            label: () => $t(L.ImplementTheImperialDivision),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PreserveACommonMilitaryCommand),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.DelegateCollectionToTheCities),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia3: {
      name: () => $t(L.CarausiusAndTheChannelFleet),
      wikipedia: "Carausius",
      image: EventImage.RomanGalley,
      desc: () => $t(L.CarausiusAndTheChannelFleetDesc),
      condition: {
         province: ["Britannia"],
         year: [286, 286],
      },
      buttons: [
         {
            label: () => $t(L.RecognizeCarausiusAsAugustus),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SubsidizeTheChannelFleet),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReaffirmLoyaltyToMaximian),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia4: {
      name: () => $t(L.ConstantiusLandsInBritannia),
      wikipedia: "Carausian_revolt",
      image: EventImage.RomanInvasion,
      desc: () => $t(L.ConstantiusLandsInBritanniaDesc),
      condition: {
         province: ["Britannia"],
         year: [296, 296],
      },
      buttons: [
         {
            label: () => $t(L.AcknowledgeConstantiusSRule),
            resources: { diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RepairTheInvadedChannelPorts),
            resources: { gold: -500 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AbsorbTheDefeatedGarrisons),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia5: {
      name: () => $t(L.ConstantineSClaimFromEboracum),
      wikipedia: "Constantine_the_Great",
      image: EventImage.ClaudiusEmperor,
      desc: () => $t(L.ConstantineSClaimFromEboracumDesc),
      condition: {
         province: ["Britannia"],
         year: [306, 306],
      },
      buttons: [
         {
            label: () => $t(L.EndorseConstantineSClaim),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateWithGalerius),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheGovernmentNeutral),
            resources: { military: 50 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia6: {
      name: () => $t(L.ASummonsToArelate),
      wikipedia: "Council_of_Arles_(314)",
      image: EventImage.NicaeaCouncil,
      desc: () => $t(L.ASummonsToArelateDesc),
      condition: {
         province: ["Britannia"],
         year: [314, 314],
      },
      buttons: [
         {
            label: () => $t(L.FundTheBritishDelegation),
            resources: { administrative: -50, christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheDisputeWithinBritannia),
            resources: { christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MakeTheCitiesBearTheCost),
            resources: { gold: 500, christianity: 5 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia7: {
      name: () => $t(L.TheWinterCrossingOfConstans),
      wikipedia: "Constans",
      image: EventImage.RomanExpedition,
      desc: () => $t(L.TheWinterCrossingOfConstansDesc),
      condition: {
         province: ["Britannia"],
         year: [343, 343],
      },
      buttons: [
         {
            label: () => $t(L.EscortTheImperialRetinue),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReceiveTheEmperorInTheCities),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PressBritanniaSFrontierClaims),
            resources: { diplomatic: -50, gold: 500 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia8: {
      name: () => $t(L.TheGreatConspiracy),
      wikipedia: "Great_Conspiracy",
      image: EventImage.EmpireDestruction,
      desc: () => $t(L.TheGreatConspiracyDesc),
      condition: {
         province: ["Britannia"],
         year: [367, 367],
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheFrontierCommands),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnlistSurrenderedWarbands),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.DefendTheWalledCities),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia9: {
      name: () => $t(L.MaximusAppealsToBritannia),
      wikipedia: "Magnus_Maximus",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.MaximusAppealsToBritanniaDesc),
      condition: {
         province: ["Britannia"],
         year: [383, 383],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionMaximusSExpedition),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RaiseReplacementGarrisons),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WarnGratianOfTheUsurpation),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia10: {
      name: () => $t(L.ConstantinePreparesToLeave),
      wikipedia: "Constantine_III_(Western_Roman_emperor)",
      image: EventImage.TroopDeparture,
      desc: () => $t(L.ConstantinePreparesToLeaveDesc),
      condition: {
         province: ["Britannia"],
         year: [407, 407],
      },
      buttons: [
         {
            label: () => $t(L.EquipConstantineSExpedition),
            resources: { military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RetainTheProvincialGarrisons),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArmTheTownsAndEstates),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia11: {
      name: () => $t(L.BritanniaLooksToTheContinent),
      image: EventImage.TroopDeparture,
      desc: () => $t(L.BritanniaLooksToTheContinentDesc),
      condition: {
         province: ["Britannia"],
         conditions: (province, save) => {
            return [manpowerCondition(4500, province, save), provinceRevenueCondition(1500, province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.PrepareTheRhineExpedition),
            casusBelli: {
               Germania: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.SeizeTheBelgicCoast),
            casusBelli: {
               Belgica: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
         {
            label: () => $t(L.StrikeIntoNorthernGaul),
            casusBelli: {
               Lugdunensis: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Britannia12: {
      name: () => $t(L.ABridgeheadAcrossTheChannel),
      image: EventImage.RomanGalley,
      desc: () => $t(L.ABridgeheadAcrossTheChannelDesc),
      condition: {
         province: ["Britannia"],
         conditions: (province, save) => {
            return [allCoreTileCondition([8978497, 8978498, 8912963, 8847427], province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.UnifyTheNewDistricts),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OpenTheChannelMarkets),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheGallicBridgehead),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
      ],
   },
   Britannia13: {
      name: () => $t(L.BelgicaSeeksOurProtection),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.BritanniaBelgicaSeeksOurProtectionDesc),
      condition: {
         province: ["Britannia"],
         annexAndCore: {
            Belgica: 5,
         },
         conditions: (province, save) => {
            return [
               minCoreTileCondition(30, province, save),
               maxCoreTileCondition(5, "Belgica", save),
               requirePeaceBetween(province, "Belgica", save),
               requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Belgica", save),
               requireNoTreatyBetween(["Patron"], province, "Belgica", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.ReceiveBelgicaAsOurClient),
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
   Britannia14: {
      name: () => $t(L.LutetiaOpensTheHeartOfGaul),
      image: EventImage.RomanAudience,
      desc: () => $t(L.LutetiaOpensTheHeartOfGaulDesc),
      condition: {
         playerOnly: true,
         province: ["Britannia"],
         annexAndCore: {
            Lugdunensis: 5,
         },
         conditions: (province, save) => {
            return [isCoreTileCondition(8978500, province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.MapTheRoadsAndFortifications),
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.1, duration: 5 * 12, province: "Lugdunensis" },
            ],
         },
         {
            label: () => $t(L.SubornTheProvincialOfficers),
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.1, duration: 5 * 12, province: "Lugdunensis" },
            ],
         },
         {
            label: () => $t(L.InflameTheGallicFactions),
            provinceModifiers: [
               { modifier: "Stability", type: "add", value: -10, duration: 5 * 12, province: "Lugdunensis" },
            ],
         },
      ],
   },
   Britannia15: {
      name: () => $t(L.BritanniaRulesNorthernGaul),
      image: EventImage.VercingetorixSurrenders,
      desc: () => $t(L.BritanniaRulesNorthernGaulDesc),
      condition: {
         province: ["Britannia"],
         annexAndCore: {
            Lugdunensis: Number.POSITIVE_INFINITY,
            Belgica: Number.POSITIVE_INFINITY,
            Germania: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.ExtendBritannianLawToGaul),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 10 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTheGallicCities),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 10 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.HonorTheConqueringArmies),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 10 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 5 * 12 },
            },
         },
      ],
   },
   Britannia16: {
      name: () => $t(L.BritanniaReachesTheMediterranean),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.BritanniaReachesTheMediterraneanDesc),
      condition: {
         province: ["Britannia"],
         conditions: (province, save) => {
            return [mediterraneanCoastCondition(5, province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.CollectTheNewHarborDues),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.StudyTheSouthernAdministrations),
            resources: { diplomatic: 30, administrative: 30, military: 30 },
         },
         {
            label: () => $t(L.ClaimCreditBeforeTheSenate),
            resources: { consulPoint: 2 },
         },
      ],
   },
   Britannia17: {
      name: () => $t(L.ABritannianFootholdInHispania),
      image: EventImage.Pyrenees,
      desc: () => $t(L.ABritannianFootholdInHispaniaDesc),
      condition: {
         province: ["Britannia"],
         annexAndCore: { Tarraconensis: 5 },
      },
      buttons: [
         {
            label: () => $t(L.LevyTributeFromTheNewEstates),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.ConsultTheHispanicMagistrates),
            resources: { diplomatic: 30, administrative: 30, military: 30 },
         },
         {
            label: () => $t(L.ProclaimTheHispanicConquest),
            resources: { consulPoint: 2 },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
