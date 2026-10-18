export const ScenarioFlags = {
   Concubinage: () => "Concubinage",
   AdvisorCharacter: () => "AdvisorCharacter",
   Senate: () => "Senate",
   ImperialCourt: () => "Imperial Court",
} as const satisfies Record<string, () => string>;

export type ScenarioFlag = keyof typeof ScenarioFlags;
