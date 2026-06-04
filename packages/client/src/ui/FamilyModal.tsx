import { Controls, ReactFlow, SmoothStepEdge } from "@xyflow/react";
import { GameStateUpdated } from "../game/Events";
import { makeFamilyTree } from "../game/logic/GovernorLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import "@xyflow/react/dist/style.css";
import "./FamilyModal.css";
import type React from "react";
import { $t, L } from "../utils/i18n";
import { FamilyNode } from "./FamilyNode";

export function FamilyTreeModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const { nodes, edges } = makeFamilyTree(state.governor);
   return (
      <ModalComp size="xl" title={<ModalTitleBar title={$t(L.FamilyTree)} dismiss />}>
         <div style={{ width: "100%", height: "calc(80vh - 50px)" }}>
            <ReactFlow
               colorMode="dark"
               nodesConnectable={false}
               nodesDraggable={false}
               nodesFocusable={false}
               edgesFocusable={false}
               edgesReconnectable={false}
               nodeTypes={{ FamilyNode }}
               nodes={nodes}
               edges={edges}
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
