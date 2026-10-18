import { keysOf } from "@project/shared/src/utils/Helper";
import type { GovernorPower } from "./ProvinceResources";

export interface IGovernmentTier {
   name: () => string;
   slots: number;
}

export const GovernmentTier = {
   Tier1: {
      name: () => "Governor",
      slots: 5,
   },
   Tier2: {
      name: () => "Duke",
      slots: 8,
   },
   Tier3: {
      name: () => "King",
      slots: 11,
   },
   Tier4: {
      name: () => "Emperor",
      slots: 14,
   },
} as const satisfies Record<string, IGovernmentTier>;

interface ICharacterSlot {
   type: "Advisor" | "AncestralTemple" | "General";
   governorPower?: GovernorPower;
}

const _CharacterSlots = {
   Administrative1: { type: "Advisor", governorPower: "administrative" },
   Diplomatic1: { type: "Advisor", governorPower: "diplomatic" },
   Military1: { type: "Advisor", governorPower: "military" },
   Administrative2: { type: "Advisor", governorPower: "administrative" },
   Diplomatic2: { type: "Advisor", governorPower: "diplomatic" },
   Military2: { type: "Advisor", governorPower: "military" },
   AncestralTemple1: { type: "AncestralTemple" },
   AncestralTemple2: { type: "AncestralTemple" },
   AncestralTemple3: { type: "AncestralTemple" },
   AncestralTemple4: { type: "AncestralTemple" },
   AncestralTemple5: { type: "AncestralTemple" },
   AncestralTemple6: { type: "AncestralTemple" },
   Strategist1: { type: "General" },
   Strategist2: { type: "General" },
} as const satisfies Record<string, ICharacterSlot>;

export type CharacterSlot = keyof typeof _CharacterSlots;
export const CharacterSlots: Record<CharacterSlot, ICharacterSlot> = _CharacterSlots;

export function getAdvisorSlots(): CharacterSlot[] {
   return keysOf(CharacterSlots).filter((slot) => CharacterSlots[slot].type === "Advisor");
}

export function getAncestralTempleSlots(): CharacterSlot[] {
   return keysOf(CharacterSlots).filter((slot) => CharacterSlots[slot].type === "AncestralTemple");
}

export function getStrategistSlots(): CharacterSlot[] {
   return keysOf(CharacterSlots).filter((slot) => CharacterSlots[slot].type === "General");
}

export type GovernmentTier = keyof typeof GovernmentTier;
