import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import type { ConditionChecks } from "../logic/Calculation";
import { availableDiplomatChecks } from "../logic/DiplomacyLogic";
import { forcePatronageEffect, maxCoreTileChecks, setProvinceNameOverrideEffect } from "../logic/MissionLogic";
import { requireNoTreatyBetweenChecks, requirePeaceBetweenChecks } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const GallicEmpireEvents = {
   Gallic1: {
      name: () => $t(L.GallicEmpireProclaimed),
      image: EventImage.RomanForum3,
      desc: () => $t(L.GallicEmpireProclaimedDesc),
      condition: {
         province: new Set(GallicEmpireProvinces),
         annexAndCore: fromEntries(GallicEmpireProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "FormGallicEmpire",
      buttons: [
         {
            label: () => $t(L.LongLiveTheGallicEmpire),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               Prestige: { type: "multiply", value: 0.2 },
            },
            custom: [setProvinceNameOverrideEffect("GallicEmpire")],
         },
      ],
   },
   Gallic2: {
      name: () => $t(L.TheSubmissionOfBritannia),
      image: EventImage.SchoolmasterPunished,
      desc: () => $t(L.TheSubmissionOfBritanniaDesc),
      condition: {
         nameOverride: "GallicEmpire",
         onMap: { Britannia: true },
         annexAndCore: { Britannia: Math.ceil(Province.Britannia.tiles.length * 0.7) },
         conditions: function* (province, save): ConditionChecks {
            yield* requireNoTreatyBetweenChecks(["Patron"], province, "Britannia", save);
            yield* requirePeaceBetweenChecks(province, "Britannia", save);
            yield* availableDiplomatChecks(province, "Britannia", save);
            yield* maxCoreTileChecks(5, "Britannia", save);
            return;
         },
      },
      buttons: [
         {
            label: () => $t(L.BritanniaShallServeAsOurLoyalClient),
            custom: [forcePatronageEffect("Britannia")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
