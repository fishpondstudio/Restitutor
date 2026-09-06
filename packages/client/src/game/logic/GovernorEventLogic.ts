import { $t, L } from "../../utils/i18n";
import type { IFamily } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import { isChristianReligion } from "../definitions/Religion";
import { applyGameEffect, type IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { ensureHeir, findFamilyById } from "./GovernorLogic";

export const NewGovernorEffect = {
   modifiers: {
      Prestige: { type: "multiply", value: -0.1, duration: 12 },
   },
} as const satisfies IGameEffect;

export const GovernorWithoutHeirEffect = {
   modifiers: {
      Prestige: { type: "multiply", value: -0.1, duration: 36 },
      Stability: { type: "add", value: -10, duration: 36 },
   },
} as const satisfies IGameEffect;

export const NewChildBornEffects1 = {
   resources: { gold: 1000 },
} as const satisfies IGameEffect;

export const NewChildBornEffects2 = {
   modifiers: {
      Stability: { type: "add", value: 10, duration: 12 },
   },
} as const satisfies IGameEffect;

export const RecognizeIllegitimateChildEffect = {
   modifiers: {
      Stability: { type: "add", value: -10, duration: 12 * 5 },
      Prestige: { type: "multiply", value: -0.1, duration: 12 * 5 },
   },
} as const satisfies IGameEffect;

export function getRecognizeIllegitimateChildEffect(province: Province, save: SaveGame): IGameEffect {
   const state = save.state.provinces[province];
   return {
      ...RecognizeIllegitimateChildEffect,
      resources: state && isChristianReligion(state.religion) ? { christianity: -10 } : undefined,
   };
}

export function recognizeIllegitimateChild(parentId: string, child: IFamily, province: Province, save: SaveGame): void {
   const parent = findFamilyById(parentId, save);
   if (!parent || parent.children.some((existingChild) => existingChild.id === child.id)) {
      return;
   }
   parent.children.push(child);
   applyGameEffect(
      getRecognizeIllegitimateChildEffect(province, save),
      $t(L.$1Event, $t(L.AQuestionOfLegitimacy)),
      province,
      save,
   );
   ensureHeir(province, save);
}
