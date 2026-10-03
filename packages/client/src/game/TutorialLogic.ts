import { hasFlag, keysOf } from "@project/shared/src/utils/Helper";
import { GameOptionFlag } from "./GameOption";
import type { SaveGame } from "./GameState";
import { Tutorial } from "./Tutorial";

const TutorialOrder = keysOf(Tutorial);

export function completeTutorial(id: Tutorial, save: SaveGame): void {
   if (save.state.completedTutorials.has(id)) {
      return;
   }
   save.state.completedTutorials.add(id);
   const nextId = TutorialOrder[TutorialOrder.indexOf(id) + 1];
   if (nextId && !save.state.completedTutorials.has(nextId)) {
      Tutorial[nextId].setup?.(save);
   }
}

export function getCurrentTutorialId(save: SaveGame): Tutorial | null {
   if (hasFlag(save.options.flag, GameOptionFlag.HideTutorial)) {
      return null;
   }
   for (const id of TutorialOrder) {
      const t = Tutorial[id];
      if (save.state.completedTutorials.has(id)) {
         continue;
      }
      const [progress, total] = t.progress(save);
      if (progress >= total) {
         completeTutorial(id, save);
         continue;
      }
      return id;
   }
   return null;
}
