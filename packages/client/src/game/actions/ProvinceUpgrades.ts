import { EmptyString } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IBaseModifier, Modifier } from "../definitions/Modifier";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";

export interface IProvinceUpgrade {
   name: () => string;
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
}

const _ProvinceUpgrades = {
   Tetrarchy: {
      name: () => $t(L.Tetrarchy),
   },
   EdictOfMilan: {
      name: () => $t(L.EdictOfMilan),
   },
   ReligiousUnrest: {
      name: () => $t(L.ReligiousUnrest),
      modifiers: {
         LandTax: { type: "multiply", value: -0.2 },
         TileOutput: { type: "multiply", value: -0.2 },
         Manpower: { type: "multiply", value: -0.2 },
         Stability: { type: "add", value: -20 },
      },
   },
   UpperClassAdministrativePoint: {
      name: () => EmptyString,
   },
   UpperClassStability: {
      name: () => EmptyString,
   },
   UpperClassLandTax: {
      name: () => EmptyString,
   },
   UpperClassLandTaxRelief: {
      name: () => EmptyString,
   },
   MiddleClassDiplomaticPoint: {
      name: () => EmptyString,
   },
   MiddleClassPrestige: {
      name: () => EmptyString,
   },
   MiddleClassGoodsTax: {
      name: () => EmptyString,
   },
   MiddleClassGoodsTaxRelief: {
      name: () => EmptyString,
   },
   LowerClassMilitaryPoint: {
      name: () => EmptyString,
   },
   LowerClassWarPower: {
      name: () => EmptyString,
   },
   LowerClassManpower: {
      name: () => EmptyString,
   },
   LowerClassManpowerRelief: {
      name: () => EmptyString,
   },
} as const satisfies Record<string, IProvinceUpgrade>;

export type ProvinceUpgrade = keyof typeof _ProvinceUpgrades;
export const ProvinceUpgrades = _ProvinceUpgrades as Record<ProvinceUpgrade, IProvinceUpgrade>;

export function hasProvinceUpgrade(upgrade: ProvinceUpgrade, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   return state.provinceUpgrades.has(upgrade);
}

export function addProvinceUpgrade(upgrade: ProvinceUpgrade, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.provinceUpgrades.add(upgrade);
}

export function removeProvinceUpgrade(upgrade: ProvinceUpgrade, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   state.provinceUpgrades.delete(upgrade);
}
