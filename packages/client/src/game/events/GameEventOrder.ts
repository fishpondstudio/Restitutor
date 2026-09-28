import type { ValueOf } from "@project/shared/src/utils/Helper";

export const GameEventOrder = {
   Order1: 1,
   Order2: 2,
   Order3: 3,
   Order4: 4,
   Standard: 5,
   Order6: 6,
   Order7: 7,
   Order8: 8,
   Order9: 9,
} as const satisfies Record<string, number>;

export type GameEventOrder = ValueOf<typeof GameEventOrder>;
