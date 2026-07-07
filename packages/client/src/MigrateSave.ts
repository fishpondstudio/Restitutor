import { forEach } from "@project/shared/src/utils/Helper";
import { Province, ProvinceStats } from "./game/definitions/Province";
import { addProvinceUpgrade } from "./game/definitions/ProvinceUpgrades";
import { SocialClass } from "./game/definitions/SocialClass";
import { GameOption } from "./game/GameOption";
import { GameState, type SaveGame } from "./game/GameState";
import { emptyRelation, fixRelations, getRelations } from "./game/logic/DiplomacyLogic";
import { initProvince, provinceResourceOf, setProvinceStat } from "./game/logic/ProvinceLogic";
import { socialClassInfluenceStat, socialClassLoyaltyStat } from "./game/logic/SocialClassLogic";

export function migrateSave(save: SaveGame): void {
   save.state = Object.assign(new GameState(), save.state);
   save.options = Object.assign(new GameOption(), save.options);
   forEach(save.state.provinces, (province, data) => {
      save.state.provinces[province] = Object.assign(initProvince(province, data.capital), data);
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
   });
   fixRelations(save);

   forEach(save.state.provinces, (province, data) => {
      Province[province].upgrades.forEach((upgrade) => {
         addProvinceUpgrade(upgrade, province, save);
      });
      if (data.legacyUpgrades instanceof Map) {
         data.legacyUpgrades = new Set();
         const legacyPoints = provinceResourceOf("legacy", province, save);
         legacyPoints[1] = 0;
      }
   });

   for (const [tile, data] of save.state.tiles) {
      if (!data.autonomy) {
         data.autonomy = 0;
      }
   }
}
