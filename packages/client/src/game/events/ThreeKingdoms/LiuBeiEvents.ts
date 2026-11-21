import { $t, L } from "../../../utils/i18n";
import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import {
   isCoreTileChecks,
   minCoreTileChecks,
   provinceResourceChecks,
   victoryCountChecks,
} from "../../logic/MissionLogic";
import {
   tkCharacterAffiliationChecks,
   tkCharacterAliveChecks,
   tkCharacterNotInRosterChecks,
   tkCharacterUnaffiliatedChecks,
   transferTKCharacterEffect,
} from "../../logic/TKCharacterLogic";
import {
   requireAnyTreatyBetweenChecks,
   requireHigherPrestigeChecks,
   requireNoPatronsChecks,
   requirePeaceBetweenChecks,
   requireWarBetweenChecks,
} from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LiuBeiEvents = {
   LiuBeiEvent1: {
      name: () => $t(L.ANameBuiltOnBenevolence),
      desc: () => $t(L.ANameBuiltOnBenevolenceDesc),
      image: EventImage.TKLiuBeiBenevolentAudience,
      condition: {
         province: new Set(["LiuBei"]),
      },
      buttons: [
         {
            label: () => $t(L.RecruitScholarsForOurGovernment),
            resources: { administrative: 75 },
         },
         {
            label: () => $t(L.CultivateTiesWithLocalFamilies),
            resources: { diplomatic: 75 },
         },
         {
            label: () => $t(L.AffirmOurDevotionToTheHanCourt),
            resources: { consulPoint: 2 },
         },
      ],
   },
   LiuBeiEvent2: {
      name: () => $t(L.CompanionsThroughAdversity),
      desc: () => $t(L.CompanionsThroughAdversityDesc),
      image: EventImage.TKLiuBeiCompanions,
      condition: {
         province: new Set(["LiuBei"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* tkCharacterAliveChecks("GuanYu", save);
            yield* tkCharacterAffiliationChecks("ZhangFei", province, save);
            yield* tkCharacterAliveChecks("ZhangFei", save);
            yield* victoryCountChecks(3, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PrepareOurArmiesForNewCampaigns),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.StrengthenDisciplineInOurGarrisons),
            resources: { military: 100 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent3: {
      name: () => $t(L.TheResponsibilityOfXu),
      desc: () => $t(L.TheResponsibilityOfXuDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { TaoQian: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.ReviseTheTaxRegistersOfXu),
            resources: { administrative: 50 },
            modifiers: { LandTax: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.ReconcileThePeopleOfXuToOurRule),
            resources: { diplomatic: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
         {
            label: () => $t(L.MusterTheMilitaryHouseholdsOfXu),
            resources: { military: 50 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent4: {
      name: () => $t(L.AnUneasyPeaceWithLuBu),
      desc: () => $t(L.AnUneasyPeaceWithLuBuDesc),
      image: EventImage.TKCouncilDeliberation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [196, Number.POSITIVE_INFINITY],
         onMap: { LuBu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("LuBu", save);
            yield* requirePeaceBetweenChecks(province, "LuBu", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimToLuBusLands),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
            casusBelli: {
               LuBu: { casusBelli: "ConquestMission", duration: 60 },
            },
         },
         {
            label: () => $t(L.SendEnvoysToPreservePeaceWithLuBu),
            attitudes: { LuBu: { type: "add", value: 20, duration: 36 } },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent5: {
      name: () => $t(L.GuanPingEntersOurService),
      desc: () => $t(L.GuanPingEntersOurServiceDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("GuanPing", save);
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.WelcomeGuanPingIntoOurService),
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("GuanPing")],
         },
      ],
   },
   LiuBeiEvent6: {
      name: () => $t(L.AnOldComradeFromTheNorth),
      desc: () => $t(L.AnOldComradeFromTheNorthDesc),
      image: EventImage.TKZhaoYunReunion,
      condition: {
         province: new Set(["LiuBei"]),
         playerOnly: true,
         year: [200, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAliveChecks("ZhaoYun", save);
            yield* tkCharacterNotInRosterChecks("ZhaoYun", province, save);
            yield* requireHigherPrestigeChecks(province, "GongsunZan", 1, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.InviteZhaoYunToRejoinOurCause),
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("ZhaoYun")],
         },
      ],
   },
   LiuBeiEvent7: {
      name: () => $t(L.ThreeVisitsToTheThatchedCottage),
      desc: () => $t(L.ThreeVisitsToTheThatchedCottageDesc),
      image: EventImage.TKLiuBeiThreeVisits,
      condition: {
         province: new Set(["LiuBei"]),
         year: [207, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("ZhugeLiang", save);
            yield* isCoreTileChecks(14745689, province, save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 2, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SeekZhugeLiangsCounselInPerson),
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("ZhugeLiang")],
         },
      ],
   },
   LiuBeiEvent8: {
      name: () => $t(L.ThePeopleBeneathOurBanner),
      desc: () => $t(L.ThePeopleBeneathOurBannerDesc),
      image: EventImage.TKLiuBeiRefugeeColumn,
      condition: {
         province: new Set(["LiuBei"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* provinceResourceChecks("gold", 500, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.FeedAndShelterTheDisplacedFamilies),
            resources: { gold: -500 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.ProvisionAndEscortTheRefugeeColumns),
            resources: { gold: -500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               Defense: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent9: {
      name: () => $t(L.CommonCauseWithTheSunHouse),
      desc: () => $t(L.CommonCauseWithTheSunHouseDesc),
      image: EventImage.TKAllianceGathering,
      condition: {
         province: new Set(["LiuBei"]),
         year: [208, Number.POSITIVE_INFINITY],
         onMap: { SunCe: true, CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "SunCe", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "SunCe", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.StrengthenTiesBetweenOurCourts),
            resources: { administrative: 50, diplomatic: 50 },
            attitudes: { SunCe: { type: "add", value: 20, duration: 36 } },
         },
         {
            label: () => $t(L.CoordinateOurArmiesAgainstCaoCao),
            resources: { military: 50 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent10: {
      name: () => $t(L.AFootholdInJingzhou),
      desc: () => $t(L.AFootholdInJingzhouDesc),
      image: EventImage.TKRegionalAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuBiao: 10 },
         conditions: function* (province, save): ConditionChecks {
            yield* provinceResourceChecks("administrative", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ExtendOurAdministrationInJingzhou),
            resources: { administrative: -100 },
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
         {
            label: () => $t(L.StrengthenCivilOfficesAndEmbassies),
            resources: { administrative: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiuBeiEvent11: {
      name: () => $t(L.WeiYanOffersHisSword),
      desc: () => $t(L.WeiYanOffersHisSwordDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [209, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("WeiYan", save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 3, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveWeiYanAPlaceAmongOurOfficers),
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("WeiYan")],
         },
      ],
   },
   LiuBeiEvent12: {
      name: () => $t(L.TheTalentsOfTheMaBrothers),
      desc: () => $t(L.TheTalentsOfTheMaBrothersDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["LiuBei"]),
         year: [211, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: 5 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("MaLiang", save);
            yield* tkCharacterUnaffiliatedChecks("MaSu", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.InviteTheMaBrothersToServeAtCourt),
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("MaLiang"), transferTKCharacterEffect("MaSu")],
         },
      ],
   },
   LiuBeiEvent13: {
      name: () => $t(L.CounselForTheWesternCampaign),
      desc: () => $t(L.CounselForTheWesternCampaignDesc),
      image: EventImage.TKWesternCampaignCounsel,
      condition: {
         province: new Set(["LiuBei"]),
         year: [211, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuBiao: Math.ceil(Province.LiuBiao.tiles.length / 2), LiuZhang: 1 },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("PangTong", save);
            yield* tkCharacterUnaffiliatedChecks("FaZheng", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SeekCounselFromPangTongAndFaZheng),
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("PangTong"), transferTKCharacterEffect("FaZheng")],
         },
      ],
   },
   LiuBeiEvent14: {
      name: () => $t(L.TheSettlementOfChengdu),
      desc: () => $t(L.TheSettlementOfChengduDesc),
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.RetainExperiencedCivilOfficials),
            resources: { administrative: 50 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.WinTheSupportOfTheWesternFamilies),
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
   LiuBeiEvent15: {
      name: () => $t(L.NewAppointmentsAtChengdu),
      desc: () => $t(L.NewAppointmentsAtChengduDesc),
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         year: [214, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("JiangWan", save);
            yield* tkCharacterUnaffiliatedChecks("FeiYi", save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AppointJiangWanAndFeiYiToOffice),
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("JiangWan"), transferTKCharacterEffect("FeiYi")],
         },
      ],
   },
   LiuBeiEvent16: {
      name: () => $t(L.TheNorthernGateway),
      desc: () => $t(L.TheNorthernGatewayDesc),
      image: EventImage.TKMountainPassPreparation,
      condition: {
         province: new Set(["LiuBei"]),
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.PrepareHanzhongForANorthernCampaign),
            modifiers: { WarPower: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => $t(L.FortifyThePassesIntoOurHeartland),
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => $t(L.OrganizeHanzhongsMilitaryHouseholds),
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   LiuBeiEvent17: {
      name: () => $t(L.TheRoadTowardHanRestoration),
      desc: () => $t(L.TheRoadTowardHanRestorationDesc),
      image: EventImage.TKMountainPassPreparation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [219, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimToCaoCaosLands),
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
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiuBeiEvent18: {
      name: () => $t(L.TheNextGenerationOfCommanders),
      desc: () => $t(L.TheNextGenerationOfCommandersDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiuBei"]),
         year: [221, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("GuanXing", save);
            yield* tkCharacterUnaffiliatedChecks("ZhangBao", save);
            yield* tkCharacterAffiliationChecks("GuanYu", province, save);
            yield* tkCharacterAffiliationChecks("ZhangFei", province, save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 4, province, save);
            yield* provinceResourceChecks("diplomatic", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CommissionGuanXingAndZhangBao),
            resources: { diplomatic: -100 },
            custom: [transferTKCharacterEffect("GuanXing"), transferTKCharacterEffect("ZhangBao")],
         },
      ],
   },
   LiuBeiEvent19: {
      name: () => $t(L.APrincipledVoiceAtCourt),
      desc: () => $t(L.APrincipledVoiceAtCourtDesc),
      image: EventImage.TKCivilAdministration,
      condition: {
         province: new Set(["LiuBei"]),
         year: [221, Number.POSITIVE_INFINITY],
         annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("DongYun", save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GiveDongYunAVoiceInOurGovernment),
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("DongYun")],
         },
      ],
   },
   LiuBeiEvent20: {
      name: () => $t(L.ZhugeLiangRecognizesJiangWei),
      desc: () => $t(L.ZhugeLiangRecognizesJiangWeiDesc),
      image: EventImage.TKJiangWeiInvitation,
      condition: {
         province: new Set(["LiuBei"]),
         year: [228, Number.POSITIVE_INFINITY],
         annexAndCore: { ZhangLu: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterUnaffiliatedChecks("JiangWei", save);
            yield* tkCharacterAffiliationChecks("ZhugeLiang", province, save);
            yield* tkCharacterAliveChecks("ZhugeLiang", save);
            yield* minCoreTileChecks(Province.LiuBei.tiles.length * 5, province, save);
            yield* provinceResourceChecks("diplomatic", 50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.OfferJiangWeiAPlaceInOurArmy),
            resources: { diplomatic: -50 },
            custom: [transferTKCharacterEffect("JiangWei")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
