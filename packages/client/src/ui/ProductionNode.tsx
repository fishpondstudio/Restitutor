import { entriesOf, formatDelta, formatNumber, formatPercent, sizeOf } from "@project/shared/src/utils/Helper";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { Goods, Price } from "../game/definitions/Goods";
import { Tech } from "../game/definitions/Tech";
import { GameStateUpdated } from "../game/Events";
import { getGoodsConsumed, getGoodsTraded, getInsufficientInput } from "../game/logic/ProductionLogic";
import {
   getProvinceProductionCapacity,
   getProvinceResource,
   getProvinceStat,
   getProvinceUsedProductionCapacity,
} from "../game/logic/ProvinceLogic";
import { hasResearched } from "../game/logic/TechLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { colorNumber } from "./components/ColorNumber";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

export type ProductionNode = Node<{ goods: Goods }, "ProductionNode">;
export function ProductionNode({ data }: NodeProps<ProductionNode>): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const config = Goods[data.goods];
   const isRawGoods = sizeOf(config.input) === 0;
   const tech = config.tech;
   const isUnlocked = tech && hasResearched(tech, G.save.state.playerProvince, G.save);
   const { capacity } = state.production[data.goods];
   const consumed = getGoodsConsumed(data.goods, G.save.state.playerProvince, G.save);
   const insufficientInput = getInsufficientInput(data.goods, G.save.state.playerProvince, G.save);
   const totalCapacity = getProvinceProductionCapacity(G.save.state.playerProvince, G.save);
   const usedCapacity = getProvinceUsedProductionCapacity(G.save.state.playerProvince, G.save);
   const goodsTaxRate = getProvinceStat("goodsTaxRate", G.save.state.playerProvince, G.save) / 100;
   const goodsTax = goodsTaxRate * capacity * Price[data.goods];
   return (
      <div className="production-node col stretch">
         <FloatingTip
            w={300}
            className="p0"
            label={
               <>
                  {insufficientInput.size > 0 && (
                     <div className="m10 text-red">
                        {html($t(L.XProductionIsHaltedBecauseTheFollowingGoodsAreInsufficient, config.name()))}{" "}
                        <i>
                           {Array.from(insufficientInput)
                              .map(([g, amount]) => `${Goods[g].name()} (${formatNumber(amount)})`)
                              .join(", ")}
                        </i>
                        .
                     </div>
                  )}
                  <div className="h2">{$t(L.XProduction, config.name())}</div>
                  <div className="h5"></div>
                  {sizeOf(Goods[data.goods].input) > 0 && (
                     <>
                        <div className="box mx10 my5">
                           {entriesOf(Goods[data.goods].input).map(([g, amount]) => (
                              <div key={g} className="row mx10 my5">
                                 <div className="f1">{Goods[g].name()}</div>
                                 <div>
                                    {formatDelta(-amount * capacity)}
                                    <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="mi cc xs">south</div>
                     </>
                  )}
                  <div className="box mx10 my5">
                     <div className="row mx10 my5">
                        <div className="f1">{config.name()}</div>
                        <div>
                           {formatDelta(capacity)}
                           <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                        </div>
                     </div>
                  </div>
                  <div className="h5"></div>
                  <div className="h2">{$t(L.GoodsTax)}</div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.PriceOfX, config.name())}</div>
                     <div>
                        {formatNumber(Price[data.goods])} {$t(L.Gold)}
                     </div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.TaxableValue)}</div>
                     <div>
                        {formatNumber(capacity * Price[data.goods])} {$t(L.Gold)}
                     </div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.GoodsTaxRate)}</div>
                     <div>{formatPercent(goodsTaxRate)}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.GoodsTax)}</div>
                     <div className="text-yellow">
                        {formatDelta(goodsTax)} {$t(L.Gold)}
                        <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                     </div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.NetAfterTax)}</div>
                     <div>
                        {colorNumber(capacity * (1 - goodsTaxRate))}
                        <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                     </div>
                  </div>
                  <div className="h2">{$t(L.XStorage, config.name())}</div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Storage)}</div>
                     <div>{formatNumber(getProvinceResource(data.goods, G.save.state.playerProvince, G.save))}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Consumed)}</div>
                     <div>
                        {formatDelta(-consumed, "")}
                        <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                     </div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Trade)}</div>
                     <div>
                        {formatNumber(getGoodsTraded(data.goods, G.save.state.playerProvince, G.save))}
                        <span className="text-dimmed text-xs">{$t(L.SlashMonth)}</span>
                     </div>
                  </div>
               </>
            }
         >
            <div>
               <div className="h10" />
               <div className="text-display text-center text-lg">{Goods[data.goods].name()}</div>
               <div className="text-center text-xl">
                  {formatNumber(getProvinceResource(data.goods, G.save.state.playerProvince, G.save))}
                  {colorNumber(capacity * (1 - goodsTaxRate) - consumed, false, "+")}
               </div>
               {insufficientInput.size > 0 && <div className="mi text-red cc">release_alert</div>}
               {insufficientInput.size === 0 && goodsTax > 0 && (
                  <div className="text-center text-yellow">
                     {formatDelta(goodsTax)} {$t(L.Gold)}
                  </div>
               )}
            </div>
         </FloatingTip>
         <div className="f1" />
         <div className="divider" />
         <div>
            {isRawGoods && <div className="m5 text-center text-lg">{+formatNumber(capacity * (1 - goodsTaxRate))}</div>}
            {!isRawGoods && !isUnlocked && (
               <FloatingTip
                  w={300}
                  label={
                     <>{html($t(L.UnlockXProductionByResearchingY, config.name(), tech ? Tech[tech].name() : ""))}</>
                  }
               >
                  <div className="mi cc" style={{ margin: 4 }}>
                     lock
                  </div>
               </FloatingTip>
            )}
            {!isRawGoods && isUnlocked && (
               <div className="row m5">
                  <button
                     className="btn p0"
                     onClick={() => {
                        --state.production[data.goods].capacity;
                        GameStateUpdated.emit();
                     }}
                     disabled={capacity <= 0}
                  >
                     <div className="mi sm">remove</div>
                  </button>
                  <div className="f1 text-center text-lg">{capacity}</div>
                  <button
                     className="btn p0"
                     onClick={() => {
                        ++state.production[data.goods].capacity;
                        GameStateUpdated.emit();
                     }}
                     disabled={usedCapacity >= totalCapacity.value}
                     id={`ProductionNode_Capacity_${data.goods}_${capacity}`}
                  >
                     <div className="mi sm">add</div>
                  </button>
               </div>
            )}
         </div>
         <Handle
            className="production-node-handle"
            type="source"
            position={Position.Bottom}
            id="left"
            isConnectable={false}
            style={{ left: "40%" }}
         />
         <Handle
            className="production-node-handle"
            type="source"
            position={Position.Bottom}
            id="mid"
            isConnectable={false}
         />
         <Handle
            className="production-node-handle"
            type="source"
            position={Position.Bottom}
            id="right"
            isConnectable={false}
            style={{ left: "60%" }}
         />
         <Handle
            className="production-node-handle"
            type="target"
            position={Position.Top}
            id="left"
            isConnectable={false}
            style={{ left: "40%" }}
         />
         <Handle
            className="production-node-handle"
            type="target"
            position={Position.Top}
            id="mid"
            isConnectable={false}
         />
         <Handle
            className="production-node-handle"
            type="target"
            position={Position.Top}
            id="right"
            isConnectable={false}
            style={{ right: "60%" }}
         />
      </div>
   );
}
