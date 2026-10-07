import { type INameGenerator, type Scenario, Scenarios } from "../scenarios/Scenarios";

export function getNameGenerator(scenario: Scenario): INameGenerator {
   return Scenarios[scenario].nameGenerator;
}
