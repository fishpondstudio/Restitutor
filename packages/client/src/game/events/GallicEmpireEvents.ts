import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { OfferPatronageAction } from "../actions/TreatyActions";
import { Province, ProvinceNameOverrides } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import { RefreshTiles } from "../Events";
import { getOriginalTileCount } from "../GameState";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import { maxCoreTileCondition } from "../logic/MissionLogic";
import { setProvinceNameOverride } from "../logic/ProvinceLogic";
import { dissolveAllTreaties, requireNoTreatyBetween, requirePeaceBetween } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const GallicEmpireEvents = {
   Gallic1: {
      name: () => $t(L.GallicEmpireProclaimed),
      image: EventImage.RomanForum3,
      desc: () => $t(L.GallicEmpireProclaimedDesc),
      condition: {
         province: GallicEmpireProvinces,
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
            custom: [
               {
                  effect: (province, save) => {
                     setProvinceNameOverride(province, "GallicEmpire", save);
                     RefreshTiles.emit({ tiles: [], options: { visual: true } });
                  },
                  desc: (province, save) => {
                     return $t(L.OurProvinceIsNowKnownAsThe$1, ProvinceNameOverrides.GallicEmpire());
                  },
               },
            ],
         },
      ],
   },
   Gallic2: {
      name: () => $t(L.TheSubmissionOfBritannia),
      image: EventImage.SchoolmasterPunished,
      desc: () => $t(L.TheSubmissionOfBritanniaDesc),
      condition: {
         nameOverride: "GallicEmpire",
         annexAndCore: { Britannia: Math.ceil(getOriginalTileCount("Britannia") * 0.7) },
         conditions: (province, save) => {
            return [
               requireNoTreatyBetween(["Patron"], province, "Britannia", save),
               requirePeaceBetween(province, "Britannia", save),
               availableDiplomatCondition(province, "Britannia", save),
               maxCoreTileCondition(5, "Britannia", save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.BritanniaShallServeAsOurLoyalClient),
            custom: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Britannia", save);
                     OfferPatronageAction(province, "Britannia", save).effect({ headless: false });
                  },
                  desc: (province, save) => $t(L.$1BecomesOurClient, Province.Britannia.name()),
               },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
