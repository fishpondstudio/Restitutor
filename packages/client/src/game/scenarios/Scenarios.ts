import type { Tile } from "@project/shared/src/utils/Helper";
import { Province } from "../definitions/Province";
import type { GameEvent } from "../events/GameEvents";
import { Rome192Scenario } from "./Rome192Scenario";

export interface IScenario {
   startDate: Date;
   provinces: Set<Province>;
   events: Set<GameEvent>;
}

export const Scenarios = {
   Rome192: Rome192Scenario,
} satisfies Record<string, IScenario>;

export type Scenario = keyof typeof Scenarios;

export function getInitialTiles(scenario: Scenario): Map<Tile, Province> {
   const tiles = new Map<Tile, Province>();
   for (const province of Scenarios[scenario].provinces) {
      for (const tile of Province[province].tiles) {
         tiles.set(tile, province);
      }
   }
   return tiles;
}
