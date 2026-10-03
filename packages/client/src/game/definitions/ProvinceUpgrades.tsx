import { mapOf } from "@project/shared/src/utils/Helper";
import { html } from "../../ui/components/RenderHTMLComp";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { Buildings } from "./Building";
import { Culture } from "./Culture";
import { Goods } from "./Goods";
import { type IBaseModifier, type Modifier, modifierToString } from "./Modifier";
import type { Province } from "./Province";
import { TimedActions } from "./TimedAction";

export interface IProvinceUpgrade {
   name: () => string;
   desc?: () => string;
   modifiers?: Partial<Record<Modifier, IBaseModifier>>;
}

const _ProvinceUpgrades = {
   RightOfPlunder: {
      name: () => $t(L.RightOfPlunder),
      desc: () => TimedActions.Pillage.desc?.() ?? "",
   },
   ExtensiveAdministration: {
      name: () => $t(L.ExtensiveAdministration),
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
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
      desc: () => $t(L.CavalryPredominanceDesc$1$2$3, "+1%", "1%", "+25%"),
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
      desc: () => $t(L.HillfortBastionDesc$1$2, "+1%", "+50%"),
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
      desc: () => $t(L.RangedPredominanceDesc$1$2$3, "+1%", "1%", "+25%"),
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
      desc: () => $t(L.$1WarPowerForEachNeighboringProvinceUpTo$2, "+5%", "+50%"),
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
   TheTwoShores: {
      name: () => $t(L.TheTwoShores),
      desc: () => $t(L.$1LandTaxWhileBaeloAndTingiAreAnnexedAndCored, "+30%"),
   },
   MoorishMuster: {
      name: () => $t(L.MoorishMuster),
      desc: () => $t(L.$1WarPowerForEvery$2CoreTiles, "+5%", "10"),
   },
   MaritimeRenown: {
      name: () => $t(L.MaritimeRenown),
      desc: () => $t(L.$1PrestigeForEachCoreCoastalTileUpTo$2, "+1%", "+50%"),
   },
   LittoralTaxDistricts: {
      name: () => $t(L.LittoralTaxDistricts),
      desc: () => $t(L.LittoralTaxDistrictsDesc$1$2, "+1%", "3"),
   },
   MercantileMobilization: {
      name: () => $t(L.MercantileMobilization),
      desc: () => $t(L.$1WarPowerForEachActiveTrade, "+10%"),
   },
   GranaryOfTheEmpire: {
      name: () => $t(L.GranaryOfTheEmpire),
      desc: () => $t(L.GranaryOfTheEmpireDesc$1$2, "+1%", "+50%"),
   },
   MaritimeAmbition: {
      name: () => $t(L.MaritimeAmbition),
      desc: () => $t(L.MaritimeAmbitionDesc$1, "20%"),
   },
   NavalTradition: {
      name: () => $t(L.NavalTradition),
      desc: () => $t(L.$1WarPowerForEachCoreCoastalTileUpTo$2, "+0.5%", "+50%"),
   },
   CoastalMandate: {
      name: () => $t(L.CoastalMandate),
      desc: () => $t(L.Gain$1ConsulPointWhenCoringACoastalTile, "1"),
   },
   MastersOfThePasses: {
      name: () => $t(L.MastersOfThePasses),
      desc: () => $t(L.MastersOfThePassesDesc$1, "20%"),
   },
   ProductiveInvestment: {
      name: () => $t(L.ProductiveInvestment),
      desc: () => $t(L.ProductiveInvestmentDesc$1, "+2%"),
   },
   CommercialRenown: {
      name: () => $t(L.CommercialRenown),
      desc: () => $t(L.$1PrestigeForEachActiveTrade, "+10%"),
   },
   MulticulturalArmy: {
      name: () => $t(L.MulticulturalArmy),
      desc: () => $t(L.MulticulturalArmyDesc$1$2, "+5%", "+50%"),
   },
   InlandAmbition: {
      name: () => $t(L.InlandAmbition),
      desc: () => $t(L.InlandAmbitionDesc$1, "-20%"),
   },
   TriumphalUnity: {
      name: () => $t(L.TriumphalUnity),
      desc: () => $t(L.TriumphalUnityDesc$1$2, "+10", "2"),
   },
   CrossroadsTaxDistricts: {
      name: () => $t(L.CrossroadsTaxDistricts),
      desc: () => $t(L.$1LandTaxForEachNeighboringProvinceUpTo$2, "+5%", "+50%"),
   },
   BountifulFrontiers: {
      name: () => $t(L.BountifulFrontiers),
      desc: () => $t(L.BountifulFrontiersDesc$1, "+10%"),
   },
   WartimeAdministration: {
      name: () => $t(L.WartimeAdministration),
      desc: () => $t(L.$1TileMaintenanceWhileAtWar, "-10%"),
   },
   HighlandRecruitment: {
      name: () => $t(L.HighlandRecruitment),
      desc: () => $t(L.$1ManpowerOnCoreHillAndMountainTiles, "+25%"),
   },
   MonumentsOfPower: {
      name: () => $t(L.MonumentsOfPower),
      desc: () => $t(L.$1PrestigeForEachCompletedProvincialGreatWork, "+10%"),
   },
   CapitalsOfProsperity: {
      name: () => $t(L.CapitalsOfProsperity),
      desc: () => $t(L.CapitalsOfProsperityDesc$1, "+50%"),
   },
   BornCommanders: {
      name: () => $t(L.BornCommanders),
      modifiers: {
         StartingGeneralSkillPoint: { type: "add", value: 2 },
      },
   },
   PonticHegemony: {
      name: () => $t(L.PonticHegemony),
      desc: () => $t(L.$1WarPowerForEachCoreBlackSeaCoastalTile, "+2%"),
   },
   CampaignRequisitions: {
      name: () => $t(L.CampaignRequisitions),
      desc: () => $t(L.CampaignRequisitionsEffect$1$2, "+10%", "12"),
   },
   InfantryPredominance: {
      name: () => $t(L.InfantryPredominance),
      desc: () => $t(L.InfantryPredominanceDesc$1$2$3, "+1%", "1%", "+25%"),
   },
   CarpathianRiches: {
      name: () => $t(L.CarpathianRiches),
      desc: () => $t(L.$1TileOutputOnCoreHillAndMountainTiles, "+25%"),
   },
   HighlandAdministration: {
      name: () => $t(L.HighlandAdministration),
      desc: () => $t(L.$1GoverningCostOnCoreHillAndMountainTiles, "-25%"),
   },
   MilitarySupplyNetwork: {
      name: () => $t(L.MilitarySupplyNetwork),
      desc: () => $t(L.MilitarySupplyNetworkDesc$1$2, "-1%", "-25%"),
   },
   MilitaryTaxation: {
      name: () => $t(L.MilitaryTaxation),
      desc: () => $t(L.$1LandTaxForEach$2ActualConscription, "+0.5%", "1%"),
   },
   SanctionedConquest: {
      name: () => $t(L.SanctionedConquest),
      desc: () => $t(L.$1WarmongerPenalty, "-50%"),
   },
   HellenicScholarship: {
      name: () => $t(L.HellenicScholarship),
      desc: () => $t(L.HellenicScholarshipDesc$1$2, "-1%", "-50%"),
   },
   DevelopedAdministration: {
      name: () => $t(L.DevelopedAdministration),
      desc: () => $t(L.DevelopedAdministrationDesc$1$2, "-1%", "-50%"),
   },
   PeacefulRenown: {
      name: () => $t(L.PeacefulRenown),
      desc: () => $t(L.PeacefulRenownDesc$1$2, "+1%", "+25%"),
   },
   DefensiveMandate: {
      name: () => $t(L.DefensiveMandate),
      desc: () => $t(L.DefensiveMandateDesc$1, "+1"),
   },
   DefensiveMobilization: {
      name: () => $t(L.DefensiveMobilization),
      desc: () => $t(L.DefensiveMobilizationDesc$1, "+25%"),
   },
   HellenicSolidarity: {
      name: () => $t(L.HellenicSolidarity),
      desc: () => $t(L.HellenicSolidarityDesc$1$2, "+1%", "+50%"),
   },
   MilitaryInnovation: {
      name: () => $t(L.MilitaryInnovation),
      desc: () => $t(L.MilitaryInnovationDesc$1$2, "+1%", "+25%"),
   },
   CulturalIntegration: {
      name: () => $t(L.CulturalIntegration),
      modifiers: {
         CultureConversionCost: { type: "multiply", value: -0.2 },
      },
   },
   CulturalAmbition: {
      name: () => $t(L.CulturalAmbition),
      desc: () => $t(L.CulturalAmbitionDesc$1, "20%"),
   },
   WartimeUnity: {
      name: () => $t(L.WartimeUnity),
      desc: () => $t(L.$1StabilityWhileAtWar, "+10"),
   },
   DevelopedRecruitment: {
      name: () => $t(L.DevelopedRecruitment),
      desc: () => $t(L.DevelopedRecruitmentDesc$1$2, "+1%", "+50%"),
   },
   CoastalCommerce: {
      name: () => $t(L.CoastalCommerce),
      desc: () => $t(L.$1TradeProfitForEachCoreCoastalTileUpTo$2, "+1%", "+50%"),
   },
   ExperiencedLeadership: {
      name: () => $t(L.ExperiencedLeadership),
      desc: () => $t(L.ExperiencedLeadershipDesc$1, "+1"),
   },
   MilitaryIndustry: {
      name: () => $t(L.MilitaryIndustry),
      desc: () => $t(L.MilitaryIndustryDesc$1$2, "+1%", "+25%"),
   },
   PluralisticRenown: {
      name: () => $t(L.PluralisticRenown),
      desc: () => $t(L.PluralisticRenownDesc$1$2, "+5%", "+25%"),
   },
   AnatolianRecruitment: {
      name: () => $t(L.AnatolianRecruitment),
      desc: () => $t(L.AnatolianRecruitmentDesc$1$2$3, "+1%", Culture.Anatolian.name(), "+50%"),
   },
   HighlandDevelopment: {
      name: () => $t(L.HighlandDevelopment),
      desc: () => $t(L.HighlandDevelopmentDesc$1, "−20%"),
   },
   InlandAdministration: {
      name: () => $t(L.InlandAdministration),
      desc: () => $t(L.$1TileMaintenanceOnCoreNonCoastalTiles, "−20%"),
   },
   ExpandedDiplomacy: {
      name: () => $t(L.ExpandedDiplomacy),
      modifiers: {
         Diplomat: { type: "add", value: 1 },
      },
   },
   FriendlyCommerce: {
      name: () => $t(L.FriendlyCommerce),
      desc: () => $t(L.FriendlyCommerceDesc$1$2, "+5%", "+50%"),
   },
   TreatyProsperity: {
      name: () => $t(L.TreatyProsperity),
      desc: () => $t(L.$1TileOutputForEachDiplomaticTreaty, "+5%"),
   },
   HarbourAdministration: {
      name: () => $t(L.HarbourAdministration),
      desc: () => $t(L.$1GoverningCapacityForEach$2OnACoreTile, "+10", Buildings.Harbour.name()),
   },
   MercantileTaxation: {
      name: () => $t(L.MercantileTaxation),
      desc: () => $t(L.$1LandTaxForEachActiveTrade, "+10%"),
   },
   VictoriousMight: {
      name: () => $t(L.VictoriousMight),
      desc: () => $t(L.$1WarPowerForEachWarWonAsLeadAttackerUpTo$2, "+1%", "+25%"),
   },
   CohesiveTaxation: {
      name: () => $t(L.CohesiveTaxation),
      desc: () => $t(L.$1LandTaxForEach$2CulturalCohesion, "+0.2%", "1%"),
   },
   ForeignAmbition: {
      name: () => $t(L.ForeignAmbition),
      desc: () => $t(L.ForeignAmbitionDesc$1, "−20%"),
   },
   AbundantProvisions: {
      name: () => $t(L.AbundantProvisions),
      desc: () => $t(L.AbundantProvisionsDesc$1$2$3$4, "+1%", Goods.bread.name(), Goods.cheese.name(), "+25%"),
   },
   CrossroadsCommerce: {
      name: () => $t(L.CrossroadsCommerce),
      desc: () => $t(L.$1TradeProfitForEachNeighboringProvinceUpTo$2, "+10%", "+50%"),
   },
   ReligiousAccommodation: {
      name: () => $t(L.ReligiousAccommodation),
      modifiers: {
         ToleratedReligion: { type: "add", value: 1 },
      },
   },
   MercantileLogistics: {
      name: () => $t(L.MercantileLogistics),
      desc: () => $t(L.$1ArmyMaintenanceForEachActiveTrade, "−10%"),
   },
   ChristianCommunities: {
      name: () => $t(L.ChristianCommunities),
      desc: () => $t(L.ChristianCommunitiesDesc$1$2, "+0.1", "+10"),
   },
   EfficientEvangelization: {
      name: () => $t(L.EfficientEvangelization),
      desc: () => $t(L.$1ChristianInfluenceCostToEvangelizeATile, "−50%"),
   },
   ApostolicTaxation: {
      name: () => $t(L.ApostolicTaxation),
      desc: () => $t(L.$1LandTaxForEachApostolicSeeWeCurrentlyOwn, "+10%"),
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
