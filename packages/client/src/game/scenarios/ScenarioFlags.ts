export const ScenarioFlags = {
   Concubinage: () => "Concubinage",
   AdvisorCharacter: () => "AdvisorCharacter",
   Senate: () => "Senate",
} as const satisfies Record<string, () => string>;

export type ScenarioFlag = keyof typeof ScenarioFlags;
