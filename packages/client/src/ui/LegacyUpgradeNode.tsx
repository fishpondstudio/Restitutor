import { entriesOf } from "@project/shared/src/utils/Helper";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { type LegacyUpgrade, LegacyUpgrades } from "../game/definitions/LegacyUpgradeV2";
import { Modifiers, modifierValueToString } from "../game/definitions/Modifier";

export type LegacyUpgradeNode = Node<{ legacyUpgrade: LegacyUpgrade }, "LegacyUpgradeNode">;

export function LegacyUpgradeNode({ data }: NodeProps<LegacyUpgradeNode>): React.ReactNode {
   const def = LegacyUpgrades[data.legacyUpgrade];
   return (
      <div className="legacy-upgrade-node">
         {def.modifiers &&
            entriesOf(def.modifiers)
               .map(([modifier, data]) => `${modifierValueToString(data)} ${Modifiers[modifier].name()}`)
               .join(", ")}
         {import.meta.env.DEV && (
            <div className="upgrade-id">
               {data.legacyUpgrade} ({def.position.x},{def.position.y})
            </div>
         )}
         <Handle
            className="legacy-upgrade-node-handle"
            id="TopTarget"
            type="target"
            position={Position.Top}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="TopSource"
            type="source"
            position={Position.Top}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="RightTarget"
            type="target"
            position={Position.Right}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="RightSource"
            type="source"
            position={Position.Right}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="BottomTarget"
            type="target"
            position={Position.Bottom}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="BottomSource"
            type="source"
            position={Position.Bottom}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="LeftTarget"
            type="target"
            position={Position.Left}
            isConnectable={false}
         />
         <Handle
            className="legacy-upgrade-node-handle"
            id="LeftSource"
            type="source"
            position={Position.Left}
            isConnectable={false}
         />
      </div>
   );
}
