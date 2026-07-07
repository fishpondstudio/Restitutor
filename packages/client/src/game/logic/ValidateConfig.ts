import { forEach, sizeOf, type Tile } from "@project/shared/src/utils/Helper";
import { type Building, Buildings } from "../definitions/Building";
import { Goods } from "../definitions/Goods";
import { type SocialClass, SocialClassBonuses } from "../definitions/SocialClass";
import { Tech } from "../definitions/Tech";
import { SpawnedProvinces } from "../definitions/TileConstants";
import { TimedActions } from "../definitions/TimedAction";

export function validateConfig(): void {
   const buildings = new Set<Building>();
   forEach(Tech, (tech, config) => {
      config.goods?.forEach((g) => {
         if (Goods[g].tech) {
            console.error(`Goods ${g} is already unlocked by tech ${Goods[g].tech}`);
         }
         Goods[g].tech = tech;
      });
      config.buildings?.forEach((building) => {
         if (buildings.has(building)) {
            console.error(`Tech ${tech} has duplicate buildings ${building}`);
         }
         buildings.add(building);
      });
      config.timedActions?.forEach((timedAction) => {
         const def = TimedActions[timedAction];
         if ("desc" in def && def.desc === undefined) {
            console.error(`Timed action ${timedAction} is unlocked by tech ${tech} but has no description`);
         }
         if (def.tech !== undefined) {
            console.error(`Timed action ${timedAction} is already unlocked by tech ${def.tech}`);
         }
         def.tech = tech;
      });
   });
   forEach(Buildings, (building, config) => {
      if (!buildings.has(building)) {
         console.error(`Building ${building} is unlocked by any tech`);
      }
   });
   forEach(Goods, (g, config) => {
      if (sizeOf(config.input) > 0 && !config.tech) {
         console.error(`Goods ${g} is not unlocked by any tech`);
      }
      if (sizeOf(config.input) === 0 && config.tech) {
         console.error(`Raw goods ${g} should not be locked by any tech`);
      }
   });
   forEach(SocialClassBonuses, (bonus, config) => {
      const socialClasses = new Set<SocialClass>();
      config.supporting.forEach((socialClass) => {
         if (socialClasses.has(socialClass)) {
            console.error(`SocialClassBonus "${bonus}" has duplicate supporting social classes "${socialClass}"`);
         }
         socialClasses.add(socialClass);
      });
      config.opposing.forEach((socialClass) => {
         if (socialClasses.has(socialClass)) {
            console.error(`SocialClassBonus "${bonus}" has duplicate opposing social classes "${socialClass}"`);
         }
         socialClasses.add(socialClass);
      });
      if (config.supporting.includes("UpperClass") && config.supporting.includes("ReligiousClass")) {
         console.error(`SocialClassBonus "${bonus}" has conflicting supporting social classes`);
      }
      if (config.opposing.includes("UpperClass") && config.opposing.includes("ReligiousClass")) {
         console.error(`SocialClassBonus "${bonus}" has conflicting opposing social classes`);
      }
   });
   forEach(SpawnedProvinces, (province, config) => {
      const tiles = new Set<Tile>();
      config.tiles.forEach((tile) => {
         if (tiles.has(tile)) {
            console.error(`Spawned province ${province} has duplicate tile ${tile}`);
         }
         tiles.add(tile);
      });
   });
   // forEach(TimedActions, (timedAction, config) => {
   //    if (config.duration > config.cooldown) {
   //       console.warn(`Timed action ${timedAction} has a duration > cooldown`);
   //    }
   // });
   // console.log(
   //    `⚠️TimedActions not unlocked by tech:\n${entriesOf(TimedActions)
   //       .flatMap(([timedAction, config]) => {
   //          if (config.tech === undefined && "desc" in config && config.desc !== undefined) {
   //             return `- ${config.name()} (${timedAction})`;
   //          }
   //          return [];
   //       })
   //       .join("\n")}`,
   // );
}
