import { forEach, keysOf, sizeOf, type Tile } from "@project/shared/src/utils/Helper";
import { expect, test } from "vitest";
import { type Building, Buildings } from "../definitions/Building";
import { Goods } from "../definitions/Goods";
import { Province } from "../definitions/Province";
import { type SocialClass, SocialClassBonuses } from "../definitions/SocialClass";
import { SpawnedProvinces } from "../definitions/SpawnedProvince";
import { Tech } from "../definitions/Tech";
import { TimedActions } from "../definitions/TimedAction";
import { type GameEvent, GameEvents } from "../events/GameEvents";
import { isLand } from "../Land";

test("Buildings are unlocked by exactly one tech", () => {
   const buildings = new Set<Building>();

   forEach(Tech, (tech, config) => {
      config.buildings?.forEach((building) => {
         expect.soft(buildings.has(building), `Tech ${tech} has duplicate buildings ${building}`).toBe(false);
         buildings.add(building);
      });
   });

   forEach(Buildings, (building) => {
      expect.soft(buildings.has(building), `Building ${building} is not unlocked by any tech`).toBe(true);
   });
});

test("Goods are unlocked by exactly one appropriate tech", () => {
   forEach(Tech, (tech, config) => {
      config.goods?.forEach((goods) => {
         expect.soft(Goods[goods].tech, `Goods ${goods} should be unlocked by tech ${tech}`).toBe(tech);
      });
   });

   forEach(Goods, (goods, config) => {
      if (sizeOf(config.input) > 0) {
         expect.soft(config.tech, `Goods ${goods} is not unlocked by any tech`).toBeDefined();
      } else {
         expect.soft(config.tech, `Raw goods ${goods} should not be locked by any tech`).toBeUndefined();
      }
   });
});

test("TimedActions have valid, unique tech unlocks", () => {
   forEach(Tech, (tech, config) => {
      config.timedActions?.forEach((timedAction) => {
         const definition = TimedActions[timedAction];
         if ("desc" in definition) {
            expect
               .soft(definition.desc, `Timed action ${timedAction} is unlocked by tech ${tech} but has no description`)
               .toBeDefined();
         }
         expect.soft(definition.tech, `Timed action ${timedAction} should be unlocked by tech ${tech}`).toBe(tech);
      });
   });
});

test("SocialClassBonuses have valid supporting and opposing classes", () => {
   forEach(SocialClassBonuses, (bonus, config) => {
      const socialClasses = new Set<SocialClass>();
      config.supporting.forEach((socialClass) => {
         expect
            .soft(
               socialClasses.has(socialClass),
               `SocialClassBonus "${bonus}" has duplicate supporting social classes "${socialClass}"`,
            )
            .toBe(false);
         socialClasses.add(socialClass);
      });
      config.opposing.forEach((socialClass) => {
         expect
            .soft(
               socialClasses.has(socialClass),
               `SocialClassBonus "${bonus}" has duplicate opposing social classes "${socialClass}"`,
            )
            .toBe(false);
         socialClasses.add(socialClass);
      });
      expect
         .soft(
            config.supporting.includes("UpperClass") && config.supporting.includes("ReligiousClass"),
            `SocialClassBonus "${bonus}" has conflicting supporting social classes`,
         )
         .toBe(false);
      expect
         .soft(
            config.opposing.includes("UpperClass") && config.opposing.includes("ReligiousClass"),
            `SocialClassBonus "${bonus}" has conflicting opposing social classes`,
         )
         .toBe(false);
   });
});

test("SpawnedProvinces contain unique tiles that are land", () => {
   forEach(SpawnedProvinces, (province, config) => {
      const tiles = new Set<Tile>();
      config.tiles.forEach((tile) => {
         expect.soft(isLand(tile), `Spawned province ${province} has tile ${tile} that is not land`).toBe(true);
         expect.soft(tiles.has(tile), `Spawned province ${province} has duplicate tile ${tile}`).toBe(false);
         tiles.add(tile);
      });
   });
});

test("GameEvents do not have conflicting province start years", () => {
   forEach(Province, (province) => {
      const yearToEvents = new Map<number, GameEvent>();
      forEach(GameEvents, (event, config) => {
         if (config.type === "manual" || config.type === "random") {
            return;
         }
         if (config.condition?.year && (!config.condition.province || config.condition.province.includes(province))) {
            const [startYear] = config.condition.year;
            const existingEvent = yearToEvents.get(startYear);
            // Events with additional conditions can coexist in the same year.
            if (
               keysOf(config.condition).filter((key) => key !== "year" && key !== "province" && key !== "playerOnly")
                  .length > 0
            ) {
               return;
            }
            expect
               .soft(
                  existingEvent,
                  `[${province}] Game Event "${existingEvent}" and "${event}" have the same year ${startYear}`,
               )
               .toBeUndefined();
            yearToEvents.set(startYear, event);
         }
      });
   });
});
