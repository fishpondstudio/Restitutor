import { keysOf, reduceOf, shuffle } from "@project/shared/src/utils/Helper";
import { srand } from "@project/shared/src/utils/Random";
import { makeModifierGetter } from "../definitions/Modifier";
import type { Province, ProvinceStat } from "../definitions/Province";
import { SocialClass, type SocialClassBonus, SocialClassBonuses } from "../definitions/SocialClass";
import type { SaveGame } from "../GameState";
import { addProvinceStat, getProvinceStat } from "./ProvinceLogic";

export function getSocialClassInfluencePercentage(
   socialClass: SocialClass,
   province: Province,
   save: SaveGame,
): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   const influence = getSocialClassInfluence(socialClass, province, save);
   const totalInfluence = reduceOf(
      SocialClass,
      (prev, key, config) => prev + getSocialClassInfluence(key, province, save),
      0,
   );
   if (totalInfluence === 0) {
      return 0;
   }
   return influence / totalInfluence;
}

export function socialClassInfluenceStat(socialClass: SocialClass): ProvinceStat {
   switch (socialClass) {
      case "UpperClass":
         return "upperClassInfluence";
      case "MiddleClass":
         return "middleClassInfluence";
      case "LowerClass":
         return "lowerClassInfluence";
      case "ReligiousClass":
         return "religiousClassInfluence";
      case "MilitaryClass":
         return "militaryClassInfluence";
      default:
         socialClass satisfies never;
         throw new Error(`Invalid social class: ${socialClass}`);
   }
}
export function socialClassLoyaltyStat(socialClass: SocialClass): ProvinceStat {
   switch (socialClass) {
      case "UpperClass":
         return "upperClassLoyalty";
      case "MiddleClass":
         return "middleClassLoyalty";
      case "LowerClass":
         return "lowerClassLoyalty";
      case "ReligiousClass":
         return "religiousClassLoyalty";
      case "MilitaryClass":
         return "militaryClassLoyalty";
      default:
         socialClass satisfies never;
         throw new Error(`Invalid social class: ${socialClass}`);
   }
}

export function getSocialClassInfluence(socialClass: SocialClass, province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   return getProvinceStat(socialClassInfluenceStat(socialClass), province, save);
}

export function getSocialClassLoyalty(socialClass: SocialClass, province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   return getProvinceStat(socialClassLoyaltyStat(socialClass), province, save);
}

export function addSocialClassInfluence(
   socialClass: SocialClass,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   addProvinceStat(socialClassInfluenceStat(socialClass), value, province, save);
}

export function addSocialClassLoyalty(
   socialClass: SocialClass,
   value: number,
   province: Province,
   save: SaveGame,
): void {
   const state = save.state.provinces[province];
   if (!state) {
      return;
   }
   addProvinceStat(socialClassLoyaltyStat(socialClass), value, province, save);
}

export function getAgendas(count: number, province: Province, save: SaveGame): SocialClassBonus[] {
   const rand = srand(`agenda${Math.floor(save.state.month / 60)}`);
   const socialClasses = keysOf(SocialClass);
   const candidates = shuffle(keysOf(SocialClassBonuses), rand);

   let picksLeft = count;
   const result: SocialClassBonus[] = [];

   for (const sc of socialClasses) {
      const picks = Math.round(getSocialClassInfluencePercentage(sc, province, save) * count);
      for (let i = 0; i < picks; i++) {
         const agenda = candidates.findIndex((a) => SocialClassBonuses[a].supporting.includes(sc));
         if (agenda !== -1) {
            const selected = candidates.splice(agenda, 1);
            --picksLeft;
            result.push(selected[0]);
         }
      }
   }

   while (picksLeft > 0 && candidates.length > 0) {
      const selected = candidates.pop();
      if (selected) {
         --picksLeft;
         result.push(selected);
      }
   }

   return result;
}

export function getAgendasRefreshIn(province: Province, save: SaveGame): number {
   const state = save.state.provinces[province];
   if (!state) {
      return 0;
   }
   return Math.ceil(save.state.month / 60) * 60 - save.state.month;
}

export const SocialClassInfluenceYearly = {
   UpperClass: makeModifierGetter("UpperClassInfluenceYearly", 0, (result, province, save) => {}),
   MiddleClass: makeModifierGetter("MiddleClassInfluenceYearly", 0, (result, province, save) => {}),
   LowerClass: makeModifierGetter("LowerClassInfluenceYearly", 0, (result, province, save) => {}),
   ReligiousClass: makeModifierGetter("ReligiousClassInfluenceYearly", 0, (result, province, save) => {}),
   MilitaryClass: makeModifierGetter("MilitaryClassInfluenceYearly", 0, (result, province, save) => {}),
} as const satisfies Record<SocialClass, ReturnType<typeof makeModifierGetter>>;

export function isSocialClassDominant(socialClass: SocialClass, province: Province, save: SaveGame): boolean {
   return getSocialClassInfluencePercentage(socialClass, province, save) > 0.5;
}

export function isSocialClassDisloyal(socialClass: SocialClass, province: Province, save: SaveGame): boolean {
   return getSocialClassLoyalty(socialClass, province, save) < 50;
}
