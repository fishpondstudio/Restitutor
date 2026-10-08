export const ScenarioFlags = ["Polygamy", "AdvisorCharacter"] as const;
export type ScenarioFlag = (typeof ScenarioFlags)[number];
