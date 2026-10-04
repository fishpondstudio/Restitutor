import type { Province } from "../definitions/Province";
import type { ProvinceNameOverride } from "../definitions/ProvinceNameOverrides";
import type { ProvinceUpgrade } from "../definitions/ProvinceUpgrades";
import type { Religion } from "../definitions/Religion";
import type { Tech } from "../definitions/Tech";
import type { ICustomEffect, IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import type { ConditionChecks } from "../logic/Calculation";
import { AchaiaEvents } from "./AchaiaEvents";
import { AegyptusCyrenaicaEvents } from "./AegyptusCyrenaicaEvents";
import { AfricaEvents } from "./AfricaEvents";
import { AnatoliaEvents } from "./AnatoliaEvents";
import { AquitaniaEvents } from "./AquitaniaEvents";
import { AsiaEvents } from "./AsiaEvents";
import { BaeticaEvents } from "./BaeticaEvents";
import { BalkanEvents } from "./BalkanEvents";
import { BelgicaEvents } from "./BelgicaEvents";
import { BithyniaEvents } from "./BithyniaEvents";
import { BritanniaEvents } from "./BritanniaEvents";
import { CorsicaSardiniaEvents } from "./CorsicaSardiniaEvents";
import { DaciaEvents } from "./DaciaEvents";
import { DalmatiaEvents } from "./DalmatiaEvents";
import { DanubianEvents } from "./DanubianEvents";
import { EpirusEvents } from "./EpirusEvents";
import { GalatiaLyciaCiliciaCappadociaEvents } from "./GalatiaLyciaCiliciaCappadociaEvents";
import { GallicEmpireEvents } from "./GallicEmpireEvents";
import type { GameEventOrder } from "./GameEventOrder";
import { GermaniaEvents } from "./GermaniaEvents";
import { HispaniaEvents } from "./HispaniaEvents";
import { HistoricalEvents } from "./HistoricalEvents";
import type { ImageWithCredit } from "./ImageWithCredit";
import { ItaliaEvents } from "./ItaliaEvents";
import { ItaliaSharedEvents } from "./ItaliaSharedEvents";
import { LugdunensisEvents } from "./LugdunensisEvents";
import { LusitaniaEvents } from "./LusitaniaEvents";
import { MacedoniaEvents } from "./MacedoniaEvents";
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
import { SyriaJudeaEvents } from "./SyriaJudeaEvents";
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
   order?: GameEventOrder;
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
   ...MacedoniaEvents,
   ...EpirusEvents,
   ...AchaiaEvents,
   ...BithyniaEvents,
   ...AsiaEvents,
   ...GalatiaLyciaCiliciaCappadociaEvents,
   ...AegyptusCyrenaicaEvents,
   ...SyriaJudeaEvents,
   ...ThraciaEvents,
   ...TarraconensisEvents,
   ...LusitaniaEvents,
   ...BaeticaEvents,
   ...MauretaniaEvents,
   ...AfricaEvents,
   ...ItaliaEvents,
   ...SiciliaEvents,
   ...CorsicaSardiniaEvents,
   ...ItaliaSharedEvents,
   ...GallicEmpireEvents,
   ...HispaniaEvents,
   ...DanubianEvents,
   ...BalkanEvents,
   ...AnatoliaEvents,
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
