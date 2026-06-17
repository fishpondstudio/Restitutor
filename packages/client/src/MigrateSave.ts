import { forEach } from "@project/shared/src/utils/Helper";
import { GameOption } from "./game/GameOption";
import { GameState, type SaveGame } from "./game/GameState";
import { provinceResourceOf } from "./game/logic/ProvinceLogic";

export function migrateSave(save: SaveGame): void {
   save.state = Object.assign(new GameState(), save.state);
   save.options = Object.assign(new GameOption(), save.options);
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
