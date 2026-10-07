import type { SaveGame } from "../GameState";
import type { ScenarioFlag } from "../scenarios/ScenarioFlags";
import { type INameGenerator, type Scenario, Scenarios } from "../scenarios/Scenarios";

export function getNameGenerator(scenario: Scenario): INameGenerator {
   return Scenarios[scenario].nameGenerator;
}

export function hasScenarioFlag(flag: ScenarioFlag, save: SaveGame): boolean {
   return Scenarios[save.state.scenario].flags.has(flag);
}
