import type { Culture } from "../definitions/Culture";
import { Province } from "../definitions/Province";
import type { Religion } from "../definitions/Religion";

export function getCulturesFromProvinces(provinces: Iterable<Province>): Set<Culture> {
   const cultures = new Set<Culture>();
   for (const province of provinces) {
      cultures.add(Province[province].culture);
   }
   return cultures;
}

export function getReligionsFromProvinces(provinces: Iterable<Province>): Set<Religion> {
   const religions = new Set<Religion>();
   for (const province of provinces) {
      religions.add(Province[province].religion);
   }
   return religions;
}
