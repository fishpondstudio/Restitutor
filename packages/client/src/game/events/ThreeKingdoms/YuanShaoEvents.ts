import { $t, L } from "../../../utils/i18n";
import { Province } from "../../definitions/Province";
import { requireHigherWarPowerChecks } from "../../logic/ArmyLogic";
import type { ConditionChecks } from "../../logic/Calculation";
import {
   minCoreTileChecks,
   provinceResourceChecks,
   victoryCountChecks,
   warPowerChecks,
} from "../../logic/MissionLogic";
import {
   tkCharacterAliveChecks,
   tkCharacterUnaffiliatedChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const YuanShaoEvents = {
   YuanShaoEvent1: {
      name: () => $t(L.FourGenerationsThreeExcellencies),
      desc: () => $t(L.FourGenerationsThreeExcellenciesDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["YuanShao"]),
      },
      buttons: [
         { label: () => $t(L.CallUponOurFamilyConnections), resources: { diplomatic: 75 } },
         { label: () => $t(L.GatherScholarsBeneathOurBanner), resources: { administrative: 75 } },
         { label: () => $t(L.HonorOurServiceToTheHan), resources: { consulPoint: 2 } },
      ],
   },
   YuanShaoEvent2: {
      name: () => $t(L.PacifyTheBlackMountains),
      desc: () => $t(L.PacifyTheBlackMountainsDesc),
      image: EventImage.TKMountainReconciliation,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { ZhangYan: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.EstablishYuanAuthorityInTheHills),
            resources: { administrative: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.ReconcileTheMountainCommunities),
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => $t(L.OrganizeTheDefenseOfThePasses),
            resources: { military: 50 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   YuanShaoEvent3: {
      name: () => $t(L.TheGreatFamiliesOfHebei),
      desc: () => $t(L.TheGreatFamiliesOfHebeiDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["YuanShao"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EmployTheirEnvoysAndOfficers),
            resources: { administrative: -100 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => $t(L.ExtendOurOwnCivilAdministration),
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
      ],
   },
   YuanShaoEvent4: {
      name: () => $t(L.TheYuanHouseAndTheHanCourt),
      desc: () => $t(L.TheYuanHouseAndTheHanCourtDesc),
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["YuanShao"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* warPowerChecks(10_000, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendAGenerousSubsidyToTheCourt),
            resources: { gold: -1000, consulPoint: 3 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.StrengthenOurGovernmentAtHome),
            resources: {
               administrative: 30,
               diplomatic: 30,
               military: 30,
            },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent5: {
      name: () => $t(L.OneYuanBanner),
      desc: () => $t(L.OneYuanBannerDesc),
      image: EventImage.TKPublicProclamation,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { YuanShu: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.ProclaimTheAscendancyOfOurHouse),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.ReconcileYuanShusFormerSubjects),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.RegisterTheEstatesForTaxation),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent11: {
      name: () => $t(L.ZhangHeJoinsOurService),
      desc: () => $t(L.ZhangHeJoinsOurServiceDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["YuanShao"]),
         year: [199, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("ZhangHe", save);
            yield* tkCharacterAliveChecks("ZhangHe", save);
            yield* victoryCountChecks(3, province, save);
            yield* minCoreTileChecks(Province.YuanShao.tiles.length + 6, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.WelcomeZhangHeIntoOurService),
            custom: [transferTKCharacterEffect("ZhangHe")],
         },
      ],
   },
   YuanShaoEvent6: {
      name: () => $t(L.SettlingTheNorthernRivalry),
      desc: () => $t(L.SettlingTheNorthernRivalryDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { GongsunZan: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.ReorganizeTheNorthernTaxOffices),
            resources: { administrative: 75 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.EnlistLocalSupportForProduction),
            resources: { diplomatic: 75 },
            modifiers: { TileOutput: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.MusterTheNorthernMilitaryHouseholds),
            resources: { military: 75 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   YuanShaoEvent7: {
      name: () => $t(L.TheCouncilBeforeTheCampaign),
      desc: () => $t(L.TheCouncilBeforeTheCampaignDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["YuanShao"]),
         year: [199, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimAndPrepareForWar),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               CaoCao: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => $t(L.ReplenishOurFieldsAndTreasury),
            modifiers: {
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent8: {
      name: () => $t(L.AProclamationAgainstCaoCao),
      desc: () => $t(L.AProclamationAgainstCaoCaoDesc),
      image: EventImage.TKYuanShaoArmyProclamation,
      condition: {
         province: new Set(["YuanShao"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ReassureOurPeopleOfOurCause),
            resources: { administrative: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.RallyOurSoldiersAgainstCaoCao),
            resources: { military: -50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.UndermineLoyaltyInCaoCaosRanks),
            resources: { diplomatic: -50 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.1, duration: 36, province: "CaoCao" },
            ],
         },
      ],
   },
   YuanShaoEvent9: {
      name: () => $t(L.ProvisioningTheGreaterArmy),
      desc: () => $t(L.ProvisioningTheGreaterArmyDesc),
      image: EventImage.TKArmyProvisioning,
      condition: {
         province: new Set(["YuanShao"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requireHigherWarPowerChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.FullyProvisionAndGuardTheConvoys),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.25, duration: 36 },
            },
         },
         {
            label: () => $t(L.ReinforceTheDepotsAndSupplyConvoys),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.SendAModestSupplementOfSupplies),
            resources: { gold: -100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.01, duration: 36 },
            },
         },
      ],
   },
   YuanShaoEvent10: {
      name: () => $t(L.TheSettlementOfCaoCaosLands),
      desc: () => $t(L.TheSettlementOfCaoCaosLandsDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["YuanShao"]),
         annexAndCore: { CaoCao: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.RetainExperiencedCivilOfficials),
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.WinTheSupportOfLocalFamilies),
            resources: { diplomatic: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.EstablishRegionalMilitaryCommands),
            resources: { military: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
