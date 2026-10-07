import type { Tile } from "@project/shared/src/utils/Helper";
import { Province } from "../definitions/Province";
import type { ProvinceResource } from "../definitions/ProvinceResources";
import type { GameEvent } from "../events/GameEvents";
import { Rome192 } from "./Rome192";
import { ThreeKingdoms194 } from "./ThreeKingdoms194";

export interface IScenario {
   startDate: Date;
   provinces: Set<Province>;
   events: Set<GameEvent>;
   nameGenerator: INameGenerator;
   provinceResourceNames?: Partial<Record<ProvinceResource, () => string>>;
}

export const Scenarios = {
   Rome192: Rome192,
   ThreeKingdoms194: ThreeKingdoms194,
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

export interface INameGenerator {
   getFamilyName: (name: string[]) => string;
   randomName(gender: "male" | "female", familyName?: string, random?: () => number): string[];
}
