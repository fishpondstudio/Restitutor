import { useRef } from "react";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import "./ProductionModal.css";
import { Popover } from "@mantine/core";
import { cls, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { Controls, ReactFlow, SmoothStepEdge } from "@xyflow/react";
import { Modifiers } from "../game/definitions/Modifier";
import { GameStateUpdated } from "../game/Events";
import {
   makeProductionTree,
   optimizeProduction,
   ProductionNodeHeight,
   ProductionNodeWidth,
   resetProduction,
} from "../game/logic/ProductionLogic";
import {
   getProvinceProductionCapacity,
   getProvinceStat,
   getProvinceUsedProductionCapacity,
} from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { GoodsTaxRateComp } from "./GoodsTaxRateComp";
import { ProductionNode } from "./ProductionNode";

export function ProductionModal(): React.ReactNode {
   const containerRef = useRef<HTMLDivElement>(null);
   const { nodes, edges } = makeProductionTree(G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="xl" title={<ModalTitleBar title={$t(L.Production)} dismiss />}>
         <div style={{ width: "100%", height: "calc(80vh - 50px)" }} ref={containerRef}>
            <ReactFlow
               colorMode="dark"
               nodesConnectable={false}
               nodesDraggable={false}
               nodesFocusable={false}
               edgesFocusable={false}
               edgesReconnectable={false}
               zoomOnDoubleClick={false}
               nodeTypes={{ ProductionNode }}
               nodes={nodes}
               edges={edges}
               edgeTypes={{ default: SmoothStepEdge }}
               proOptions={{ hideAttribution: true }}
               minZoom={0.1}
               fitView
            >
               <Controls
                  orientation="horizontal"
                  position="top-left"
                  showInteractive={false}
                  showZoom={false}
                  showFitView={true}
               >
                  <ProductionCapacityButton />
                  <GoodsTaxRateButton />
                  <FloatingTip label={$t(L.ResetProduction)}>
                     <button
                        className="btn"
                        onClick={() => {
                           resetProduction(G.save.state.playerProvince, G.save);
                           GameStateUpdated.emit();
                        }}
                     >
                        <div className="mi sm">reset_wrench</div>
                     </button>
                  </FloatingTip>
                  <FloatingTip label={html($t(L.AutomaticallySetupProduction))}>
                     <button
                        className="btn"
                        onClick={() => {
                           optimizeProduction(G.save.state.playerProvince, G.save);
                           GameStateUpdated.emit();
                        }}
                     >
                        <div className="mi sm">wand_stars</div>
                     </button>
                  </FloatingTip>
               </Controls>
            </ReactFlow>
         </div>
      </ModalComp>
   );
}

document.documentElement.style.setProperty("--production-node-width", `${ProductionNodeWidth}px`);
document.documentElement.style.setProperty("--production-node-height", `${ProductionNodeHeight}px`);

function ProductionCapacityButton(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const totalCapacity = getProvinceProductionCapacity(G.save.state.playerProvince, G.save);
   const usedCapacity = getProvinceUsedProductionCapacity(G.save.state.playerProvince, G.save);
   return (
      <FloatingTip
         w={300}
         className="p0"
         label={
            <>
               <div className="m10">{Modifiers.ProductionCapacity.desc()}</div>
               <div className="row m10">
                  <div className="f1">{$t(L.UsedTotalCapacity)}</div>
                  <div className={cls(usedCapacity >= totalCapacity.value ? "text-red" : null)}>
                     {usedCapacity}/{formatNumber(totalCapacity.value)}
                  </div>
               </div>
               <div className="h2">{$t(L.ProductionCapacity)}</div>
               <BreakdownComp breakdown={getProvinceProductionCapacity(G.save.state.playerProvince, G.save)} />
            </>
         }
      >
         <button className={cls("btn text-body", usedCapacity >= totalCapacity.value ? "text-red" : null)}>
            {formatNumber(usedCapacity)}/{formatNumber(totalCapacity.value)}
         </button>
      </FloatingTip>
   );
}

function GoodsTaxRateButton(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const goodsTaxRate = getProvinceStat("goodsTaxRate", G.save.state.playerProvince, G.save) / 100;
   return (
      <Popover width={300} position="bottom-start" withOverlay>
         <Popover.Target>
            <button className="btn text-body">
               <FloatingTip
                  label={
                     <>
                        {$t(L.GoodsTaxRate)}: {formatPercent(goodsTaxRate)}
                     </>
                  }
               >
                  <div>{formatPercent(goodsTaxRate)}</div>
               </FloatingTip>
            </button>
         </Popover.Target>
         <Popover.Dropdown className="panel">
            <GoodsTaxRateComp />
         </Popover.Dropdown>
      </Popover>
   );
}
