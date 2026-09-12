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
   const [cursor, setCursor] = useState<{ clientX: number; clientY: number } | null>(null);
   const cursorRef = useRef(cursor);
   refreshOnTypedEvent(OnSceneSwitched);
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(OnResize);
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

   useLayoutEffect(() => {
      const previous = cursorRef.current;
      cursorRef.current = cursor;
      if (cursor && (cursor.clientX !== previous?.clientX || cursor.clientY !== previous?.clientY)) {
         update();
      }
   }, [cursor, update]);

   useLayoutEffect(() => {
      if (!scene) {
         return;
      }
      refs.setPositionReference({
         getBoundingClientRect: () =>
            new DOMRect(cursorRef.current?.clientX ?? 0, cursorRef.current?.clientY ?? 0, 0, 0),
         contextElement: G.pixi.view as HTMLCanvasElement,
      });
      return () => refs.setPositionReference(null);
   }, [scene, refs]);

   useEffect(() => {
      setCursor(null);
      if (!scene) {
         return;
      }
      const canvas = G.pixi.view as HTMLCanvasElement;
      const clear = () => setCursor(null);
      const onMouseMove = (event: MouseEvent) => {
         setCursor(event.buttons === 0 && !hasOpenModal() ? { clientX: event.clientX, clientY: event.clientY } : null);
      };
      const onCameraMoved = () => setCursor((current) => (current ? { ...current } : null));
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseleave", clear);
      canvas.addEventListener("mousedown", clear);
      window.addEventListener("blur", clear);
      scene.viewport.on("moved", onCameraMoved);
      scene.viewport.on("zoomed", onCameraMoved);
      ShowModal.on(clear);
      return () => {
         canvas.removeEventListener("mousemove", onMouseMove);
         canvas.removeEventListener("mouseleave", clear);
         canvas.removeEventListener("mousedown", clear);
         window.removeEventListener("blur", clear);
         scene.viewport.off("moved", onCameraMoved);
         scene.viewport.off("zoomed", onCameraMoved);
         ShowModal.off(clear);
      };
   }, [scene]);

   if (!cursor || !scene || hasOpenModal()) {
      return null;
   }
   const canvas = G.pixi.view as HTMLCanvasElement;
   const bounds = canvas.getBoundingClientRect();
   const war = scene.getWarFromScreenPosition({
      x: ((cursor.clientX - bounds.left) * G.pixi.screen.width) / bounds.width,
      y: ((cursor.clientY - bounds.top) * G.pixi.screen.height) / bounds.height,
   });
   if (!war) {
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
