import { $t, L } from "../../utils/i18n";
import { getOriginalTileCount } from "../GameState";
import { allyCountCondition, minCoreTileCondition } from "../logic/MissionLogic";
import { isGreatPowerCondition } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MissionEvents = {
   Mission1: {
      name: () => $t(L.AStrongAlliance),
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.AStrongAllianceDesc),
      condition: {
         conditions: (province, save) => [allyCountCondition(2, province, save)],
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
      image: EventImage.ZenobiaCaptured,
      desc: () => $t(L.ANewHegemonRisesDesc),
      condition: {
         conditions: (province, save) => [
            isGreatPowerCondition(province, save),
            minCoreTileCondition(getOriginalTileCount(province) + 5, province, save),
         ],
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
      image: EventImage.CaptiveTriumph,
      desc: () => $t(L.TheIncorporationOfHispaniaDesc),
      condition: {
         annexAndCore: {
            Tarraconensis: Number.POSITIVE_INFINITY,
            Lusitania: Number.POSITIVE_INFINITY,
            Baetica: Number.POSITIVE_INFINITY,
         },
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
