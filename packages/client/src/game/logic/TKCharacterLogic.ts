import { entriesOf } from "@project/shared/src/utils/Helper";
import { CharacterTTLMonths } from "../definitions/Constant";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { type TKCharacter, TKCharacters, type TKCharacterTier } from "../ThreeKingdoms/TKCharacter";
import { type TKWarlord, TKWarlordCharacters } from "../ThreeKingdoms/TKWarlord";

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

export function isTKCharacterAvailable(character: TKCharacter, save: SaveGame): boolean {
   for (const [province, state] of entriesOf(save.state.provinces)) {
      if (isProvinceTKWarlord(province) && TKWarlordCharacters[province].character === character) {
         return false;
      }
      for (const [slot, advisor] of entriesOf(state.advisorSlots)) {
         if (advisor === character) {
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
         return CharacterTTLMonths - (save.state.month - characterState.startMonth);
      }
   }
   return 0;
}

export function isProvinceTKWarlord(province: Province): province is TKWarlord {
   return province in TKWarlordCharacters;
}
