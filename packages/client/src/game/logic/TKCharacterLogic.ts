import { entriesOf, forEach } from "@project/shared/src/utils/Helper";
import { CharacterSlots } from "../definitions/GovernmentTier";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { type TKCharacter, TKCharacters, type TKCharacterTier } from "../ThreeKingdoms/TKCharacter";
import { type TKWarlord, TKWarlordCharacters } from "../ThreeKingdoms/TKWarlord";

export function tickTKCharacters(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const ticked = new Set<TKCharacter>();
   forEach(state.characterSlots, (slot, character) => {
      const characterState = state.characters.get(character);
      if (!characterState) {
         delete state.characterSlots[slot];
         return;
      }
      if (CharacterSlots[slot].type === "AncestralTemple") {
         return;
      }
      if (!ticked.has(character) && state.governor.male?.character !== character) {
         if (characterState.monthsLeft > 0) {
            characterState.monthsLeft--;
         }
         ticked.add(character);
      }
      if (characterState.monthsLeft <= 0) {
         delete state.characterSlots[slot];
      }
   });
}

export function killTKCharacter(character: TKCharacter, province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   const characterState = state.characters.get(character);
   if (characterState) {
      characterState.monthsLeft = 0;
   }
   forEach(state.characterSlots, (slot, assignedCharacter) => {
      if (assignedCharacter === character) {
         delete state.characterSlots[slot];
      }
   });
}

export function getTKCharacterName(character: TKCharacter): { fullName: string; courtesyName: string } {
   const name = TKCharacters[character].name();
   return {
      fullName: [name[0], [name[1]]].join(" "),
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

export function getTKCharacterTierToAStartingGeneralSkills(tier: TKCharacterTier): number {
   switch (tier) {
      case "Tier1":
         return 3;
      case "Tier2":
         return 2;
      case "Tier3":
         return 1;
      case "Tier4":
         return 0;
      default:
         tier satisfies never;
         return 0;
   }
}

export function getTKCharacterTierToCost(tier: TKCharacterTier): number {
   return 2 ** (getTKCharacterTierToPower(tier) - 1) * 10;
}

export function isCharacterCurrentWarlord(character: TKCharacter, province: Province, save: SaveGame): boolean {
   return save.state.provinces[province]?.governor.male?.character === character;
}

export function isTKCharacterAvailable(character: TKCharacter, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state?.characters.has(character)) {
      return false;
   }
   for (const [slot, assignedCharacter] of entriesOf(state.characterSlots)) {
      if (assignedCharacter === character) {
         return false;
      }
   }
   return true;
}

export function isProvinceTKWarlord(province: Province): province is TKWarlord {
   return province in TKWarlordCharacters;
}
