import { $t, L } from "../../../utils/i18n";
import { Province } from "../../definitions/Province";
import type { ConditionChecks } from "../../logic/Calculation";
import { tkGovernorDeathEffect } from "../../logic/GovernorLogic";
import { isCoreTileChecks, setProvinceNameOverrideEffect } from "../../logic/MissionLogic";
import { isTKCharacterRulerChecks } from "../../logic/TKCharacterLogic";
import { requirePeaceBetweenChecks } from "../../logic/TreatyLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const YuanShuEvents = {
   YuanShuEvent1: {
      name: () => $t(L.TheSealInPawn),
      desc: () => $t(L.TheSealInPawnDesc),
      image: EventImage.TKImperialSealPledge,
      condition: {
         province: new Set(["YuanShu"]),
         year: [194, Number.POSITIVE_INFINITY],
         onMap: { SunCe: true },
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("YuanShu", province, save);
            yield* isTKCharacterRulerChecks("SunCe", "SunCe", save);
            yield* requirePeaceBetweenChecks(province, "SunCe", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ShowTheSealToOurGuests),
            modifiers: { Prestige: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.SendTheVeteransTheirPay),
            resources: { gold: -500, military: 100 },
            attitudes: { SunCe: { type: "add", value: 25, duration: 36 } },
         },
      ],
   },
   YuanShuEvent2: {
      name: () => $t(L.OpenTheLowerHuai),
      desc: () => $t(L.OpenTheLowerHuaiDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { TaoQian: 2 } },
      buttons: [
         { label: () => $t(L.FillTheArmyDepots), resources: { military: 100 } },
         { label: () => $t(L.LicenseTheGrainMerchants), resources: { gold: 1000 } },
      ],
   },
   YuanShuEvent3: {
      name: () => $t(L.AFootholdInXu),
      desc: () => $t(L.AFootholdInXuDesc),
      image: EventImage.TKDistrictIntegration,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { LiuBei: 2 } },
      buttons: [
         {
            label: () => $t(L.SettleOurVeteransInXu),
            resources: { military: 50 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.RetainTheCountyMagistrates),
            resources: { administrative: 50 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   YuanShuEvent4: {
      name: () => $t(L.ABrideFromTheHouseOfLu),
      desc: () => $t(L.ABrideFromTheHouseOfLuDesc),
      image: EventImage.TKYuanShuBetrothalGifts,
      condition: {
         province: new Set(["YuanShu"]),
         year: [196, Number.POSITIVE_INFINITY],
         onMap: { LuBu: true },
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("YuanShu", province, save);
            yield* isTKCharacterRulerChecks("LuBu", "LuBu", save);
            yield* requirePeaceBetweenChecks(province, "LuBu", save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SendHanYinWithTheGifts),
            resources: { gold: -500, military: 50 },
            attitudes: { LuBu: { type: "add", value: 30, duration: 36 } },
         },
         { label: () => $t(L.KeepOurSonFreeOfTheMatch), resources: { administrative: 50 } },
      ],
   },
   YuanShuEvent5: {
      name: () => $t(L.TheThroneAtShouchun),
      desc: () => $t(L.TheThroneAtShouchunDesc),
      image: EventImage.TKThroneAtShouchun,
      condition: {
         province: new Set(["YuanShu"]),
         year: [197, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("YuanShu", province, save);
            yield* isCoreTileChecks(Province.YuanShu.capital, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.ProclaimTheZhongDynasty),
            resources: { administrative: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 36 } },
            attitudes: {
               CaoCao: { type: "add", value: -30, duration: 36 },
               SunCe: { type: "add", value: -30, duration: 36 },
               LiuBei: { type: "add", value: -30, duration: 36 },
            },
            custom: [setProvinceNameOverrideEffect("Zhong")],
         },
         {
            label: () => $t(L.HeedYanXiangsCounsel),
            resources: { consulPoint: 3 },
            modifiers: { Stability: { type: "add", value: 10, duration: 36 } },
         },
      ],
   },
   YuanShuEvent6: {
      name: () => $t(L.CallInSunCesDebt),
      desc: () => $t(L.CallInSunCesDebtDesc),
      image: EventImage.TKRiverPortCommerce,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { SunCe: 3 } },
      buttons: [
         { label: () => $t(L.CollectTheArrears), resources: { gold: 1000 } },
         {
            label: () => $t(L.TakeTheBoatmenIntoService),
            modifiers: { TradeProfit: { type: "multiply", value: 0.2, duration: 36 } },
         },
      ],
   },
   YuanShuEvent7: {
      name: () => $t(L.AWesternCommand),
      desc: () => $t(L.AWesternCommandDesc),
      image: EventImage.TKAgriculturalSurvey,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { LiuBiao: 4 } },
      buttons: [
         {
            label: () => $t(L.EstablishMilitaryColonies),
            resources: { military: 100 },
            modifiers: { Manpower: { type: "multiply", value: 0.1, duration: 36 } },
         },
         {
            label: () => $t(L.ConfirmTheDistrictOfficials),
            modifiers: { GoverningCapacity: { type: "add", value: 20 } },
         },
      ],
   },
   YuanShuEvent8: {
      name: () => $t(L.ACupOfHoneyWater),
      desc: () => $t(L.ACupOfHoneyWaterDesc),
      image: EventImage.TKYuanShuHoneyWater,
      condition: {
         province: new Set(["YuanShu"]),
         year: [199, Number.POSITIVE_INFINITY],
         conditions: function* (province, save): ConditionChecks {
            yield* isTKCharacterRulerChecks("YuanShu", province, save);
         },
      },
      buttons: [{ label: () => $t(L.MournYuanShu), custom: [tkGovernorDeathEffect("YuanShu")] }],
   },
   YuanShuEvent9: {
      name: () => $t(L.BreakCaoCaosHoldOnThePlains),
      desc: () => $t(L.BreakCaoCaosHoldOnThePlainsDesc),
      image: EventImage.TKNorthernConsolidation,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { CaoCao: 4 } },
      buttons: [
         {
            label: () => $t(L.RebuildTheNorthernArmy),
            resources: { military: 100 },
            modifiers: { WarPower: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => $t(L.ReopenTheTaxOffices),
            resources: { administrative: 100 },
            modifiers: { LandTax: { type: "multiply", value: 0.2, duration: 36 } },
         },
      ],
   },
   YuanShuEvent10: {
      name: () => $t(L.WhichYuanSpeaksForTheClan),
      desc: () => $t(L.WhichYuanSpeaksForTheClanDesc),
      image: EventImage.TKRegionalAssembly,
      condition: { province: new Set(["YuanShu"]), annexAndCore: { YuanShao: 8 } },
      buttons: [
         {
            label: () => $t(L.BringTheClanRegistersSouth),
            resources: { diplomatic: 100 },
            modifiers: { Prestige: { type: "multiply", value: 0.2, duration: 36 } },
         },
         {
            label: () => $t(L.ConfirmTheNorthernOfficials),
            modifiers: { GoverningCapacity: { type: "add", value: 50 } },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
