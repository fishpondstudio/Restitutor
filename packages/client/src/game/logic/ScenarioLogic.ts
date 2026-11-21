import type { Language } from "@project/shared/src/rpc/ServerMessageTypes";
import { $t, L } from "../../utils/i18n";
import type { ICondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { type ScenarioFlag, ScenarioFlags } from "../scenarios/ScenarioFlags";
import { type INameGenerator, type Scenario, Scenarios } from "../scenarios/Scenarios";

export function getNameGenerator(scenario: Scenario, language: Language): INameGenerator {
   const generator = Scenarios[scenario].nameGenerator;
   return {
      getFamilyName: (name) => generator.getFamilyName(name),
      randomName: (options) => generator.randomName({ ...options, language }),
   };
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
         name: $t(L.$1IsSupported, ScenarioFlags[flag]()),
         value: enabled,
         desc: $t(L.CurrentScenarioSupports$1, ScenarioFlags[flag]()),
      },
   ];
}
