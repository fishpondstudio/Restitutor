import { clamp } from "@project/shared/src/utils/Helper";
import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import type { Camera } from "./Camera";
import type { SceneLifecycle } from "./SceneLifecycle";

export interface IEdgePanOptions {
   edgeSize: number;
   speed: number;
}

export class EdgePanMovement implements SceneLifecycle {
   private pointerPosition: IHaveXY | null = null;

   constructor(
      private readonly camera: Camera,
      private readonly domElement: HTMLElement,
      private readonly getOptions: () => IEdgePanOptions | undefined,
   ) {}

   private clear = (): void => {
      this.pointerPosition = null;
   };

   private onPointerMove = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse" || document.hidden || !document.hasFocus()) {
         this.clear();
         return;
      }
      this.pointerPosition = { x: e.clientX, y: e.clientY };
   };

   private onPointerOut = (e: PointerEvent): void => {
      if (e.relatedTarget === null) {
         this.onPointerMove(e);
      }
   };

   public onEnable(): void {
      document.addEventListener("pointermove", this.onPointerMove, true);
      document.addEventListener("pointerout", this.onPointerOut, true);
      document.addEventListener("pointercancel", this.clear, true);
      window.addEventListener("blur", this.clear);
      document.addEventListener("visibilitychange", this.clear);
   }

   public onDisable(): void {
      document.removeEventListener("pointermove", this.onPointerMove, true);
      document.removeEventListener("pointerout", this.onPointerOut, true);
      document.removeEventListener("pointercancel", this.clear, true);
      window.removeEventListener("blur", this.clear);
      document.removeEventListener("visibilitychange", this.clear);
      this.clear();
   }

   public update(unscaled: number): void {
      const options = this.getOptions();
      const pointer = this.pointerPosition;
      if (!options || !pointer || options.edgeSize <= 0 || options.speed <= 0) {
         return;
      }
      const bounds = this.domElement.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) {
         this.clear();
         return;
      }
      const { screenWidth, screenHeight } = this.camera;
      const x = clamp((pointer.x - bounds.left) / bounds.width, 0, 1) * screenWidth;
      const y = clamp((pointer.y - bounds.top) / bounds.height, 0, 1) * screenHeight;
      const dx = clamp(1 - (screenWidth - x) / options.edgeSize, 0, 1) - clamp(1 - x / options.edgeSize, 0, 1);
      const dy = clamp(1 - (screenHeight - y) / options.edgeSize, 0, 1) - clamp(1 - y / options.edgeSize, 0, 1);
      const length = Math.hypot(dx, dy);
      if (length === 0) {
         return;
      }
      const distance = (options.speed * Math.min(unscaled, 0.05)) / Math.max(1, length);
      this.camera.moveBy({ x: dx * distance, y: dy * distance });
   }
}
