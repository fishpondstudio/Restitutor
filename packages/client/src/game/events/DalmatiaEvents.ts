import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import { allCoreTileChecks, forcePatronageEffect, maxCoreTileChecks } from "../logic/MissionLogic";
import { requireNoTreatyBetweenChecks, requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const DalmatiaEvents = {
   Dalmatia1: {
      name: () => $t(L.WaterForDomaviasBaths),
      wikipedia: "Domavia",
      image: EventImage.Aqueduct,
      desc: () => $t(L.WaterForDomaviasBathsDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [220, 220],
      },
      buttons: [
         {
            label: () => $t(L.FundTheBathsAndWaterChannels),
            resources: { gold: -750 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AuditTheMaintenanceContracts),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.LevyTheMineOwnersForUpkeep),
            resources: { gold: 500 },
            modifiers: {
               TileOutput: { type: "multiply", value: -0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia2: {
      name: () => $t(L.TheMemoryOfVenantius),
      wikipedia: "Salona",
      image: EventImage.ChristianBurial,
      desc: () => $t(L.TheMemoryOfVenantiusDesc$1, "257"),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [257, 257],
      },
      buttons: [
         {
            label: () => $t(L.RelieveTheBereavedHouseholds),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForLocalRestraint),
            resources: { diplomatic: -50 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EnforceTheConfiscations),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 3 * 12 },
            },
         },
      ],
   },
   Dalmatia3: {
      name: () => $t(L.AnEmperorRetiresToTheAdriatic),
      wikipedia: "Diocletian%27s_Palace",
      image: EventImage.CoastalPalace,
      desc: () => $t(L.AnEmperorRetiresToTheAdriaticDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [305, 305],
      },
      buttons: [
         {
            label: () => $t(L.ProvisionTheImperialHousehold),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ImproveTheRoadsFromSalona),
            resources: { gold: -750 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.LimitCompulsoryRequisitions),
            resources: { administrative: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia4: {
      name: () => $t(L.JeromeRemembersStridon),
      wikipedia: "De_Viris_Illustribus_(Jerome)",
      image: EventImage.JeromeStudy,
      desc: () => $t(L.JeromeRemembersStridonDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [392, 392],
      },
      buttons: [
         {
            label: () => $t(L.SponsorCopiesOfJeromesWorks),
            resources: { gold: -500 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.PreserveOurMunicipalArchives),
            resources: { administrative: -50 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.EndowTeachingInOurTowns),
            resources: { gold: -750 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia5: {
      name: () => $t(L.LettersAcrossTheAdriatic),
      wikipedia: "Salona",
      image: EventImage.AugustineStudy,
      desc: () => $t(L.LettersAcrossTheAdriaticDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [419, 419],
      },
      buttons: [
         {
            label: () => $t(L.SupportTheBishopsPoorRelief),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.EscortTheMaritimeCouriers),
            resources: { military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReassureTheMunicipalCouncils),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia6: {
      name: () => $t(L.TheMusterAtSalona),
      wikipedia: "Joannes",
      image: EventImage.RomanGalley,
      desc: () => $t(L.TheMusterAtSalonaDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [425, 425],
      },
      buttons: [
         {
            label: () => $t(L.SupplyTheExpeditionsTransports),
            resources: { gold: -750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.GuardTheRoadsToItalia),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveBerthsForOurMerchants),
            resources: { administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia7: {
      name: () => $t(L.MarcellinusDefiesTheCourt),
      wikipedia: "Marcellinus_(magister_militum)",
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.MarcellinusDefiesTheCourtDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [454, 454],
      },
      buttons: [
         {
            label: () => $t(L.EquipMarcellinussTroops),
            resources: { gold: -750 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekMediationFromConstantinople),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepStoresForOurOwnGarrisons),
            resources: { military: -50 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia8: {
      name: () => $t(L.MarcellinusWillNotReturn),
      wikipedia: "Marcellinus_(magister_militum)",
      image: EventImage.RomanAudience,
      desc: () => $t(L.MarcellinusWillNotReturnDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [468, 468],
      },
      buttons: [
         {
            label: () => $t(L.GuaranteeTheSoldiersArrears),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConfirmTheMunicipalGuarantees),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.CultivateNepossEasternContacts),
            resources: { diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia9: {
      name: () => $t(L.AnEmperorFindsRefuge),
      wikipedia: "Julius_Nepos",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.AnEmperorFindsRefugeDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [475, 475],
      },
      buttons: [
         {
            label: () => $t(L.MaintainTheEmperorsHousehold),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.StrengthenTheCoastalWatch),
            resources: { military: -50, gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateLimitsOnRequisitions),
            resources: { diplomatic: -50 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia10: {
      name: () => $t(L.TheMurderOfJuliusNepos),
      wikipedia: "Julius_Nepos",
      image: EventImage.CaesarDeath2,
      desc: () => $t(L.TheMurderOfJuliusNeposDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         year: [480, 480],
      },
      buttons: [
         {
            label: () => $t(L.SecureTheHarborsAndGarrisons),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekGuaranteesFromOdoacer),
            resources: { diplomatic: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BindTheTownsToACommonCouncil),
            resources: { administrative: -50, gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Dalmatia11: {
      name: () => $t(L.TheHeadOfTheAdriatic),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TheHeadOfTheAdriaticDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([9568329, 9568328], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CollectTheHarborDues),
            resources: { gold: 1000 },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitTheCoastalOfficials),
            resources: { administrative: 30, diplomatic: 30, military: 30 },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SchoolOurCommandersInCoastalWarfare),
            resources: { generalSkillPoint: 1 },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Dalmatia12: {
      name: () => $t(L.BeyondTheDinaricPasses),
      image: EventImage.FieldHarvest,
      desc: () => $t(L.BeyondTheDinaricPassesDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         annexAndCore: { Pannonia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.SurveyThePannonianEstates),
            modifiers: {
               LandTax: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Pannonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.CoordinateTheFarmsAndWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Pannonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.CelebrateOurPannonianGains),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Pannonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Dalmatia13: {
      name: () => $t(L.AFootholdInMoesia),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.AFootholdInMoesiaDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         annexAndCore: { Moesia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.EstablishAFrontierSupplyBureau),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.BuildANetworkOfFrontierEnvoys),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.TrainOfficersForRiverCampaigns),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Moesia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Dalmatia14: {
      name: () => $t(L.DalmatianStandardsInMacedonia),
      image: EventImage.HeroTriumph,
      desc: () => $t(L.DalmatianStandardsInMacedoniaDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         annexAndCore: { Macedonia: 5 },
      },
      buttons: [
         {
            label: () => $t(L.ReorganizeTheFieldForces),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Macedonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ReconcileTheMunicipalCouncils),
            modifiers: {
               Stability: { type: "add", value: 20, duration: 2 * 12 },
            },
            casusBelli: {
               Macedonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ProclaimOurMacedonianVictories),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Macedonia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Dalmatia15: {
      name: () => $t(L.ADalmatianVoiceInItalia),
      image: EventImage.CiceroInSenate,
      desc: () => $t(L.ADalmatianVoiceInItaliaDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         annexAndCore: { Italia: 10 },
      },
      buttons: [
         {
            label: () => $t(L.CultivateOurSenatorialSupporters),
            resources: {
               consulPoint: 2,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.SecureRecognitionOfOurMandate),
            resources: {
               mandate: 1,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.DevelopOurVeteranCommanders),
            resources: {
               generalSkillPoint: 2,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Dalmatia16: {
      name: () => $t(L.PannoniaUnderOurProtection),
      image: EventImage.RomanAudience,
      desc: () => $t(L.PannoniaUnderOurProtectionDesc),
      condition: {
         province: new Set(["Dalmatia"]),
         onMap: { Pannonia: true },
         annexAndCore: {
            Pannonia: Math.ceil(Province.Pannonia.tiles.length * 0.7),
         },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(3, "Pannonia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Pannonia", save);
            yield* requirePeaceBetweenChecks(province, "Pannonia", save);
            yield* availableDiplomatChecks(province, "Pannonia", save);
            return;
         },
      },
      buttons: [
         {
            label: () => $t(L.ReceivePannoniaAsOurClient),
            custom: [forcePatronageEffect("Pannonia")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
