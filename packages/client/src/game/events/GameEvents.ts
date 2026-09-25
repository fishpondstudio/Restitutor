import type { Province } from "../definitions/Province";
import type { ProvinceNameOverride } from "../definitions/ProvinceNameOverrides";
import type { ProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { ICustomEffect, IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import type { ConditionChecks } from "../logic/Calculation";
import { AfricaEvents } from "./AfricaEvents";
import { AquitaniaEvents } from "./AquitaniaEvents";
import { BaeticaEvents } from "./BaeticaEvents";
import { BalkanEvents } from "./BalkanEvents";
import { BelgicaEvents } from "./BelgicaEvents";
import { BritanniaEvents } from "./BritanniaEvents";
import { DaciaEvents } from "./DaciaEvents";
import { DalmatiaEvents } from "./DalmatiaEvents";
import { DanubianEvents } from "./DanubianEvents";
import { GallicEmpireEvents } from "./GallicEmpireEvents";
import { GermaniaEvents } from "./GermaniaEvents";
import { HispaniaEvents } from "./HispaniaEvents";
import { HistoricalEvents } from "./HistoricalEvents";
import type { ImageWithCredit } from "./ImageWithCredit";
import { ItaliaEvents } from "./ItaliaEvents";
import { ItaliaSharedEvents } from "./ItaliaSharedEvents";
import { LugdunensisEvents } from "./LugdunensisEvents";
import { LusitaniaEvents } from "./LusitaniaEvents";
import { MauretaniaEvents } from "./MauretaniaEvents";
import { MissionEvents } from "./MissionEvents";
import { MoesiaEvents } from "./MoesiaEvents";
import { NarbonensisEvents } from "./NarbonensisEvents";
import { NoricumEvents } from "./NoricumEvents";
import { PannoniaEvents } from "./PannoniaEvents";
import { RaetiaEvents } from "./RaetiaEvents";
import { RandomEvents } from "./RandomEvents";
import { ReligiousEvents } from "./ReligiousEvents";
import { SiciliaEvents } from "./SiciliaEvents";
import { TarraconensisEvents } from "./TarraconensisEvents";
import { ThraciaEvents } from "./ThraciaEvents";

export interface IGameEventButton extends IGameEffect {
   label: () => string;
   custom?: ICustomEffect[];
}

export interface IGameEventConfig {
   name: () => string;
   desc: () => string;
   type?: GameEventType;
   wikipedia?: string;
   achievement?: string;
   image: ImageWithCredit;
   condition?: IGameEventCondition;
   buttons: IGameEventButton[];
}

export interface IGameEventCondition {
   year?: [number, number];
   nameOverride?: ProvinceNameOverride;
   province?: Set<Province>;
   playerOnly?: boolean;
   onMap?: Partial<Record<Province, boolean>>;
   religion?: Set<Religion>;
   techs?: Set<Tech>;
   provinceUpgrades?: Set<ProvinceUpgrade>;
   annexAndCore?: Partial<Record<Province, number>>;
   conditions?: (province: Province, save: SaveGame) => ConditionChecks;
}

export const RomeEvents = {
   ...LugdunensisEvents,
   ...AquitaniaEvents,
   ...BelgicaEvents,
   ...BritanniaEvents,
   ...NarbonensisEvents,
   ...GermaniaEvents,
   ...RaetiaEvents,
   ...NoricumEvents,
   ...PannoniaEvents,
   ...MoesiaEvents,
   ...DaciaEvents,
   ...DalmatiaEvents,
   ...ThraciaEvents,
   ...TarraconensisEvents,
   ...LusitaniaEvents,
   ...BaeticaEvents,
   ...MauretaniaEvents,
   ...AfricaEvents,
   ...ItaliaEvents,
   ...SiciliaEvents,
   ...ItaliaSharedEvents,
   ...GallicEmpireEvents,
   ...HispaniaEvents,
   ...DanubianEvents,
   ...BalkanEvents,
   ...ReligiousEvents,
   ...MissionEvents,
   // These should not appear in `MissionPage`
   ...HistoricalEvents,
   ...RandomEvents,
} as const satisfies Record<string, IGameEventConfig>;

const _GameEvents = { ...RomeEvents };

export type GameEvent = keyof typeof _GameEvents;
export const GameEvents: Record<GameEvent, IGameEventConfig> = _GameEvents;
export type GameEventType = "random";
