import { filterInPlace, forEach } from "@project/shared/src/utils/Helper";
import { NegotiateWhitePeaceAction } from "../actions/NegotiateWhitePeaceAction";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getRelations } from "./DiplomacyLogic";
import { clearProvincePrestigeRankingCache } from "./ProvinceLogic";

// This function should remove `province` and clean up all references to it from `SaveGame`

export function cleanUpProvince(province: Province, save: SaveGame): void {
   forEach(save.state.provinces, (otherProvince, state) => {
      if (otherProvince === province) {
         return;
      }
      getRelations(otherProvince, save)?.delete(province);
      for (let i = 0; i < state.rivals.length; i++) {
         if (state.rivals[i] === province) {
            state.rivals[i] = null;
         }
      }
   });
   filterInPlace(save.state.wars, (war) => {
      if (war.attacker === province || war.defender === province) {
         NegotiateWhitePeaceAction(war, province, save).effect({ headless: true });
         return false;
      }
      war.coAttackers.delete(province);
      war.coDefenders.delete(province);
      return true;
   });
   delete save.state.provinces[province];
   clearProvincePrestigeRankingCache();
}
