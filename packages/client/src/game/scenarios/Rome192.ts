import { keysOf } from "@project/shared/src/utils/Helper";
import { RomanEmpireProvinces } from "../definitions/TileConstants";
import { RomeEvents } from "../events/GameEvents";
import { RomanNameGenerator } from "../RomanNames";
import type { IScenario } from "./Scenarios";

export const Rome192: IScenario = {
   startDate: new Date(192, 11, 31),
   provinces: new Set(RomanEmpireProvinces),
   nameGenerator: RomanNameGenerator,
   // Event definitions import scenario-aware logic, so defer reading the catalog until initialization finishes.
   events: new Set(keysOf(RomeEvents)),
   flags: new Set(),
};
