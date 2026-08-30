import type { Province } from "./definitions/Province";
import type { Tech } from "./definitions/Tech";

export const ProvinceSelectorPrefix = "$Province:";
export const TechSelectorPrefix = "$Tech:";

export function provinceSel(province: Province): string {
   return `${ProvinceSelectorPrefix}${province}`;
}

export function techSel(tech: Tech): string {
   return `${TechSelectorPrefix}${tech}`;
}
