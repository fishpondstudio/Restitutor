import { entriesOf } from "@project/shared/src/utils/Helper";
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
      if (province in TKWarlordCharacters && TKWarlordCharacters[province as TKWarlord].character === character) {
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
