import { entriesOf, fromEntries, keysOf } from "@project/shared/src/utils/Helper";
import { type CharacterSlot, CharacterSlots, GovernmentTier } from "../definitions/GovernmentTier";
import type { Province } from "../definitions/Province";
import { GovernorPowerNames } from "../definitions/ProvinceResources";
import type { SaveGame } from "../GameState";
import { type TKCharacter, TKCharacters } from "../ThreeKingdoms/TKCharacter";
import { getProvinceGovernmentPoint, getProvinceIncome } from "./ProvinceLogic";
import { hasScenarioFlag } from "./ScenarioLogic";
import {
   assignTKCharacter,
   getCharacterRoleConditions,
   getProvinceAssignedCharacters,
   getProvinceCharacters,
   getTKCharacterAdvisorMonthlyCost,
   getTKCharacterState,
   getTKCharacterTierToPercentage,
   getTKCharacterTierToPower,
   unassignTKCharacter,
} from "./TKCharacterLogic";
import { getCurrentWars } from "./WarLogic";

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
      const power = CharacterSlots[slot].governorPower;
      if (power) {
         budget += getTKCharacterAdvisorMonthlyCost(character, province, save).value;
         points[power].value -= getTKCharacterTierToPower(TKCharacters[character].tier) * points[power].multiplier;
      }
   }

   const candidates: SeatCandidate[] = [];
   const slots = keysOf(CharacterSlots).filter(
      (slot) => CharacterSlots[slot].type !== "AncestralTemple" || hasScenarioFlag("ImperialCourt", save),
   );
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
      const salary = getTKCharacterAdvisorMonthlyCost(character, province, save).value;
      for (const slot of slots) {
         const { type } = CharacterSlots[slot];
         if (type === "Advisor" && (state.loans.length > 0 || salary > budget)) {
            continue;
         }
         if (!getCharacterRoleConditions(slot, character, province, save).every((c) => c.value)) {
            continue;
         }
         candidates.push({ slot, character, score: scores[type], salary: type === "Advisor" ? salary : 0 });
      }
   }

   const roleOrder =
      getCurrentWars(province, save).length > 0
         ? ["Strategist", "Advisor", "AncestralTemple"]
         : ["Advisor", "Strategist", "AncestralTemple"];
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
