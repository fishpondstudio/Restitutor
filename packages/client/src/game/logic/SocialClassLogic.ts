import { clamp, forEach } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeBreakdown, type IValueBreakdown, makeValueBreakdown } from "../actions/GameAction";
import type { ProvinceUpgrade } from "../actions/ProvinceUpgrades";
import type { Province } from "../definitions/Province";
import { type SocialClass, SocialClassBonuses, SocialClassNames } from "../definitions/SocialClass";
import type { SaveGame } from "../GameState";

export const SocialClassDissentEffectPct = -0.1;

export function getLoyaltyEquilibrium(socialClass: SocialClass, province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown();
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   result.add.push({
      name: $t(L.FromInfluence),
      value: 100 - state.socialClasses[socialClass].influence,
      desc: $t(L.HundredMinusInfluenceTheHigherTheInfluenceTheLowerTheEquilibrium),
   });
   return finalizeBreakdown(result);
}

export function tickSocialClasses(province: Province, save: SaveGame): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   forEach(state.socialClasses, (socialClass, data) => {
      const targetLoyalty = getLoyaltyEquilibrium(socialClass, province, save).value;
      data.loyalty = data.loyalty + Math.sign(targetLoyalty - data.loyalty);
      data.dissent = clamp(data.dissent + getDissentChange(socialClass, province, save).value, -100, 100);
   });
}

export function getDissentChange(socialClass: SocialClass, province: Province, save: SaveGame): IValueBreakdown {
   const result = makeValueBreakdown({ reverse: true });
   const state = save.state.provinces[province];
   if (!state) {
      return result;
   }
   const data = state.socialClasses[socialClass];
   result.add.push({
      name: $t(L.ExcessInfluenceOverLoyalty),
      value: (data.influence - data.loyalty) * 0.1,
      desc: $t(L.InfluenceLoyalty10),
   });
   if (data.loyalty === data.influence) {
      result.add.push({
         name: $t(L.DriftingTowards0),
         value: data.dissent === 0 ? 0 : Math.sign(-data.dissent) * Math.min(Math.abs(data.dissent), 1),
         desc: $t(L.WhenInfluenceIsEqualToLoyaltyDissentWillDriftTowards0),
      });
   }
   return finalizeBreakdown(result);
}

export function getEstimatedDissentTime(socialClass: SocialClass, province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   const data = state.socialClasses[socialClass];
   const delta = data.loyalty - data.dissent;
   if (delta < 0) {
      return 0;
   }
   if (data.loyalty >= data.influence) {
      return Number.POSITIVE_INFINITY;
   }
   const dissentDelta = getDissentChange(socialClass, province, save).value;
   if (dissentDelta <= 0) {
      return Number.POSITIVE_INFINITY;
   }
   return delta / dissentDelta;
}

export function getSocialClassBonusName(upgrade: ProvinceUpgrade): { name: string; desc: string } {
   const bonus = SocialClassBonuses[upgrade];
   if (!bonus) {
      return {
         name: $t(L.ErrorUnknownSocialClassBonus),
         desc: $t(L.CheckSocialClassBonusesDefinition),
      };
   }
   return { name: bonus.name(), desc: $t(L.$1ClassPrivilege, SocialClassNames[bonus.socialClass]()) };
}

export function isSocialClassDissent(socialClass: SocialClass, province: Province, save: SaveGame): boolean {
   const state = save.state.provinces[province];
   if (!state) {
      return false;
   }
   const sc = state.socialClasses[socialClass];
   return sc.dissent > sc.loyalty;
}
