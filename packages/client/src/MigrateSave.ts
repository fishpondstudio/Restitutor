import { forEach } from "@project/shared/src/utils/Helper";
import type { SaveGame } from "./game/GameState";
import { provinceResourceOf } from "./game/logic/ProvinceLogic";

export function migrateSave(save: SaveGame): void {
   for (const [tile, data] of save.state.tiles) {
      if (!data.autonomy) {
         data.autonomy = 0;
      }
   }
   forEach(save.state.provinces, (province, data) => {
      if (data.legacyUpgrades instanceof Map) {
         data.legacyUpgrades = new Set();
         const legacyPoints = provinceResourceOf("legacy", province, save);
         legacyPoints[1] = 0;
      }
   });
}
