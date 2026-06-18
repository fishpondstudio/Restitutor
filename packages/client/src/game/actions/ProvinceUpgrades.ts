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
      name: () => $t(L.MagisterialExtensions),
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   },
   UpperClassStability: {
      name: () => $t(L.CensorialOversight),
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   },
   UpperClassLandTax: {
      name: () => $t(L.PatricianLandRegistries),
      modifiers: {
         LandTax: { type: "multiply", value: 0.1 },
      },
   },
   UpperClassLandTaxRelief: {
      name: () => $t(L.SenateTaxRelief),
      modifiers: {
         LandTax: { type: "multiply", value: -0.05 },
      },
   },
   MiddleClassDiplomaticPoint: {
      name: () => $t(L.OverseasTradeMissions),
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   },
   MiddleClassPrestige: {
      name: () => $t(L.ForeignArbitrationRights),
      modifiers: {
         Prestige: { type: "multiply", value: 0.1 },
      },
   },
   MiddleClassGoodsTax: {
      name: () => $t(L.NegotiatedTariffTreaties),
      modifiers: {
         TileOutput: { type: "multiply", value: 0.1 },
      },
   },
   MiddleClassGoodsTaxRelief: {
      name: () => $t(L.GoodsTariffRelief),
      modifiers: {
         TileOutput: { type: "multiply", value: -0.05 },
      },
   },
   LowerClassMilitaryPoint: {
      name: () => $t(L.CitizenSoldierStipends),
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   },
   LowerClassWarPower: {
      name: () => $t(L.MilitiaTrainingAssemblies),
      modifiers: {
         WarPower: { type: "multiply", value: 0.1 },
      },
   },
   LowerClassManpower: {
      name: () => $t(L.FrontierSettlementIncentives),
      modifiers: {
         Manpower: { type: "multiply", value: 0.1 },
      },
   },
   LowerClassManpowerRelief: {
      name: () => $t(L.WarLevyExemptions),
      modifiers: {
         Manpower: { type: "multiply", value: -0.05 },
      },
   },
   InfiltrationOnDeclaringWar: {
      name: () => $t(L.$1InfiltrationWhenDeclaringWar, "+25"),
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
