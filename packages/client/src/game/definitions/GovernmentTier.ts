import { keysOf } from "@project/shared/src/utils/Helper";
import type { GovernorPower } from "./ProvinceResources";

export interface IGovernmentTier {
   name: () => string;
   advisors: number;
}

export const GovernmentTier = {
   Tier1: {
      name: () => "Governor",
      advisors: 3,
   },
   Tier2: {
      name: () => "Duke",
      advisors: 4,
   },
   Tier3: {
      name: () => "King",
      advisors: 5,
   },
   Tier4: {
      name: () => "Emperor",
      advisors: 6,
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
   AncestralTempleSlot1: { type: "AncestralTemple" },
   AncestralTempleSlot2: { type: "AncestralTemple" },
   AncestralTempleSlot3: { type: "AncestralTemple" },
   AncestralTempleSlot4: { type: "AncestralTemple" },
   AncestralTempleSlot5: { type: "AncestralTemple" },
   AncestralTempleSlot6: { type: "AncestralTemple" },
   StrategistSlot: { type: "General" },
} as const satisfies Record<string, ICharacterSlot>;

export type CharacterSlot = keyof typeof _CharacterSlots;
export const CharacterSlots: Record<CharacterSlot, ICharacterSlot> = _CharacterSlots;

export function getAdvisorSlots(): CharacterSlot[] {
   return keysOf(CharacterSlots).filter((slot) => CharacterSlots[slot].type === "Advisor");
}

export function getAncestralTempleSlots(): CharacterSlot[] {
   return keysOf(CharacterSlots).filter((slot) => CharacterSlots[slot].type === "AncestralTemple");
}

export type GovernmentTier = keyof typeof GovernmentTier;
