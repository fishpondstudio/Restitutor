import { autoPlacement, getOverflowAncestors, offset, type Placement, shift, useFloating } from "@floating-ui/react";
import { type Factory, factory, getRefProp, isElement, Portal } from "@mantine/core";
import { useMergedRef } from "@mantine/hooks";
import { cls } from "@project/shared/src/utils/Helper";
import { cloneElement, memo, useCallback, useEffect, useRef, useState } from "react";

export function useFloatingTooltip<T extends HTMLElement = any>({ position }: { position: Placement }) {
   const [opened, setOpened] = useState(false);
   const boundaryRef = useRef<T>(null);
   const cursorRef = useRef({ x: 0, y: 0 });
   const placementRef = useRef(position);
   const animationFrameRef = useRef<number | null>(null);
   const [positionReference] = useState(() => ({
      getBoundingClientRect() {
         const { x, y } = cursorRef.current;
         return {
            width: 0,
            height: 0,
            x,
            y,
            left: x,
            // if placement is bottom, add 20px to offset cursor size!
            top: y + (placementRef.current.includes("bottom") ? 20 : 0),
            right: x,
            bottom: y,
         };
      },
   }));

   const { x, y, elements, refs, update, placement } = useFloating({
      placement: position,
      middleware: [
         offset(40),
         shift({ padding: 20 }),
         autoPlacement(),
         // flip({
         //    crossAxis: "alignment",
         //    fallbackAxisSideDirection: "end",
         //    padding: 10,
         // }),
      ],
   });

   const { setPositionReference } = refs;

   useEffect(() => {
      setPositionReference(positionReference);
   }, [setPositionReference, positionReference]);

   useEffect(() => {
      placementRef.current = placement;
   }, [placement]);

   const scheduleUpdate = useCallback(() => {
      if (!refs.floating.current || animationFrameRef.current !== null) {
         return;
      }
      animationFrameRef.current = requestAnimationFrame(() => {
         animationFrameRef.current = null;
         update();
      });
   }, [refs.floating, update]);

   const handleMouseMove = useCallback(
      ({ clientX, clientY }: MouseEvent | React.MouseEvent<T, MouseEvent>) => {
         cursorRef.current.x = clientX;
         cursorRef.current.y = clientY;
         scheduleUpdate();
      },
      [scheduleUpdate],
   );

   useEffect(() => {
      const boundary = boundaryRef.current;
      if (!opened || !elements.floating || !boundary) {
         return;
      }

      boundary.addEventListener("mousemove", handleMouseMove);
      const parents = getOverflowAncestors(elements.floating);
      parents.forEach((parent) => {
         parent.addEventListener("scroll", scheduleUpdate);
      });

      return () => {
         boundary.removeEventListener("mousemove", handleMouseMove);
         parents.forEach((parent) => {
            parent.removeEventListener("scroll", scheduleUpdate);
         });
         if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
         }
      };
   }, [elements.floating, handleMouseMove, opened, scheduleUpdate]);

   return { handleMouseMove, x, y, opened, setOpened, boundaryRef, floating: refs.setFloating };
}

const FloatingTipContent = memo(({ label }: { label: () => React.ReactNode }) => <>{label()}</>);

export const FloatingTip = factory<
   Factory<{
      props: {
         className?: string;
         label: () => React.ReactNode;
         children: React.ReactNode;
         position?: Placement;
         disabled?: boolean;
         fixedWidth?: boolean;
         style?: React.CSSProperties;
      };
   }>
>(({ label, children, disabled, fixedWidth, style, className, position = "bottom", ref }) => {
   const { handleMouseMove, x, y, opened, boundaryRef, floating, setOpened } = useFloatingTooltip({ position });

   if (!isElement(children)) {
      throw new Error(
         "FloatingTip component children should be an element or a component that accepts ref, fragments, strings, numbers and other primitive values are not supported",
      );
   }

   const targetRef = useMergedRef(boundaryRef, getRefProp(children), ref);
   const _childrenProps = children.props as any;

   const onMouseEnter = (event: React.MouseEvent<unknown, MouseEvent>) => {
      _childrenProps.onMouseEnter?.(event);
      handleMouseMove(event);
      setOpened(true);
   };

   const onMouseLeave = (event: React.MouseEvent<unknown, MouseEvent>) => {
      _childrenProps.onMouseLeave?.(event);
      setOpened(false);
   };

   useEffect(() => {
      return () => {
         setOpened(false);
      };
   }, [setOpened]);

   const shouldShow = !disabled && opened;

   return (
      <>
         {shouldShow && (
            <Portal reuseTargetNode>
               <div
                  className={cls("floating-tip panel", className)}
                  style={{
                     ...style,
                     top: 0,
                     left: 0,
                     transform: `translate(${Math.round(x ?? 0)}px, ${Math.round(y ?? 0)}px)`,
                     width: fixedWidth ? "18.75rem" : style?.width,
                     maxWidth: fixedWidth ? "18.75rem" : style?.maxWidth,
                  }}
                  ref={floating}
               >
                  <FloatingTipContent label={label} />
               </div>
            </Portal>
         )}

         {cloneElement(children, {
            ..._childrenProps,
            ref: targetRef,
            onMouseEnter,
            onMouseLeave,
         })}
      </>
   );
});
