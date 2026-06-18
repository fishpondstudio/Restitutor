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
   influence: number;
   loyalty: number;
   socialClass: SocialClass;
}

export const SocialClassBonuses: Partial<Record<ProvinceUpgrade, ISocialClassBonus>> = {
   UpperClassAdministrativePoint: {
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassStability: {
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassLandTax: {
      influence: 10,
      loyalty: 10,
      socialClass: "UpperClass",
   },
   UpperClassLandTaxRelief: {
      influence: 5,
      loyalty: 20,
      socialClass: "UpperClass",
   },
   MiddleClassDiplomaticPoint: {
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassPrestige: {
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassGoodsTax: {
      influence: 10,
      loyalty: 10,
      socialClass: "MiddleClass",
   },
   MiddleClassGoodsTaxRelief: {
      influence: 5,
      loyalty: 20,
      socialClass: "MiddleClass",
   },
   LowerClassMilitaryPoint: {
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassWarPower: {
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassManpower: {
      influence: 10,
      loyalty: 10,
      socialClass: "LowerClass",
   },
   LowerClassManpowerRelief: {
      influence: 5,
      loyalty: 20,
      socialClass: "LowerClass",
   },
};
