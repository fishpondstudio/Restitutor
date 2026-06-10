import { entriesOf, formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type ProvinceResource, ProvinceResourceNames } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { getProvinceResource } from "./ProvinceLogic";

export function notEnoughResourcesError(resources: Partial<Record<ProvinceResource, number>>, save: SaveGame): string {
   return $t(
      L.NotEnoughResources$1,
      entriesOf(resources)
         .map(
            ([key, value]) =>
               `${ProvinceResourceNames[key]()}: ${formatNumber(getProvinceResource(key, save.state.playerProvince, save) - value)}`,
         )
         .join(", "),
   );
}
