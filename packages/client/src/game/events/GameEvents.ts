import type { IGameEventConfig } from "./GameEventTypes";
import { AchaiaEvents } from "./Rome/AchaiaEvents";
import { AegyptusCyrenaicaEvents } from "./Rome/AegyptusCyrenaicaEvents";
import { AfricaEvents } from "./Rome/AfricaEvents";
import { AnatoliaEvents } from "./Rome/AnatoliaEvents";
import { AquitaniaEvents } from "./Rome/AquitaniaEvents";
import { AsiaEvents } from "./Rome/AsiaEvents";
import { BaeticaEvents } from "./Rome/BaeticaEvents";
import { BalkanEvents } from "./Rome/BalkanEvents";
import { BelgicaEvents } from "./Rome/BelgicaEvents";
import { BithyniaEvents } from "./Rome/BithyniaEvents";
import { BritanniaEvents } from "./Rome/BritanniaEvents";
import { CaliphateEvents } from "./Rome/CaliphateEvents";
import { CorsicaSardiniaEvents } from "./Rome/CorsicaSardiniaEvents";
import { DaciaEvents } from "./Rome/DaciaEvents";
import { DalmatiaEvents } from "./Rome/DalmatiaEvents";
import { DanubianEvents } from "./Rome/DanubianEvents";
import { EpirusEvents } from "./Rome/EpirusEvents";
import { GalatiaLyciaCiliciaCappadociaEvents } from "./Rome/GalatiaLyciaCiliciaCappadociaEvents";
import { GallicEmpireEvents } from "./Rome/GallicEmpireEvents";
import { GermaniaEvents } from "./Rome/GermaniaEvents";
import { HispaniaEvents } from "./Rome/HispaniaEvents";
import { HistoricalEvents } from "./Rome/HistoricalEvents";
import { ItaliaEvents } from "./Rome/ItaliaEvents";
import { ItaliaSharedEvents } from "./Rome/ItaliaSharedEvents";
import { LugdunensisEvents } from "./Rome/LugdunensisEvents";
import { LusitaniaEvents } from "./Rome/LusitaniaEvents";
import { MacedoniaEvents } from "./Rome/MacedoniaEvents";
import { MauretaniaEvents } from "./Rome/MauretaniaEvents";
import { MissionEvents } from "./Rome/MissionEvents";
import { MoesiaEvents } from "./Rome/MoesiaEvents";
import { NarbonensisEvents } from "./Rome/NarbonensisEvents";
import { NoricumEvents } from "./Rome/NoricumEvents";
import { PannoniaEvents } from "./Rome/PannoniaEvents";
import { RaetiaEvents } from "./Rome/RaetiaEvents";
import { RandomEvents } from "./Rome/RandomEvents";
import { ReligiousEvents } from "./Rome/ReligiousEvents";
import { SiciliaEvents } from "./Rome/SiciliaEvents";
import { SyriaJudeaEvents } from "./Rome/SyriaJudeaEvents";
import { TarraconensisEvents } from "./Rome/TarraconensisEvents";
import { ThraciaEvents } from "./Rome/ThraciaEvents";
import { LiuBeiEvents } from "./ThreeKingdoms/LiuBeiEvents";
import { LuBuEvents } from "./ThreeKingdoms/LuBuEvents";
import { ThreeKingdomsMissionEvents } from "./ThreeKingdoms/ThreeKingdomsMissionEvents";
import { YuanShaoEvents } from "./ThreeKingdoms/YuanShaoEvents";

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
