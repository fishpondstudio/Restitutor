import type { ICondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { type ScenarioFlag, ScenarioFlags } from "../scenarios/ScenarioFlags";
import { type INameGenerator, type Scenario, Scenarios } from "../scenarios/Scenarios";

export function getNameGenerator(scenario: Scenario): INameGenerator {
   return Scenarios[scenario].nameGenerator;
}

export function hasScenarioFlag(flag: ScenarioFlag, save: SaveGame): boolean {
   return Scenarios[save.state.scenario].flags.has(flag);
}

export function requireScenarioFlagCondition(flag: ScenarioFlag, save: SaveGame): ICondition[] {
   const enabled = hasScenarioFlag(flag, save);
   if (enabled) {
      return [];
   }
   return [
      {
         name: `${ScenarioFlags[flag]()} is supported`,
         value: enabled,
         desc: `Current scenario supports ${ScenarioFlags[flag]()}`,
      },
   ];
}
