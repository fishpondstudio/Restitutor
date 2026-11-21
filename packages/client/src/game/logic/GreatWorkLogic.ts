import type { Tile } from "@project/shared/src/utils/Helper";
import { GreatWork } from "../definitions/GreatWork";
import type { SaveGame } from "../GameState";
import { type Scenario, Scenarios } from "../scenarios/Scenarios";
import { getGameDate } from "./GameDateTime";

export function getScenarioGreatWorks(scenario: Scenario): ReadonlySet<GreatWork> {
   return Scenarios[scenario].greatWorks;
}

const greatWorksTiles = new Map<Scenario, ReadonlyMap<Tile, GreatWork>>();

export function getGreatWorkTiles(scenario: Scenario): ReadonlyMap<Tile, GreatWork> {
   let tiles = greatWorksTiles.get(scenario);
   if (!tiles) {
      tiles = new Map(Array.from(getScenarioGreatWorks(scenario), (work) => [GreatWork[work].tile, work]));
      greatWorksTiles.set(scenario, tiles);
   }
   return tiles;
}

export function isGreatWorkCompleted(greatWork: GreatWork, save: SaveGame): boolean {
   return (
      getScenarioGreatWorks(save.state.scenario).has(greatWork) &&
      getGameDate(save.state.tick, save).getFullYear() >= GreatWork[greatWork].completionYear
   );
}
