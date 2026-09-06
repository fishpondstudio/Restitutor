import { formatNumber } from "@project/shared/src/utils/Helper";
import { Controls, ReactFlow, SmoothStepEdge, useEdgesState, useNodesState } from "@xyflow/react";
import { GameStateUpdated } from "../game/Events";
import { makeFamilyTree } from "../game/logic/GovernorLogic";
import { G } from "../utils/Global";
import { useTypedEvent } from "../utils/Hook";
import { ModalTitleBar } from "../utils/ModalManager";
import "@xyflow/react/dist/style.css";
import "./FamilyTreeSingletonModal.css";
import type React from "react";
import { DivorceAction, DivorceChristianityCost, DivorceGameEffect } from "../game/actions/SpouseActions";
import { ProvinceResourceNames } from "../game/definitions/Province";
import { getGameEffectDesc } from "../game/GameEffect";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FamilyNode } from "./FamilyNode";
import { ModalFullHeight } from "./UIConstant";

export function FamilyTreeSingletonModal(): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   useTypedEvent(GameStateUpdated, () => {
      const tree = makeFamilyTree(state.governor);
      setNodes(tree.nodes);
      setEdges(tree.edges);
   });
   const tree = makeFamilyTree(state.governor);
   const [nodes, setNodes, onNodesChange] = useNodesState(tree.nodes);
   const [edges, setEdges, onEdgesChange] = useEdgesState(tree.edges);
   return (
      <div className="modal panel xl">
         <ModalTitleBar title={$t(L.FamilyTree)} dismiss />
         <div style={{ width: "100%", height: ModalFullHeight }}>
            <ReactFlow
               colorMode="dark"
               nodesConnectable={false}
               nodesDraggable={false}
               nodesFocusable={false}
               edgesFocusable={false}
               edgesReconnectable={false}
               zoomOnDoubleClick={false}
               nodeTypes={{ FamilyNode }}
               nodes={nodes}
               edges={edges}
               onNodesChange={onNodesChange}
               onEdgesChange={onEdgesChange}
               edgeTypes={{ default: SmoothStepEdge }}
               proOptions={{ hideAttribution: true }}
               fitView
               fitViewOptions={{ maxZoom: 1 }}
            >
               <Controls
                  orientation="horizontal"
                  position="top-left"
                  showInteractive={false}
                  showZoom={false}
                  showFitView={true}
               >
                  <ActionButton
                     action={DivorceAction(G.save.state.playerProvince, G.save)}
                     tooltip={(element) => (
                        <>
                           <div className="h3">{$t(L.DivorcingHasTheFollowingEffects)}</div>
                           <div className="m10">
                              {getGameEffectDesc(DivorceGameEffect, G.save.state.playerProvince, G.save)}
                           </div>
                           <div className="m10 text-dimmed">
                              {$t(
                                 L.DivorceCostForChristianProvince$1$2,
                                 formatNumber(DivorceChristianityCost),
                                 ProvinceResourceNames.christianity(),
                              )}
                           </div>
                           {element}
                        </>
                     )}
                  >
                     {$t(L.Divorce)}
                  </ActionButton>
               </Controls>
            </ReactFlow>
         </div>
      </div>
   );
}
