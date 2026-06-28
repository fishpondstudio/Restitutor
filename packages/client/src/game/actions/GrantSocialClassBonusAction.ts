import { $t, L } from "../../utils/i18n";
import type { Province } from "../definitions/Province";
import { SocialClass, type SocialClassBonus, SocialClassBonuses } from "../definitions/SocialClass";
import { applyGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import {
   addSocialClassInfluence,
   addSocialClassLoyalty,
   getSocialClassInfluencePercentage,
   getSocialClassLoyalty,
} from "../logic/SocialClassLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function GrantSocialClassBonusAction(bonus: SocialClassBonus, province: Province, save: SaveGame): IGameAction {
   const config = SocialClassBonuses[bonus];
   const supportingInfluence =
      config.supporting
         .map((socialClass) => getSocialClassInfluencePercentage(socialClass, province, save))
         .reduce((acc, curr) => acc + curr, 0) * 100;
   return {
      condition: finalizeCondition([
         ...timedActionConditions({ action: "GrantSocialClassBonus" }, province, save),
         {
            name: $t(
               L.$1HasAtLeast50CombinedInfluence,
               config.supporting.map((socialClass) => SocialClass[socialClass].name()).join(", "),
            ),
            value: supportingInfluence >= 50,
            progress: [supportingInfluence, 50],
         },
         ...config.supporting.map((socialClass) => {
            return {
               name: $t(L.$1HasAtLeast50Loyalty, SocialClass[socialClass].name()),
               value: getSocialClassLoyalty(socialClass, province, save) >= 50,
            };
         }),
         ...config.opposing.map((socialClass) => {
            return {
               name: $t(L.$1HasAtLeast10Loyalty, SocialClass[socialClass].name()),
               value: getSocialClassLoyalty(socialClass, province, save) >= 10,
            };
         }),
      ]),
      effect: () => {
         startTimedAction("GrantSocialClassBonus", province, save);
         config.supporting.forEach((socialClass) => {
            addSocialClassInfluence(socialClass, 10, province, save);
         });
         config.opposing.forEach((socialClass) => {
            addSocialClassLoyalty(socialClass, -10, province, save);
         });
         applyGameEffect(config.effect, $t(L.SocialClassAgenda), province, save);
      },
   };
}
