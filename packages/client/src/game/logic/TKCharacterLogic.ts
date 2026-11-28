import { entriesOf, formatNumber, fromEntries, keysOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type ICondition, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { IFamily } from "../definitions/Family";
import { type CharacterSlot, CharacterSlots, GovernmentTier, isSalariedSlot } from "../definitions/GovernmentTier";
import type { Province } from "../definitions/Province";
import { GovernorPowerNames } from "../definitions/ProvinceResources";
import type { ICustomEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { type TKCharacter, TKCharacters, type TKCharacterTier, TKCharacterTraits } from "../ThreeKingdoms/TKCharacter";
import type { ITKCharacterState } from "../ThreeKingdoms/TKCharacterState";
import { type TKWarlord, TKWarlordCharacters } from "../ThreeKingdoms/TKWarlord";
import { clearAllCaches, getProvinceTilesCached } from "./CacheLogic";
import type { ConditionChecks } from "./Calculation";
import { attachModifier } from "./ModifierLogic";
import { formatPersonName } from "./NameLogic";
import { getProvinceGovernmentPoint, getProvinceIncome, getProvinceName } from "./ProvinceLogic";
import { hasScenarioFlag, requireScenarioFlagCondition } from "./ScenarioLogic";
import { getCurrentWars } from "./WarLogic";

export function getTKCharacterState(character: TKCharacter, save: SaveGame): Readonly<ITKCharacterState> | null {
   return save.state.characters.get(character) ?? null;
}

export function getTKCharacterProvince(character: TKCharacter, save: SaveGame): Province | null {
   return getTKCharacterState(character, save)?.placement?.province ?? null;
}

export function getProvinceCharacters(province: Province, save: SaveGame): TKCharacter[] {
   const result: TKCharacter[] = [];
   for (const [character, state] of save.state.characters) {
      if (state.placement?.province === province) {
         result.push(character);
      }
   }
   return result;
}

export function getProvinceAssignedCharacters(province: Province, save: SaveGame): [CharacterSlot, TKCharacter][] {
   const result: [CharacterSlot, TKCharacter][] = [];
   for (const [character, state] of save.state.characters) {
      if (state.placement?.province === province && state.placement.slot !== null) {
         result.push([state.placement.slot, character]);
      }
   }
   return result;
}

export function getCharacterInSlot(province: Province, slot: CharacterSlot, save: SaveGame): TKCharacter | null {
   for (const [character, state] of save.state.characters) {
      if (state.placement?.province === province && state.placement.slot === slot) {
         return character;
      }
   }
   return null;
}

export function isTKCharacterAlive(character: TKCharacter, save: SaveGame): boolean {
   return (getTKCharacterState(character, save)?.monthsLeft ?? 0) > 0;
}

export function isTKCharacterUnaffiliated(character: TKCharacter, save: SaveGame): boolean {
   return getTKCharacterState(character, save)?.placement === null;
}

export function isTKCharacterUnassigned(character: TKCharacter, save: SaveGame): boolean {
   const state = getTKCharacterState(character, save);
   return state !== null && (state.placement === null || state.placement.slot === null);
}

export function isTKCharacterRulingOrAssigned(character: TKCharacter, save: SaveGame): boolean {
   const state = getTKCharacterState(character, save);
   if (!state?.placement || !save.state.provinces[state.placement.province]) {
      return false;
   }
   return (
      state.placement.slot != null ||
      (isTKCharacterRuler(character, state.placement.province, save) && state.monthsLeft > 0)
   );
}

function isCharacterInFamily(character: TKCharacter, family: IFamily): boolean {
   return (
      family.male?.character === character || family.children.some((child) => isCharacterInFamily(character, child))
   );
}

export function tickTKCharacters(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   for (const [slot, character] of getProvinceAssignedCharacters(province, save)) {
      if (CharacterSlots[slot].type === "AncestralTemple") {
         continue;
      }
      if (!isCharacterInFamily(character, state.governor)) {
         ageTKCharacter(character, 1, save);
      }
      if (!isTKCharacterAlive(character, save)) {
         unassignTKCharacter(character, province, save);
      }
   }
}

export function ageTKCharacter(character: TKCharacter, months: number, save: SaveGame): void {
   const state = save.state.characters.get(character);
   if (!state || months <= 0) {
      return;
   }
   state.monthsLeft = Math.max(0, state.monthsLeft - months);
   if (state.monthsLeft === 0) {
      killTKCharacter(character, save);
   }
}

export function killTKCharacter(character: TKCharacter, save: SaveGame): void {
   const state = save.state.characters.get(character);
   if (!state) {
      return;
   }
   state.monthsLeft = 0;
   if (state.placement?.slot && CharacterSlots[state.placement.slot].type !== "AncestralTemple") {
      state.placement.slot = null;
   }
   clearAllCaches();
}

export function getTKCharacterName(character: TKCharacter): { fullName: string; courtesyName: string } {
   const name = TKCharacters[character].name();
   return {
      fullName: formatPersonName([name[0], name[1]]),
      courtesyName: name[2],
   };
}

export function getTKCharacterTierToPower(tier: TKCharacterTier): number {
   switch (tier) {
      case "Tier1":
         return 4;
      case "Tier2":
         return 3;
      case "Tier3":
         return 2;
      case "Tier4":
         return 1;
      default:
         tier satisfies never;
         return 0;
   }
}

export function getTKCharacterTierToPercentage(tier: TKCharacterTier): number {
   switch (tier) {
      case "Tier1":
         return 0.3;
      case "Tier2":
         return 0.2;
      case "Tier3":
         return 0.1;
      case "Tier4":
         return 0.05;
      default:
         tier satisfies never;
         return 0;
   }
}

function getTKCharacterTierToCost(tier: TKCharacterTier): number {
   return 2 ** (getTKCharacterTierToPower(tier) - 1) * 10;
}

export function getTKCharacterMonthlyCost(character: TKCharacter, province: Province, save: SaveGame): IValueBreakdown {
   const breakdown = makeValueBreakdown({ reverse: true });
   breakdown.add.push({
      name: $t(L.BaseCost),
      value: getTKCharacterTierToCost(TKCharacters[character].tier),
   });
   attachModifier("AdvisorCost", breakdown, province, save);
   return finalizeBreakdown(breakdown);
}

export function isTKCharacterRuler(character: TKCharacter, province: Province, save: SaveGame): boolean {
   return save.state.provinces[province]?.governor.male?.character === character;
}

export function* isTKCharacterRulerChecks(character: TKCharacter, province: Province, save: SaveGame): ConditionChecks {
   (yield isTKCharacterRuler(character, province, save))?.describe(
      province === save.state.playerProvince
         ? $t(L.$1IsOurGovernor, getTKCharacterName(character).fullName)
         : $t(L.$1IsTheGovernorOf$2, getTKCharacterName(character).fullName, getProvinceName(province, save)),
   );
}

export function* tkCharacterUnaffiliatedChecks(character: TKCharacter, save: SaveGame): ConditionChecks {
   (yield isTKCharacterUnaffiliated(character, save))?.describe(
      $t(L.$1IsUnaffiliated, getTKCharacterName(character).fullName),
   );
}

export function* tkCharacterAliveChecks(character: TKCharacter, save: SaveGame): ConditionChecks {
   (yield isTKCharacterAlive(character, save))?.describe($t(L.$1IsAlive, getTKCharacterName(character).fullName));
}

export function* tkCharacterAffiliationChecks(
   character: TKCharacter,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   (yield getTKCharacterProvince(character, save) === province)?.describe(
      $t(L.$1IsInOurRoster, getTKCharacterName(character).fullName),
   );
}

export function* tkCharacterNotInRosterChecks(
   character: TKCharacter,
   province: Province,
   save: SaveGame,
): ConditionChecks {
   (yield getTKCharacterProvince(character, save) !== province)?.describe(
      $t(L.$1IsNotInOurRoster, getTKCharacterName(character).fullName),
   );
}

export function transferTKCharacterEffect(character: TKCharacter): ICustomEffect {
   return {
      desc: (province, save) => {
         const { fullName } = getTKCharacterName(character);
         if (getTKCharacterProvince(character, save) === province) {
            return $t(L.$1IsAlreadyInOurRoster, fullName);
         }
         return isTKCharacterAlive(character, save)
            ? $t(L.$1JoinsOurService, fullName)
            : $t(L.$1IsAddedToOurRoster, fullName);
      },
      execute: (province, save) => {
         transferTKCharacter(character, province, save);
      },
   };
}

export function transferTKCharacter(character: TKCharacter, province: Province, save: SaveGame): boolean {
   const state = save.state.characters.get(character);
   if (!state || !save.state.provinces[province]) {
      return false;
   }
   if (state.placement?.province === province) {
      return true;
   }
   if (state.placement && isTKCharacterRuler(character, state.placement.province, save)) {
      return false;
   }
   state.placement = { province, slot: null };
   clearAllCaches();
   return true;
}

export function transferProvinceCharacters(from: Province, to: Province, save: SaveGame): boolean {
   if (from === to) {
      return true;
   }
   if (!save.state.provinces[to]) {
      return false;
   }
   // Only elimination may transfer a ruler without arranging succession.
   if (getProvinceTilesCached(from, save).length > 0) {
      return false;
   }
   for (const state of save.state.characters.values()) {
      if (state.placement?.province === from) {
         state.placement = { province: to, slot: null };
      }
   }
   clearAllCaches();
   return true;
}

export function assignTKCharacter(
   character: TKCharacter,
   slot: CharacterSlot,
   province: Province,
   save: SaveGame,
): boolean {
   if (!getCharacterAssignmentConditions(slot, character, province, save).every((condition) => condition.value)) {
      return false;
   }
   const state = save.state.characters.get(character);
   if (!state?.placement || state.placement.province !== province) {
      return false;
   }
   const previous = getCharacterInSlot(province, slot, save);
   if (previous !== null) {
      unassignTKCharacter(previous, province, save);
   }
   state.placement.slot = slot;
   clearAllCaches();
   return true;
}

export function unassignTKCharacter(character: TKCharacter, province: Province, save: SaveGame): boolean {
   const state = save.state.characters.get(character);
   if (!state?.placement || state.placement.province !== province) {
      return false;
   }
   state.placement.slot = null;
   clearAllCaches();
   return true;
}

export function getUsedCharacterSlots(province: Province, save: SaveGame): number {
   return getProvinceAssignedCharacters(province, save).length;
}

export function getCharacterSlotCapacityCondition(slot: CharacterSlot, province: Province, save: SaveGame): ICondition {
   const state = save.state.provinces[province];
   const used = getUsedCharacterSlots(province, save);
   const limit = state ? GovernmentTier[state.tier].slots : 0;
   return {
      name: $t(L.ThisAssignmentIsWithinOurCharacterSlotCapacity),
      value: !!state && (getCharacterInSlot(province, slot, save) !== null || used < limit),
      desc: $t(L.TotalSlots$1Used$2, formatNumber(limit), formatNumber(used)),
   };
}

export function getCharacterAssignmentConditions(
   slot: CharacterSlot,
   character: TKCharacter,
   province: Province,
   save: SaveGame,
): ICondition[] {
   return [
      ...requireScenarioFlagCondition("TKCharacter", save),
      getCharacterSlotCapacityCondition(slot, province, save),
      {
         name: $t(L.CharacterIsInOurRoster),
         value: getTKCharacterProvince(character, save) === province,
      },
      {
         name: $t(L.CharacterIsNotAssignedToASlot),
         value: isTKCharacterUnassigned(character, save),
      },
      ...getCharacterRoleConditions(slot, character, province, save),
   ];
}

export function getCharacterRoleConditions(
   slot: CharacterSlot,
   character: TKCharacter,
   province: Province,
   save: SaveGame,
): ICondition[] {
   const { type, governorPower } = CharacterSlots[slot];
   const state = getTKCharacterState(character, save);
   const conditions: ICondition[] = [
      {
         name: type === "AncestralTemple" ? $t(L.CharacterIsDead) : $t(L.CharacterIsAlive),
         value: state !== null && (type === "AncestralTemple" ? state.monthsLeft <= 0 : state.monthsLeft > 0),
      },
      {
         name: $t(L.CharacterIsNotOurRuler),
         value: !isTKCharacterRuler(character, province, save),
      },
   ];
   if (type === "AncestralTemple") {
      return conditions;
   }
   const trait = type === "Advisor" && governorPower !== "military" ? "Civil" : "Martial";
   conditions.push({
      name: $t(L.CharacterHasThe$1Trait, TKCharacterTraits[trait].name()),
      value: TKCharacters[character].traits.has(trait),
   });
   return conditions;
}

export function isProvinceTKWarlord(province: Province): province is TKWarlord {
   return province in TKWarlordCharacters;
}

interface SeatCandidate {
   slot: CharacterSlot;
   character: TKCharacter;
   score: number;
   salary: number;
}

function getPersonalBonus(character: TKCharacter): number {
   let bonus = 0;
   for (const [modifier, data] of entriesOf(TKCharacters[character].modifiers)) {
      const isCost = modifier === "AdvisorCost" || modifier === "ArmyMaintenance" || modifier === "TileMaintenance";
      // Compare points of stability with percentage points of the other character bonuses.
      bonus += (isCost ? -data.value : data.value) * (data.type === "add" ? 0.01 : 1);
   }
   return bonus;
}

export function assignAICharacters(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const current = new Map(getProvinceAssignedCharacters(province, save));
   const points = fromEntries(
      keysOf(GovernorPowerNames).map((power) => {
         const { value, totalMultiply } = getProvinceGovernmentPoint(power, province, save);
         return [power, { value, multiplier: totalMultiply }];
      }),
   );
   let budget = getProvinceIncome(province, save).income;
   // Net income and government points already include incumbents. Plan from the pre-staffing totals.
   for (const [slot, character] of current) {
      if (isSalariedSlot(slot)) {
         budget += getTKCharacterMonthlyCost(character, province, save).value;
      }
      const power = CharacterSlots[slot].governorPower;
      if (power) {
         points[power].value -= getTKCharacterTierToPower(TKCharacters[character].tier) * points[power].multiplier;
      }
   }

   const atWar = getCurrentWars(province, save).length > 0;
   const candidates: SeatCandidate[] = [];
   const slots = keysOf(CharacterSlots).filter((slot) => {
      switch (CharacterSlots[slot].type) {
         case "Strategist":
            // Strategists only add war power, so they are not worth a salary in peacetime.
            return atWar;
         case "AncestralTemple":
            return hasScenarioFlag("ImperialCourt", save);
         default:
            return true;
      }
   });
   for (const character of getProvinceCharacters(province, save)) {
      const tier = TKCharacters[character].tier;
      const bonus = getPersonalBonus(character);
      // Discount officers nearing the end of service without rotating fresh officers every month.
      const service = Math.min((getTKCharacterState(character, save)?.monthsLeft ?? 0) / 12, 1);
      const scores = {
         Advisor: service * (getTKCharacterTierToPower(tier) + bonus),
         Strategist: service * (getTKCharacterTierToPercentage(tier) + bonus),
         AncestralTemple: bonus,
      };
      const salary = getTKCharacterMonthlyCost(character, province, save).value;
      for (const slot of slots) {
         const salaried = isSalariedSlot(slot);
         if (salaried && (state.loans.length > 0 || salary > budget)) {
            continue;
         }
         if (!getCharacterRoleConditions(slot, character, province, save).every((c) => c.value)) {
            continue;
         }
         const { type } = CharacterSlots[slot];
         candidates.push({ slot, character, score: scores[type], salary: salaried ? salary : 0 });
      }
   }

   const roleOrder = ["Strategist", "Advisor", "AncestralTemple"];
   const compare = (a: SeatCandidate, b: SeatCandidate): number => {
      const roleA = CharacterSlots[a.slot];
      const roleB = CharacterSlots[b.slot];
      return (
         roleOrder.indexOf(roleA.type) - roleOrder.indexOf(roleB.type) ||
         (roleA.governorPower && roleB.governorPower
            ? points[roleA.governorPower].value - points[roleB.governorPower].value
            : 0) ||
         b.score - a.score ||
         Number(current.get(b.slot) === b.character) - Number(current.get(a.slot) === a.character)
      );
   };
   const planned = new Map<CharacterSlot, TKCharacter>();
   const used = new Set<TKCharacter>();
   while (planned.size < GovernmentTier[state.tier].slots) {
      let best: SeatCandidate | undefined;
      for (const candidate of candidates) {
         if (
            planned.has(candidate.slot) ||
            used.has(candidate.character) ||
            (candidate.salary > 0 && candidate.salary > budget)
         ) {
            continue;
         }
         if (!best || compare(candidate, best) < 0) {
            best = candidate;
         }
      }
      if (!best) {
         break;
      }
      planned.set(best.slot, best.character);
      used.add(best.character);
      budget -= best.salary;
      const power = CharacterSlots[best.slot].governorPower;
      if (power) {
         points[power].value += getTKCharacterTierToPower(TKCharacters[best.character].tier) * points[power].multiplier;
      }
   }

   // Vacate only changed seats, before assigning: moving an advisor to strategist must also work at the cap.
   for (const [slot, character] of current) {
      if (planned.get(slot) !== character) {
         unassignTKCharacter(character, province, save);
      }
   }
   for (const [slot, character] of planned) {
      if (current.get(slot) !== character) {
         assignTKCharacter(character, slot, province, save);
      }
   }
}
