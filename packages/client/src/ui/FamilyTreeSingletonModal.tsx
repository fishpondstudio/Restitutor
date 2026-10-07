import { formatNumber } from "@project/shared/src/utils/Helper";
import { Controls, ReactFlow, SmoothStepEdge, useEdgesState, useNodesState } from "@xyflow/react";
import { GameStateUpdated } from "../game/Events";
import { makeFamilyTree } from "../game/logic/GovernorLogic";
import { G } from "../utils/Global";
import { useTypedEvent } from "../utils/Hook";
import { ModalTitleBar } from "../utils/ModalManager";
import "@xyflow/react/dist/style.css";
import "./FamilyTreeSingletonModal.css";
import { Popover } from "@mantine/core";
import type React from "react";
import { DivorceAction, DivorceChristianityCost } from "../game/actions/SpouseActions";
import { getResourceName } from "../game/definitions/ProvinceResources";
import { hasScenarioFlag } from "../game/logic/ScenarioLogic";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FamilyNode } from "./FamilyNode";
import { LoversComponent } from "./LoversComponent";
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
                     action={() => DivorceAction(G.save.state.playerProvince, G.save)}
                     tooltip={(element) => (
                        <>
                           <div className="m10">
                              {$t(
                                 L.DivorceCostForChristianProvince$1$2,
                                 formatNumber(DivorceChristianityCost),
                                 getResourceName("christianity", G.save.state.scenario),
                              )}
                           </div>
                           {element}
                        </>
                     )}
                  >
                     <div className="row g5">
                        <div className="mi sm">heart_broken</div>
                        {$t(L.Divorce)}
                     </div>
                  </ActionButton>
                  <Popover position="bottom-start" withOverlay>
                     <Popover.Target>
                        <button className="btn row g5">
                           <div className="mi sm">person_heart</div>
                           {hasScenarioFlag("Polygamy", G.save)
                              ? `Concubines (${formatNumber(state.governor.concubines.length)})`
                              : $t(L.Lovers$1, formatNumber(state.governor.concubines.length))}
                        </button>
                     </Popover.Target>
                     <Popover.Dropdown className="panel p0">
                        <LoversComponent />
                     </Popover.Dropdown>
                  </Popover>
               </Controls>
            </ReactFlow>
         </div>
      </div>
   );
}
