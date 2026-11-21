import type { ProvinceResource } from "./ProvinceResources";

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
   "EnlistCourtSupport",
   "DeclareWar",
   "SignPeaceTreaty",
   "NegotiateWhitePeace",
   "MakeCore",
   "ConvertCulture",
   "AppointPontiffEnvoyArmyStaff",
   "TradeGoods",
   "UpgradeGeneralSkill",
   "ConvertToChristianity",
   "OfferTreaty",
   "ChangeRival",
   "Denounce",
   "SetGovernmentFocus",
   "EstablishRegionalCapital",
] as const;
export type AIAction = (typeof AIActions)[number];
