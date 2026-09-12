import { clamp, clearFlag, formatDelta, formatNumber, hasFlag } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type ICondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import { PersonFlags } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import { hasProvinceUpgrade, ProvinceUpgrades } from "../definitions/ProvinceUpgrades";
import { getTileName } from "../definitions/TileName";
import type { SaveGame } from "../GameState";
import { cacheProvince, getProvinceCoreTilesCached } from "./CacheLogic";
import type { ConditionChecks } from "./Calculation";
import { getProvinceCultures } from "./InternalAffairsLogic";
import { attachModifiers } from "./ModifierLogic";
import {
   getNeighborProvinces,
   getProvinceCoreCoastalTileCount,
   getProvinceName,
   getProvinceStat,
   getProvinceTileCount,
   setProvinceStat,
} from "./ProvinceLogic";
import { provinceResourceOf } from "./ResourceLogic";
import { getTileManpower } from "./TileLogic";
import { endTimedActionAndResetCooldown, getTimedActionTimeLeft } from "./TimedActionLogic";
import { getProvinceTrades } from "./TradeLogic";
import { getCurrentWars, MonthlyExtraArmyMaintenancePct } from "./WarLogic";

export const MaxConscription = 50;
export const MinConscription = 5;
export const MinArmyMaintenance = 50;
export const MaxArmyMaintenance = 100;
export const ArmyMoraleMonthlyIncrease = 10;

export const UnitPowerUpgradeBonus = 0.5;
export const ArmyCounterBonus = 0.25;
export const ArmyUnits = ["infantry", "ranged", "cavalry"] as const;
export type ArmyUnit = (typeof ArmyUnits)[number];
export const ArmyUnitNames: Record<ArmyUnit, () => string> = {
   infantry: () => $t(L.Infantry),
   ranged: () => $t(L.Ranged),
   cavalry: () => $t(L.Cavalry),
};
export type ArmyUnitPowers = Record<ArmyUnit, number>;
type ArmyComposition = Record<ArmyUnit, number>;

export function getArmyComposition(province: Province, save: SaveGame): ArmyComposition {
   const ranged = clamp(getProvinceStat("rangedUnit", province, save), 0, 100);
   const cavalry = clamp(getProvinceStat("cavalryUnit", province, save), 0, 100 - ranged);
   return { infantry: 100 - ranged - cavalry, ranged, cavalry };
}

export function setArmyComposition(ranged: number, cavalry: number, province: Province, save: SaveGame): void {
   ranged = clamp(ranged, 0, 100);
   cavalry = clamp(cavalry, 0, 100 - ranged);
   setProvinceStat("rangedUnit", ranged, province, save);
   setProvinceStat("cavalryUnit", cavalry, province, save);
}

const ArmyUnitPowerConfig = {
   infantry: { basePower: 1, skillName: () => $t(L.GeneralInfantrySkill), modifier: "InfantryUnitPower" },
   ranged: { basePower: 2, skillName: () => $t(L.GeneralRangedSkill), modifier: "RangedUnitPower" },
   cavalry: { basePower: 3, skillName: () => $t(L.GeneralCavalrySkill), modifier: "CavalryUnitPower" },
} as const;

export function getUnitWarPower(unit: ArmyUnit, province: Province, save: SaveGame): IValueBreakdown {
   const config = ArmyUnitPowerConfig[unit];
   const result = makeValueBreakdown();
   result.add.push({ name: $t(L.BasePower), value: config.basePower });
   const skill = getProvinceStat(`${unit}Skill`, province, save);
   if (skill > 0) {
      result.multiply.push({
         name: config.skillName(),
         value: skill * UnitPowerUpgradeBonus,
      });
   }
   attachModifiers(config.modifier, result, province, save);
   return finalizeBreakdown(result);
}

export const getProvinceManpower = cacheProvince(_getProvinceManpower);

function _getProvinceManpower(province: Province, save: SaveGame): IValueBreakdown {
   const breakdown: IValueBreakdown = makeValueBreakdown();
   for (const [tile, data] of save.state.tiles) {
      if (data.province === province) {
         breakdown.add.push({ name: getTileName(tile, save), value: getTileManpower(tile, save).value });
      }
   }
   return finalizeBreakdown(breakdown);
}

const InfantryMaintenanceCost = 0.01;
const RangedMaintenanceCost = 0.02;
const CavalryMaintenanceCost = 0.03;

export const GeneralArmyMaintenancePct = 0.1;

export function getArmyMaintenanceCost(province: Province, save: SaveGame): IValueBreakdown {
   const maintenance = getProvinceStat("armyMaintenance", province, save);
   const breakdown: IValueBreakdown = makeValueBreakdown({
      reverse: true,
      multiplyBase: { name: $t(L.ArmyMaintenance), value: maintenance / 100 },
   });
   const manpower = getProvinceManpower(province, save);
   const conscription = getProvinceStat("actualConscription", province, save) / 100;
   const { ranged: rangedUnit, cavalry: cavalryUnit, infantry: infantryUnit } = getArmyComposition(province, save);
   const infantryCost = manpower.value * conscription * InfantryMaintenanceCost * infantryUnit * 0.01;
   breakdown.add.push({
      name: $t(L.InfantryCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(InfantryMaintenanceCost)),
      value: infantryCost,
   });
   const rangedCost = manpower.value * conscription * RangedMaintenanceCost * rangedUnit * 0.01;
   breakdown.add.push({
      name: $t(L.RangedCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(RangedMaintenanceCost)),
      value: rangedCost,
   });
   const cavalryCost = manpower.value * conscription * CavalryMaintenanceCost * cavalryUnit * 0.01;
   breakdown.add.push({
      name: $t(L.CavalryCost),
      desc: $t(L.$1GoldPerArmySize, formatNumber(CavalryMaintenanceCost)),
      value: cavalryCost,
   });
   const wars = getCurrentWars(province, save);
   for (const war of wars) {
      if (war.attacker === province) {
         breakdown.multiply.push({
            name: $t(L.$1$2War, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
            value: MonthlyExtraArmyMaintenancePct,
         });
      }
   }
   const recruitAGeneral = getTimedActionTimeLeft("RecruitAGeneral", province, save);
   if (recruitAGeneral > 0) {
      breakdown.multiply.push({
         name: $t(L.RecruitAGeneral),
         value: GeneralArmyMaintenancePct,
      });
   }
   attachModifiers("ArmyMaintenance", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function getMercenaryCost(province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   const actualConscription = getProvinceStat("actualConscription", province, save);
   const targetConscription = getProvinceStat("targetConscription", province, save);
   if (actualConscription < targetConscription) {
      const diff = (targetConscription - actualConscription) * 0.01;
      const manpower = getProvinceManpower(province, save);
      const { ranged: rangedUnit, cavalry: cavalryUnit, infantry: infantryUnit } = getArmyComposition(province, save);

      const infantryUnits = manpower.value * diff * infantryUnit * 0.01;
      const infantryCost = infantryUnits * InfantryMaintenanceCost;
      result.add.push({
         name: $t(L.InfantryMercenaryCost),
         value: infantryCost * 12,
         desc: $t(L.$1Infantry, formatDelta(infantryUnits)),
      });
      const rangedUnits = manpower.value * diff * rangedUnit * 0.01;
      const rangedCost = rangedUnits * RangedMaintenanceCost;
      result.add.push({
         name: $t(L.RangedMercenaryCost),
         value: rangedCost * 12,
         desc: $t(L.$1Ranged, formatDelta(rangedUnits)),
      });
      const cavalryUnits = manpower.value * diff * cavalryUnit * 0.01;
      const cavalryCost = cavalryUnits * CavalryMaintenanceCost;
      result.add.push({
         name: $t(L.CavalryMercenaryCost),
         value: cavalryCost * 12,
         desc: $t(L.$1Cavalry, formatDelta(cavalryUnits)),
      });
   }
   return finalizeBreakdown(result);
}

const AttackerWarPowerDiscount = -0.2;
const DefenderWarPowerDiscount = -0.1;
const CoAttackerWarPowerDiscount = -0.1;
const CoDefenderWarPowerDiscount = -0.05;

export interface IWarPowerBreakdown {
   infantry: IValueBreakdown;
   ranged: IValueBreakdown;
   cavalry: IValueBreakdown;
   total: IValueBreakdown;
}

export function getWarPower(province: Province, save: SaveGame, enemy?: ArmyUnitPowers): IWarPowerBreakdown {
   const result = makeValueBreakdown({
      multiplyBase: { name: $t(L.CurrentMorale), value: getProvinceStat("armyMorale", province, save) / 100 },
   });
   const totalArmy =
      (getProvinceManpower(province, save).value * getProvinceStat("actualConscription", province, save)) / 100;
   const composition = getArmyComposition(province, save);
   const { ranged: rangedUnit, cavalry: cavalryUnit } = composition;
   const unitPowers = {
      infantry: getUnitWarPower("infantry", province, save).value,
      ranged: getUnitWarPower("ranged", province, save).value,
      cavalry: getUnitWarPower("cavalry", province, save).value,
   };
   const enemyTotal = enemy ? enemy.infantry + enemy.ranged + enemy.cavalry : 0;
   const counterScale = enemyTotal > 0 ? ArmyCounterBonus / enemyTotal : 0;
   const makeUnitPower = (unit: ArmyUnit, strong: ArmyUnit, weak: ArmyUnit): IValueBreakdown => {
      const soldiers = totalArmy * composition[unit] * 0.01;
      const unitPower = unitPowers[unit];
      const breakdown = makeValueBreakdown({ multiplyBase: { name: $t(L.Effectiveness), value: 1 } });
      breakdown.add.push({
         name: $t(L.BasePower),
         value: soldiers * unitPower,
         desc: $t(L.$1Units$2Power, formatNumber(soldiers), formatNumber(unitPower)),
      });
      if (enemy) {
         breakdown.multiply.push(
            { name: $t(L.Vs$1, ArmyUnitNames[strong]()), value: counterScale * enemy[strong] },
            { name: $t(L.Vs$1, ArmyUnitNames[weak]()), value: -counterScale * enemy[weak] },
         );
      }
      return finalizeBreakdown(breakdown);
   };
   const infantry = makeUnitPower("infantry", "cavalry", "ranged");
   const ranged = makeUnitPower("ranged", "infantry", "cavalry");
   const cavalry = makeUnitPower("cavalry", "ranged", "infantry");
   result.add.push({ name: $t(L.CombinedPower), value: infantry.value + ranged.value + cavalry.value });
   if (hasProvinceUpgrade("CavalryWarPower", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.CavalryWarPower.name(),
         value: Math.min(cavalryUnit * 0.01, 0.25),
      });
   }
   if (hasProvinceUpgrade("RangedPredominance", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.RangedPredominance.name(),
         value: Math.min(rangedUnit * 0.01, 0.25),
      });
   }
   if (hasProvinceUpgrade("MartialSociety", province, save)) {
      const actualConscription = getProvinceStat("actualConscription", province, save);
      result.multiply.push({
         name: ProvinceUpgrades.MartialSociety.name(),
         value: actualConscription * 0.01,
      });
   }
   if (hasProvinceUpgrade("UnitedFrontier", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.UnitedFrontier.name(),
         value: Math.min(getNeighborProvinces(province, save).size * 0.05, 0.5),
      });
   }
   if (hasProvinceUpgrade("MoorishMuster", province, save)) {
      const coreTileGroups = Math.floor(getProvinceCoreTilesCached(province).length / 10);
      if (coreTileGroups > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.MoorishMuster.name(),
            value: coreTileGroups * 0.05,
         });
      }
   }
   if (hasProvinceUpgrade("NavalTradition", province, save)) {
      result.multiply.push({
         name: ProvinceUpgrades.NavalTradition.name(),
         value: Math.min(getProvinceCoreCoastalTileCount(province, save) * 0.005, 0.5),
      });
   }
   if (hasProvinceUpgrade("MercantileMobilization", province, save)) {
      const tradeCount = getProvinceTrades(province, save).size;
      if (tradeCount > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.MercantileMobilization.name(),
            value: tradeCount * 0.1,
         });
      }
   }
   if (hasProvinceUpgrade("ExperiencedCommand", province, save)) {
      const generalSkill =
         getProvinceStat("infantrySkill", province, save) +
         getProvinceStat("rangedSkill", province, save) +
         getProvinceStat("cavalrySkill", province, save);
      if (generalSkill > 0) {
         result.multiply.push({
            name: ProvinceUpgrades.ExperiencedCommand.name(),
            value: generalSkill * 0.02,
         });
      }
   }
   if (hasProvinceUpgrade("MulticulturalArmy", province, save)) {
      const cultures = getProvinceCultures(province, save);
      result.multiply.push({
         name: ProvinceUpgrades.MulticulturalArmy.name(),
         value: Math.min(cultures.size * 0.05, 0.5),
      });
   }
   attachModifiers("WarPower", result, province, save);
   const wars = getCurrentWars(province, save);
   if (wars.length > 1) {
      wars.forEach((war) => {
         if (war.attacker === province) {
            result.multiply.push({
               name: $t(L.$1$2WarAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: AttackerWarPowerDiscount,
            });
         }
         if (war.defender === province) {
            result.multiply.push({
               name: $t(L.$1$2WarDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: DefenderWarPowerDiscount,
            });
         }
         if (war.coAttackers.has(province)) {
            result.multiply.push({
               name: $t(L.$1$2WarCoAttacker, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoAttackerWarPowerDiscount,
            });
         }
         if (war.coDefenders.has(province)) {
            result.multiply.push({
               name: $t(L.$1$2WarCoDefender, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
               value: CoDefenderWarPowerDiscount,
            });
         }
      });
   }
   return { infantry, ranged, cavalry, total: finalizeBreakdown(result) };
}

export function getArmyUnitPowers(province: Province, save: SaveGame): ArmyUnitPowers {
   const power = getWarPower(province, save);
   const unitTotal = power.infantry.value + power.ranged.value + power.cavalry.value;
   const scale = unitTotal > 0 ? power.total.value / unitTotal : 0;
   return {
      infantry: power.infantry.value * scale,
      ranged: power.ranged.value * scale,
      cavalry: power.cavalry.value * scale,
   };
}

export type GeneralType = "Recruit" | "Governor";

export function getCurrentGeneral(province: Province, save: SaveGame): GeneralType | undefined {
   const state = save.state.provinces[province];
   if (!state) {
      return undefined;
   }
   if (hasFlag(state.governor.male.flag, PersonFlags.IsGeneral)) {
      return "Governor";
   }
   if (getTimedActionTimeLeft("RecruitAGeneral", province, save) > 0) {
      return "Recruit";
   }
   return undefined;
}

export function onGeneralEnded(province: Province, save: SaveGame): void {
   const sp = provinceResourceOf("generalSkillPoint", province, save);
   sp[0] = Math.floor(sp[0] / 2);
   sp[1] = 0;
   setProvinceStat("infantrySkill", 0, province, save);
   setProvinceStat("rangedSkill", 0, province, save);
   setProvinceStat("cavalrySkill", 0, province, save);
}

export function hasGeneralCondition(province: Province, save: SaveGame): ICondition {
   return {
      name: $t(L.CurrentlyHasAGeneral),
      value: getCurrentGeneral(province, save) !== undefined,
   };
}

export function* hasGeneralChecks(province: Province, save: SaveGame): ConditionChecks {
   (yield getCurrentGeneral(province, save) !== undefined)?.describe($t(L.CurrentlyHasAGeneral));
}

export function dismissGeneral(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const governor = state.governor.male;
   governor.flag = clearFlag(governor.flag, PersonFlags.IsGeneral);
   endTimedActionAndResetCooldown("RecruitAGeneral", province, save);
   onGeneralEnded(province, save);
}

export function getGeneralSkillUpgradeCost(level: number): number {
   return level;
}

export function getWarPowerPerTile(province: Province, save: SaveGame): number {
   const tileCount = getProvinceTileCount(province, save);
   if (tileCount === 0) {
      return 0;
   }
   return getWarPower(province, save).total.value / tileCount;
}

export function setProvinceArmyMaintenance(value: number, province: Province, save: SaveGame): void {
   value = clamp(value, MinArmyMaintenance, MaxArmyMaintenance);
   if (value < getProvinceStat("armyMorale", province, save)) {
      setProvinceStat("armyMorale", value, province, save);
   }
   setProvinceStat("armyMaintenance", value, province, save);
}

export function setProvinceTargetConscription(value: number, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const targetConscription = clamp(value, MinConscription, MaxConscription);
   if (targetConscription < getProvinceStat("actualConscription", province, save)) {
      setProvinceStat("actualConscription", targetConscription, province, save);
   }
   setProvinceStat("targetConscription", targetConscription, province, save);
}
