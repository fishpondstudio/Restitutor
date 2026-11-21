import type { CharacterSlot } from "../definitions/GovernmentTier";
import type { Province } from "../definitions/Province";

export type TKCharacterPlacement = null | { province: Province; slot: CharacterSlot | null };

export interface ITKCharacterState {
   monthsLeft: number;
   placement: TKCharacterPlacement;
}
