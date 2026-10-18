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
   state.characters.forEach((characterState, character) => {
      if (characterState.monthsLeft <= 0) {
         return;
      }
      characterState.monthsLeft--;
   });
   forEach(state.characterSlots, (slot, character) => {
      if (CharacterSlots[slot].type !== "AncestralTemple" && getTKCharacterTTL(character, save) <= 0) {
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

export function getTKCharacterTierToCost(tier: TKCharacterTier): number {
   return 2 ** (getTKCharacterTierToPower(tier) - 1) * 10;
}

export function isCharacterCurrentWarlord(character: TKCharacter, province: Province): boolean {
   return isProvinceTKWarlord(province) && TKWarlordCharacters[province].character === character;
}

export function isTKCharacterAvailable(character: TKCharacter, save: SaveGame): boolean {
   for (const [province, state] of entriesOf(save.state.provinces)) {
      for (const [slot, assignedCharacter] of entriesOf(state.characterSlots)) {
         if (assignedCharacter === character) {
            return false;
         }
      }
   }
   return true;
}

export function getTKCharacterTTL(character: TKCharacter, save: SaveGame): number {
   for (const [province, state] of entriesOf(save.state.provinces)) {
      const characterState = state.characters.get(character);
      if (characterState) {
         return characterState.monthsLeft;
      }
   }
   return 0;
}

export function isProvinceTKWarlord(province: Province): province is TKWarlord {
   return province in TKWarlordCharacters;
}
