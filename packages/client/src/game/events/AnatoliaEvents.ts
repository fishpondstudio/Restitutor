import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { AnatoliaProvinces } from "../definitions/TileConstants";
import { setProvinceNameOverrideEffect } from "../logic/MissionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const AnatoliaEvents = {
   Anatolia1: {
      name: () => $t(L.TheAnatolianLeague),
      image: EventImage.RomanAudience,
      desc: () => $t(L.TheAnatolianLeagueDesc),
      condition: {
         province: new Set(AnatoliaProvinces),
         annexAndCore: fromEntries(AnatoliaProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "RestoreAnatolia",
      buttons: [
         {
            label: () => $t(L.UnifyTheLeaguesAdministration),
            modifiers: {
               GoverningCapacity: { type: "add", value: 300 },
            },
            custom: [setProvinceNameOverrideEffect("AnatolianLeague")],
         },
         {
            label: () => $t(L.ShareAuthorityAndProtectCustoms),
            modifiers: {
               ToleratedCulture: { type: "add", value: 1 },
               ToleratedReligion: { type: "add", value: 1 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("AnatolianLeague")],
         },
         {
            label: () => $t(L.PoolOurClerksEnvoysAndOfficers),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
               DiplomaticPoint: { type: "add", value: 1 },
               MilitaryPoint: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("AnatolianLeague")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
