import { $t, L } from "../../../utils/i18n";
import type { ConditionChecks } from "../../logic/Calculation";
import { isCoreTileChecks, provinceResourceChecks, victoryCountChecks } from "../../logic/MissionLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const KongRongEvents = {
   KongRongEvent1: {
      name: () => $t(L.CleverAsAChild),
      desc: () => $t(L.CleverAsAChildDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["KongRong"]),
      },
      buttons: [
         { label: () => $t(L.FillOurOfficesWithScholars), resources: { administrative: 75 } },
         { label: () => $t(L.KeepOurHallOpenToEveryCourt), resources: { diplomatic: 75 } },
         { label: () => $t(L.AffirmOurLoyaltyToTheHanCourt), resources: { consulPoint: 2 } },
      ],
   },
   KongRongEvent2: {
      name: () => $t(L.TaishiCiRepaysAKindness),
      desc: () => $t(L.TaishiCiRepaysAKindnessDesc),
      image: EventImage.TKBeihaiMessenger,
      condition: {
         province: new Set(["KongRong"]),
         onMap: { LiuBei: true },
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(1, province, save);
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendOurThanksToLiuBei),
            modifiers: { DiplomaticPoint: { type: "add", value: 1, duration: 60 } },
         },
         {
            label: () => $t(L.SendRichGiftsToTaishiCi),
            modifiers: { MilitaryPoint: { type: "add", value: 1, duration: 60 } },
         },
      ],
   },
   KongRongEvent3: {
      name: () => $t(L.ADryBoneInATomb),
      desc: () => $t(L.ADryBoneInATombDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["KongRong"]),
         annexAndCore: { TaoQian: 3 },
         onMap: { YuanShu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("YuanShu", save);
            yield* requirePeaceBetweenChecks(province, "YuanShu", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimAgainstYuanShu),
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
            casusBelli: { YuanShu: { casusBelli: "ConquestMission", duration: 60 } },
         },
         {
            label: () => $t(L.WinOverThePeopleOfXu),
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   KongRongEvent4: {
      name: () => $t(L.TheSettlementOfXu),
      desc: () => $t(L.TheSettlementOfXuDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         province: new Set(["KongRong"]),
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.AcceptTheGiftsOfTheMerchantHouses),
            resources: { gold: 1000 },
         },
         {
            label: () => $t(L.RestoreTheFarmColoniesOfXiapi),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   KongRongEvent5: {
      name: () => $t(L.BeneathMountTai),
      desc: () => $t(L.BeneathMountTaiDesc),
      image: EventImage.TKMountainReconciliation,
      condition: {
         province: new Set(["KongRong"]),
         annexAndCore: { LuBu: 3 },
      },
      buttons: [
         {
            label: () => $t(L.EnlistTheBanditsOfMountTai),
            resources: { military: 100 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RestoreTheShrinesOfMountTai),
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   KongRongEvent6: {
      name: () => $t(L.HomecomingToQufu),
      desc: () => $t(L.HomecomingToQufuDesc),
      image: EventImage.TKQufuHomecoming,
      condition: {
         province: new Set(["KongRong"]),
         conditions: function* (province, save): ConditionChecks {
            yield* isCoreTileChecks(15007829, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheTempleOfConfucius),
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 60 } },
         },
         {
            label: () => $t(L.ReopenTheSchoolsOfQufu),
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 60 } },
         },
      ],
   },
   KongRongEvent7: {
      name: () => $t(L.YuanTanTurnedBack),
      desc: () => $t(L.YuanTanTurnedBackDesc),
      image: EventImage.TKRiverGarrison,
      condition: {
         province: new Set(["KongRong"]),
         annexAndCore: { YuanShao: 3 },
      },
      buttons: [
         {
            label: () => $t(L.FortifyTheRiverCrossings),
            resources: { military: 50 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.OpenTheCapturedGranaries),
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   KongRongEvent8: {
      name: () => $t(L.AcrossTheBohaiStrait),
      desc: () => $t(L.AcrossTheBohaiStraitDesc),
      image: EventImage.TKNorthernConsolidation,
      condition: {
         province: new Set(["KongRong"]),
         annexAndCore: { GongsunDu: 3 },
      },
      buttons: [
         {
            label: () => $t(L.InviteTheExiledScholarsHome),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
               TileOutput: { type: "multiply", value: 0.15, duration: 36 },
            },
         },
         {
            label: () => $t(L.RecruitTheHorsemenOfLiaodong),
            resources: { military: 50 },
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   KongRongEvent9: {
      name: () => $t(L.AMemorialForMiHeng),
      desc: () => $t(L.AMemorialForMiHengDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["KongRong"]),
         year: [197, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendTheMemorialToTheCourt),
            resources: { diplomatic: -50, consulPoint: 3 },
            attitudes: { CaoCao: { type: "add", value: -10, duration: 36 } },
         },
         {
            label: () => $t(L.KeepMiHengAtOurCourt),
            resources: { diplomatic: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.15, duration: 36 },
               AdministrativePoint: { type: "add", value: 1, duration: 36 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
      ],
   },
   KongRongEvent10: {
      name: () => $t(L.UnderABrokenNest),
      desc: () => $t(L.UnderABrokenNestDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["KongRong"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true, LiuBei: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
            yield* requireWarBetweenChecks("CaoCao", "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.StandByOurRemonstrance),
            resources: { consulPoint: 2 },
            attitudes: {
               CaoCao: { type: "add", value: -25, duration: 36 },
               LiuBei: { type: "add", value: 25, duration: 36 },
            },
         },
         {
            label: () => $t(L.SendGiftsToCaoCaosCourt),
            attitudes: { CaoCao: { type: "add", value: 25, duration: 36 } },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
