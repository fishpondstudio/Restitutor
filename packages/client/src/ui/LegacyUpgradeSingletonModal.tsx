import { Controls, ReactFlow } from "@xyflow/react";
import { getLegacyUpgradeCost, makeLegacyUpgradeNodes } from "../game/logic/LegacyUpgradeLogic";
import { hideModal, ModalTitleBar } from "../utils/ModalManager";
import { FloatingEdge, LegacyUpgradeNode } from "./LegacyUpgradeNode";
import "./LegacyUpgradeSingletonModal.css";
import { formatNumber } from "@project/shared/src/utils/Helper";
import { GameStateUpdated } from "../game/Events";
import { getProvinceResource } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { RebirthPage } from "./RebirthPage";
import { ModalFullHeight } from "./UIConstant";

const NodeTypes = { LegacyUpgradeNode };
const EdgeTypes = { default: FloatingEdge };

export function LegacyUpgradeSingletonModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const { nodes, edges } = makeLegacyUpgradeNodes(G.save.state.playerProvince, G.save);
   const cost = getLegacyUpgradeCost(G.save.state.playerProvince, G.save);
   const legacyPoints = getProvinceResource("legacy", G.save.state.playerProvince, G.save);
   return (
      <div className="modal panel xl">
         <ModalTitleBar title={$t(L.LegacyUpgrade)} dismiss />
         <div style={{ width: "100%", height: ModalFullHeight }}>
            <ReactFlow
               colorMode="dark"
               nodesConnectable={false}
               nodesDraggable={false}
               nodesFocusable={false}
               edgesFocusable={false}
               edgesReconnectable={false}
               nodes={nodes}
               edges={edges}
               nodeTypes={NodeTypes}
               edgeTypes={EdgeTypes}
               proOptions={{ hideAttribution: true }}
               fitView
            >
               <Controls
                  orientation="horizontal"
                  showInteractive={false}
                  showZoom={false}
                  showFitView={true}
                  position="top-left"
               >
                  <FloatingTip
                     fixedWidth
                     className="p0"
                     label={
                        <>
                           <div className="m10">
                              <div className="row my5">
                                 <div className="f1">{$t(L.AvailableLegacyPoints)}</div>
                                 <div>{formatNumber(legacyPoints)}</div>
                              </div>
                              <div className="row my5">
                                 <div className="f1">{$t(L.NextLegacyUpgradeCost)}</div>
                                 <div>{formatNumber(cost)}</div>
                              </div>
                              <div className="row my5">
                                 <div className="f1">{$t(L.UnlockedLegacyUpgrades)}</div>
                                 <div>{formatNumber(state.legacyUpgrades.size)}</div>
                              </div>
                           </div>
                           <div className="divider" />
                           <div className="m10 text-dimmed">{$t(L.LegacyUpgradeCostIncrementDesc$1, "1")}</div>
                        </>
                     }
                  >
                     <button className="btn">
                        {formatNumber(legacyPoints)}/{formatNumber(cost)}
                     </button>
                  </FloatingTip>
                  <button
                     className="btn"
                     id="LegacyUpgradeModal_Rebirth"
                     onClick={() => {
                        hideModal();
                        showPanel(RebirthPage, {});
                     }}
                  >
                     {$t(L.Rebirth)}
                  </button>
               </Controls>
            </ReactFlow>
         </div>
      </div>
   );
}
