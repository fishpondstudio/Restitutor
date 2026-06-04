import type { ICondition } from "../actions/GameAction";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { CasusBelli } from "../definitions/CasusBelli";
import type { IModifier, Modifier } from "../definitions/Modifier";
import type {
   Province,
   ProvinceNameOverride,
   ProvinceResource,
   ProvinceStat,
   TradeOfferBase,
} from "../definitions/Province";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { SaveGame } from "../GameState";
import { GallicEmpireEvents } from "./GallicEmpireEvents";
import { HistoricalEvents } from "./HistoricalEvents";
import { LugdunensisEvent } from "./LugdunensisEvent";
import { ManualEvents } from "./ManualEvents";
import { MissionEvents } from "./MissionEvents";
import { RandomEvents } from "./RandomEvents";
import { WesternRomanEmpireEvents } from "./WesternRomanEmpireEvents";

export interface IGameEventImage {
   url: string;
   credit: string;
}

export interface IGameEventConfig {
   name: () => string;
   desc: () => string;
   type?: GameEventType;
   image: IGameEventImage;
   condition?: IGameEventCondition;
   buttons: IEventButton[];
}

export interface IGameEventCondition {
   year?: [number, number];
   nameOverride?: ProvinceNameOverride;
   province?: Province[];
   religion?: Religion;
   techs?: Tech[];
   provinceUpgrades?: ProvinceUpgrade[];
   coreTiles?: { province: Province; count?: number }[];
   monthlyRevenue?: number;
   manpower?: number;
   coreTileCount?: number;
   governingCost?: number;
   techCount?: number;
   allyCount?: number;
   warPower?: number;
   conditions?: (province: Province, save: SaveGame) => ICondition[];
}

export interface IEventEffect {
   effect?: (province: Province, save: SaveGame) => void;
   desc?: (province: Province, save: SaveGame) => string;
}

export type IEventTrade = {
   offer: TradeOfferBase;
   extraProfit: number;
};

export interface IEventButton {
   label: () => string;
   modifiers?: Partial<Record<Modifier, Omit<IModifier, "name">>>;
   resources?: Partial<Record<ProvinceResource, number>>;
   stats?: Partial<Record<ProvinceStat, number>>;
   attitudes?: Partial<Record<Province, Omit<IModifier, "name"> & { duration: number }>>;
   infiltration?: Partial<Record<Province, number>>;
   casusBelli?: Partial<Record<Province, { casusBelli: CasusBelli; duration: number }>>;
   trades?: Partial<Record<Province, IEventTrade>>;
   provinceUpgrades?: ProvinceUpgrade[];
   effects?: IEventEffect[];
}

const _GameEvents = {
   ...LugdunensisEvent,
   ...GallicEmpireEvents,
   ...MissionEvents,
   ...WesternRomanEmpireEvents,
   // These should not appear in `MissionPage`
   ...HistoricalEvents,
   ...ManualEvents,
   ...RandomEvents,
} as const satisfies Record<string, IGameEventConfig>;

export type GameEvent = keyof typeof _GameEvents;
export const GameEvents: Record<GameEvent, IGameEventConfig> = _GameEvents;
export type GameEventType = "manual" | "random";
