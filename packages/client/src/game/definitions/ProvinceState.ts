import type { Tile, ValueOf } from "@project/shared/src/utils/Helper";
import type { GameEvent } from "../events/GameEvents";
import type { IAdvisor } from "./Advisor";
import type { Culture } from "./Culture";
import type { IRelation } from "./Diplomacy";
import type { IGovernorFamily } from "./Family";
import type { Goods } from "./Goods";
import type { LegacyUpgrade } from "./LegacyUpgrade";
import type { IModifier, Modifier } from "./Modifier";
import type { Province } from "./Province";
import type { IBlackboard } from "./ProvinceAI";
import type { ProvinceNameOverride } from "./ProvinceNameOverrides";
import type { GovernorPower, ProvinceResources } from "./ProvinceResources";
import type { ProvinceStats } from "./ProvinceStats";
import type { ProvinceUpgrade } from "./ProvinceUpgrades";
import type { Religion } from "./Religion";
import type { Tech } from "./Tech";
import type { TimedAction } from "./TimedAction";
import type { TradeOffer } from "./Trade";

export const ProvinceFlags = {
   None: 0,
   AutomaticallySettleUnrest: 1 << 0,
   AutomaticallyPledgeSupport: 1 << 1,
   AutomaticallyMakeCore: 1 << 2,
   AutomaticallyEvangelizeMinorReligions: 1 << 3,
   AutomaticallyEvangelizeToleratedReligions: 1 << 4,
   AutomaticallyConvertMinorCultures: 1 << 5,
   AutomaticallyConvertToleratedCultures: 1 << 6,
   AutomaticallyRepayLoans: 1 << 7,
   AutomaticallyInviteMinorReligionsToIslam: 1 << 8,
   AutomaticallyInviteToleratedReligionsToIslam: 1 << 9,
} as const;

export type ProvinceFlags = ValueOf<typeof ProvinceFlags>;

export interface IProvince {
   nameOverride?: ProvinceNameOverride;
   culture: Culture;
   toleratedCultures: Set<Culture>;
   religion: Religion;
   toleratedReligions: Set<Religion>;
   resources: ProvinceResources;
   governor: IGovernorFamily;
   stats: ProvinceStats;
   advisors: Record<GovernorPower, { selected: IAdvisor | null; candidates: IAdvisor[] }>;
   focus: GovernorPower;
   capital: Tile;
   regionalCapitals: Set<Tile>;
   rivals: [Province | null, Province | null];
   _relations: Map<Province, IRelation>;
   unlockedTech: Set<Tech>;
   loans: ILoan[];
   timedActions: Map<TimedAction, number>;
   modifiers: Partial<Record<Modifier, IModifier[]>>;
   dynamicModifiers: Partial<Record<Modifier, IModifier[]>>;
   production: Record<Goods, { capacity: number }>;
   events: Map<GameEvent, { month: number }>;
   usedEvents: Set<GameEvent>;
   blackboard: IBlackboard;
   legacyUpgrades: Set<LegacyUpgrade>;
   provinceUpgrades: Set<ProvinceUpgrade>;
   tradeOffers: TradeOffer[];
   flags: ProvinceFlags;
   monthly: {
      tradeGold: Map<Province, number>;
      goodsTax: Map<Goods, number>;
      skippedTrade: Set<Province>;
   };
}

export interface ILoan {
   principal: number;
   interest: number;
   month: number;
}
