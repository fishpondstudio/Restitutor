import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getProvinceGoverningCost, getProvinceResource } from "../logic/ProvinceLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ConvertToChristianityAction(province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   const governingCost = getProvinceGoverningCost(province, save);
   const christianity = getProvinceResource("christianity", province, save);
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: "Christianity Influence >= Governing Cost",
               value: christianity > governingCost.value,
               progress: [christianity, governingCost.value],
            },
            {
               name: "Our religion is not Christianity",
               value: state.religion !== "Christianity",
            },
         ],
      }),
      effect: () => {
         state.religion = "Christianity";
         for (const [tile, tileData] of save.state.tiles) {
            if (tileData.province === province && tileData.coreProvinces.has(province)) {
               tileData.religion = "Christianity";
            }
         }
      },
   };
}
