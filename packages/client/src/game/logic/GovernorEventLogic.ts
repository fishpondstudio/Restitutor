import type { IGameEffect } from "../GameEffect";

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

export const NewHeirBornEffects1 = {
   resources: { gold: 1000 },
} as const satisfies IGameEffect;

export const NewHeirBornEffects2 = {
   modifiers: {
      Stability: { type: "add", value: 10, duration: 12 },
   },
} as const satisfies IGameEffect;
