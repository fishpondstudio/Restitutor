import { $t, L } from "../../utils/i18n";
import { WesternRomanEmpireProvinces } from "../definitions/TileConstants";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const WesternRomanEmpireEvents = {
   WRE1: {
      name: () => $t(L.TheArianControversy),
      image: EventImage.Arianism,
      desc: () => $t(L.TheArianControversyDesc),
      condition: {
         province: WesternRomanEmpireProvinces,
         religion: "Christianity",
         year: [313, Number.POSITIVE_INFINITY],
      },
      buttons: [
         {
            label: () => $t(L.CondemnTheHeresyAffirmingOurTrueFaith),
            modifiers: {
               Stability: { type: "add", value: -10, duration: 10 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.TolerateTheAriansSeekingPeaceAmongAll),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 10 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 10 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
