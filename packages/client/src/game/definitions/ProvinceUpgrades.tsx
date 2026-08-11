import { mapOf } from "@project/shared/src/utils/Helper";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { type IBaseModifier, type Modifier, modifierToString } from "./Modifier";
import type { Province } from "./Province";

export interface IProvinceUpgrade {
   name: () => string;
   desc?: () => string;
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
}

const _ProvinceUpgrades = {
   Tetrarchy: {
      name: () => $t(L.Tetrarchy),
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
   CavalryWarPower: {
      name: () => $t(L.CavalryPredominance),
      desc: () => $t(L.CavalryPredominanceDesc),
   },
   TradeProfitForEachTrade: {
      name: () => $t(L.MercantileSynergy),
      desc: () => $t(L.MercantileSynergyDesc),
   },
   ChristianFervor: {
      name: () => $t(L.ChristianFervor),
      desc: () => $t(L.ChristianFervorDesc),
   },
   OurOwnDestiny: {
      name: () => $t(L.OurOwnDestiny),
      desc: () => $t(L.OurOwnDestinyDesc),
   },
   SereneVineyards: {
      name: () => $t(L.SereneVineyards),
      desc: () => $t(L.SereneVineyardsDesc),
   },
   CultivatedEstates: {
      name: () => $t(L.CultivatedEstates),
      desc: () => $t(L.CultivatedEstatesDesc),
   },
   HillfortBastion: {
      name: () => $t(L.HillfortBastion),
      desc: () => $t(L.HillfortBastionDesc),
   },
   MunicipalPrivilege: {
      name: () => $t(L.MunicipalPrivilege),
      desc: () => $t(L.MunicipalPrivilegeDesc),
   },
   MaritimeProsperity: {
      name: () => $t(L.MaritimeProsperity),
      desc: () => $t(L.MaritimeProsperityDesc),
   },
   CommercialAlliances: {
      name: () => $t(L.CommercialAlliances),
      desc: () => $t(L.CommercialAlliancesDesc),
   },
   RangedPredominance: {
      name: () => $t(L.RangedPredominance),
      desc: () => $t(L.RangedPredominanceDesc),
   },
   BravestOfTheGauls: {
      name: () => $t(L.BravestOfTheGauls),
      desc: () => $t(L.BravestOfTheGaulsDesc),
   },
   MartialSociety: {
      name: () => $t(L.MartialSociety),
      desc: () => $t(L.MartialSocietyDesc),
   },
   FortifiedAdministration: {
      name: () => $t(L.FortifiedAdministration),
      desc: () => $t(L.FortifiedAdministrationDesc),
   },
   VeteranGenerals: {
      name: () => $t(L.VeteranGenerals),
      desc: () => $t(L.VeteranGeneralsDesc),
   },
   UnitedFrontier: {
      name: () => $t(L.UnitedFrontier),
      desc: () => $t(L.UnitedFrontierDesc),
   },
   CulturalEfficiency: {
      name: () => $t(L.CulturalEfficiency),
      desc: () => $t(L.CulturalEfficiencyDesc$3$1$2, "1%", "50%", "0.4%"),
   },
   ChristianTranquility: {
      name: () => $t(L.ChristianTranquility),
      desc: () => $t(L.ChristianTranquilityDesc$1, "-5"),
   },
   FocusedGovernance: {
      name: () => $t(L.FocusedGovernance),
      desc: () => $t(L.FocusedGovernanceDesc$1, "+1"),
   },
   TreatyRevenues: {
      name: () => $t(L.TreatyRevenues),
      desc: () => $t(L.$1LandTaxForEachDiplomaticTreaty, "+5%"),
   },
   VictoriousLeadership: {
      name: () => $t(L.VictoriousLeadership),
      desc: () => $t(L.$1PrestigeFor$2YearsAfterWinningAWarAsLeadAttackerOrDefender, "+10%", "2"),
   },
   PaxLusitana: {
      name: () => $t(L.PaxLusitana),
      desc: () => $t(L.$1TileOutputWhileNotAtWar, "+20%"),
   },
   CommandOfThePillars: {
      name: () => $t(L.CommandOfThePillars),
      desc: () => $t(L.CommandOfThePillarsDesc),
   },
   OpulentPortCities: {
      name: () => $t(L.OpulentPortCities),
      desc: () => $t(L.OpulentPortCitiesDesc),
   },
   WorkshopOfTheWest: {
      name: () => $t(L.WorkshopOfTheWest),
      modifiers: {
         ProductionCapacity: { type: "add", value: 5 },
      },
   },
   SenatorialAuthority: {
      name: () => $t(L.SenatorialAuthority),
      desc: () => $t(L.$1ConsulPointAfterEachConsulElection, "+1"),
   },
   InclusiveCitizenship: {
      name: () => $t(L.InclusiveCitizenship),
      desc: () => $t(L.$1ToleratedCulture, "+1"),
   },
   CaputMundi: {
      name: () => $t(L.CaputMundi),
      desc: () => $t(L.$1PrestigeWhileRomeIsOurCapital, "+10%"),
   },
   ExperiencedCommand: {
      name: () => $t(L.ExperiencedCommand),
      desc: () => $t(L.ExperiencedCommandDesc$1, "+2%"),
   },
   MediterraneanAmbition: {
      name: () => $t(L.MediterraneanAmbition),
      desc: () => $t(L.MediterraneanAmbitionDesc$1$2, "-20%", "10"),
   },
   BountifulCoastlines: {
      name: () => $t(L.BountifulCoastlines),
      desc: () => $t(L.BountifulCoastlinesDesc$1, "+10%"),
   },
   CoastalAdministration: {
      name: () => $t(L.CoastalAdministration),
      desc: () => $t(L.$1GoverningCostOnCoreCoastalTiles, "-20%"),
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

export function hasProvinceUpgradeCondition(upgrade: ProvinceUpgrade, province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.WeHaveEnacted$1, ProvinceUpgrades[upgrade].name()),
      value: hasProvinceUpgrade(upgrade, province, save),
   };
}

export function hasNotProvinceUpgradeCondition(
   upgrade: ProvinceUpgrade,
   province: Province,
   save: SaveGame,
): ICondition {
   return {
      name: $t(L.WeHaventEnacted$1, ProvinceUpgrades[upgrade].name()),
      value: !hasProvinceUpgrade(upgrade, province, save),
   };
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

export function getProvinceUpgradeDesc(upgrade: ProvinceUpgrade): React.ReactNode {
   const def = ProvinceUpgrades[upgrade];
   return (
      <>
         {def.desc && html(def.desc())}{" "}
         {def.modifiers &&
            mapOf(def.modifiers, (modifier, data) => <div key={modifier}>{modifierToString(modifier, data)}</div>)}
      </>
   );
}
