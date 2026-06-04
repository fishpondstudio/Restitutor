import { type CollisionDetector, CollisionPriority, CollisionType } from "@dnd-kit/abstract";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { range, useForceUpdate } from "@mantine/hooks";
import { createTile, type Tile, tileToPoint } from "@project/shared/src/utils/Helper";
import { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useState } from "react";
import AntoninusPius from "../assets/images/relics/AntoninusPius.webp";
import Aquila from "../assets/images/relics/Aquila.webp";
import Augustus from "../assets/images/relics/Augustus.webp";
import CapitolineWolf from "../assets/images/relics/CapitolineWolf.webp";
import Dodecahedron from "../assets/images/relics/Dodecahedron.webp";
import EquestrianStatueOfMarcusAurelius from "../assets/images/relics/EquestrianStatueOfMarcusAurelius.webp";
import Hadrian from "../assets/images/relics/Hadrian.webp";
import JuliusCaesar from "../assets/images/relics/JuliusCaesar.webp";
import PompeiiGladius from "../assets/images/relics/PompeiiGladius.webp";
import PortlandVase from "../assets/images/relics/PortlandVase.webp";
import TrajansColumn from "../assets/images/relics/TrajansColumn.webp";
import Vespasian from "../assets/images/relics/Vespasian.webp";
import { useTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";

export function RelicModal(): React.ReactNode {
   const forceUpdate = useForceUpdate();
   return (
      <ModalComp size="xl" title={<ModalTitleBar title={$t(L.Relic)} dismiss />}>
         <DragDropProvider
            onDragMove={(e) => {
               if (e.operation.target) {
                  const sourceId = e.operation.source?.id as string | undefined;
                  const sourceWidth = e.operation.source?.data?.width as number | undefined;
                  const sourceHeight = e.operation.source?.data?.height as number | undefined;
                  if (!sourceWidth || !sourceHeight) {
                     return;
                  }
                  const targetPoint = tileToPoint(e.operation.target.id as number);
                  if (
                     canFit(
                        { x: targetPoint.x, y: targetPoint.y, width: sourceWidth, height: sourceHeight },
                        placedRelics,
                        GridSize,
                        sourceId,
                     )
                  ) {
                     const ids = new Set<number>();
                     for (let x = 0; x < sourceWidth; x++) {
                        for (let y = 0; y < sourceHeight; y++) {
                           ids.add(createTile(targetPoint.x + x, targetPoint.y + y));
                        }
                     }
                     relicMoved.emit({ relicId: sourceId, tiles: ids });
                  } else {
                     relicMoved.emit({ relicId: sourceId, tiles: new Set<Tile>() });
                  }
               }
            }}
            onDragEnd={(e) => {
               const target = e.operation.target;
               const source = e.operation.source;
               if (source && target) {
                  const targetWidth = source.data.width as number;
                  const targetHeight = source.data.height as number;
                  const targetPoint = tileToPoint(target.id as number);
                  if (
                     canFit(
                        { x: targetPoint.x, y: targetPoint.y, width: targetWidth, height: targetHeight },
                        placedRelics,
                        GridSize,
                        source.id as string,
                     )
                  ) {
                     placedRelics.set(source.id as string, {
                        x: targetPoint.x,
                        y: targetPoint.y,
                        width: source.data.width,
                        height: source.data.height,
                     });
                     relicUpdated.emit();
                     forceUpdate();
                  }
               }
               if (source && !target) {
                  placedRelics.delete(source.id as string);
                  forceUpdate();
               }
               relicMoved.emit({ relicId: source?.id as string | undefined, tiles: new Set<Tile>() });
            }}
         >
            <div className="row m5 g5 fstart">
               <div style={{ position: "relative" }}>
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${GridSize}, ${GridItemSize}px)`,
                     }}
                  >
                     {range(0, GridSize * GridSize - 1).map((i) => {
                        const x = i % GridSize;
                        const y = Math.floor(i / GridSize);
                        const id = createTile(x, y);
                        return <GridItem key={id} id={id} />;
                     })}
                  </div>
                  {Array.from(placedRelics.entries()).map(([id, { x, y, width, height }]) => {
                     return (
                        <RelicItem
                           key={id}
                           id={id}
                           style={{
                              position: "absolute",
                              top: y * GridItemSize,
                              left: x * GridItemSize,
                           }}
                        />
                     );
                  })}
               </div>
               <div className="divider vertical" />
               <div
                  className="f1 m5"
                  style={{
                     display: "flex",
                     flexDirection: "row",
                     flexWrap: "wrap",
                     placeItems: "flex-start",
                     gap: 10,
                  }}
               >
                  {Array.from(Object.entries(Relics)).map(([key, size]) => {
                     if (placedRelics.has(key)) {
                        return null;
                     }
                     return <RelicItem key={key} id={key} />;
                  })}
               </div>
            </div>
         </DragDropProvider>
      </ModalComp>
   );
}

function GridItem({ id }: { id: number }): React.ReactNode {
   const [isHighlighted, setIsHighlighted] = useState(false);
   const [isUsed, setIsUsed] = useState(false);

   useTypedEvent(relicMoved, ({ relicId, tiles }) => {
      const shouldHighlight = tiles.has(id);
      if (shouldHighlight !== isHighlighted) {
         setIsHighlighted(shouldHighlight);
      }
      const shouldUsed = isTileUsed(id, placedRelics, relicId);
      if (shouldUsed !== isUsed) {
         setIsUsed(shouldUsed);
      }
   });

   useTypedEvent(relicUpdated, () => {
      const shouldUsed = isTileUsed(id, placedRelics);
      if (shouldUsed !== isUsed) {
         setIsUsed(shouldUsed);
      }
   });

   const { ref } = useDroppable({
      id,
      collisionDetector: collisionDetectorTopLeftCorner,
   });
   return (
      <div ref={ref}>
         <div
            style={{
               margin: 2,
               borderRadius: 4,
               aspectRatio: "1 / 1",
               border: isHighlighted ? "2px solid yellow" : "1px solid gray",
               color: isHighlighted ? "yellow" : "gray",
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               visibility: isUsed ? "hidden" : "visible",
            }}
         ></div>
      </div>
   );
}

function RelicItem({ id, style }: { id: string; style?: React.CSSProperties }): React.ReactNode {
   const relic = Relics[id as keyof typeof Relics];
   const { ref } = useDraggable({
      id: id,
      data: {
         width: relic.width,
         height: relic.height,
      },
   });

   return (
      <div
         onClick={() => {
            const placed = placedRelics.get(id);
            if (placed) {
               const adjacentRects = getAdjacentRects([id, placed], placedRelics);
               console.log(adjacentRects);
            }
         }}
         ref={ref}
         style={{
            flexShrink: 0,
            width: relic.width * GridItemSize,
            height: relic.height * GridItemSize,
            borderRadius: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...style,
         }}
      >
         <img src={relic.image} alt={id} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
      </div>
   );
}

const relicMoved = new TypedEvent<{ relicId: string | undefined; tiles: Set<Tile> }>();
const relicUpdated = new TypedEvent<void>();
const placedRelics = new Map<string, { x: number; y: number; width: number; height: number }>();

interface IRelic {
   width: number;
   height: number;
   image: string;
}

const Relics = {
   "Relic 1": { width: 2, height: 1, image: CapitolineWolf },
   "Relic 2": { width: 1, height: 2, image: Augustus },
   "Relic 4": { width: 1, height: 2, image: EquestrianStatueOfMarcusAurelius },
   "Relic 6": { width: 1, height: 1, image: Aquila },
   "Relic 7": { width: 1, height: 1, image: PortlandVase },
   "Relic 8": { width: 2, height: 1, image: PompeiiGladius },
   "Relic 9": { width: 1, height: 1, image: Vespasian },
   "Relic 10": { width: 1, height: 2, image: JuliusCaesar },
   "Relic 11": { width: 1, height: 2, image: Hadrian },
   "Relic 3": { width: 1, height: 5, image: TrajansColumn },
   "Relic 12": { width: 1, height: 1, image: AntoninusPius },
   "Relic 14": { width: 1, height: 1, image: Dodecahedron },
} as const satisfies Record<string, IRelic>;

const GridSize = 10;
const GridItemSize = 50;

interface IRect {
   x: number;
   y: number;
   width: number;
   height: number;
}

function canFit<T extends string | number>(
   rect: IRect,
   existingRects: Map<T, IRect>,
   gridSize: number,
   excludeId?: T,
): boolean {
   if (rect.x < 0 || rect.x + rect.width > gridSize || rect.y < 0 || rect.y + rect.height > gridSize) {
      return false;
   }
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         rect.x < existingRect.x + existingRect.width &&
         rect.x + rect.width > existingRect.x &&
         rect.y < existingRect.y + existingRect.height &&
         rect.y + rect.height > existingRect.y
      ) {
         return false;
      }
   }
   return true;
}

function isTileUsed<T extends string | number>(tile: Tile, existingRects: Map<T, IRect>, excludeId?: T): boolean {
   const { x, y } = tileToPoint(tile);
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         existingRect.x <= x &&
         existingRect.x + existingRect.width > x &&
         existingRect.y <= y &&
         existingRect.y + existingRect.height > y
      ) {
         return true;
      }
   }
   return false;
}

function getAdjacentRects<T extends string | number>(rect: [T, IRect], existingRects: Map<T, IRect>): [T, IRect][] {
   const [currId, currRect] = rect;
   const result: [T, IRect][] = [];
   // Convert current rect to a set of tiles
   const currTiles = new Set<Tile>();
   for (let dx = 0; dx < currRect.width; dx++) {
      for (let dy = 0; dy < currRect.height; dy++) {
         currTiles.add(createTile(currRect.x + dx, currRect.y + dy));
      }
   }

   for (const [otherId, otherRect] of existingRects) {
      if (otherId === currId) continue;

      // For each edge tile of the other rect, check if it's adjacent
      let isAdjacent = false;
      outer: for (let dx = 0; dx < otherRect.width; dx++) {
         for (let dy = 0; dy < otherRect.height; dy++) {
            const ox = otherRect.x + dx;
            const oy = otherRect.y + dy;
            // Four sides: up, down, left, right
            const neighbors = [
               [ox + 1, oy],
               [ox - 1, oy],
               [ox, oy + 1],
               [ox, oy - 1],
            ];
            for (const [nx, ny] of neighbors) {
               if (currTiles.has(createTile(nx, ny))) {
                  isAdjacent = true;
                  break outer;
               }
            }
         }
      }
      if (isAdjacent) {
         result.push([otherId, otherRect]);
      }
   }
   return result;
}

const collisionDetectorTopLeftCorner: CollisionDetector = (input) => {
   const { dragOperation, droppable } = input;
   const { shape, position } = dragOperation;
   if (!droppable.shape) {
      return null;
   }
   let p1 = position.current;
   if (shape) {
      p1 = { x: shape.current.boundingRectangle.top, y: shape.current.boundingRectangle.left };
   }
   const p2 = { x: droppable.shape.boundingRectangle.top, y: droppable.shape.boundingRectangle.left };
   const distanceX = Math.abs(p1.x - p2.x);
   const distanceY = Math.abs(p1.y - p2.y);
   if (distanceX > droppable.shape.boundingRectangle.width || distanceY > droppable.shape.boundingRectangle.height) {
      return null;
   }
   const distance = distanceX + distanceY;
   return {
      id: droppable.id,
      value: 1 / distance,
      type: CollisionType.Collision,
      priority: CollisionPriority.Normal,
   };
};
