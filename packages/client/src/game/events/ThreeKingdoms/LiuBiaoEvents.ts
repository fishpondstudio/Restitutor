import { $t, L } from "../../../utils/i18n";
import type { ConditionChecks } from "../../logic/Calculation";
import { tkGovernorDeathEffect } from "../../logic/GovernorLogic";
import { forcePatronageEffect, maxCoreTileChecks, minCoreTileChecks, techCountChecks } from "../../logic/MissionLogic";
import { isTKCharacterRulerChecks } from "../../logic/TKCharacterLogic";
import { requireAnyTreatyBetweenChecks, requireClientChecks, requirePeaceBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const LiuBiaoEvents = {
   LiuBiaoEvent1: {
      name: () => $t(L.TheFiveClassicsOfJingzhou),
      desc: () => $t(L.TheFiveClassicsOfJingzhouDesc),
      image: EventImage.TKScholarlyPatronage,
      condition: {
         province: new Set(["LiuBiao"]),
         conditions: function* (province, save): ConditionChecks {
            yield* techCountChecks(6, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EndowSongZhongsSchool),
            resources: { administrative: 60 },
            modifiers: { AdministrativePoint: { type: "add", value: 1, duration: 60 } },
         },
         {
            label: () => $t(L.SendTeachersToTheCommanderies),
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
   LiuBiaoEvent2: {
      name: () => $t(L.HuangZusRiverCommand),
      desc: () => $t(L.HuangZusRiverCommandDesc),
      image: EventImage.TKRiverGarrison,
      condition: { province: new Set(["LiuBiao"]), annexAndCore: { YuanShu: 3 } },
      buttons: [
         {
            label: () => $t(L.EquipTheRiverPatrols),
            resources: { military: 50 },
            modifiers: { Defense: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => $t(L.EscortTheGrainMerchants),
            resources: { gold: 300 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   LiuBiaoEvent3: {
      name: () => $t(L.SecureTheUpperHan),
      desc: () => $t(L.SecureTheUpperHanDesc),
      image: EventImage.TKMountainPassPreparation,
      condition: { province: new Set(["LiuBiao"]), annexAndCore: { ZhangLu: 4 } },
      buttons: [
         {
            label: () => $t(L.GarrisonTheFrontier),
            resources: { military: 75 },
            modifiers: { Defense: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.OpenTheValleyMarkets),
            resources: { administrative: 75 },
            modifiers: { TileOutput: { type: "multiply", value: 0.1, duration: 36 } },
         },
      ],
   },
   LiuBiaoEvent4: {
      name: () => $t(L.CaoCaoSendsMiHeng),
      desc: () => $t(L.CaoCaoSendsMiHengDesc),
      image: EventImage.TKMiHengAtXiangyang,
      condition: {
         province: new Set(["LiuBiao"]),
         year: [199, Number.POSITIVE_INFINITY],
         onMap: { CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("LiuBiao", province, save);
            yield* isTKCharacterRulerChecks("CaoCao", "CaoCao", save);
            yield* requirePeaceBetweenChecks(province, "CaoCao", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendMiHengOnToHuangZu),
            resources: { diplomatic: 50 },
            modifiers: { Prestige: { type: "multiply", value: -0.05, duration: 36 } },
         },
         {
            label: () => $t(L.GiveHimAPlaceAmongOurScholars),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 60 },
               Stability: { type: "add", value: -5, duration: 36 },
            },
         },
      ],
   },
   LiuBiaoEvent5: {
      name: () => $t(L.BeyondLingling),
      desc: () => $t(L.BeyondLinglingDesc),
      image: EventImage.TKSouthernConsolidation,
      condition: { province: new Set(["LiuBiao"]), annexAndCore: { ShiXie: 5 } },
      buttons: [
         {
            label: () => $t(L.OpenTheSouthernMarkets),
            resources: { diplomatic: 50 },
            modifiers: { TradeProfit: { type: "multiply", value: 0.15, duration: 36 } },
         },
         {
            label: () => $t(L.RegisterTheFrontierHouseholds),
            resources: { administrative: 50 },
            modifiers: { Manpower: { type: "multiply", value: 0.15, duration: 36 } },
         },
      ],
   },
   LiuBiaoEvent6: {
      name: () => $t(L.AKinsmanAtXinye),
      desc: () => $t(L.AKinsmanAtXinyeDesc),
      image: EventImage.TKXinyeRefuge,
      condition: {
         province: new Set(["LiuBiao"]),
         year: [201, Number.POSITIVE_INFINITY],
         onMap: { LiuBei: true, CaoCao: true },
         conditions: function* (province, save): ConditionChecks {
            yield* maxCoreTileChecks(5, "LiuBei", save);
            yield* minCoreTileChecks(25, province, save);
            yield* requirePeaceBetweenChecks(province, "LiuBei", save);
            yield* requireAnyTreatyBetweenChecks(["DefensePact", "Alliance"], province, "LiuBei", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.TakeLiuBeiUnderOurProtection),
            resources: { diplomatic: 50 },
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
            custom: [forcePatronageEffect("LiuBei")],
         },
      ],
   },
   LiuBiaoEvent7: {
      name: () => $t(L.TheLeapAtTanStream),
      desc: () => $t(L.TheLeapAtTanStreamDesc),
      image: EventImage.TKTanStreamLeap,
      condition: {
         province: new Set(["LiuBiao"]),
         onMap: { LiuBei: true },
         year: [201, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* requireClientChecks("LiuBei", province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.CallCaiMaoToAccount),
            resources: { diplomatic: 100 },
            modifiers: { Stability: { type: "add", value: -10, duration: 36 } },
         },
         {
            label: () => $t(L.AcceptCaiMaosAccount),
            resources: { military: 100 },
            modifiers: { Prestige: { type: "multiply", value: -0.1, duration: 36 } },
         },
      ],
   },
   LiuBiaoEvent8: {
      name: () => $t(L.CommandTheMiddleYangtze),
      desc: () => $t(L.CommandTheMiddleYangtzeDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: { province: new Set(["LiuBiao"]), annexAndCore: { YuanShu: 5, LiuYao: 5 } },
      buttons: [
         { label: () => $t(L.CollectTheRiverTolls), resources: { gold: 1000 } },
         {
            label: () => $t(L.CharterTheTransportFleet),
            modifiers: { TradeCapacity: { type: "add", value: 1 } },
         },
      ],
   },
   LiuBiaoEvent9: {
      name: () => $t(L.TheGovernorsPassing),
      desc: () => $t(L.TheGovernorsPassingDesc),
      image: EventImage.TKJingzhouMourning,
      condition: {
         province: new Set(["LiuBiao"]),
         year: [208, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("LiuBiao", province, save);
         },
      },
      buttons: [{ label: () => $t(L.MournLiuBiao), custom: [tkGovernorDeathEffect("LiuBiao")] }],
   },
   LiuBiaoEvent10: {
      name: () => $t(L.CarryTheHanBannerNorth),
      desc: () => $t(L.CarryTheHanBannerNorthDesc),
      image: EventImage.TKRegionalAdministration,
      condition: { province: new Set(["LiuBiao"]), annexAndCore: { CaoCao: 4, LiJue: 6 } },
      buttons: [
         {
            label: () => $t(L.EstablishANorthernSeatOfGovernment),
            resources: { mandate: 1, consulPoint: 3 },
            modifiers: { RegionalCapitalCount: { type: "add", value: 1 } },
         },
         {
            label: () => $t(L.AppointTheNorthernOfficersToCourt),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
               DiplomaticPoint: { type: "add", value: 1 },
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.EnterTheEstatesOnOurTaxRolls),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1 },
               GoverningCapacity: { type: "add", value: 100 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
