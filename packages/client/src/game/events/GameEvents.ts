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
import { CaliphateEvents } from "./CaliphateEvents";
import { CorsicaSardiniaEvents } from "./CorsicaSardiniaEvents";
import { DaciaEvents } from "./DaciaEvents";
import { DalmatiaEvents } from "./DalmatiaEvents";
import { DanubianEvents } from "./DanubianEvents";
import { EpirusEvents } from "./EpirusEvents";
import { GalatiaLyciaCiliciaCappadociaEvents } from "./GalatiaLyciaCiliciaCappadociaEvents";
import { GallicEmpireEvents } from "./GallicEmpireEvents";
import type { IGameEventConfig } from "./GameEventTypes";
import { GermaniaEvents } from "./GermaniaEvents";
import { HispaniaEvents } from "./HispaniaEvents";
import { HistoricalEvents } from "./HistoricalEvents";
import { ItaliaEvents } from "./ItaliaEvents";
import { ItaliaSharedEvents } from "./ItaliaSharedEvents";
import { LiuBeiEvents } from "./LiuBeiEvents";
import { LuBuEvents } from "./LuBuEvents";
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
import { ThreeKingdomsMissionEvents } from "./ThreeKingdomsMissionEvents";
import { YuanShaoEvents } from "./YuanShaoEvents";

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
   ...CaliphateEvents,
   // These should not appear in `MissionPage`
   ...HistoricalEvents,
   ...RandomEvents,
} as const satisfies Record<string, IGameEventConfig>;

export const ThreeKingdomsEvents = {
   ...LiuBeiEvents,
   ...LuBuEvents,
   ...YuanShaoEvents,
   ...ThreeKingdomsMissionEvents,
} as const satisfies Record<string, IGameEventConfig>;

const _GameEvents = { ...RomeEvents, ...ThreeKingdomsEvents };

export type GameEvent = keyof typeof _GameEvents;
export const GameEvents: Record<GameEvent, IGameEventConfig> = _GameEvents;
export type GameEventType = "random";
