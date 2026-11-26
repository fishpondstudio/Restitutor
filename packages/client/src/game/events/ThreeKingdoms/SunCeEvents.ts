import { $t, L } from "../../../utils/i18n";
import type { ConditionChecks } from "../../logic/Calculation";
import { tkCharacterSuccessionEffect } from "../../logic/GovernorLogic";
import {
   governmentTierChecks,
   minCoreCoastalTileChecks,
   minGovernorSonsChecks,
   notAnnexedChecks,
   setProvinceNameOverrideEffect,
} from "../../logic/MissionLogic";
import {
   isTKCharacterRulerChecks,
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   tkCharacterUnaffiliatedChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import {
   requireAnyTreatyBetweenChecks,
   requirePeaceBetweenChecks,
   requireWarBetweenChecks,
} from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const SunCeEvents = {
   SunCeEvent1: {
      name: () => $t(L.TheSealPawnedForAnArmy),
      desc: () => $t(L.TheSealPawnedForAnArmyDesc),
      image: EventImage.TKImperialSealPledge,
      condition: {
         province: new Set(["SunCe"]),
         year: [194, Number.POSITIVE_INFINITY],
         onMap: { YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
            yield* tkCharacterAffiliationChecks("ChengPu", province, save);
            yield* tkCharacterAffiliationChecks("HuangGai", province, save);
         },
      },
      buttons: [
         { label: () => $t(L.KeepSunJiansVeteransTogether), resources: { military: 100 } },
         {
            label: () => $t(L.SendTheVeteransToTrainFreshLevies),
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   SunCeEvent2: {
      name: () => $t(L.CommandersForTheCrossing),
      desc: () => $t(L.CommandersForTheCrossingDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["SunCe"]),
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreCoastalTileChecks(5, province, save);
            yield* tkCharacterUnaffiliatedChecks("ZhouYu", save);
            yield* tkCharacterUnaffiliatedChecks("JiangQin", save);
            yield* tkCharacterUnaffiliatedChecks("ZhouTai", save);
            yield* tkCharacterUnaffiliatedChecks("ZhangZhao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.WelcomeTheCommandersAndInviteZhangZhao),
            resources: { military: 50 },
            custom: [
               transferTKCharacterEffect("ZhouYu"),
               transferTKCharacterEffect("ZhangZhao"),
               transferTKCharacterEffect("JiangQin"),
               transferTKCharacterEffect("ZhouTai"),
            ],
         },
      ],
   },
   SunCeEvent3: {
      name: () => $t(L.TheDuelAtShenting),
      desc: () => $t(L.TheDuelAtShentingDesc),
      image: EventImage.TKShentingDuel,
      condition: {
         province: new Set(["SunCe"]),
         annexAndCore: { LiuYao: 3 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("TaishiCi", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.TrustHisWordAndLetHimGo),
            custom: [transferTKCharacterEffect("TaishiCi")],
            modifiers: { MilitaryPoint: { type: "add", value: 1, duration: 36 } },
         },
         {
            label: () => $t(L.KeepHimAtOurSideAndHonorHisCourage),
            custom: [transferTKCharacterEffect("TaishiCi")],
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   SunCeEvent4: {
      name: () => $t(L.TheLingsOfYuhang),
      desc: () => $t(L.TheLingsOfYuhangDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["SunCe"]),
         annexAndCore: { YanBaihu: 3 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("LingCao", save);
            yield* tkCharacterUnaffiliatedChecks("LingTong", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.HaveTheLingsOrganizeTheDistrictLevies),
            resources: { administrative: 50 },
            custom: [transferTKCharacterEffect("LingCao"), transferTKCharacterEffect("LingTong")],
         },
         {
            label: () => $t(L.AskTheLingsToRallyTheLocalFamilies),
            resources: { diplomatic: 50 },
            custom: [transferTKCharacterEffect("LingCao"), transferTKCharacterEffect("LingTong")],
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   SunCeEvent5: {
      name: () => $t(L.APretendersSeal),
      desc: () => $t(L.APretendersSealDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["SunCe"]),
         year: [197, Number.POSITIVE_INFINITY],
         onMap: { YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.WriteToYuanShuAndBreakWithHim),
            resources: { consulPoint: 2 },
            attitudes: { YuanShu: { type: "add", value: -20, duration: 36 } },
         },
         {
            label: () => $t(L.AnswerHimWithCourtesyAndKeepOurTies),
            resources: { diplomatic: 75 },
            attitudes: { YuanShu: { type: "add", value: 20, duration: 36 } },
         },
      ],
   },
   SunCeEvent6: {
      name: () => $t(L.GeneralWhoSmitesRebels),
      desc: () => $t(L.GeneralWhoSmitesRebelsDesc),
      image: EventImage.TKPublicProclamation,
      condition: {
         province: new Set(["SunCe"]),
         annexAndCore: { YanBaihu: 3, WangLang: 3, YuanShu: 2, LiuYao: 6 },
      },
      buttons: [
         { label: () => $t(L.SeekHonorsForOurOfficers), resources: { consulPoint: 2 } },
         { label: () => $t(L.SeekConfirmationOfOurAppointments), resources: { diplomatic: 75 } },
      ],
   },
   SunCeEvent7: {
      name: () => $t(L.TheSealAndCord),
      desc: () => $t(L.TheSealAndCordDesc),
      image: EventImage.TKJiangdongSuccession,
      condition: {
         province: new Set(["SunCe"]),
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("SunQuan", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EntrustJiangdongToSunQuan),
            custom: [tkCharacterSuccessionEffect("SunQuan"), setProvinceNameOverrideEffect("SunQuan")],
         },
      ],
   },
   SunCeEvent8: {
      name: () => $t(L.CounselForTheYoungGovernor),
      desc: () => $t(L.CounselForTheYoungGovernorDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["SunCe"]),
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("SunQuan", province, save);
            yield* tkCharacterAliveChecks("ZhouYu", save);
            yield* tkCharacterAffiliationChecks("ZhouYu", province, save);
            yield* tkCharacterUnaffiliatedChecks("LuSu", save);
            yield* tkCharacterUnaffiliatedChecks("ZhugeJin", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveBothMenSeatsAtOurCouncil),
            custom: [transferTKCharacterEffect("LuSu"), transferTKCharacterEffect("ZhugeJin")],
         },
      ],
   },
   SunCeEvent9: {
      name: () => $t(L.ANewGenerationOfOfficers),
      desc: () => $t(L.ANewGenerationOfOfficersDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["SunCe"]),
         year: [202, Number.POSITIVE_INFINITY],
         annexAndCore: {
            LiuYao: Number.POSITIVE_INFINITY,
            YanBaihu: Number.POSITIVE_INFINITY,
            WangLang: Number.POSITIVE_INFINITY,
         },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("LuMeng", save);
            yield* tkCharacterUnaffiliatedChecks("LuXun", save);
            yield* tkCharacterUnaffiliatedChecks("DingFeng", save);
            yield* tkCharacterUnaffiliatedChecks("XuSheng", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AppointTheFourOfficersToOurService),
            custom: [
               transferTKCharacterEffect("LuMeng"),
               transferTKCharacterEffect("LuXun"),
               transferTKCharacterEffect("DingFeng"),
               transferTKCharacterEffect("XuSheng"),
            ],
         },
      ],
   },
   SunCeEvent10: {
      name: () => $t(L.TheBrocadeSailPirate),
      desc: () => $t(L.TheBrocadeSailPirateDesc),
      image: EventImage.TKBrocadeSail,
      condition: {
         province: new Set(["SunCe"]),
         annexAndCore: { LiuBiao: 3 },
         onMap: { LiuBiao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("LuMeng", save);
            yield* tkCharacterAffiliationChecks("LuMeng", province, save);
            yield* tkCharacterUnaffiliatedChecks("GanNing", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AvengeSunJianAtJiangxia),
            custom: [transferTKCharacterEffect("GanNing")],
            casusBelli: { LiuBiao: { casusBelli: "ConquestMission", duration: 60 } },
         },
         {
            label: () => $t(L.SetGanNingToGuardOurCrossings),
            custom: [transferTKCharacterEffect("GanNing")],
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   SunCeEvent11: {
      name: () => $t(L.TheCouncilBeforeRedCliffs),
      desc: () => $t(L.TheCouncilBeforeRedCliffsDesc),
      image: EventImage.TKRedCliffsCouncil,
      condition: {
         province: new Set(["SunCe"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true, LiuBei: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.JoinForcesWithLiuBei),
            resources: { military: 75 },
            attitudes: { LiuBei: { type: "add", value: 20, duration: 36 } },
         },
         {
            label: () => $t(L.HoldOurOwnBankOfTheYangtze),
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 24 } },
         },
      ],
   },
   SunCeEvent12: {
      name: () => $t(L.FireAtRedCliffs),
      desc: () => $t(L.FireAtRedCliffsDesc),
      image: EventImage.TKRedCliffsFleet,
      condition: {
         province: new Set(["SunCe"]),
         year: [208, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "LiuBei", save);
            yield* tkCharacterAliveChecks("ZhouYu", save);
            yield* tkCharacterAffiliationChecks("ZhouYu", province, save);
            yield* tkCharacterAliveChecks("HuangGai", save);
            yield* tkCharacterAffiliationChecks("HuangGai", province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendTheFireShipsWithOurWholeFleet),
            modifiers: { WarPower: { type: "multiply", value: 0.15, duration: 24 } },
         },
         {
            label: () => $t(L.KeepAReserveToCoverTheAlliedRetreat),
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 24 } },
         },
      ],
   },
   SunCeEvent13: {
      name: () => $t(L.TheStandAtRuxu),
      desc: () => $t(L.TheStandAtRuxuDesc),
      image: EventImage.TKRuxuLanding,
      condition: {
         province: new Set(["SunCe"]),
         year: [213, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* tkCharacterAliveChecks("LuMeng", save);
            yield* tkCharacterAffiliationChecks("LuMeng", province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.BuildLuMengsFortAtRuxu),
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 36 } },
         },
         { label: () => $t(L.StationAFleetAtRuxu), resources: { military: 75 } },
      ],
   },
   SunCeEvent14: {
      name: () => $t(L.TheBrokenBridgeAtXiaoyaoFord),
      desc: () => $t(L.TheBrokenBridgeAtXiaoyaoFordDesc),
      image: EventImage.TKXiaoyaoLeap,
      condition: {
         province: new Set(["SunCe"]),
         year: [215, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* notAnnexedChecks(15007833, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendTheHouseholdGuardBackForTheStragglers),
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RallyTheRearguardOnTheFarBank),
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   SunCeEvent15: {
      name: () => $t(L.LuMengCrossesTheRiverInWhite),
      desc: () => $t(L.LuMengCrossesTheRiverInWhiteDesc),
      image: EventImage.TKWhiteCladBoatmen,
      condition: {
         province: new Set(["SunCe"]),
         year: [219, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 10 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("LuMeng", save);
            yield* tkCharacterAffiliationChecks("LuMeng", province, save);
            yield* tkCharacterUnaffiliatedChecks("ZhuRan", save);
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendTheWhiteCladBoatsUpriver),
            custom: [transferTKCharacterEffect("ZhuRan")],
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 36 } },
            casusBelli: { LiuBei: { casusBelli: "ConquestMission", duration: 60 } },
         },
         {
            label: () => $t(L.KeepZhuRanOnTheFrontierAndHonorOurAgreement),
            custom: [transferTKCharacterEffect("ZhuRan")],
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 36 } },
            attitudes: { LiuBei: { type: "add", value: 25, duration: 36 } },
         },
      ],
   },
   SunCeEvent16: {
      name: () => $t(L.TheKingOfWu),
      desc: () => $t(L.TheKingOfWuDesc),
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["SunCe"]),
         year: [221, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
            yield* requireWarBetweenChecks(province, "LiuBei", save);
            yield* governmentTierChecks("Tier3", province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.BowToWeiAndReceiveThePatent),
            modifiers: { Prestige: { type: "multiply", value: 0.15, duration: 36 } },
            attitudes: { CaoCao: { type: "add", value: 20, duration: 36 } },
         },
         {
            label: () => $t(L.SendXingZhenBackToLuoyang),
            resources: { mandate: 1 },
            attitudes: { CaoCao: { type: "add", value: -20, duration: 36 } },
         },
      ],
   },
   SunCeEvent17: {
      name: () => $t(L.LuXunTakesCommandAtYiling),
      desc: () => $t(L.LuXunTakesCommandAtYilingDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["SunCe"]),
         year: [222, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 20 },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "LiuBei", save);
            yield* tkCharacterAliveChecks("LuXun", save);
            yield* tkCharacterAffiliationChecks("LuXun", province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveLuXunSoleCommand),
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 24 } },
         },
         {
            label: () => $t(L.OrderAnImmediateCounterattack),
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 24 } },
         },
      ],
   },
   SunCeEvent18: {
      name: () => $t(L.DengZhiComesFromShu),
      desc: () => $t(L.DengZhiComesFromShuDesc),
      image: EventImage.TKAllianceGathering,
      condition: {
         province: new Set(["SunCe"]),
         year: [223, Number.POSITIVE_INFINITY],
         onMap: { LiuBei: true, CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.RenewTheAllianceWithShu),
            resources: { diplomatic: 75 },
            attitudes: { LiuBei: { type: "add", value: 25, duration: 36 } },
         },
         { label: () => $t(L.StrengthenTheFrontierGarrison), resources: { military: 75 } },
      ],
   },
   SunCeEvent19: {
      name: () => $t(L.TheYellowDragonEra),
      desc: () => $t(L.TheYellowDragonEraDesc),
      image: EventImage.TKPublicProclamation,
      condition: {
         province: new Set(["SunCe"]),
         year: [229, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* governmentTierChecks("Tier4", province, save);
         },
      },
      buttons: [
         { label: () => $t(L.SendEmbassiesToNeighboringCourts), resources: { mandate: 1, diplomatic: 100 } },
         {
            label: () => $t(L.EstablishTheImperialSecretariat),
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 60 } },
         },
      ],
   },
   SunCeEvent20: {
      name: () => $t(L.TheDisputeOfTheTwoPalaces),
      desc: () => $t(L.TheDisputeOfTheTwoPalacesDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["SunCe"]),
         year: [242, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* governmentTierChecks("Tier4", province, save);
            yield* minGovernorSonsChecks(2, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveTheElderPrinceSolePrecedence),
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => $t(L.AllowBothHouseholdsACourtRetinue),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
               Stability: { type: "add", value: -10, duration: 36 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
