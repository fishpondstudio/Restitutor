import { forEach, safePush } from "@project/shared/src/utils/Helper";
import { G } from "../../utils/Global";
import { $t, L } from "../../utils/i18n";
import { GameStateUpdated } from "../Events";
import { getScenarioGreatWorks, isGreatWorkCompleted } from "../logic/GreatWorkLogic";
import { ensureValidModifiers } from "../logic/ModifierLogic";
import { isSocialClassDisloyal, isSocialClassDominant } from "../logic/SocialClassLogic";
import { getTimedActionTimeLeft } from "../logic/TimedActionLogic";
import { getProvinceAssignedCharacters, getTKCharacterName, isTKCharacterAlive } from "../logic/TKCharacterLogic";
import { TKCharacters } from "../ThreeKingdoms/TKCharacter";
import { GreatWork } from "./GreatWork";
import { LegacyUpgrades } from "./LegacyUpgrade";
import { type IPersonTrait, PersonTrait } from "./PersonTrait";
import { ProvinceUpgrades } from "./ProvinceUpgrades";
import { getSocialClassName, SocialClass } from "./SocialClass";
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
                  name: governor
                     ? $t(L.GovernorsTrait$1, `${def.name()}, ${personName}`)
                     : $t(L.AdvisorsTrait$1, `${def.name()}, ${personName}`),
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
      const characters = new Set(getProvinceAssignedCharacters(province, G.save).map(([, character]) => character));
      const ruler = state.governor.male.character;
      if (ruler !== undefined && isTKCharacterAlive(ruler, G.save)) {
         characters.add(ruler);
      }
      for (const character of characters) {
         forEach(TKCharacters[character].modifiers, (modifier, data) => {
            safePush(state.dynamicModifiers, modifier, {
               type: data.type,
               value: data.value,
               name: getTKCharacterName(character).fullName,
            });
         });
      }
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
                  duration: timeLeft,
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
                  name: $t(L.$1ClassIsDominant, getSocialClassName(socialClass, G.save.state.scenario)),
               });
            });
         }
         if (isSocialClassDisloyal(socialClass, province, G.save)) {
            forEach(data.disloyal, (modifier, data) => {
               const { type, value } = data;
               safePush(state.dynamicModifiers, modifier, {
                  type,
                  value,
                  name: $t(L.$1ClassIsDisloyal, getSocialClassName(socialClass, G.save.state.scenario)),
               });
            });
         }
      });
   });
   for (const greatWork of getScenarioGreatWorks(G.save.state.scenario)) {
      if (!isGreatWorkCompleted(greatWork, G.save)) {
         continue;
      }
      const config = GreatWork[greatWork];
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
   }
   ensureValidModifiers(G.save);
}

export function subscribeToModifierUpdate(): void {
   GameStateUpdated.on(updateModifier);
}
