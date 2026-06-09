import { fromEntries, keysOf, mapOf, type Tile, type ValueOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { GameEvent } from "../events/GameEvents";
import type { IAdvisor } from "./Advisor";
import type { CasusBelli } from "./CasusBelli";
import type { Culture } from "./Culture";
import type { IGovernorFamily } from "./Family";
import { Goods } from "./Goods";
import type { LegacyUpgrade } from "./LegacyUpgrade";
import type { IModifier, Modifiers } from "./Modifier";
import type { Religion } from "./Religion";
import type { ISocialClassData, SocialClass } from "./SocialClass";
import type { Tech } from "./Tech";
import type { TimedAction } from "./TimedAction";

export const DefaultConscription = 10;
export const MinGoodsTaxRate = 10;
export const MaxGoodsTaxRate = 50;

export const ProvinceStats = {
   targetConscription: DefaultConscription,
   actualConscription: DefaultConscription,
   armyMaintenance: 100,
   armyMorale: 100,
   rangedUnit: 0,
   cavalryUnit: 0,
   infantrySkill: 0,
   rangedSkill: 0,
   cavalrySkill: 0,
   makeCoreCount: 0,
   attackCount: 0,
   defendCount: 0,
   consulVotes: 1,
   goodsTaxRate: MaxGoodsTaxRate,
} as const;

export const ProvinceStatNames: Record<ProvinceStat, () => string> = {
   targetConscription: () => $t(L.TargetConscription),
   actualConscription: () => $t(L.ActualConscription),
   armyMaintenance: () => $t(L.ArmyMaintenance),
   armyMorale: () => $t(L.ArmyMorale),
   rangedUnit: () => $t(L.RangedUnit),
   cavalryUnit: () => $t(L.CavalryUnit),
   infantrySkill: () => $t(L.InfantrySkill),
   rangedSkill: () => $t(L.RangedSkill),
   cavalrySkill: () => $t(L.CavalrySkill),
   makeCoreCount: () => $t(L.NumberOfCoresMade),
   attackCount: () => $t(L.NumberOfAttacks),
   defendCount: () => $t(L.NumberOfDefenses),
   consulVotes: () => $t(L.ConsulVotes),
   goodsTaxRate: () => $t(L.GoodsTaxRate),
} as const;

export type ProvinceStat = keyof typeof ProvinceStats;
export type ProvinceStats = Record<ProvinceStat, number>;

export const ProvinceResources = {
   administrative: [0, 0] as [number, number],
   diplomatic: [0, 0] as [number, number],
   military: [0, 0] as [number, number],
   gold: [1453, 0] as [number, number],
   legacy: [0, 0] as [number, number],
   generalSkillPoint: [0, 0] as [number, number],
   consulPoint: [0, 0] as [number, number],
   christianity: [10, 0] as [number, number],
   ...fromEntries(mapOf(Goods, (goods) => [goods, [0, 0] as [number, number]])),
} as const;

export const ProvinceResourceNames: Record<ProvinceResource, () => string> = {
   administrative: () => $t(L.AdministrativePoint),
   diplomatic: () => $t(L.DiplomaticPoint),
   military: () => $t(L.MilitaryPoint),
   gold: () => $t(L.Gold),
   legacy: () => $t(L.LegacyPoint),
   generalSkillPoint: () => $t(L.GeneralSkillPoint),
   consulPoint: () => $t(L.ConsulPoint),
   christianity: () => $t(L.ChristianityInfluence),
   ...fromEntries(mapOf(Goods, (goods, def) => [goods, () => def.name()])),
} as const;

export type GovernorPower = keyof Pick<ProvinceResources, "administrative" | "diplomatic" | "military">;
export type GovernorStats = Record<GovernorPower, number>;
export type ProvinceResource = keyof typeof ProvinceResources;
export type ProvinceResources = Record<ProvinceResource, [number, number]>;
export type ProvinceResourceCosts = Partial<Record<ProvinceResource, number>>;

export type TradeOfferBase =
   | { theyOffer: Goods; weOffer: Goods }
   | { theyOffer: "gold"; weOffer: Goods }
   | { theyOffer: Goods; weOffer: "gold" };

export type TradeOffer = TradeOfferBase & { theyOfferAmount: number; weOfferAmount: number };

export type ActiveTrade = TradeOffer & { monthsLeft: number };

export const ProvinceFlags = {
   None: 0,
   AutomaticallySettleUnrest: 1 << 0,
   AutomaticallyPledgeSupport: 1 << 1,
} as const;

export type ProvinceFlags = ValueOf<typeof ProvinceFlags>;

export interface IProvince {
   nameOverride: ProvinceNameOverride | undefined;
   culture: Culture;
   religion: Religion;
   resources: ProvinceResources;
   governor: IGovernorFamily;
   stats: ProvinceStats;
   advisors: Record<GovernorPower, { selected: IAdvisor | null; candidates: IAdvisor[] }>;
   focus: GovernorPower;
   capital: Tile;
   rivals: [Province | null, Province | null];
   _relations: Map<Province, IRelation>;
   unlockedTech: Set<Tech>;
   loans: ILoan[];
   timedActions: Map<TimedAction, number>;
   modifiers: Modifiers;
   dynamicModifiers: Modifiers;
   production: Record<Goods, { capacity: number }>;
   events: Map<GameEvent, { month: number }>;
   usedEvents: Set<GameEvent>;
   blackboard: IBlackboard;
   completedMissions: Set<string>;
   socialClasses: Record<SocialClass, ISocialClassData>;
   legacyUpgrades: Map<LegacyUpgrade, number>;
   provinceUpgrades: Set<ProvinceUpgrade>;
   tradeOffers: TradeOffer[];
   flags: ProvinceFlags;
   monthly: {
      tradeGold: Map<Province, number>;
      goodsTax: Map<Goods, number>;
      skippedTrade: Set<Province>;
   };
}

export const ProvinceNameOverrides = {
   GallicEmpire: () => $t(L.GallicEmpire),
} as const satisfies Record<string, () => string>;

export type ProvinceNameOverride = keyof typeof ProvinceNameOverrides;

export type BlackboardResource = Partial<Record<ProvinceResource, Partial<Record<AIAction, number>>>>;

export interface IBlackboard {
   resources: BlackboardResource;
}

export const AIActions = [
   "Upgrade",
   "Research",
   "Construct",
   "CrackDown",
   "ChangeTileGoods",
   "LookForSpouse",
   "RecruitGeneral",
   "RequestFunding",
   "DeclareWar",
   "SignPeaceTreaty",
   "NegotiateWhitePeace",
   "MakeCore",
   "AppointPontiffEnvoyArmyStaff",
   "TradeGoods",
   "UpgradeGeneralSkill",
   "ConvertToChristianity",
   "OfferTreaty",
] as const;
export type AIAction = (typeof AIActions)[number];

export interface ILoan {
   principal: number;
   interest: number;
   month: number;
}

export const Treaty = ["DefensePact", "Alliance", "Client", "Patron"] as const;
export type Treaty = (typeof Treaty)[number];

export const TreatyNames: Record<Treaty, () => string> = {
   DefensePact: () => $t(L.DefensePact),
   Alliance: () => $t(L.Alliance),
   Client: () => $t(L.Clientage),
   Patron: () => $t(L.Patronage),
} as const;

export interface IRelation {
   treaty?: { type: Treaty; month: number };
   guaranteeDefense: number | undefined;
   deterAggression: number | undefined;
   revealElectionBacking: number | undefined;
   truceUntil: number;
   improveRelations: { active: boolean; value: number };
   infiltrate: { active: boolean; value: number };
   casusBelli: Map<CasusBelli, { monthsLeft: number }>;
   attitudeModifier: IModifier[];
   trade: ActiveTrade | undefined;
}

interface IProvinceConfig {
   name: () => string;
   culture: Culture;
   religion: Religion;
}

export const Province = {
   Achaia: { name: () => $t(L.ProvinceAchaia), culture: "Greek", religion: "GrecoRoman" },
   Aegyptus: { name: () => $t(L.ProvinceAegyptus), culture: "Egyptian", religion: "Egyptian" },
   Africa: { name: () => $t(L.ProvinceAfrica), culture: "Punic", religion: "GrecoRoman" },
   Aquitania: { name: () => $t(L.ProvinceAquitania), culture: "Gallic", religion: "Celtic" },
   Judea: { name: () => $t(L.ProvinceJudea), culture: "Arab", religion: "Judaism" },
   Asia: { name: () => $t(L.ProvinceAsia), culture: "Greek", religion: "GrecoRoman" },
   Italia: { name: () => $t(L.ProvinceItalia), culture: "Italic", religion: "GrecoRoman" },
   Baetica: { name: () => $t(L.ProvinceBaetica), culture: "Iberian", religion: "Iberian" },
   Belgica: { name: () => $t(L.ProvinceBelgica), culture: "Gallic", religion: "Celtic" },
   Bithynia: { name: () => $t(L.ProvinceBithynia), culture: "Greek", religion: "GrecoRoman" },
   Corsica: { name: () => $t(L.ProvinceCorsica), culture: "Corsican", religion: "GrecoRoman" },
   Dalmatia: { name: () => $t(L.ProvinceDalmatia), culture: "Illyrian", religion: "GrecoRoman" },
   Cyrenaica: { name: () => $t(L.ProvinceCyrenaica), culture: "Greek", religion: "GrecoRoman" },
   Dacia: { name: () => $t(L.ProvinceDacia), culture: "Dacian", religion: "GrecoRoman" },
   Cilicia: { name: () => $t(L.ProvinceCilicia), culture: "Anatolian", religion: "Eastern" },
   Germania: { name: () => $t(L.ProvinceGermania), culture: "Germanic", religion: "Germanic" },
   Lusitania: { name: () => $t(L.ProvinceLusitania), culture: "Iberian", religion: "Iberian" },
   Lycia: { name: () => $t(L.ProvinceLycia), culture: "Anatolian", religion: "Anatolian" },
   Britannia: { name: () => $t(L.ProvinceBritannia), culture: "Brittonic", religion: "Celtic" },
   Macedonia: { name: () => $t(L.ProvinceMacedonia), culture: "Greek", religion: "GrecoRoman" },
   Mauretania: { name: () => $t(L.ProvinceMauretania), culture: "Berber", religion: "Berber" },
   Moesia: { name: () => $t(L.ProvinceMoesia), culture: "Thracian", religion: "GrecoRoman" },
   Narbonensis: { name: () => $t(L.ProvinceNarbonensis), culture: "Gallic", religion: "GrecoRoman" },
   Sardinia: { name: () => $t(L.ProvinceSardinia), culture: "Sardinian", religion: "GrecoRoman" },
   Raetia: { name: () => $t(L.ProvinceRaetia), culture: "Raetian", religion: "GrecoRoman" },
   Epirus: { name: () => $t(L.ProvinceEpirus), culture: "Greek", religion: "GrecoRoman" },
   Pannonia: { name: () => $t(L.ProvincePannonia), culture: "Pannonian", religion: "GrecoRoman" },
   Sicilia: { name: () => $t(L.ProvinceSicilia), culture: "Greek", religion: "GrecoRoman" },
   Galatia: { name: () => $t(L.ProvinceGalatia), culture: "Anatolian", religion: "Anatolian" },
   Syria: { name: () => $t(L.ProvinceSyria), culture: "Syrian", religion: "Eastern" },
   Tarraconensis: { name: () => $t(L.ProvinceTarraconensis), culture: "Iberian", religion: "Iberian" },
   Thracia: { name: () => $t(L.ProvinceThracia), culture: "Thracian", religion: "GrecoRoman" },
   Cappadocia: { name: () => $t(L.ProvinceCappadocia), culture: "Cappadocian", religion: "Anatolian" },
   Noricum: { name: () => $t(L.ProvinceNoricum), culture: "Noric", religion: "GrecoRoman" },
   Lugdunensis: { name: () => $t(L.ProvinceLugdunensis), culture: "Gallic", religion: "Celtic" },
} as const satisfies Record<string, IProvinceConfig>;

export type Province = keyof typeof Province;
export const Provinces = keysOf(Province);

export const ProvinceExtraGoverningCapacity: Partial<Record<Province, number>> = {
   Africa: 100,
   Italia: 100,
   Mauretania: 100,
   Tarraconensis: 100,
};
