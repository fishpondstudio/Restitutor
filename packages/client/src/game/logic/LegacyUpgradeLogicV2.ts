import { forEach } from "@project/shared/src/utils/Helper";
import type { IHaveXY } from "@project/shared/src/utils/Vector2";
import { type Edge, MarkerType, type Node } from "@xyflow/react";
import { LegacyUpgrades } from "../definitions/LegacyUpgradeV2";

export const LegacyUpgradeNodeWidth = 160;
export const LegacyUpgradeNodeHeight = 90;
export const LegacyUpgradeNodeSpacingX = 90;
export const LegacyUpgradeNodeSpacingY = 90;

export function makeLegacyUpgradeNodes(): { nodes: Node[]; edges: Edge[] } {
   const nodes: Node[] = [];
   const edges: Edge[] = [];
   forEach(LegacyUpgrades, (upgrade, def) => {
      nodes.push({
         id: upgrade,
         data: { legacyUpgrade: upgrade },
         type: "LegacyUpgradeNode",
         position: {
            x: def.position.x * (LegacyUpgradeNodeWidth + LegacyUpgradeNodeSpacingX),
            y: def.position.y * (LegacyUpgradeNodeHeight + LegacyUpgradeNodeSpacingY),
         },
      });

      def.requires.forEach((required) => {
         const sourceDef = LegacyUpgrades[required];
         const targetDef = def;
         const handles = getHandles(sourceDef, targetDef);
         if (!handles) {
            console.error(`Invalid position for edge ${required}->${upgrade}. Check the position of both nodes!`);
         } else {
            edges.push({
               id: `${required}->${upgrade}`,
               source: required,
               target: upgrade,
               ...handles,
               markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--mantine-color-dark-3)" },
               style: {
                  strokeWidth: 2,
                  stroke: "var(--mantine-color-dark-3)",
               },
            });
         }
      });
   });
   return { nodes, edges };
}
export function getHandles(
   source: { position: IHaveXY },
   target: { position: IHaveXY },
): { sourceHandle: string; targetHandle: string } | undefined {
   let sourceHandle = "";
   let targetHandle = "";
   if (source.position.y === target.position.y) {
      if (source.position.x < target.position.x) {
         sourceHandle = "RightSource";
         targetHandle = "LeftTarget";
      }
      if (source.position.x > target.position.x) {
         sourceHandle = "LeftSource";
         targetHandle = "RightTarget";
      }
      return { sourceHandle, targetHandle };
   }
   if (source.position.x === target.position.x) {
      if (source.position.y < target.position.y) {
         sourceHandle = "BottomSource";
         targetHandle = "TopTarget";
      }
      if (source.position.y > target.position.y) {
         sourceHandle = "TopSource";
         targetHandle = "BottomTarget";
      }
      return { sourceHandle, targetHandle };
   }
   return undefined;
}
