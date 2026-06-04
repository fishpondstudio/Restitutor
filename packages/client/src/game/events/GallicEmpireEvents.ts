import { $t, L } from "../../utils/i18n";
import { Province, ProvinceNameOverrides } from "../definitions/Province";
import { GallicEmpireProvinces } from "../definitions/TileConstants";
import { RefreshTiles } from "../Events";
import { getOriginalTileCount } from "../GameState";
import { availableDiplomatCondition } from "../logic/DiplomacyLogic";
import { getProvinceCoreTileCount, setProvinceNameOverride } from "../logic/ProvinceLogic";
import { dissolveAllTreaties, forcePatronage, requireMinimumAttitude } from "../logic/TreatyLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const GallicEmpireEvents = {
   Gallic1: {
      name: () => $t(L.GallicEmpireProclaimed),
      image: EventImage.Y400,
      desc: () => $t(L.GallicEmpireProclaimedDesc),
      condition: {
         province: GallicEmpireProvinces,
         coreTiles: GallicEmpireProvinces.map((province) => ({ province })),
      },
      buttons: [
         {
            label: () => $t(L.LongLiveTheGallicEmpire),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               Prestige: { type: "multiply", value: 0.2 },
            },
            effects: [
               {
                  effect: (province, save) => {
                     setProvinceNameOverride(province, "GallicEmpire", save);
                     RefreshTiles.emit({ tiles: [], options: { visual: true } });
                  },
                  desc: (province, save) => {
                     return $t(L.OurProvinceIsNowKnownAsTheX, ProvinceNameOverrides.GallicEmpire());
                  },
               },
            ],
         },
      ],
   },
   Gallic2: {
      name: () => $t(L.TheSubmissionOfBritannia),
      image: EventImage.Surrender,
      desc: () => $t(L.TheSubmissionOfBritanniaDesc),
      condition: {
         nameOverride: "GallicEmpire",
         coreTiles: [{ province: "Britannia", count: Math.ceil(getOriginalTileCount("Britannia") * 0.7) }],
         conditions: (province, save) => {
            return [
               availableDiplomatCondition(province, "Britannia", save),
               {
                  name: $t(L.XHasAtMostYCoreTiles, Province.Britannia.name(), "5"),
                  value: getProvinceCoreTileCount("Britannia", save) <= 5,
               },
               requireMinimumAttitude(province, "Britannia", 50, save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.BritanniaShallServeAsOurLoyalClient),
            effects: [
               {
                  effect: (province, save) => {
                     dissolveAllTreaties("Britannia", save);
                     forcePatronage(province, "Britannia", save);
                  },
                  desc: (province, save) => $t(L.XBecomesOurClient, Province.Britannia.name()),
               },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
