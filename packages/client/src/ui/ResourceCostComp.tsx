import { entriesOf, formatNumber } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import { areProvinceCostsEqual } from "../game/actions/GameAction";
import { type ProvinceResource, ProvinceResourceNames } from "../game/definitions/Province";
import { GameStateUpdated } from "../game/Events";
import { hasEnoughProvinceResources } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export const ResourceCostComp = memo(_ResourceCostComp, (prev, next) => {
   return areProvinceCostsEqual(prev.cost, next.cost);
});

function _ResourceCostComp({ cost }: { cost: Partial<Record<ProvinceResource, number>> }): React.ReactNode {
   return (
      <>
         {entriesOf(cost).map(([key, value]) => (
            <ResourceCostRow resource={key} amount={value} key={key} />
         ))}
      </>
   );
}

export const ResourceCostRow = memo(_ResourceCostRow, (prev, next) => {
   return prev.resource === next.resource && prev.amount === next.amount;
});

function _ResourceCostRow({ resource, amount }: { resource: ProvinceResource; amount: number }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <div className="row g5 pl10 pr5 py5">
         <div className="f1">{ProvinceResourceNames[resource]()}</div>
         <div>{formatNumber(amount)}</div>
         {hasEnoughProvinceResources({ [resource]: amount }, G.save.state.playerProvince, G.save) ? (
            <div className="mi xs text-green">check_circle</div>
         ) : (
            <div className="mi xs text-red">cancel</div>
         )}
      </div>
   );
}
