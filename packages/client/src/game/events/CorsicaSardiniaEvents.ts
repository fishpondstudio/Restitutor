import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import type { ConditionChecks } from "../logic/Calculation";
import { forcePatronageEffect, marriageChecks, minCoreTileChecks, provinceResourceChecks } from "../logic/MissionLogic";
import {
   requireAnyTreatyBetweenChecks,
   requireNoTreatyBetweenChecks,
   requirePeaceBetweenChecks,
} from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const CorsicaSardiniaEvents = {
   CorsicaSardinia1: {
      name: () => $t(L.SixColumnsForTheCourt),
      wikipedia: "Turris_Libisonis",
      image: EventImage.RomanAudience,
      desc: () => $t(L.SixColumnsForTheCourtDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [244, 244] },
      buttons: [
         {
            label: () => $t(L.ContributeToTheRebuilding),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArrangeHearingsForOurMerchants),
            resources: { gold: -500, administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia2: {
      name: () => $t(L.TwoEmperorsAtTheGranaryDoor),
      wikipedia: "Domitius_Alexander",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.TwoEmperorsAtTheGranaryDoorDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [308, 308] },
      buttons: [
         {
            label: () => $t(L.GuaranteeTheMerchantsCargoes),
            resources: { gold: -1000, diplomatic: -30 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.BuyGrainForOurPublicStores),
            resources: { gold: -1000 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia3: {
      name: () => $t(L.PassageForQuintasius),
      wikipedia: "Council_of_Arles_(314)",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.PassageForQuintasiusDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [314, 314] },
      buttons: [
         {
            label: () => $t(L.FundPassageAndLetterCarriers),
            resources: { gold: -500, diplomatic: 30, christianity: 10 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EquipLodgingsAlongTheSeaRoute),
            resources: { gold: -1000 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia4: {
      name: () => $t(L.AnEmptyBishopsChair),
      wikipedia: "Lucifer_of_Cagliari",
      image: EventImage.SaintCharity,
      desc: () => $t(L.AnEmptyBishopsChairDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [355, 355] },
      buttons: [
         {
            label: () => $t(L.KeepTheReliefBasketsFilled),
            resources: { gold: -1000, christianity: 10 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForClemencyForTheBishop),
            resources: { gold: -500, diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia5: {
      name: () => $t(L.LettersThatDivideTheFaithful),
      wikipedia: "Lucifer_of_Cagliari",
      image: EventImage.AugustineDebate,
      desc: () => $t(L.LettersThatDivideTheFaithfulDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [362, 362] },
      buttons: [
         {
            label: () => $t(L.HostMediatorsFromTheCongregations),
            resources: { administrative: -50, diplomatic: -30 },
            modifiers: {
               Stability: { type: "add", value: 15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EndowReliefOpenToBothParties),
            resources: { gold: -1000, christianity: 10 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia6: {
      name: () => $t(L.WaitingForTheAfricanWind),
      wikipedia: "Gildonic_War",
      image: EventImage.RomanGalley,
      desc: () => $t(L.WaitingForTheAfricanWindDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [398, 398] },
      buttons: [
         {
            label: () => $t(L.SupplyPilotsAndProvisions),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ReserveBerthsForCivilianCargoes),
            resources: { gold: -500, administrative: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia7: {
      name: () => $t(L.TheHermitsBeyondTheChannel),
      wikipedia: "Rutilius_Claudius_Namatianus",
      image: EventImage.MediterraneanIsland,
      desc: () => $t(L.TheHermitsBeyondTheChannelDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [417, 417] },
      buttons: [
         {
            label: () => $t(L.SupplyTheIslandReligiousHouses),
            resources: { gold: -1000, christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.EquipSheltersForOurCoastalCrews),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia8: {
      name: () => $t(L.BrokenOarsOffCorsica),
      wikipedia: "Battle_of_Corsica",
      image: EventImage.NavalBattle,
      desc: () => $t(L.BrokenOarsOffCorsicaDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [456, 456] },
      buttons: [
         {
            label: () => $t(L.EquipCoastalPatrols),
            resources: { gold: -1000, military: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EscortTheWaitingMerchantmen),
            resources: { gold: -500, military: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RepairBoatsAndSupportTheCrews),
            resources: { gold: -1000 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia9: {
      name: () => $t(L.MarcellinusNeedsTheHarbours),
      wikipedia: "Marcellinus_(magister_militum)",
      image: EventImage.RomanGalley,
      desc: () => $t(L.MarcellinusNeedsTheHarboursDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [468, 468] },
      buttons: [
         {
            label: () => $t(L.ProvisionTheExpedition),
            resources: { gold: -1000, military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StockAndGuardOurOwnHarbours),
            resources: { gold: -1000, administrative: -30 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia10: {
      name: () => $t(L.APeaceCarriedBySea),
      wikipedia: "Gaiseric",
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.APeaceCarriedBySeaDesc),
      condition: { province: new Set(["Corsica", "Sardinia"]), year: [474, 474] },
      buttons: [
         {
            label: () => $t(L.SeekGuaranteesForMerchantShipping),
            resources: { gold: -500, diplomatic: -50 },
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.FundTheSearchForIslandCaptives),
            resources: { gold: -1000, diplomatic: -30 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   CorsicaSardinia11: {
      name: () => $t(L.BeyondTheIslandQuays),
      image: EventImage.RomanGalley,
      desc: () => $t(L.BeyondTheIslandQuaysDesc),
      condition: {
         province: new Set(["Sardinia", "Corsica"]),
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Africa.name()),
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Italia.name()),
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PressOurClaimTo$1, Province.Narbonensis.name()),
            casusBelli: {
               Narbonensis: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   Sardinia1: {
      name: () => $t(L.APledgeFromTheNorthernShore),
      image: EventImage.RomanAudience,
      desc: () => $t(L.APledgeFromTheNorthernShoreDesc),
      condition: {
         playerOnly: true,
         province: new Set(["Sardinia"]),
         onMap: { Corsica: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "Corsica", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Corsica", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "Corsica", save);
            yield* marriageChecks(province, "Corsica", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Corsica.name()),
            custom: [forcePatronageEffect("Corsica")],
         },
      ],
   },
   Corsica1: {
      name: () => $t(L.APledgeFromTheSouthernShore),
      image: EventImage.RomanAudience,
      desc: () => $t(L.APledgeFromTheSouthernShoreDesc),
      condition: {
         playerOnly: true,
         province: new Set(["Corsica"]),
         onMap: { Sardinia: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "Sardinia", save);
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Sardinia", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "Sardinia", save);
            yield* marriageChecks(province, "Sardinia", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.$1BecomesOurClient, Province.Sardinia.name()),
            custom: [forcePatronageEffect("Sardinia")],
         },
      ],
   },
   CorsicaSardinia12: {
      name: () => $t(L.AFootholdOnTheMainland),
      image: EventImage.EmperorAndSoldiers,
      desc: () => $t(L.AFootholdOnTheMainlandDesc),
      condition: {
         province: new Set(["Sardinia", "Corsica"]),
         annexAndCore: { Italia: 2 },
      },
      buttons: [
         {
            label: () => $t(L.AdvanceItalianNotablesToOurCouncil),
            resources: {
               consulPoint: 1,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.PromoteTheCampaignsVeteranOfficers),
            resources: {
               generalSkillPoint: 1,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.RecruitStaffForTheNextAdvance),
            resources: {
               administrative: 20,
               diplomatic: 20,
               military: 20,
            },
            casusBelli: {
               Italia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   CorsicaSardinia13: {
      name: () => $t(L.SicilianSheavesBeneathOurSeal),
      image: EventImage.FieldHarvest,
      desc: () => $t(L.SicilianSheavesBeneathOurSealDesc),
      condition: {
         province: new Set(["Sardinia", "Corsica"]),
         annexAndCore: { Sicilia: 2 },
      },
      buttons: [
         {
            label: () => $t(L.SurveyEstatesAndRegularizeTheTax),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 12 * 3 },
            },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.RestoreFarmsAndEquipWorkshops),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 12 * 3 },
            },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
         {
            label: () => $t(L.EnrollLocalHouseholdsForService),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 12 * 3 },
            },
            casusBelli: {
               Sicilia: { casusBelli: "ConquestMission", duration: 12 * 5 },
            },
         },
      ],
   },
   CorsicaSardinia14: {
      name: () => $t(L.MoreThanAnIslandCouncil),
      image: EventImage.ImperialCity,
      desc: () => $t(L.MoreThanAnIslandCouncilDesc),
      condition: {
         province: new Set(["Sardinia", "Corsica"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(20, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AuthorizeAnotherRegionalCapital),
            modifiers: {
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.RecognizeAnotherPeoplesCustoms),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ExtendProtectionToAnotherFaith),
            modifiers: {
               ToleratedReligion: { type: "add", value: 1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
