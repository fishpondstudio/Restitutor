import { $t, L } from "../../utils/i18n";
import { isGreatPowerCondition } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MissionEvents = {
   Mission1: {
      name: () => $t(L.AStrongAlliance),
      image: EventImage.WarEnded,
      desc: () => $t(L.AStrongAllianceDesc),
      condition: {
         allyCount: 2,
      },
      buttons: [
         {
            label: () => $t(L.LetOurAlliesMarchBesideUsInWar),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OurAllianceShallElevateOurPrestige),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Mission2: {
      name: () => $t(L.ANewHegemonRises),
      image: EventImage.Y272,
      desc: () => $t(L.ANewHegemonRisesDesc),
      condition: {
         conditions: (province, save) => [isGreatPowerCondition(province, save)],
      },
      buttons: [
         {
            label: () => $t(L.LetCommerceFlowThroughOurPorts),
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ChannelOurStrengthIntoProduction),
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Mission3: {
      name: () => $t(L.TheIncorporationOfHispania),
      image: EventImage.Annex,
      desc: () => $t(L.TheIncorporationOfHispaniaDesc),
      condition: {
         coreTiles: [{ province: "Tarraconensis" }, { province: "Lusitania" }, { province: "Baetica" }],
      },
      buttons: [
         {
            label: () => $t(L.WeShallBringProsperityToHispania),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               LandTax: { type: "multiply", value: 0.1 },
               TileOutput: { type: "multiply", value: 0.1 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
