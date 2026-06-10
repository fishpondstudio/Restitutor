import { hasFlag } from "@project/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { GameStateUpdated } from "./Events";
import { GameOptionFlag } from "./GameOption";
import type { SaveGame } from "./GameState";
import { type ITutorial, Tutorial } from "./Tutorial";

export function getCurrentTutorial(save: SaveGame): ITutorial | null {
   if (!save) {
      return null;
   }
   if (hasFlag(save.options.flag, GameOptionFlag.HideTutorial)) {
      return null;
   }
   for (let i = 0; i < Tutorial.length; i++) {
      const t = Tutorial[i];
      if (save.state.completedTutorials.has(t.id)) {
         continue;
      }
      const [progress, total] = t.progress(G.save);
      if (progress >= total) {
         save.state.completedTutorials.add(t.id);
         const nextTutorial = Tutorial[i + 1];
         if (nextTutorial) {
            nextTutorial.setup?.(save);
            GameStateUpdated.emit();
         }
         continue;
      }
      return t;
   }
   return null;
}
