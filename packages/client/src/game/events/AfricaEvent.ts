import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province } from "../definitions/Province";
import { marriageCondition, minCoreTileCondition, provinceResourceCondition } from "../logic/MissionLogic";
import {
   dissolveAllTreaties,
   requireAnyTreatyBetween,
   requireHigherPrestige,
   requireNoTreatyBetween,
   requirePeaceBetween,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const AfricaEvent = {
   Africa1: {
      name: () => $t(L.ThePassionOfPerpetuaAndFelicity),
      wikipedia: "Perpetua_and_Felicity",
      image: EventImage.StephenStoning,
      desc: () => $t(L.ThePassionOfPerpetuaAndFelicityDesc),
      condition: {
         province: ["Africa"],
         year: [203, 203],
      },
      buttons: [
         {
            label: () => $t(L.PermitTheFaithfulToHonorThem),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PreserveTheAccountBanTheCult),
            resources: { administrative: 75, christianity: -10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheArenaMakeAnExample),
            resources: { gold: 300, christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa2: {
      name: () => $t(L.CyprianBeforeTheProconsul),
      wikipedia: "Cyprian",
      image: EventImage.SaintHealing,
      desc: () => $t(L.CyprianBeforeTheProconsulDesc),
      condition: {
         province: ["Africa"],
         year: [258, 258],
      },
      buttons: [
         {
            label: () => $t(L.RaiseAShrineOutsideCarthage),
            resources: { gold: -500, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConfiscateTheBishopsEstates),
            resources: { gold: 750, christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepHisWritingsInTheArchives),
            resources: { administrative: 100, diplomatic: -50, christianity: 5 },
         },
      ],
   },
   Africa3: {
      name: () => $t(L.ThePrisonersOfAbitina),
      wikipedia: "Martyrs_of_Abitinae",
      image: EventImage.MartyrsPrayer,
      desc: () => $t(L.ThePrisonersOfAbitinaDesc),
      condition: {
         province: ["Africa"],
         year: [304, 304],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveTheConfessorsOfAbitina),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.UpholdTheBanOnAssemblies),
            resources: { administrative: 75, christianity: -15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa4: {
      name: () => $t(L.TheBrokenQuaysOfLepcis),
      wikipedia: "365_Crete_earthquake",
      image: EventImage.Flood,
      desc: () => $t(L.TheBrokenQuaysOfLepcisDesc),
      condition: {
         province: ["Africa"],
         year: [365, 365],
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheHarborWorks),
            resources: { gold: -750 },
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RelieveTheFloodedNeighborhoods),
            resources: { gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.WithdrawBehindStrongerWalls),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa5: {
      name: () => $t(L.GildoWithholdsTheGrain),
      wikipedia: "Gildonic_War",
      image: EventImage.HonoriusCourt,
      desc: () => $t(L.GildoWithholdsTheGrainDesc),
      condition: {
         province: ["Africa"],
         year: [397, 397],
      },
      buttons: [
         {
            label: () => $t(L.ShipTheGrainDespiteGildo),
            resources: { gold: -300, diplomatic: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BackTheAfricanCommand),
            resources: { military: 75 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepTheGranariesForOurCities),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa6: {
      name: () => $t(L.TheConferenceOfCarthage),
      wikipedia: "Councils_of_Carthage",
      image: EventImage.Donatism,
      desc: () => $t(L.TheConferenceOfCarthageDesc),
      condition: {
         province: ["Africa"],
         year: [411, 411],
      },
      buttons: [
         {
            label: () => $t(L.EnforceTheImperialVerdict),
            resources: { christianity: 10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BrokerPeaceBetweenTheChurches),
            resources: { diplomatic: -50, christianity: -5 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.LetEachCitySettleItsChurches),
            resources: { administrative: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa7: {
      name: () => $t(L.HeracliansArmada),
      wikipedia: "Heraclianus",
      image: EventImage.NavalBattle,
      desc: () => $t(L.HeracliansArmadaDesc),
      condition: {
         province: ["Africa"],
         year: [413, 413],
      },
      buttons: [
         {
            label: () => $t(L.EquipTheExpeditionToItaly),
            resources: { gold: -500, military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SecureAfricaAndRefuseHim),
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TurnTheFleetBackToCommerce),
            resources: { gold: 500 },
            modifiers: {
               TradeCapacity: { type: "add", value: 1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa8: {
      name: () => $t(L.TheVandalLandSettlement),
      wikipedia: "Vandal_Kingdom",
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.TheVandalLandSettlementDesc),
      condition: {
         province: ["Africa"],
         year: [442, 442],
      },
      buttons: [
         {
            label: () => $t(L.RegisterTheVandalLandGrants),
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.DefendTheEstablishedTenants),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveTheBestEstatesForTheCrown),
            resources: { gold: 750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa9: {
      name: () => $t(L.TheLastAlmsOfDeogratias),
      wikipedia: "Deogratias_(bishop)",
      image: EventImage.SaintConsecration,
      desc: () => $t(L.TheLastAlmsOfDeogratiasDesc),
      condition: {
         province: ["Africa"],
         year: [457, 457],
      },
      buttons: [
         {
            label: () => $t(L.ContinueTheBishopsRelief),
            resources: { gold: -500, christianity: 10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionToFillTheVacantSee),
            resources: { diplomatic: -50, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ReturnTheBasilicasToWorship),
            resources: { administrative: 75 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Africa10: {
      name: () => $t(L.TheFireShipsOfCapeBon),
      wikipedia: "Battle_of_Cape_Bon_(468)",
      image: EventImage.NavalBattle,
      desc: () => $t(L.TheFireShipsOfCapeBonDesc),
      condition: {
         province: ["Africa"],
         year: [468, 468],
      },
      buttons: [
         {
            label: () => $t(L.LaunchTheFireShips),
            resources: { military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OfferTermsBeforeTheAttack),
            resources: { diplomatic: 100 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PrepareCarthageForALanding),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Africa11: {
      name: () => $t(L.TheSardinianCompact),
      image: EventImage.QueenEmbarkation,
      desc: () => $t(L.TheSardinianCompactDesc),
      condition: {
         province: ["Africa"],
         conditions: (province, save) => [
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Sardinia", save),
            requireNoTreatyBetween(["Patron"], province, "Sardinia", save),
            requirePeaceBetween(province, "Sardinia", save),
            requireHigherPrestige(province, "Sardinia", 2.5, save),
            marriageCondition(province, "Sardinia", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.ReceiveSardiniaAsOurClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Sardinia", save);
                     OfferPatronageAction(province, "Sardinia", save).effect({ headless: false });
                  },
                  desc: (_province, _save) => $t(L.$1BecomesOurClient, Province.Sardinia.name()),
               },
            ],
         },
      ],
   },
   Africa12: {
      name: () => $t(L.CorsicaUnderOurProtection),
      image: EventImage.ImperialPatronage,
      desc: () => $t(L.CorsicaUnderOurProtectionDesc),
      condition: {
         province: ["Africa"],
         conditions: (province, save) => [
            requireAnyTreatyBetween(["DefensePact", "Alliance"], province, "Corsica", save),
            requireNoTreatyBetween(["Patron"], province, "Corsica", save),
            requirePeaceBetween(province, "Corsica", save),
            requireHigherPrestige(province, "Corsica", 2.5, save),
            provinceResourceCondition("gold", 5000, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.EndowCorsicaAndSecureItsLoyalty),
            resources: { gold: -5000 },
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Corsica", save);
                     OfferPatronageAction(province, "Corsica", save).effect({ headless: false });
                  },
                  desc: (_province, _save) => $t(L.$1BecomesOurClient, Province.Corsica.name()),
               },
            ],
         },
      ],
   },
   Africa13: {
      name: () => $t(L.AnAfricanFootholdInSicilia),
      image: EventImage.RomanInvasion,
      desc: () => $t(L.AnAfricanFootholdInSiciliaDesc),
      condition: {
         province: ["Africa"],
         annexAndCore: { Sicilia: 2 },
      },
      buttons: [
         {
            label: () => $t(L.PressTheInvasionWithFullForce),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 12 * 2 },
            },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.LetOurGeneralsDirectTheCampaign),
            resources: { generalSkillPoint: 2 },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.SupplyTheArmyFromSicilianPorts),
            modifiers: {
               ArmyMaintenance: { type: "multiply", value: -0.2, duration: 12 * 2 },
            },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Africa14: {
      name: () => $t(L.TheRoadFromCarthageToRome),
      image: EventImage.VandalsInItaly,
      desc: () => $t(L.TheRoadFromCarthageToRomeDesc),
      condition: {
         province: ["Africa"],
         annexAndCore: { Sicilia: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.LaunchAnUnrelentingInvasion),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.CreateAPermanentExpeditionaryCommand),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.ExtendAfricasTaxSystemNorth),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1 },
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Africa15: {
      name: () => $t(L.ARealmOfManyPeoples),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.ARealmOfManyPeoplesDesc),
      condition: {
         province: ["Africa"],
         conditions: (province, save) => [minCoreTileCondition(40, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.AdmitProvincialElitesToOffice),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.GuaranteeEveryLawfulWorship),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
