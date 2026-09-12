import { autoPlacement, autoUpdate, offset, shift, useFloating } from "@floating-ui/react";
import { Portal } from "@mantine/core";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GameStateUpdated, OnResize, OnSceneSwitched, ShowModal } from "../game/Events";
import type { IWar } from "../game/logic/WarLogic";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { hasOpenModal } from "../utils/ModalManager";
import { WarTooltip } from "./WarTooltip";

export function WorldWarTooltip(): React.ReactNode {
   const [war, setWar] = useState<IWar | undefined>(undefined);
   const cursorRef = useRef<{ clientX: number; clientY: number } | null>(null);
   refreshOnTypedEvent(OnSceneSwitched);
   const scene = G.scene?.getCurrent(WorldScene);
   const { refs, floatingStyles, update } = useFloating({
      strategy: "fixed",
      placement: "bottom",
      middleware: [
         offset(({ placement }) => (placement.startsWith("bottom") ? 60 : 40)),
         autoPlacement(),
         shift({ padding: 20 }),
      ],
      whileElementsMounted: autoUpdate,
   });

   const { setPositionReference } = refs;

   useLayoutEffect(() => {
      if (!scene) {
         return;
      }
      setPositionReference({
         getBoundingClientRect: () =>
            new DOMRect(cursorRef.current?.clientX ?? 0, cursorRef.current?.clientY ?? 0, 0, 0),
         contextElement: G.pixi.view as HTMLCanvasElement,
      });
      return () => setPositionReference(null);
   }, [scene, setPositionReference]);

   useEffect(() => {
      cursorRef.current = null;
      setWar(undefined);
      if (!scene) {
         return;
      }
      const canvas = G.pixi.view as HTMLCanvasElement;
      let animationFrame: number | null = null;
      const cancelUpdate = () => {
         if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
         }
      };
      const clear = () => {
         cursorRef.current = null;
         cancelUpdate();
         setWar(undefined);
      };
      const scheduleUpdate = () => {
         if (!cursorRef.current || animationFrame !== null) {
            return;
         }
         animationFrame = requestAnimationFrame(() => {
            animationFrame = null;
            const cursor = cursorRef.current;
            if (!cursor || hasOpenModal()) {
               clear();
               return;
            }
            const bounds = canvas.getBoundingClientRect();
            const hoveredWar = scene.getWarFromScreenPosition({
               x: ((cursor.clientX - bounds.left) * G.pixi.screen.width) / bounds.width,
               y: ((cursor.clientY - bounds.top) * G.pixi.screen.height) / bounds.height,
            });
            setWar(hoveredWar);
            if (hoveredWar) {
               update();
            }
         });
      };
      const onMouseMove = (event: MouseEvent) => {
         if (event.buttons !== 0 || hasOpenModal()) {
            clear();
            return;
         }
         cursorRef.current = { clientX: event.clientX, clientY: event.clientY };
         scheduleUpdate();
      };
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseleave", clear);
      canvas.addEventListener("mousedown", clear);
      window.addEventListener("blur", clear);
      scene.viewport.on("moved", scheduleUpdate);
      scene.viewport.on("zoomed", scheduleUpdate);
      GameStateUpdated.on(scheduleUpdate);
      OnResize.on(scheduleUpdate);
      ShowModal.on(clear);
      return () => {
         cancelUpdate();
         cursorRef.current = null;
         canvas.removeEventListener("mousemove", onMouseMove);
         canvas.removeEventListener("mouseleave", clear);
         canvas.removeEventListener("mousedown", clear);
         window.removeEventListener("blur", clear);
         scene.viewport.off("moved", scheduleUpdate);
         scene.viewport.off("zoomed", scheduleUpdate);
         GameStateUpdated.off(scheduleUpdate);
         OnResize.off(scheduleUpdate);
         ShowModal.off(clear);
      };
   }, [scene, update]);

   if (!war || !scene || hasOpenModal()) {
      return null;
   }
   return (
      <Portal reuseTargetNode>
         <div
            ref={refs.setFloating}
            className="floating-tip panel p0"
            style={{ ...floatingStyles, width: "18.75rem", pointerEvents: "none" }}
         >
            <WorldWarTooltipContent war={war} />
         </div>
      </Portal>
   );
}

const WorldWarTooltipContent = memo(function WorldWarTooltipContent({ war }: { war: IWar }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return <WarTooltip war={war} />;
});
