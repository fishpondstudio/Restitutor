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

interface IAdvisorSlot {
   type: GovernorPower;
}

const _AdvisorSlots = {
   Administrative1: { type: "administrative" },
   Diplomatic1: { type: "diplomatic" },
   Military1: { type: "military" },
   Administrative2: { type: "administrative" },
   Diplomatic2: { type: "diplomatic" },
   Military2: { type: "military" },
} as const satisfies Record<string, IAdvisorSlot>;

export type AdvisorSlot = keyof typeof _AdvisorSlots;
export const AdvisorSlots: Record<AdvisorSlot, IAdvisorSlot> = _AdvisorSlots;

export type GovernmentTier = keyof typeof GovernmentTier;
