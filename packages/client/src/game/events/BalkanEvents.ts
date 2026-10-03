import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { BalkanProvinces, GraeciaProvinces } from "../definitions/TileConstants";
import { setProvinceNameOverrideEffect } from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const BalkanEvents = {
   Balkan1: {
      name: () => $t(L.ACommonHellenicFuture),
      image: EventImage.RomanAudience,
      desc: () => $t(L.ACommonHellenicFutureDesc),
      condition: {
         province: new Set(GraeciaProvinces),
         annexAndCore: fromEntries(GraeciaProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "RestoreGraecia",
      buttons: [
         {
            label: () => $t(L.UnifyOurOfficesAsTheGraeciaEmpire),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            resources: {
               mandate: 1,
            },
            custom: [setProvinceNameOverrideEffect("GraeciaEmpire")],
         },
         {
            label: () => $t(L.PoolExpertiseInAHellenicLeague),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
               Diplomat: { type: "add", value: 1 },
               MilitaryPoint: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("HellenicLeague")],
         },
      ],
   },
   Balkan2: {
      name: () => $t(L.TheBalkanEmpire),
      image: EventImage.ImperialCity,
      desc: () => $t(L.TheBalkanEmpireDesc),
      condition: {
         province: new Set(BalkanProvinces),
         annexAndCore: fromEntries(BalkanProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "RestoreBalkan",
      buttons: [
         {
            label: () => $t(L.UnifyOurRegionalAdministrations),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            custom: [setProvinceNameOverrideEffect("BalkanEmpire")],
         },
         {
            label: () => $t(L.DevelopOurEstatesAndSettlements),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1 },
               TileOutput: { type: "multiply", value: 0.1 },
               Manpower: { type: "multiply", value: 0.1 },
            },
            custom: [setProvinceNameOverrideEffect("BalkanEmpire")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
