import { forEach, keysOf } from "@project/shared/src/utils/Helper";
import type { IFamily, IPerson } from "./game/definitions/Family";
import { Province, ProvinceResources, ProvinceStats } from "./game/definitions/Province";
import { addProvinceUpgrade, ProvinceUpgrades } from "./game/definitions/ProvinceUpgrades";
import { SocialClass } from "./game/definitions/SocialClass";
import { TimedActions } from "./game/definitions/TimedAction";
import { GameEvents } from "./game/events/GameEvents";
import { GameOption } from "./game/GameOption";
import { GameState, type SaveGame } from "./game/GameState";
import { emptyRelation, fixRelations, getRelations } from "./game/logic/DiplomacyLogic";
import { ensureHeir } from "./game/logic/GovernorLogic";
import { initProvince, provinceResourceOf, setProvinceStat } from "./game/logic/ProvinceLogic";
import { socialClassInfluenceStat, socialClassLoyaltyStat } from "./game/logic/SocialClassLogic";

export function migrateSave(save: SaveGame): void {
   const defaultGameState = new GameState();
   const defaultGameOption = new GameOption();
   save.state = Object.assign(defaultGameState, save.state);
   save.options = Object.assign(defaultGameOption, save.options);
   forEach(save.state.provinces, (province, data) => {
      data = Object.assign(initProvince(province, data.capital), data);
      save.state.provinces[province] = data;
      migrateFamily(data.governor, save.state.month);
      ensureHeir(province, save);
      const relations = getRelations(province, save);
      if (relations) {
         for (const [otherProvince, relation] of relations) {
            relations.set(otherProvince, Object.assign(emptyRelation(), relation));
         }
      }
      if ("socialClasses" in data) {
         forEach(SocialClass, (socialClass) => {
            setProvinceStat(
               socialClassInfluenceStat(socialClass),
               ProvinceStats[socialClassInfluenceStat(socialClass)],
               province,
               save,
            );
            setProvinceStat(
               socialClassLoyaltyStat(socialClass),
               ProvinceStats[socialClassLoyaltyStat(socialClass)],
               province,
               save,
            );
         });
         delete data.socialClasses;
      }
      Province[province].upgrades.forEach((upgrade) => {
         addProvinceUpgrade(upgrade, province, save);
      });
      for (const upgrade of data.provinceUpgrades) {
         if (!ProvinceUpgrades[upgrade]) {
            data.provinceUpgrades.delete(upgrade);
         }
      }
      for (const resource of keysOf(data.resources)) {
         if (!(resource in ProvinceResources)) {
            delete data.resources[resource];
         }
      }
      for (const stat of keysOf(data.stats)) {
         if (!(stat in ProvinceStats)) {
            delete data.stats[stat];
         }
      }
      for (const [timedAction, timeLeft] of data.timedActions) {
         if (!TimedActions[timedAction]) {
            data.timedActions.delete(timedAction);
         }
      }
      if (data.legacyUpgrades instanceof Map) {
         data.legacyUpgrades = new Set();
         const legacyPoints = provinceResourceOf("legacy", province, save);
         legacyPoints[1] = 0;
      }
      for (const [event] of data.events) {
         if (!GameEvents[event]) {
            data.events.delete(event);
         }
      }
      for (const event of data.usedEvents) {
         if (!GameEvents[event]) {
            data.usedEvents.delete(event);
         }
      }
   });
   fixRelations(save);
   for (const [tile, data] of save.state.tiles) {
      if (!data.autonomy) {
         data.autonomy = 0;
      }
   }
}

function migrateFamily(family: IFamily, currentMonth: number): void {
   const legacyFamily = family as IFamily & {
      concubines?: IPerson[];
      marriageMonth?: number;
   };
   family.concubines = legacyFamily.concubines ?? [];

   if (family.male) {
      ensureJoinMonth(family.male, Math.max(0, currentMonth - family.male.age * 12));
   }
   if (family.female) {
      const fallback = family.male
         ? (legacyFamily.marriageMonth ?? currentMonth)
         : Math.max(0, currentMonth - family.female.age * 12);
      ensureJoinMonth(family.female, fallback);
   }
   for (const concubine of family.concubines) {
      ensureJoinMonth(concubine, currentMonth);
   }
   for (const child of family.children) {
      migrateFamily(child, currentMonth);
   }
   delete legacyFamily.marriageMonth;
}

function ensureJoinMonth(person: IPerson, fallback: number): void {
   const legacyPerson = person as IPerson & { joinMonth?: number };
   legacyPerson.joinMonth ??= fallback;
}
