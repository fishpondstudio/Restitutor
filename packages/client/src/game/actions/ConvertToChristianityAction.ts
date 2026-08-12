import { $t, L } from "../../utils/i18n";
import { unlockAchievement } from "../Achievement";
import type { Province } from "../definitions/Province";
import { isChristianReligion } from "../definitions/Religion";
import type { SaveGame } from "../GameState";
import { changeProvinceReligion, getProvinceGoverningCost, getProvinceResource } from "../logic/ProvinceLogic";
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
      condition: finalizeCondition([
         {
            name: $t(L.ChristianInfluenceIsHigherThanGoverningCost),
            value: christianity > governingCost.value,
            progress: [christianity, governingCost.value],
         },
         {
            name: $t(L.OurReligionIsNotChristian),
            value: !isChristianReligion(state.religion),
         },
      ]),
      effect: () => {
         changeProvinceReligion("Christianity", province, save);
         if (province === save.state.playerProvince) {
            unlockAchievement("AdoptChristianity");
         }
         for (const [tile, tileData] of save.state.tiles) {
            if (tileData.province === province && tileData.coreProvinces.has(province)) {
               tileData.religion = "Christianity";
            }
         }
      },
   };
}
