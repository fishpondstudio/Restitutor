import { $t, L } from "../../../utils/i18n";
import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import { minCoreTileChecks, provinceResourceChecks, victoryCountChecks } from "../../logic/MissionLogic";
import { tkCharacterAffiliationChecks, tkCharacterAliveChecks } from "../../logic/TKCharacterLogic";
import { requireNoPatronsChecks, requirePeaceBetweenChecks, requireWarBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LiJueEvents = {
   LiJueEvent1: {
      name: () => $t(L.TheVeteransOfLiang),
      desc: () => $t(L.TheVeteransOfLiangDesc),
      image: EventImage.TKLiJueVeterans,
      condition: { province: new Set(["LiJue"]) },
      buttons: [
         {
            label: () => $t(L.MusterTheVeterans),
            resources: { military: 100 },
         },
         {
            label: () => $t(L.EstablishAnOfficerCorps),
            modifiers: { MilitaryPoint: { type: "add", value: 1, duration: 120 } },
         },
         {
            label: () => $t(L.LetTheVeteransTrainTheArmy),
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 120 } },
         },
      ],
   },
   LiJueEvent2: {
      name: () => $t(L.JiaXusCounsel),
      desc: () => $t(L.JiaXusCounselDesc),
      image: EventImage.TKJiaXuCounsel,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("JiaXu", province, save);
            yield* tkCharacterAliveChecks("JiaXu", save);
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
            label: () => $t(L.SupportEnvoysAndCommanders),
            resources: { administrative: -100 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
               MilitaryPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiJueEvent3: {
      name: () => $t(L.RivalriesWithinTheLiangArmy),
      desc: () => $t(L.RivalriesWithinTheLiangArmyDesc),
      image: EventImage.TKMilitaryAppointments,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(3, province, save);
            yield* provinceResourceChecks("gold", 500, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.RewardLoyaltyToCivilAuthority),
            resources: { gold: -500 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.FundEnvoysToCoordinateTheCamps),
            resources: { gold: -500 },
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 36 },
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.HonorTheArmysOfficers),
            resources: { gold: -500 },
            modifiers: {
               MilitaryPoint: { type: "add", value: 1, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent4: {
      name: () => $t(L.RestoringTheFieldsOfGuanzhong),
      desc: () => $t(L.RestoringTheFieldsOfGuanzhongDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* victoryCountChecks(5, province, save);
            yield* minCoreTileChecks(Province.LiJue.tiles.length + 10, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheFieldsAndReassureFarmers),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               Stability: { type: "add", value: 10, duration: 36 },
            },
         },
         {
            label: () => $t(L.BringOrderToTheTaxRegisters),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               Prestige: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.OrganizeTheMilitaryHouseholds),
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent5: {
      name: () => $t(L.ThePriceOfCourtlyRespect),
      desc: () => $t(L.ThePriceOfCourtlyRespectDesc),
      image: EventImage.TKDiplomaticSubsidy,
      condition: {
         province: new Set(["LiJue"]),
         year: [195, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province.LiJue.tiles.length + 20, province, save);
            yield* provinceResourceChecks("gold", 1000, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendSilverToTheHanCourt),
            resources: { gold: -1000, consulPoint: 3 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.EmployRespectedCivilOfficials),
            resources: { gold: -1000, administrative: 100 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   LiJueEvent6: {
      name: () => $t(L.XuHuangsDiscipline),
      desc: () => $t(L.XuHuangsDisciplineDesc),
      image: EventImage.TKXuHuangTraining,
      condition: {
         province: new Set(["LiJue"]),
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("XuHuang", province, save);
            yield* tkCharacterAliveChecks("XuHuang", save);
            yield* victoryCountChecks(5, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.TrainTheFieldArmy),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.ReorganizeTheGarrisons),
            resources: { military: 100 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.ReformTheRecruitmentRolls),
            resources: { military: 100 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiJueEvent7: {
      name: () => $t(L.AClaimToLiangzhou),
      desc: () => $t(L.AClaimToLiangzhouDesc),
      image: EventImage.TKLiJueWesternFrontier,
      condition: {
         province: new Set(["LiJue"]),
         onMap: { MaTeng: true, HanSui: true },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoPatronsChecks("MaTeng", save);
            yield* requireNoPatronsChecks("HanSui", save);
            yield* requirePeaceBetweenChecks(province, "MaTeng", save);
            yield* requirePeaceBetweenChecks(province, "HanSui", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PressOurClaimToLiangzhou),
            casusBelli: {
               MaTeng: { casusBelli: "ConquestMission", duration: 60 },
               HanSui: { casusBelli: "ConquestMission", duration: 60 },
            },
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 36 },
               LandTax: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
         {
            label: () => $t(L.PutOurOwnLandsInOrder),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 36 },
               TileOutput: { type: "multiply", value: 0.1, duration: 36 },
               WarPower: { type: "multiply", value: -0.1, duration: 36 },
            },
         },
      ],
   },
   LiJueEvent8: {
      name: () => $t(L.TheWestAsOurFoundation),
      desc: () => $t(L.TheWestAsOurFoundationDesc),
      image: EventImage.TKNorthernConsolidation,
      condition: {
         province: new Set(["LiJue"]),
         annexAndCore: {
            MaTeng: Number.POSITIVE_INFINITY,
            HanSui: Number.POSITIVE_INFINITY,
         },
      },
      buttons: [
         {
            label: () => $t(L.EstablishLastingMilitaryTraditions),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.1 } },
         },
         {
            label: () => $t(L.PrepareToGovernAGreaterRealm),
            resources: { administrative: 100 },
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
         {
            label: () => $t(L.ProclaimOurAuthorityFromTheWest),
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.1 } },
         },
      ],
   },
   LiJueEvent9: {
      name: () => $t(L.JiaXusPlansAgainstCaoCao),
      desc: () => $t(L.JiaXusPlansAgainstCaoCaoDesc),
      image: EventImage.TKJiaXuCounsel,
      condition: {
         province: new Set(["LiJue"]),
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* tkCharacterAffiliationChecks("JiaXu", province, save);
            yield* tkCharacterAliveChecks("JiaXu", save);
            yield* requireWarBetweenChecks(province, "CaoCao", save);
            yield* provinceResourceChecks("military", 100, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.DisruptCaoCaosSupplyRoads),
            resources: { military: -100 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.2, duration: 36, province: "CaoCao" },
            ],
         },
         {
            label: () => $t(L.ConcentrateOurForcesForAnOffensive),
            resources: { military: -100 },
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => $t(L.ReassignStaffToOfficialsAndEnvoys),
            resources: { military: -100 },
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
               DiplomaticPoint: { type: "add", value: 1, duration: 60 },
            },
         },
      ],
   },
   LiJueEvent10: {
      name: () => $t(L.BeyondDongZhuosShadow),
      desc: () => $t(L.BeyondDongZhuosShadowDesc),
      image: EventImage.TKRegionalAssembly,
      condition: {
         province: new Set(["LiJue"]),
         annexAndCore: { CaoCao: Number.POSITIVE_INFINITY },
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(50, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.AuthorizeAnotherRegionalCapital),
            resources: { administrative: 100 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.GiveLocalCustomsAPlaceInOurRealm),
            resources: { diplomatic: 100 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
               ToleratedCulture: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.LetOurCommandersUpholdOurMandate),
            resources: { military: 100, mandate: 1 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 50 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
