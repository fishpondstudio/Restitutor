import type { Tile } from "@project/shared/src/utils/Helper";
import type { Culture } from "../definitions/Culture";
import { Province } from "../definitions/Province";
import type { ProvinceResource } from "../definitions/ProvinceResources";
import type { Religion } from "../definitions/Religion";
import type { SocialClass } from "../definitions/SocialClass";
import type { TimedAction } from "../definitions/TimedAction";
import type { GameEvent } from "../events/GameEvents";
import { Rome192 } from "./Rome192";
import type { ScenarioFlag } from "./ScenarioFlags";
import { ThreeKingdoms194 } from "./ThreeKingdoms194";

export interface IScenario {
   name: () => string;
   desc: () => string;
   startDate: Date;
   provinces: Set<Province>;
   cultures: Set<Culture>;
   religions: Set<Religion>;
   events: Set<GameEvent>;
   nameGenerator: INameGenerator;
   flags: Set<ScenarioFlag>;
   provinceResourceNames?: Partial<Record<ProvinceResource, () => string>>;
   timedActionNames?: Partial<Record<TimedAction, () => string>>;
   socialClassNames?: Partial<Record<SocialClass, () => string>>;
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
