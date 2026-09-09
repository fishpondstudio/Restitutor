import { entriesOf } from "@project/shared/src/utils/Helper";
import type { IShortcutConfig } from "../game/ShortcutDefinition";
import type { Camera } from "./Camera";
import { G } from "./Global";
import type { SceneLifecycle } from "./SceneLifecycle";

export type WASDBindings = Partial<Record<"up" | "down" | "left" | "right", IShortcutConfig>>;

const WASDDirections = {
   up: { x: 0, y: -1 },
   down: { x: 0, y: 1 },
   left: { x: -1, y: 0 },
   right: { x: 1, y: 0 },
};

export class WASDMovement implements SceneLifecycle {
   private readonly keys = new Map<string, keyof WASDBindings>();
   private readonly velocity = { x: 0, y: 0 };

   constructor(
      private readonly camera: Camera,
      private readonly getBindings: () => WASDBindings | undefined,
   ) {}

   private clear = (): void => {
      this.keys.clear();
      this.velocity.x = 0;
      this.velocity.y = 0;
   };

   private onKey = (e: KeyboardEvent): void => {
      const bindings = this.getBindings();
      if (!bindings) {
         this.clear();
         return;
      }
      const matchesModifiers = (binding: IShortcutConfig) =>
         binding.ctrl === e.ctrlKey &&
         binding.alt === e.altKey &&
         binding.shift === e.shiftKey &&
         binding.meta === e.metaKey;
      for (const [code, direction] of this.keys) {
         const binding = bindings[direction];
         if ((e.type === "keyup" && e.code === code) || !binding || !matchesModifiers(binding)) {
            this.keys.delete(code);
         }
      }
      if (e.type !== "keydown" || e.defaultPrevented) {
         return;
      }
      for (const [direction] of entriesOf(WASDDirections)) {
         const binding = bindings[direction];
         if (binding && matchesModifiers(binding) && binding.key.toUpperCase() === e.key.toUpperCase()) {
            if (!e.repeat) {
               this.keys.set(e.code, direction);
            }
            e.preventDefault();
            break;
         }
      }
   };

   public onEnable(): void {
      window.addEventListener("keydown", this.onKey);
      window.addEventListener("keyup", this.onKey);
      window.addEventListener("blur", this.clear);
      document.addEventListener("visibilitychange", this.clear);
      document.addEventListener("focusin", this.clear);
   }

   public onDisable(): void {
      window.removeEventListener("keydown", this.onKey);
      window.removeEventListener("keyup", this.onKey);
      window.removeEventListener("blur", this.clear);
      document.removeEventListener("visibilitychange", this.clear);
      document.removeEventListener("focusin", this.clear);
      this.clear();
   }

   public update(unscaled: number): void {
      const velocity = this.velocity;
      if (this.keys.size === 0 && velocity.x === 0 && velocity.y === 0) {
         return;
      }
      if (!this.getBindings()) {
         this.clear();
         return;
      }
      let x = 0;
      let y = 0;
      for (const direction of this.keys.values()) {
         x += WASDDirections[direction].x;
         y += WASDDirections[direction].y;
      }
      const { wasdMovementSpeed: mapMovementSpeed, wasdMovementResponsiveness: mapMovementResponsiveness } =
         G.save.options;
      const length = Math.hypot(x, y);
      if (length > 0) {
         x *= mapMovementSpeed / length;
         y *= mapMovementSpeed / length;
      }
      const smoothing = 1 - Math.exp(-mapMovementResponsiveness * unscaled);
      velocity.x += (x - velocity.x) * smoothing;
      velocity.y += (y - velocity.y) * smoothing;
      if (length === 0 && Math.hypot(velocity.x, velocity.y) < 1) {
         velocity.x = 0;
         velocity.y = 0;
         return;
      }
      this.camera.moveBy({ x: velocity.x * unscaled, y: velocity.y * unscaled });
   }
}
