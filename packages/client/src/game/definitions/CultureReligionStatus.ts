import type { DefaultMantineColor } from "@mantine/core";
import { $t, L } from "../../utils/i18n";

export const CultureReligionStatus = {
   Dominant: { name: () => $t(L.CultureReligionStatusDominant), color: "green" },
   Tolerated: { name: () => $t(L.CultureReligionStatusTolerated), color: "yellow" },
   Minor: { name: () => $t(L.CultureReligionStatusMinor), color: "red" },
} as const satisfies Record<string, { name: () => string; color: DefaultMantineColor }>;

export type CultureReligionStatus = keyof typeof CultureReligionStatus;
