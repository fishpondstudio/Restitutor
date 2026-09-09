import type { Texture } from "pixi.js";
import type { Terrain } from "../game/definitions/Terrain";
import { TileWidth } from "../game/MapGrid";
import { G } from "../utils/Global";
import { hasOpenModal } from "../utils/ModalManager";
import type { UnicodeText } from "../utils/UnicodeText";

let TerrainTextures: Record<Terrain, Texture[]> | undefined;

export function isMapMovementBlocked(): boolean {
   const active = document.activeElement;
   return (
      document.hidden ||
      hasOpenModal() ||
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement ||
      (active instanceof HTMLElement && active.isContentEditable)
   );
}

export function adjustTextSize(text: UnicodeText): void {
   text.size = 50;
   while (text.width > TileWidth - 20) {
      text.size -= 1;
   }
}

export function getTerrainTextures(terrain: Terrain): Texture[] {
   if (!TerrainTextures) {
      TerrainTextures = {
         Mountain: [
            G.textures.get("Shaded/Mountain1") as Texture,
            G.textures.get("Shaded/Mountain2") as Texture,
            G.textures.get("Shaded/Mountain3") as Texture,
         ],
         Hill: [
            G.textures.get("Shaded/Hill1") as Texture,
            G.textures.get("Shaded/Hill2") as Texture,
            G.textures.get("Shaded/Hill3") as Texture,
         ],
         Forest: [
            G.textures.get("Shaded/Forest1") as Texture,
            G.textures.get("Shaded/Forest2") as Texture,
            G.textures.get("Shaded/Forest3") as Texture,
         ],
         Plain: [
            G.textures.get("Shaded/Plain1") as Texture,
            G.textures.get("Shaded/Plain2") as Texture,
            G.textures.get("Shaded/Plain3") as Texture,
         ],
         Arid: [
            G.textures.get("Shaded/Arid1") as Texture,
            G.textures.get("Shaded/Arid2") as Texture,
            G.textures.get("Shaded/Arid3") as Texture,
         ],
      };
   }
   return TerrainTextures[terrain];
}
