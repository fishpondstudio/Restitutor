import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../../utils/i18n";
import { AlpineProvinces, DanubiaProvinces, IllyrianProvinces } from "../../definitions/TileConstants";
import { setProvinceNameOverrideEffect } from "../../logic/MissionLogic";
import { EventImage } from "../EventImages";
import type { IGameEventConfig } from "../GameEventTypes";

export const DanubianEvents = {
   Danubian1: {
      name: () => $t(L.TheAlpineConfederation),
      image: EventImage.Alps,
      desc: () => $t(L.TheAlpineConfederationDesc),
      condition: {
         province: new Set(AlpineProvinces),
         annexAndCore: fromEntries(AlpineProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => $t(L.EstablishTheAlpineConfederation),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            resources: {
               mandate: 1,
            },
            custom: [setProvinceNameOverrideEffect("AlpineConfederation")],
         },
      ],
   },
   Danubian2: {
      name: () => $t(L.IllyriaUnited),
      image: EventImage.RomanAudience,
      desc: () => $t(L.IllyriaUnitedDesc),
      condition: {
         province: new Set(IllyrianProvinces),
         annexAndCore: fromEntries(IllyrianProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => $t(L.UnifyOurAdministrationAsIllyria),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            resources: {
               mandate: 1,
            },
            custom: [setProvinceNameOverrideEffect("Illyria")],
         },
      ],
   },
   Danubian3: {
      name: () => $t(L.TheDanubianAlliance),
      image: EventImage.RomanExpedition,
      desc: () => $t(L.TheDanubianAllianceDesc),
      achievement: "DanubianAlliance",
      condition: {
         province: new Set(DanubiaProvinces),
         annexAndCore: fromEntries(DanubiaProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      buttons: [
         {
            label: () => $t(L.EstablishTheDanubianAlliance),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
            },
            resources: {
               mandate: 1,
            },
            custom: [setProvinceNameOverrideEffect("DanubianAlliance")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
