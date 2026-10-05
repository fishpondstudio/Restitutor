import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { RashidunCaliphateProvinces, UmayyadCaliphateProvinces } from "../definitions/TileConstants";
import { getProvinceCoreTilesCached } from "../logic/CacheLogic";
import type { ConditionChecks } from "../logic/Calculation";
import { changeProvinceReligion } from "../logic/InternalAffairsLogic";
import { allCoreTileChecks, setProvinceNameOverrideEffect } from "../logic/MissionLogic";
import { addProvinceResource, getProvinceResource, spendProvinceResource } from "../logic/ResourceLogic";
import { getTotalTileUpgrade } from "../logic/TileLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const CaliphateEvents = {
   Caliphate1: {
      name: () => $t(L.TheFaithOfTheHolyCities),
      image: EventImage.DesertCaravan,
      desc: () => $t(L.TheFaithOfTheHolyCitiesDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* allCoreTileChecks([10944609, 10944611], province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.EmbraceIslam),
            custom: [
               {
                  desc(province, save) {
                     return $t(L.EmbraceIslamEffects$1, "20");
                  },
                  execute(province, save) {
                     changeProvinceReligion("Islam", province, save);
                     const christianInfluence = getProvinceResource("christianity", province, save);
                     spendProvinceResource("christianity", christianInfluence, province, save);
                     addProvinceResource("islam", christianInfluence, province, save);
                     getProvinceCoreTilesCached(province, save)
                        .filter((tile) => {
                           return save.state.tiles.get(tile)?.religion !== "Islam";
                        })
                        .sort((a, b) => {
                           return getTotalTileUpgrade(b, save) - getTotalTileUpgrade(a, save);
                        })
                        .slice(0, 20)
                        .forEach((tile) => {
                           const data = save.state.tiles.get(tile);
                           if (data) {
                              data.religion = "Islam";
                           }
                        });
                  },
               },
            ],
         },
         {
            label: () => $t(L.EndowOurChristianCommunities),
            resources: { christianity: 100 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 5 },
            },
         },
      ],
   },
   Caliphate2: {
      name: () => $t(L.TheRashidunCaliphate),
      image: EventImage.ArabCouncil,
      desc: () => $t(L.TheRashidunCaliphateDesc),
      condition: {
         onMap: { Caliphate: false },
         religion: new Set(["Islam"]),
         annexAndCore: fromEntries(RashidunCaliphateProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      wikipedia: "Rashidun_Caliphate",
      buttons: [
         {
            label: () => $t(L.ProclaimTheRashidunCaliphate),
            resources: { islam: 100 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               RegionalCapitalCount: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("RashidunCaliphate")],
         },
      ],
   },
   Caliphate3: {
      name: () => $t(L.TheUmayyadCaliphate),
      image: EventImage.Gibraltar,
      desc: () => $t(L.TheUmayyadCaliphateDesc),
      condition: {
         nameOverride: "RashidunCaliphate",
         religion: new Set(["Islam"]),
         annexAndCore: fromEntries(UmayyadCaliphateProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      wikipedia: "Umayyad_Caliphate",
      buttons: [
         {
            label: () => $t(L.ProclaimTheUmayyadCaliphate),
            resources: { islam: 200 },
            modifiers: {
               GoverningCapacity: { type: "add", value: 400 },
               RegionalCapitalCount: { type: "add", value: 1 },
               ToleratedReligion: { type: "add", value: 1 },
               ToleratedCulture: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("UmayyadCaliphate")],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
