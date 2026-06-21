import { forEach } from "@project/shared/src/utils/Helper";
import { Province } from "./game/definitions/Province";
import { addProvinceUpgrade } from "./game/definitions/ProvinceUpgrades";
import { GameOption } from "./game/GameOption";
import { GameState, type SaveGame } from "./game/GameState";
import { emptyRelation, fixRelations, getRelations } from "./game/logic/DiplomacyLogic";
import { initProvince, provinceResourceOf } from "./game/logic/ProvinceLogic";

export function migrateSave(save: SaveGame): void {
   save.state = Object.assign(new GameState(), save.state);
   save.options = Object.assign(new GameOption(), save.options);
   forEach(save.state.provinces, (province, data) => {
      save.state.provinces[province] = Object.assign(initProvince(province), data);
      const relations = getRelations(province, save);
      if (relations) {
         for (const [otherProvince, relation] of relations) {
            relations.set(otherProvince, Object.assign(emptyRelation(), relation));
         }
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
