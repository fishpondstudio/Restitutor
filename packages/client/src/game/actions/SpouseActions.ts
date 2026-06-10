import { clamp, randInt } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { hideModal } from "../../utils/ModalManager";
import type { IFamily } from "../definitions/Family";
import { PersonFlags } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import type { SocialClass } from "../definitions/SocialClass";
import type { SaveGame } from "../GameState";
import { showSuccess } from "../logic/AlertLogic";
import { ensureTraits, removeEmptyFamily } from "../logic/GovernorLogic";
import { GovernorMaxExcl, GovernorMinIncl } from "../logic/ProvinceLogic";
import { requireHigherPrestige, requireMinimumAttitude } from "../logic/TreatyLogic";
import { randomFemaleName } from "../RomanNames";
import { finalizeCondition, type ICondition, type IGameAction } from "./GameAction";

export function LookForLocalSpouseAction(
   socialClass: SocialClass,
   family: IFamily,
   province: Province,
   save: SaveGame,
): IGameAction {
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: $t(L.IsEligibleForSpouse),
               value: !family.male || !family.female,
            },
         ],
      }),
      effect: ({ headless }) => {
         if (!family.male && family.female) {
            const daughter = family.female;
            family.female = null;
            removeEmptyFamily(save);
            if (!headless) {
               showSuccess($t(L.OurDaughter$1HasJoinedHerHusbandsFamily, daughter.name.join(" ")));
            }
         }
         if (!family.female && family.male) {
            family.female = ensureTraits({
               traits: new Set(),
               name: randomFemaleName(),
               age: clamp(randInt(family.male.age - 5, family.male.age + 5), 0, Number.POSITIVE_INFINITY),
               administrative: randInt(GovernorMinIncl, GovernorMaxExcl),
               diplomatic: randInt(GovernorMinIncl, GovernorMaxExcl),
               military: randInt(GovernorMinIncl, GovernorMaxExcl),
               province: province,
               flag: PersonFlags.None,
            });
         }
         const state = save.state.provinces[province];
         if (state) {
            state.socialClasses[socialClass].loyalty += 50;
         }
         if (!headless) {
            hideModal();
         }
      },
   };
}

export function OfferMarriageAction(ours: IFamily, theirs: IFamily, province: Province, save: SaveGame): IGameAction {
   const ourPerson = ours.male ?? ours.female;
   const theirPerson = theirs.male ?? theirs.female;
   const conditions: ICondition[] = [];

   if (!ourPerson || !theirPerson) {
      conditions.push({ name: $t(L.IsEligibleForMarriage), value: false });
   } else {
      conditions.push({ name: $t(L.IsEligibleForMarriage), value: true });
      conditions.push(requireHigherPrestige(ourPerson.province, theirPerson.province, 0.75, G.save));
      conditions.push(requireMinimumAttitude(ourPerson.province, theirPerson.province, 10, G.save));
   }

   return {
      condition: finalizeCondition({
         breakdown: conditions,
      }),
      effect: ({ headless }) => {
         if (ours.male && theirs.female) {
            ours.female = theirs.female;
            theirs.female = null;
         }
         if (ours.female && theirs.male) {
            const daughter = ours.female;
            theirs.female = ours.female;
            ours.female = null;
            if (!headless) {
               showSuccess($t(L.OurDaughter$1HasJoinedHerHusbandsFamily, daughter.name.join(" ")));
            }
         }
         removeEmptyFamily(save);
         if (!headless) {
            hideModal();
         }
      },
   };
}
