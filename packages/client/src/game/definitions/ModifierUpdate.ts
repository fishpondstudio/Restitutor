import { forEach, safePush } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { GameStateUpdated } from "../Events";
import { getGameDate } from "../logic/GameDateTime";
import { isSocialClassDisloyal, isSocialClassDominant } from "../logic/SocialClassLogic";
import { getTimedActionTimeLeft } from "../logic/TimedActionLogic";
import { GreatWork } from "./GreatWork";
import { LegacyUpgrades } from "./LegacyUpgrade";
import { type IPersonTrait, PersonTrait } from "./PersonTrait";
import { ProvinceUpgrades } from "./ProvinceUpgrades";
import { SocialClass } from "./SocialClass";
import { Tech } from "./Tech";
import { TimedActions } from "./TimedAction";

function updateModifier(): void {
   forEach(G.save.state.provinces, (province, state) => {
      state.dynamicModifiers = {};
      const addTraits = (traits: Set<PersonTrait>, personName: string, governor: boolean) => {
         traits.forEach((trait) => {
            const def: IPersonTrait = PersonTrait[trait];
            if (!("modifiers" in def)) {
               return;
            }
            forEach(def.modifiers, (modifier, data) => {
               safePush(state.dynamicModifiers, modifier, {
                  ...data,
                  name: $t(governor ? L.GovernorsTrait$1 : L.AdvisorsTrait$1, `${def.name()}, ${personName}`),
               });
            });
         });
      };
      addTraits(state.governor.male.traits, state.governor.male.name.join(" "), true);
      forEach(state.advisors, (_, advisor) => {
         if (advisor.selected) {
            addTraits(advisor.selected.traits, advisor.selected.name, false);
         }
      });
      state.unlockedTech.forEach((tech) => {
         forEach(Tech[tech].modifiers, (modifier, data) => {
            const { type, value } = data;
            safePush(state.dynamicModifiers, modifier, {
               type,
               value,
               name: $t(L.$1Research, Tech[tech].name()),
            });
         });
      });
      state.provinceUpgrades.forEach((upgrade) => {
         const { modifiers } = ProvinceUpgrades[upgrade];
         if (modifiers) {
            forEach(modifiers, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: ProvinceUpgrades[upgrade].name(),
               });
            });
         }
      });
      state.legacyUpgrades.forEach((level, upgrade) => {
         const def = LegacyUpgrades[upgrade];
         if ("modifiers" in def) {
            forEach(def.modifiers, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: $t(L.LegacyUpgrade),
               });
            });
         }
      });
      state.timedActions.forEach((_, timedAction) => {
         const timeLeft = getTimedActionTimeLeft(timedAction, province, G.save);
         if (timeLeft <= 0) {
            return;
         }
         const config = TimedActions[timedAction];
         if ("modifiers" in config) {
            forEach(config.modifiers, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: config.name(),
                  timeLeft,
               });
            });
         }
      });
      forEach(SocialClass, (socialClass, data) => {
         if (isSocialClassDominant(socialClass, province, G.save)) {
            forEach(data.dominant, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: $t(L.$1ClassIsDominant, SocialClass[socialClass].name()),
               });
            });
         }
         if (isSocialClassDisloyal(socialClass, province, G.save)) {
            forEach(data.disloyal, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: $t(L.$1ClassIsDisloyal, SocialClass[socialClass].name()),
               });
            });
         }
      });
   });
   const currentYear = getGameDate(G.save.state.tick).getFullYear();
   forEach(GreatWork, (_, config) => {
      if (currentYear < config.completionYear) {
         return;
      }
      forEach(config.modifiers, (modifier, data) => {
         const tileData = G.save.state.tiles.get(config.tile);
         if (!tileData) {
            return;
         }
         const state = G.save.state.provinces[tileData.province];
         if (!state) {
            return;
         }
         const { type, value } = data;
         safePush(state.dynamicModifiers, modifier, {
            type,
            value,
            name: config.name(),
         });
      });
   });
}

export function subscribeToModifierUpdate(): void {
   GameStateUpdated.on(updateModifier);
}
