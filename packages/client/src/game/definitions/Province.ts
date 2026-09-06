import { fromEntries, keysOf, mapOf, type Tile, type ValueOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { GameEvent } from "../events/GameEvents";
import type { IAdvisor } from "./Advisor";
import type { CasusBelli } from "./CasusBelli";
import type { Culture } from "./Culture";
import type { IGovernorFamily } from "./Family";
import { Goods } from "./Goods";
import type { LegacyUpgrade } from "./LegacyUpgrade";
import type { IModifier, Modifier } from "./Modifier";
import type { ProvinceUpgrade } from "./ProvinceUpgrades";
import type { Religion } from "./Religion";
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
   victoryCount: 0,
   consulVotes: 1,
   goodsTaxRate: MaxGoodsTaxRate,
   usedRestoration: 0,
   agendaCount: 0,
   upperClassInfluence: 100,
   middleClassInfluence: 80,
   lowerClassInfluence: 60,
   religiousClassInfluence: 0,
   militaryClassInfluence: 60,
   upperClassLoyalty: 100,
   middleClassLoyalty: 100,
   lowerClassLoyalty: 100,
   religiousClassLoyalty: 100,
   militaryClassLoyalty: 100,
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
   victoryCount: () => $t(L.NumberOfVictories),
   consulVotes: () => $t(L.ConsulVotes),
   goodsTaxRate: () => $t(L.GoodsTaxRate),
   usedRestoration: () => $t(L.UsedRestoration),
   agendaCount: () => $t(L.AgendaCount),
   upperClassInfluence: () => $t(L.UpperClassInfluenceStat),
   middleClassInfluence: () => $t(L.MiddleClassInfluenceStat),
   lowerClassInfluence: () => $t(L.LowerClassInfluenceStat),
   religiousClassInfluence: () => $t(L.ReligiousClassInfluenceStat),
   militaryClassInfluence: () => $t(L.MilitaryClassInfluenceStat),
   upperClassLoyalty: () => $t(L.UpperClassLoyaltyStat),
   middleClassLoyalty: () => $t(L.MiddleClassLoyaltyStat),
   lowerClassLoyalty: () => $t(L.LowerClassLoyaltyStat),
   religiousClassLoyalty: () => $t(L.ReligiousClassLoyaltyStat),
   militaryClassLoyalty: () => $t(L.MilitaryClassLoyaltyStat),
} as const;

export type ProvinceStat = keyof typeof ProvinceStats;
export type ProvinceStats = Record<ProvinceStat, number>;

export const ProvinceResources = {
   administrative: [0, 0] as [number, number],
   diplomatic: [0, 0] as [number, number],
   military: [0, 0] as [number, number],
   gold: [300, 0] as [number, number],
   legacy: [0, 0] as [number, number],
   generalSkillPoint: [0, 0] as [number, number],
   consulPoint: [0, 0] as [number, number],
   christianity: [10, 0] as [number, number],
   mandate: [0, 0] as [number, number],
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
   christianity: () => $t(L.ChristianInfluence),
   mandate: () => $t(L.Mandate),
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
   toleratedCultures: Set<Culture>;
   religion: Religion;
   toleratedReligions: Set<Religion>;
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
   modifiers: Partial<Record<Modifier, IModifier[]>>;
   dynamicModifiers: Partial<Record<Modifier, (IModifier & { timeLeft?: number })[]>>;
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

export const ProvinceNameOverrides = {
   GallicEmpire: () => $t(L.GallicEmpire),
   WesternRomanEmpire: () => $t(L.ProvinceWesternRomanEmpire),
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
   "Appease",
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
   "ChangeRival",
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
   patronMonths: number;
   guaranteeDefense?: number;
   deterAggression?: number;
   revealElectionBacking?: number;
   truceUntil: number;
   improveRelations: { active: boolean; value: number };
   infiltrate: { active: boolean; value: number };
   casusBelli: Map<CasusBelli, { monthsLeft: number }>;
   attitudeModifier: IModifier[];
   trade?: ActiveTrade;
}

interface IProvinceConfig {
   code: string;
   name: () => string;
   culture: Culture;
   religion: Religion;
   upgrades: ProvinceUpgrade[];
}

export const Province = {
   Achaia: { code: "AC", name: () => $t(L.ProvinceAchaia), culture: "Greek", religion: "GrecoRoman", upgrades: [] },
   Aegyptus: {
      code: "AE",
      name: () => $t(L.ProvinceAegyptus),
      culture: "Egyptian",
      religion: "Egyptian",
      upgrades: [],
   },
   Africa: {
      code: "AF",
      name: () => $t(L.ProvinceAfrica),
      culture: "Punic",
      religion: "GrecoRoman",
      upgrades: ["LittoralTaxDistricts", "MercantileMobilization", "GranaryOfTheEmpire"],
   },
   Aquitania: {
      code: "AQ",
      name: () => $t(L.ProvinceAquitania),
      culture: "Gallic",
      religion: "Celtic",
      upgrades: ["SereneVineyards", "CultivatedEstates", "HillfortBastion"],
   },
   Asia: { code: "AS", name: () => $t(L.ProvinceAsia), culture: "Greek", religion: "GrecoRoman", upgrades: [] },
   Baetica: {
      code: "BA",
      name: () => $t(L.ProvinceBaetica),
      culture: "Iberian",
      religion: "Iberian",
      upgrades: ["CommandOfThePillars", "OpulentPortCities", "WorkshopOfTheWest"],
   },
   Belgica: {
      code: "BE",
      name: () => $t(L.ProvinceBelgica),
      culture: "Gallic",
      religion: "Celtic",
      upgrades: ["RangedPredominance", "BravestOfTheGauls", "MartialSociety"],
   },
   Bithynia: {
      code: "BI",
      name: () => $t(L.ProvinceBithynia),
      culture: "Greek",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Britannia: {
      code: "BR",
      name: () => $t(L.ProvinceBritannia),
      culture: "Brittonic",
      religion: "Celtic",
      upgrades: ["MaritimeAmbition", "NavalTradition", "CoastalMandate"],
   },
   Cappadocia: {
      code: "CA",
      name: () => $t(L.ProvinceCappadocia),
      culture: "Cappadocian",
      religion: "Anatolian",
      upgrades: [],
   },
   Cilicia: { code: "CI", name: () => $t(L.ProvinceCilicia), culture: "Anatolian", religion: "Eastern", upgrades: [] },
   Corsica: {
      code: "CO",
      name: () => $t(L.ProvinceCorsica),
      culture: "Corsican",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Cyrenaica: {
      code: "CY",
      name: () => $t(L.ProvinceCyrenaica),
      culture: "Greek",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Dacia: { code: "DA", name: () => $t(L.ProvinceDacia), culture: "Dacian", religion: "GrecoRoman", upgrades: [] },
   Dalmatia: {
      code: "DL",
      name: () => $t(L.ProvinceDalmatia),
      culture: "Illyrian",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Epirus: { code: "EP", name: () => $t(L.ProvinceEpirus), culture: "Greek", religion: "GrecoRoman", upgrades: [] },
   Galatia: {
      code: "GA",
      name: () => $t(L.ProvinceGalatia),
      culture: "Anatolian",
      religion: "Anatolian",
      upgrades: [],
   },
   Germania: {
      code: "GE",
      name: () => $t(L.ProvinceGermania),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: ["FortifiedAdministration", "VeteranGenerals", "UnitedFrontier"],
   },
   Italia: {
      code: "IT",
      name: () => $t(L.ProvinceItalia),
      culture: "Italic",
      religion: "GrecoRoman",
      upgrades: ["SenatorialAuthority", "InclusiveCitizenship", "CaputMundi", "ExperiencedCommand"],
   },
   Judea: { code: "JU", name: () => $t(L.ProvinceJudea), culture: "Arab", religion: "Judaism", upgrades: [] },
   Lusitania: {
      code: "LS",
      name: () => $t(L.ProvinceLusitania),
      culture: "Iberian",
      religion: "Iberian",
      upgrades: ["TreatyRevenues", "VictoriousLeadership", "PaxLusitana"],
   },
   Lycia: { code: "LY", name: () => $t(L.ProvinceLycia), culture: "Anatolian", religion: "Anatolian", upgrades: [] },
   Lugdunensis: {
      code: "LG",
      name: () => $t(L.ProvinceLugdunensis),
      culture: "Gallic",
      religion: "Celtic",
      upgrades: ["CavalryWarPower", "TradeProfitForEachTrade", "ChristianFervor"],
   },
   Macedonia: {
      code: "MC",
      name: () => $t(L.ProvinceMacedonia),
      culture: "Greek",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Mauretania: {
      code: "MR",
      name: () => $t(L.ProvinceMauretania),
      culture: "Berber",
      religion: "Berber",
      upgrades: ["TheTwoShores", "MoorishMuster", "MaritimeRenown"],
   },
   Moesia: {
      code: "MO",
      name: () => $t(L.ProvinceMoesia),
      culture: "Thracian",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Narbonensis: {
      code: "NB",
      name: () => $t(L.ProvinceNarbonensis),
      culture: "Gallic",
      religion: "GrecoRoman",
      upgrades: ["MunicipalPrivilege", "MaritimeProsperity", "CommercialAlliances"],
   },
   Noricum: {
      code: "NO",
      name: () => $t(L.ProvinceNoricum),
      culture: "Noric",
      religion: "GrecoRoman",
      upgrades: ["MulticulturalArmy", "InlandAmbition", "TriumphalUnity"],
   },
   Pannonia: {
      code: "PN",
      name: () => $t(L.ProvincePannonia),
      culture: "Pannonian",
      religion: "GrecoRoman",
      upgrades: ["CrossroadsTaxDistricts", "BountifulFrontiers", "WartimeAdministration"],
   },
   Raetia: {
      code: "RA",
      name: () => $t(L.ProvinceRaetia),
      culture: "Raetian",
      religion: "GrecoRoman",
      upgrades: ["MastersOfThePasses", "ProductiveInvestment", "CommercialRenown"],
   },
   Sardinia: {
      code: "SA",
      name: () => $t(L.ProvinceSardinia),
      culture: "Sardinian",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Sicilia: {
      code: "SC",
      name: () => $t(L.ProvinceSicilia),
      culture: "Greek",
      religion: "GrecoRoman",
      upgrades: ["MediterraneanAmbition", "BountifulCoastlines", "CoastalAdministration"],
   },
   Syria: { code: "SY", name: () => $t(L.ProvinceSyria), culture: "Syrian", religion: "Eastern", upgrades: [] },
   Tarraconensis: {
      code: "TR",
      name: () => $t(L.ProvinceTarraconensis),
      culture: "Iberian",
      religion: "Iberian",
      upgrades: ["CulturalEfficiency", "ChristianTranquility", "FocusedGovernance"],
   },
   Thracia: {
      code: "TH",
      name: () => $t(L.ProvinceThracia),
      culture: "Thracian",
      religion: "GrecoRoman",
      upgrades: [],
   },
   Suebi: { code: "SU", name: () => $t(L.ProvinceSuebi), culture: "Germanic", religion: "Germanic", upgrades: [] },
   Visigoths: {
      code: "VI",
      name: () => $t(L.ProvinceVisigoths),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: [],
   },
   Vandals: {
      code: "VA",
      name: () => $t(L.ProvinceVandals),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: [],
   },
   Burgundians: {
      code: "BU",
      name: () => $t(L.ProvinceBurgundians),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: [],
   },
   Franks: { code: "FR", name: () => $t(L.ProvinceFranks), culture: "Germanic", religion: "Germanic", upgrades: [] },
   Saxons: { code: "SX", name: () => $t(L.ProvinceSaxons), culture: "Germanic", religion: "Germanic", upgrades: [] },
   Alemanni: {
      code: "AL",
      name: () => $t(L.ProvinceAlemanni),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: [],
   },
   Ostrogoths: {
      code: "OS",
      name: () => $t(L.ProvinceOstrogoths),
      culture: "Germanic",
      religion: "Germanic",
      upgrades: [],
   },
   Huns: { code: "HU", name: () => $t(L.ProvinceHuns), culture: "Hunnic", religion: "Hunnic", upgrades: [] },
} as const satisfies Record<string, IProvinceConfig>;

export type Province = keyof typeof Province;
export const Provinces = keysOf(Province);
export const EnabledProvinces: Province[] = [
   "Lugdunensis",
   "Aquitania",
   "Narbonensis",
   "Belgica",
   "Germania",
   "Tarraconensis",
   "Lusitania",
   "Baetica",
   "Italia",
   "Sicilia",
   "Mauretania",
   "Africa",
   "Britannia",
   "Raetia",
   "Noricum",
   "Pannonia",
];
EnabledProvinces.sort();
export const AlwaysFreeProvinces: Province[] = ["Lugdunensis"];
