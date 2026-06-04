import { GameOptionUpdated, GameStateUpdated } from "./game/Events";
import { tickLogic } from "./game/logic/TickLogic";
import { initShortcut } from "./game/Shortcut";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { tickActions } from "./utils/actions/ActionRuntime";
import { G } from "./utils/Global";
import { Watermark } from "./Watermark";

export function startGameLoop(): void {
   let accumulatedTime = 0;
   const watermark = new Watermark();
   G.pixi.ticker.add(() => {
      const unscaled = G.pixi.ticker.deltaMS / 1000;
      const dt = unscaled * G.speed;

      accumulatedTime += dt;
      while (accumulatedTime >= 1) {
         accumulatedTime -= 1;
         tickLogic(G.save, 1, 1 / G.speed);
      }
      watermark.update();
      G.scene.getCurrent(WorldScene)?.update(dt, unscaled);
      G.scene.getCurrent(TechTreeScene)?.update(dt, unscaled);
      tickActions(unscaled);
   });
   GameStateUpdated.emit();
   GameOptionUpdated.emit();

   initShortcut();
}
