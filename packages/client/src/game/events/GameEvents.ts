import type { ICondition } from "../actions/GameAction";
import type { Province, ProvinceNameOverride } from "../definitions/Province";
import type { ProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { ICustomEffect, IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { AquitaniaEvent } from "./AquitaniaEvent";
import { BaeticaEvent } from "./BaeticaEvent";
import { BelgicaEvent } from "./BelgicaEvent";
import { GallicEmpireEvents } from "./GallicEmpireEvents";
import { GermaniaEvent } from "./GermaniaEvent";
import { HispaniaEvent } from "./HispaniaEvents";
import { HistoricalEvents } from "./HistoricalEvents";
import type { ImageWithCredit } from "./ImageWithCredit";
import { ItaliaEvent } from "./ItaliaEvent";
import { ItaliaSharedEvent } from "./ItaliaSharedEvent";
import { LugdunensisEvent } from "./LugdunensisEvent";
import { LusitaniaEvent } from "./LusitaniaEvent";
import { ManualEvents } from "./ManualEvents";
import { MissionEvents } from "./MissionEvents";
import { NarbonensisEvent } from "./NarbonensisEvent";
import { RandomEvents } from "./RandomEvents";
import { ReligiousEvents } from "./ReligiousEvents";
import { SiciliaEvent } from "./SiciliaEvent";
import { TarraconensisEvent } from "./TarraconensisEvent";
import { WesternRomanEmpireEvents } from "./WesternRomanEmpireEvents";

export interface IGameEventButton extends IGameEffect {
   label: () => string;
   custom?: ICustomEffect[];
}

export interface IGameEventConfig {
   name: () => string;
   desc: () => string;
   type?: GameEventType;
   wikipedia?: string;
   image: ImageWithCredit;
   condition?: IGameEventCondition;
   buttons: IGameEventButton[];
}

export interface IGameEventCondition {
   year?: [number, number];
   nameOverride?: ProvinceNameOverride;
   province?: Province[];
   playerOnly?: boolean;
   provinceOnMap?: Province[];
   religion?: Religion[];
   techs?: Tech[];
   provinceUpgrades?: ProvinceUpgrade[];
   annexAndCore?: Partial<Record<Province, number>>;
   conditions?: (province: Province, save: SaveGame) => ICondition[];
}

const _GameEvents = {
   ...LugdunensisEvent,
   ...AquitaniaEvent,
   ...BelgicaEvent,
   ...NarbonensisEvent,
   ...GermaniaEvent,
   ...TarraconensisEvent,
   ...LusitaniaEvent,
   ...BaeticaEvent,
   ...ItaliaEvent,
   ...SiciliaEvent,
   ...ItaliaSharedEvent,
   ...GallicEmpireEvents,
   ...HispaniaEvent,
   ...MissionEvents,
   ...WesternRomanEmpireEvents,
   ...ReligiousEvents,
   // These should not appear in `MissionPage`
   ...HistoricalEvents,
   ...ManualEvents,
   ...RandomEvents,
} as const satisfies Record<string, IGameEventConfig>;

export type GameEvent = keyof typeof _GameEvents;
export const GameEvents: Record<GameEvent, IGameEventConfig> = _GameEvents;
export type GameEventType = "manual" | "random";
