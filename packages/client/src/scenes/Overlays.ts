import { RefreshOverlay } from "../game/Events";
import { $t, L } from "../utils/i18n";

let overlay: OverlayType = "Terrain";

export function getOverlay(): OverlayType {
   return overlay;
}

export function setOverlay(value: OverlayType): void {
   overlay = value;
   RefreshOverlay.emit();
}

export const Overlays = {
   Terrain: () => $t(L.Terrain),
   Output: () => $t(L.Output),
   Upgrade: () => $t(L.Upgrade),
   Defense: () => $t(L.Defense),
   Maintenance: () => $t(L.Maintenance),
   GreatWorks: () => $t(L.GreatWorks),
} as const satisfies Record<string, () => string>;

export type OverlayType = keyof typeof Overlays;
