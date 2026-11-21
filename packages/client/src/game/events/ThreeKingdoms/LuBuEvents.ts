import { $t, L } from "../../../utils/i18n";
import type { ConditionChecks } from "../../logic/Calculation";
import { provinceResourceChecks, victoryCountChecks } from "../../logic/MissionLogic";
import {
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LuBuEvents = {
   LuBuEvent1: {
      name: () => $t(L.TheStrengthBehindTheLegend),
      desc: () => $t(L.TheStrengthBehindTheLegendDesc),
      image: EventImage.TKLuBuVeteranMuster,
      condition: {
         province: new Set(["LuBu"]),
      },
      buttons: [
         {
            label: () => $t(L.MusterTheVeterans),
            resources: { military: 100 },
         },
         {
            label: () => $t(L.EstablishAnOfficerCorps),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 120 },
            },
         },
         {
            label: () => $t(L.TrainTheArmyInLuBusMethods),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 120 },
            },
         },
      ],
   },
   LuBuEvent2: {
      name: () => $t(L.ChenGongsCounsel),
      desc: () => $t(L.ChenGongsCounselDesc),
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LuBu"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ChenGong", province, save);
            yield* tkCharacterAliveChecks("ChenGong", save);
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ExtendTheCivilAdministration),
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.StrengthenEveryBranchOfGovernment),
            resources: { administrative: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 40 },
               DiplomaticPoint: { type: "add", value: 1, duration: 40 },
               MilitaryPoint: { type: "add", value: 1, duration: 40 },
            },
         },
      ],
   },
   LuBuEvent3: {
      name: () => $t(L.GaoShunsFormationBreakers),
      desc: () => $t(L.GaoShunsFormationBreakersDesc),
      image: EventImage.TKGaoShunFormationBreakers,
      condition: {
         province: new Set(["LuBu"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("GaoShun", province, save);
            yield* tkCharacterAliveChecks("GaoShun", save);
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EquipAnEliteAssaultForce),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 36 },
            },
         },
         {
            label: () => $t(L.TrainFieldTroopsAndGarrisons),
            resources: { gold: -1000 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.RecruitExperiencedOfficers),
            resources: { gold: -1000, military: 100 },
         },
      ],
   },
   LuBuEvent4: {
      name: () => $t(L.TheContestForYan),
      desc: () => $t(L.TheContestForYanDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["LuBu"]),
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
            label: () => $t(L.RestoreTheFieldsAndTreasury),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent5: {
      name: () => $t(L.ChenDengAndTheSettlementOfXu),
      desc: () => $t(L.ChenDengAndTheSettlementOfXuDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LuBu"]),
         playerOnly: true,
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
         conditions: function* (_province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("ChenDeng", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.HaveChenDengReformTheTaxOffices),
            resources: { administrative: 75 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => $t(L.HaveChenDengReconcileTheFamilies),
            resources: { diplomatic: 75 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
         {
            label: () => $t(L.HaveChenDengMusterTheHouseholds),
            resources: { military: 75 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [transferTKCharacterEffect("ChenDeng")],
         },
      ],
   },
   LuBuEvent6: {
      name: () => $t(L.TheHalberdAtTheCampGate),
      desc: () => $t(L.TheHalberdAtTheCampGateDesc),
      image: EventImage.TKLuBuHalberdShot,
      condition: {
         province: new Set(["LuBu"]),
         year: [196, Number.POSITIVE_INFINITY],
         onMap: { LiuBei: true, YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.LetTheEnvoysWitnessHisProwess),
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RallyOurOfficersAndInspireTheArmy),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LuBuEvent7: {
      name: () => $t(L.ThePriceOfYuanShusFriendship),
      desc: () => $t(L.ThePriceOfYuanShusFriendshipDesc),
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["LuBu"]),
         year: [197, Number.POSITIVE_INFINITY],
         onMap: { YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("YuanShu", save);
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.NegotiateASubsidyFromYuanShu),
            resources: { diplomatic: -50, gold: 1000 },
            modifiers: { Prestige: { type: "multiply", value: -0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RejectHisDesignsAndHonorTheHan),
            resources: { diplomatic: -50, consulPoint: 2 },
         },
      ],
   },
   LuBuEvent8: {
      name: () => $t(L.TrustWithinTheCamp),
      desc: () => $t(L.TrustWithinTheCampDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LuBu"]),
         year: [198, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ZhangLiao", province, save);
            yield* tkCharacterAliveChecks("ZhangLiao", save);
            yield* victoryCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveZhangLiaoBroaderFieldCommand),
            resources: { military: 50 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RewardTheGarrisonsForTheirLoyalty),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent9: {
      name: () => $t(L.ChenGongsPlansAgainstCaoCao),
      desc: () => $t(L.ChenGongsPlansAgainstCaoCaoDesc),
      image: EventImage.TKChenGongFieldCommand,
      condition: {
         province: new Set(["LuBu"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("ChenGong", province, save);
            yield* tkCharacterAliveChecks("ChenGong", save);
            yield* requireWarBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.DisruptCaoCaosSupplyRoads),
            resources: { military: -50 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.1, duration: 36, province: "CaoCao" },
            ],
         },
         {
            label: () => $t(L.FundStrongerDefensesAndSupplyDepots),
            resources: { gold: -500 },
            modifiers: { Defense: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => $t(L.GatherTheArmyForADecisiveBlow),
            resources: { military: -100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 36 },
            },
         },
      ],
   },
   LuBuEvent10: {
      name: () => $t(L.MoreThanAWarrior),
      desc: () => $t(L.MoreThanAWarriorDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LuBu"]),
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
