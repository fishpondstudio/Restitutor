import { $t, L } from "../../utils/i18n";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";

export const SocialClasses = ["UpperClass", "MiddleClass", "LowerClass"] as const;
export type SocialClass = (typeof SocialClasses)[number];

export interface ISocialClassData {
   loyalty: number;
   influence: number;
   dissent: number;
}

export const SocialClassNames: Record<SocialClass, () => string> = {
   UpperClass: () => $t(L.Senate),
   MiddleClass: () => $t(L.Equites),
   LowerClass: () => $t(L.Plebs),
} as const;

export interface ISocialClassBonus {
   name: () => string;
   desc: () => string;
   influence: number;
   loyalty: number;
   socialClass: SocialClass;
}

export const SocialClassBonuses: Partial<Record<ProvinceUpgrade, ISocialClassBonus>> = {
   UpperClassAdministrativePoint: {
      name: () => $t(L.MagisterialExtensions),
      desc: () => $t(L.$1MonthlyAdministrativePoint, "+1"),
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassStability: {
      name: () => $t(L.CensorialOversight),
      desc: () => $t(L.$1Stability, "+10"),
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassLandTax: {
      name: () => $t(L.PatricianLandRegistries),
      desc: () => $t(L.$1LandTax, "+10%"),
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassLandTaxRelief: {
      name: () => $t(L.SenateTaxRelief),
      desc: () => $t(L.$1LandTax, "-5%"),
      influence: 5,
      loyalty: 20,
      socialClass: "UpperClass",
   },
   MiddleClassDiplomaticPoint: {
      name: () => $t(L.OverseasTradeMissions),
      desc: () => $t(L.$1MonthlyDiplomaticPoint, "+1"),
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassPrestige: {
      name: () => $t(L.ForeignArbitrationRights),
      desc: () => $t(L.$1Prestige, "+10%"),
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassGoodsTax: {
      name: () => $t(L.NegotiatedTariffTreaties),
      desc: () => $t(L.$1TileOutput, "+10%"),
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassGoodsTaxRelief: {
      name: () => $t(L.GoodsTariffRelief),
      desc: () => $t(L.$1TileOutput, "-5%"),
      influence: 5,
      loyalty: 20,
      socialClass: "MiddleClass",
   },
   LowerClassMilitaryPoint: {
      name: () => $t(L.CitizenSoldierStipends),
      desc: () => $t(L.$1MonthlyMilitaryPoint, "+1"),
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassWarPower: {
      name: () => $t(L.MilitiaTrainingAssemblies),
      desc: () => $t(L.$1WarPower, "+10%"),
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassManpower: {
      name: () => $t(L.FrontierSettlementIncentives),
      desc: () => $t(L.$1Manpower, "+10%"),
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassManpowerRelief: {
      name: () => $t(L.WarLevyExemptions),
      desc: () => $t(L.$1Manpower, "-5%"),
      influence: 5,
      loyalty: 20,
      socialClass: "LowerClass",
   },
};
