import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../../utils/i18n";
import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import {
   allyCountChecks,
   changeGovernmentTierEffect,
   minCoreTileChecks,
   setProvinceNameOverrideEffect,
} from "../../logic/MissionLogic";
import { isGreatPowerChecks } from "../../logic/ProvinceLogic";
import { TKWarlords } from "../../ThreeKingdoms/TKWarlord";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const ThreeKingdomsMissionEvents = {
   TKMissionEvent1: {
      name: () => $t(L.ANetworkOfAllies),
      desc: () => $t(L.ANetworkOfAlliesDesc),
      image: EventImage.TKAllianceGathering,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* allyCountChecks(2, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.LetOurAlliesMarchBesideUs),
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 60 } },
         },
         {
            label: () => $t(L.LetOurAllianceCommandRespect),
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 60 } },
         },
         {
            label: () => $t(L.LetConcordSecurePeaceAtHome),
            modifiers: { Stability: { type: "add", value: 10, duration: 60 } },
         },
      ],
   },
   TKMissionEvent2: {
      name: () => $t(L.ARisingPower),
      desc: () => $t(L.ARisingPowerDesc),
      image: EventImage.TKCivilAdministration,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* isGreatPowerChecks(province, save);
            yield* minCoreTileChecks(Province[province].tiles.length + 5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.StrengthenTheCivilAdministration),
            modifiers: { AdministrativePoint: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.ExpandOurCorpsOfEnvoys),
            modifiers: { DiplomaticPoint: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.EstablishAPermanentMilitaryStaff),
            modifiers: { MilitaryPoint: { type: "add", value: 1 } },
         },
      ],
   },
   TKMissionEvent3: {
      name: () => $t(L.ExpandOurBorders),
      desc: () => $t(L.ExpandOurBordersDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length + 5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ConsolidateTheNewDistricts),
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.WinOverNeighboringCourts),
            resources: { diplomatic: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.PrepareTheNextCampaign),
            resources: { military: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   TKMissionEvent4: {
      name: () => $t(L.TheSealOfADuke),
      desc: () => $t(L.TheSealOfADukeDesc),
      image: EventImage.TKDistrictIntegration,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length * 2, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.OpenTheOfficesOfOurDucalCourt),
            resources: { administrative: 25, diplomatic: 25, military: 25 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
            custom: [changeGovernmentTierEffect("Tier2")],
         },
         {
            label: () => $t(L.SeekImperialInvestitureAsDuke),
            resources: { consulPoint: 2 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
            custom: [changeGovernmentTierEffect("Tier2")],
         },
         {
            label: () => $t(L.ClaimOurDukedomByOurOwnRight),
            resources: { mandate: 1 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
            custom: [changeGovernmentTierEffect("Tier2")],
         },
      ],
   },
   TKMissionEvent5: {
      name: () => $t(L.TheBannerOfAKing),
      desc: () => $t(L.TheBannerOfAKingDesc),
      image: EventImage.TKRegionalAdministration,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishTheRoyalCivilMinistries),
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
            custom: [changeGovernmentTierEffect("Tier3")],
         },
         {
            label: () => $t(L.DispatchRoyalEnvoysAcrossTheRealm),
            resources: { diplomatic: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
            custom: [changeGovernmentTierEffect("Tier3")],
         },
         {
            label: () => $t(L.OrganizeOurRoyalMilitaryCommands),
            resources: { military: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 100 } },
            custom: [changeGovernmentTierEffect("Tier3")],
         },
      ],
   },
   TKMissionEvent6: {
      name: () => $t(L.TheThroneOfAnEmperor),
      desc: () => $t(L.TheThroneOfAnEmperorDesc),
      image: EventImage.TKRegionalAdministration,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(200, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheImperialMinistries),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
            },
            custom: [changeGovernmentTierEffect("Tier4")],
         },
         {
            label: () => $t(L.ReformTheEmpiresLandTaxRegisters),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               LandTax: { type: "multiply", value: 0.1 },
            },
            custom: [changeGovernmentTierEffect("Tier4")],
         },
         {
            label: () => $t(L.EnrichTheLandsOfOurNewEmpire),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               TileOutput: { type: "multiply", value: 0.1 },
            },
            custom: [changeGovernmentTierEffect("Tier4")],
         },
      ],
   },
   TKMissionEvent7: {
      name: () => $t(L.AnEmpireInTheMaking),
      desc: () => $t(L.AnEmpireInTheMakingDesc),
      image: EventImage.TKRegionalAssembly,
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(300, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.GovernThroughRegionalCapitals),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.AccommodateRegionalCultures),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.AffirmOurMandateToRule),
            resources: { mandate: 1 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
      ],
   },
   TKMissionEvent8: {
      name: () => $t(L.UnifyHebei),
      desc: () => $t(L.UnifyHebeiDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         annexAndCore: {
            YuanShao: Number.POSITIVE_INFINITY,
            ZhangYan: Number.POSITIVE_INFINITY,
            ZhangYang: Number.POSITIVE_INFINITY,
            GongsunZan: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.DevelopTheNorthernFarmlands),
            modifiers: { TileOutput: { type: "multiply", value: 0.15, duration: 60 } },
         },
         {
            label: () => $t(L.RecruitFromTheCommanderies),
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 60 } },
         },
         {
            label: () => $t(L.SurveyTheEstatesForTaxation),
            modifiers: { LandTax: { type: "multiply", value: 0.15, duration: 60 } },
         },
      ],
   },
   TKMissionEvent9: {
      name: () => $t(L.SecureLiaodong),
      desc: () => $t(L.SecureLiaodongDesc),
      image: EventImage.TKMountainReconciliation,
      condition: { annexAndCore: { GongsunDu: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => $t(L.MusterTheFrontierWarriors),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 60 },
            },
         },
         {
            label: () => $t(L.ReconcileTheFrontierCommunities),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 60 },
            },
         },
         {
            label: () => $t(L.ProclaimOurMasteryOfLiaodong),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 60 },
            },
         },
      ],
   },
   TKMissionEvent10: {
      name: () => $t(L.UnifyTheCentralPlains),
      desc: () => $t(L.UnifyTheCentralPlainsDesc),
      image: EventImage.TKRegionalAssembly,
      condition: {
         annexAndCore: {
            CaoCao: Number.POSITIVE_INFINITY,
            LuBu: Number.POSITIVE_INFINITY,
            LiuBei: Number.POSITIVE_INFINITY,
            TaoQian: Number.POSITIVE_INFINITY,
            KongRong: Number.POSITIVE_INFINITY,
            YuanShu: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.SeekTheCourtsFavorForOurRule),
            resources: {
               consulPoint: 2,
            },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => $t(L.HonorOurGeneralsAndEmpowerEnvoys),
            resources: {
               generalSkillPoint: 2,
            },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
         {
            label: () => $t(L.AssertOurMandateThroughArms),
            resources: {
               mandate: 1,
            },
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   TKMissionEvent11: {
      name: () => $t(L.UnifyGuanzhongAndLiangzhou),
      desc: () => $t(L.UnifyGuanzhongAndLiangzhouDesc),
      image: EventImage.TKMountainReconciliation,
      condition: {
         annexAndCore: {
            LiJue: Number.POSITIVE_INFINITY,
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.RebuildTheWesternHeartland),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 60 },
               TileOutput: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               administrative: 100,
            },
         },
         {
            label: () => $t(L.ExtendOurInfluenceFromTheWest),
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               diplomatic: 100,
            },
         },
         {
            label: () => $t(L.StrengthenTheWesternArmies),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 60 },
            },
            resources: {
               military: 100,
            },
         },
      ],
   },
   TKMissionEvent12: {
      name: () => $t(L.UnifyJingzhou),
      desc: () => $t(L.UnifyJingzhouDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: { annexAndCore: { LiuBiao: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => $t(L.DevelopTheRiverMarkets),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
         {
            label: () => $t(L.RecruitSoldiersFromJingzhou),
            modifiers: {
               Manpower: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
         {
            label: () => $t(L.FortifyTheRiverCrossings),
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 60 },
            },
         },
      ],
   },
   TKMissionEvent13: {
      name: () => $t(L.UnifyJiangdong),
      desc: () => $t(L.UnifyJiangdongDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: {
         annexAndCore: {
            SunCe: Number.POSITIVE_INFINITY,
            LiuYao: Number.POSITIVE_INFINITY,
            WangLang: Number.POSITIVE_INFINITY,
            YanBaihu: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.ExpandRiverAndCoastalCommerce),
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.DevelopSouthernWorkshops),
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
            },
         },
         {
            label: () => $t(L.IntegrateTheSouthernDistricts),
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
            },
         },
      ],
   },
   TKMissionEvent14: {
      name: () => $t(L.UnifyBashuAndHanzhong),
      desc: () => $t(L.UnifyBashuAndHanzhongDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: { annexAndCore: { LiuZhang: Number.POSITIVE_INFINITY, ZhangLu: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => $t(L.DevelopTheBasinsAbundance),
            modifiers: { TileOutput: { type: "multiply", value: 0.2, duration: 60 } },
         },
         {
            label: () => $t(L.BringTheFertileEstatesToTax),
            modifiers: { LandTax: { type: "multiply", value: 0.2, duration: 60 } },
         },
         {
            label: () => $t(L.EmployTheTalentsOfBashu),
            resources: { administrative: 20, diplomatic: 20, military: 20 },
         },
      ],
   },
   TKMissionEvent15: {
      name: () => $t(L.UnifyJiaozhou),
      desc: () => $t(L.UnifyJiaozhouDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: { annexAndCore: { ShiXie: Number.POSITIVE_INFINITY } },
      buttons: [
         {
            label: () => $t(L.EncourageMaritimeCommerce),
            modifiers: {
               TradeProfit: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.OpenNewMaritimeTradeRoutes),
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.DevelopLocalProduction),
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
            },
         },
      ],
   },
   TKMissionEvent16: {
      name: () => $t(L.UnifyTheNorth),
      desc: () => $t(L.UnifyTheNorthDesc),
      image: EventImage.TKNorthernConsolidation,
      condition: {
         annexAndCore: {
            YuanShao: Number.POSITIVE_INFINITY,
            ZhangYan: Number.POSITIVE_INFINITY,
            ZhangYang: Number.POSITIVE_INFINITY,
            GongsunZan: Number.POSITIVE_INFINITY,
            GongsunDu: Number.POSITIVE_INFINITY,
            CaoCao: Number.POSITIVE_INFINITY,
            LuBu: Number.POSITIVE_INFINITY,
            LiuBei: Number.POSITIVE_INFINITY,
            TaoQian: Number.POSITIVE_INFINITY,
            KongRong: Number.POSITIVE_INFINITY,
            YuanShu: Number.POSITIVE_INFINITY,
            LiJue: Number.POSITIVE_INFINITY,
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.ConsolidateNorthernGovernment),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.ExtendOurInfluenceThroughEnvoys),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               DiplomaticPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.MobilizeNorthernStrength),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
      ],
   },
   TKMissionEvent17: {
      name: () => $t(L.UnifyTheSouth),
      desc: () => $t(L.UnifyTheSouthDesc),
      image: EventImage.TKSouthernConsolidation,
      condition: {
         annexAndCore: {
            LiuBiao: Number.POSITIVE_INFINITY,
            SunCe: Number.POSITIVE_INFINITY,
            LiuYao: Number.POSITIVE_INFINITY,
            WangLang: Number.POSITIVE_INFINITY,
            YanBaihu: Number.POSITIVE_INFINITY,
            LiuZhang: Number.POSITIVE_INFINITY,
            ZhangLu: Number.POSITIVE_INFINITY,
            ShiXie: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.SurveyTheSouthernLandsForTax),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               LandTax: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.DevelopTheWealthOfTheSouth),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               TileOutput: { type: "multiply", value: 0.1 },
            },
         },
         {
            label: () => $t(L.OrganizeRecruitmentInTheSouth),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               Manpower: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
   TKMissionEvent18: {
      name: () => $t(L.AllUnderHeaven),
      desc: () => $t(L.AllUnderHeavenDesc),
      image: EventImage.TKRealmUnification,
      condition: {
         annexAndCore: fromEntries(Array.from(TKWarlords, (warlord) => [warlord, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => $t(L.ProclaimTheEmpireOfChina),
            modifiers: { GoverningCapacity: { type: "add", value: 200 } },
            custom: [setProvinceNameOverrideEffect("EmpireOfChina")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
