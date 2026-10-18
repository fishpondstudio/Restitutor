export const ScenarioFlags = {
   Concubinage: () => "Concubinage",
   TKCharacter: () => "Three Kingdoms Character",
   Senate: () => "Senate",
   ImperialCourt: () => "Imperial Court",
} as const satisfies Record<string, () => string>;

export type ScenarioFlag = keyof typeof ScenarioFlags;
