import { cls } from "@project/shared/src/utils/Helper";
import {
   type EdgeProps,
   getStraightPath,
   Handle,
   type Node,
   type NodeProps,
   Position,
   useInternalNode,
} from "@xyflow/react";
import { type LegacyUpgrade, LegacyUpgrades } from "../game/definitions/LegacyUpgrade";
import { GameStateUpdated } from "../game/Events";
import {
   canUpgradeLegacyUpgrade,
   getLegacyUpgradeCost,
   getLegacyUpgradeName,
   LegacyUpgradeNodeHeight,
   LegacyUpgradeNodeWidth,
} from "../game/logic/LegacyUpgradeLogic";
import { trySpendProvinceResources } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { FloatingTip } from "./components/FloatingTip";

export type LegacyUpgradeNode = Node<{ legacyUpgrade: LegacyUpgrade }, "LegacyUpgradeNode">;

const showDebug = import.meta.env.DEV;
// const showDebug = false;

export function LegacyUpgradeNode({ data }: NodeProps<LegacyUpgradeNode>): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const def = LegacyUpgrades[data.legacyUpgrade];
   let status = "";
   const upgradeCondition = canUpgradeLegacyUpgrade(data.legacyUpgrade, G.save.state.playerProvince, G.save);
   if (state.legacyUpgrades.has(data.legacyUpgrade)) {
      status = "upgraded";
   } else if (upgradeCondition.value) {
      status = "can-upgrade";
   }

   return (
      <FloatingTip
         w={300}
         className="p0"
         disabled={state.legacyUpgrades.has(data.legacyUpgrade)}
         label={
            <>
               <div className="m10">{getLegacyUpgradeName(data.legacyUpgrade)}</div>
               <div className="divider" />
               <div className="my10">
                  <ConditionBreakdownComp condition={upgradeCondition} />
               </div>
            </>
         }
      >
         <div
            className={cls("legacy-upgrade-node", status)}
            onClick={() => {
               if (state.legacyUpgrades.has(data.legacyUpgrade)) {
                  return;
               }
               if (!upgradeCondition.value) {
                  return;
               }
               if (
                  trySpendProvinceResources(
                     { legacy: getLegacyUpgradeCost(G.save.state.playerProvince, G.save) },
                     G.save.state.playerProvince,
                     G.save,
                  )
               ) {
                  state.legacyUpgrades.add(data.legacyUpgrade);
                  GameStateUpdated.emit();
               }
            }}
         >
            {getLegacyUpgradeName(data.legacyUpgrade)}
            {showDebug && (
               <div className="upgrade-id">
                  {data.legacyUpgrade} ({def.position.x},{def.position.y})
               </div>
            )}
            <Handle
               className="legacy-upgrade-node-handle"
               type="source"
               position={Position.Top}
               isConnectable={false}
            />
            <Handle
               className="legacy-upgrade-node-handle"
               type="target"
               position={Position.Bottom}
               isConnectable={false}
            />
         </div>
      </FloatingTip>
   );
}

export function FloatingEdge({ id, source, target, markerEnd, style }: EdgeProps): React.ReactNode {
   const sourceNode = useInternalNode<LegacyUpgradeNode>(source);
   const targetNode = useInternalNode<LegacyUpgradeNode>(target);

   if (!sourceNode || !targetNode) {
      return null;
   }

   const sourceLeft = sourceNode.position.x;
   const sourceTop = sourceNode.position.y;
   const sourceRight = sourceLeft + LegacyUpgradeNodeWidth;
   const sourceBottom = sourceTop + LegacyUpgradeNodeHeight;

   const targetLeft = targetNode.position.x;
   const targetTop = targetNode.position.y;
   const targetRight = targetLeft + LegacyUpgradeNodeWidth;
   const targetBottom = targetTop + LegacyUpgradeNodeHeight;

   const overlapX = Math.max(0, Math.min(sourceRight, targetRight) - Math.max(sourceLeft, targetLeft));
   const overlapY = Math.max(0, Math.min(sourceBottom, targetBottom) - Math.max(sourceTop, targetTop));

   let sourceX: number;
   let sourceY: number;
   let targetX: number;
   let targetY: number;

   if (overlapY > 0) {
      // Same row
      sourceY = targetY = (Math.max(sourceTop, targetTop) + Math.min(sourceBottom, targetBottom)) / 2;
      if (sourceLeft < targetLeft) {
         sourceX = sourceRight;
         targetX = targetLeft;
      } else {
         sourceX = sourceLeft;
         targetX = targetRight;
      }
   } else if (overlapX > 0) {
      // Same column
      sourceX = targetX = (Math.max(sourceLeft, targetLeft) + Math.min(sourceRight, targetRight)) / 2;
      if (sourceTop < targetTop) {
         sourceY = sourceBottom;
         targetY = targetTop;
      } else {
         sourceY = sourceTop;
         targetY = targetBottom;
      }
   } else if (sourceLeft < targetLeft) {
      if (sourceTop < targetTop) {
         sourceX = sourceRight;
         sourceY = sourceBottom;
         targetX = targetLeft;
         targetY = targetTop;
      } else {
         sourceX = sourceRight;
         sourceY = sourceTop;
         targetX = targetLeft;
         targetY = targetBottom;
      }
   } else {
      if (sourceTop < targetTop) {
         sourceX = sourceLeft;
         sourceY = sourceBottom;
         targetX = targetRight;
         targetY = targetTop;
      } else {
         sourceX = sourceLeft;
         sourceY = sourceTop;
         targetX = targetRight;
         targetY = targetBottom;
      }
   }

   const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });

   return <path id={id} d={edgePath} markerEnd={markerEnd} style={style} />;
}
