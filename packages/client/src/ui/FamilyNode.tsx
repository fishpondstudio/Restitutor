import { hasFlag } from "@project/shared/src/utils/Helper";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type React from "react";
import { ChangeHeirAction } from "../game/actions/ChangeHeirAction";
import { type IFamily, type IPerson, PersonFlags } from "../game/definitions/Family";
import { isEligibleForMarriage, isGovernorSon } from "../game/logic/GovernorLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionDescComp";
import { G, isDev } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { LookForSpouseModal } from "./LookForSpouseModal";
import { PersonTooltip } from "./PersonTooltip";

export type FamilyNode = Node<{ family: IFamily }, "FamilyNode">;

export function FamilyNode({ data }: NodeProps<FamilyNode>): React.ReactNode {
   return (
      <div className="family-node frame frame-hover">
         <PersonNode person={data.family.male} family={data.family} male={true} />
         <div className="divider" />
         <PersonNode person={data.family.female} family={data.family} male={false} />
         <Handle className="family-node-handle" type="source" position={Position.Bottom} isConnectable={false} />
         <Handle className="family-node-handle" type="target" position={Position.Top} isConnectable={false} />
      </div>
   );
}

export function PersonNode({
   person,
   family,
   male,
}: {
   person: IPerson | null;
   family: IFamily;
   male: boolean;
}): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   let content: React.ReactNode;
   if (person) {
      content = (
         <>
            <FloatingTip
               fixedWidth
               className="p0"
               disabled={!person}
               label={() => person && <PersonTooltip person={person} family={family} />}
            >
               <div className="f1">
                  <div className="text-display">{person ? person.name.join(" ") : ""}</div>
                  <div className="text-xs">
                     {$t(
                        L.Age$1Skill$2,
                        person.age,
                        `${person.administrative}/${person.diplomatic}/${person.military}`,
                     )}
                  </div>
               </div>
            </FloatingTip>
            {male &&
               isGovernorSon(family, G.save.state.playerProvince, G.save) &&
               (hasFlag(person.flag, PersonFlags.IsHeir) ? (
                  <FloatingTip label={() => $t(L.CurrentHeir)}>
                     <div className="mi text-yellow">crown</div>
                  </FloatingTip>
               ) : (
                  <ActionButton
                     action={() => ChangeHeirAction(family, G.save.state.playerProvince, G.save)}
                     className="btn p2"
                     tooltip={(element) => (
                        <>
                           <TimedActionDescComp action="ChangeHeir" />
                           {element}
                        </>
                     )}
                  >
                     <div className="mi sm">crown</div>
                  </ActionButton>
               ))}
         </>
      );
   } else {
      const eligibleForMarriage = isEligibleForMarriage(family);
      content = (
         <div className="f1">
            <button
               disabled={!eligibleForMarriage}
               onClick={() => showPanel(LookForSpouseModal, { family })}
               className="btn"
               id={family.male === state.governor.male ? "FamilyNode_LookForSpouse_Governor" : undefined}
            >
               <FloatingTip
                  label={() => $t(L.CannotLookForSpouseWhileFamilyHasChildren)}
                  disabled={eligibleForMarriage}
               >
                  <div>{$t(L.LookForSpouse)}</div>
               </FloatingTip>
            </button>
         </div>
      );
   }
   return (
      <div
         className="f1 text-sm mx10 my5 row"
         onClick={() => {
            if (isDev()) {
               console.log(family);
            }
         }}
      >
         <div className="mi">{male ? "male" : "female"}</div>
         {content}
      </div>
   );
}
