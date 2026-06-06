import type { ICondition } from "../actions/GameAction";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { Province, ProvinceNameOverride } from "../definitions/Province";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { ICustomEffect, IGameEffect } from "../GameEffect";
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

export interface IGameEventButton extends IGameEffect {
   label: () => string;
   custom?: ICustomEffect[];
}

export interface IGameEventConfig {
   name: () => string;
   desc: () => string;
   type?: GameEventType;
   image: IGameEventImage;
   condition?: IGameEventCondition;
   buttons: IGameEventButton[];
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
