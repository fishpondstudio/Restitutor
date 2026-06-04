import type { SaveGame } from "./game/GameState";

export function migrateSave(save: SaveGame): void {
   for (const [tile, data] of save.state.tiles) {
      if (!data.autonomy) {
         data.autonomy = 0;
      }
   }
}
