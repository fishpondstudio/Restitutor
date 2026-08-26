import { formatNumber } from "@project/shared/src/utils/Helper";
import { Controls, ReactFlow, SmoothStepEdge } from "@xyflow/react";
import { GameStateUpdated } from "../game/Events";
import { makeFamilyTree } from "../game/logic/GovernorLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ModalTitleBar } from "../utils/ModalManager";
import "@xyflow/react/dist/style.css";
import "./FamilyModal.css";
import type React from "react";
import { DivorceAction, DivorceChristianityCost } from "../game/actions/SpouseActions";
import { ProvinceResourceNames } from "../game/definitions/Province";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FamilyNode } from "./FamilyNode";
import { ModalFullHeight } from "./UIConstant";

export function FamilyTreeModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const { nodes, edges } = makeFamilyTree(state.governor);
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
               nodeTypes={{ FamilyNode }}
               nodes={nodes}
               edges={edges}
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
                           <div className="m10">
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
