import { Controls, ReactFlow, SmoothStepEdge } from "@xyflow/react";
import {
   LegacyUpgradeNodeHeight,
   LegacyUpgradeNodeWidth,
   makeLegacyUpgradeNodes,
} from "../game/logic/LegacyUpgradeLogicV2";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { LegacyUpgradeNode } from "./LegacyUpgradeNode";
import "./LegacyUpgradeModal.css";
import { GameStateUpdated } from "../game/Events";
import { refreshOnTypedEvent } from "../utils/Hook";

const { nodes, edges } = makeLegacyUpgradeNodes();

export function LegacyUpgradeModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <ModalComp size="xl" title={<ModalTitleBar title="Legacy Upgrades" dismiss />}>
         <div style={{ width: "100%", height: "calc(80vh - 50px)" }}>
            <ReactFlow
               colorMode="dark"
               nodesConnectable={false}
               nodesDraggable={false}
               nodesFocusable={false}
               edgesFocusable={false}
               edgesReconnectable={false}
               nodes={nodes}
               edges={edges}
               nodeTypes={{ LegacyUpgradeNode }}
               edgeTypes={{ default: SmoothStepEdge }}
               proOptions={{ hideAttribution: true }}
               fitView
            >
               <Controls showInteractive={false} showZoom={false} showFitView={true} />
            </ReactFlow>
         </div>
      </ModalComp>
   );
}

document.documentElement.style.setProperty("--legacy-upgrade-node-width", `${LegacyUpgradeNodeWidth}px`);
document.documentElement.style.setProperty("--legacy-upgrade-node-height", `${LegacyUpgradeNodeHeight}px`);
