import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type React from "react";
import type { IFamily, IPerson } from "../game/definitions/Family";
import { PersonTrait } from "../game/definitions/PersonTrait";
import { getDeathChance, getOffspringChance, getOffspringSkillRangeIncl } from "../game/logic/GovernorLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { showModal } from "../utils/ModalManager";
import { BreakdownComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";
import { LookForSpouseModal } from "./LookForSpouseModal";

export type FamilyNode = Node<{ family: IFamily }, "FamilyNode">;

export function FamilyNode({ data }: NodeProps<FamilyNode>): React.ReactNode {
   return (
      <div className="family-node">
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
   return (
      <FloatingTip
         w={300}
         className="p0"
         disabled={!person}
         label={
            person && (
               <>
                  <div className="h2">{person.name.join(" ")}</div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Age)}</div>
                     <div>{person.age}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Administrative)}</div>
                     <div>{person.administrative}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Diplomatic)}</div>
                     <div>{person.diplomatic}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.Military)}</div>
                     <div>{person.military}</div>
                  </div>
                  <div className="row mx10 my5">
                     <div className="f1">{$t(L.OriginallyFrom)}</div>
                     <div>{getProvinceName(person.province, G.save)}</div>
                  </div>
                  <div className="divider" />
                  <div className="h2 row">
                     <div className="f1">{$t(L.Traits)}</div>
                     {person === state.governor.male ? (
                        <div className="text-green">{$t(L.Active)}</div>
                     ) : (
                        <div className="text-red">{$t(L.Inactive)}</div>
                     )}
                  </div>
                  {Array.from(person.traits).map((trait) => (
                     <div key={trait} className="mx10 my5">
                        <div>{PersonTrait[trait].name()}</div>
                        <div className="text-dimmed text-xs text-italic">{PersonTrait[trait].desc()}</div>
                     </div>
                  ))}
                  {person === state.governor.male ? (
                     <div className="mx10 my5 text-yellow text-italic">
                        {$t(L.ANewTraitIsAcquiredEveryXYears, "10")}
                     </div>
                  ) : (
                     <div className="mx10 my5 text-red text-italic">{$t(L.OnlyGovernorsTraitsHaveActiveEffects)}</div>
                  )}
                  <div className="divider" />
                  <div className="h2">{$t(L.DeathChance)}</div>
                  <BreakdownComp breakdown={getDeathChance(person, G.save.state.playerProvince, G.save)} />
                  {family.male && family.female ? (
                     <>
                        <div className="divider" />
                        <div className="h2">{$t(L.OffspringChance)}</div>
                        <BreakdownComp breakdown={getOffspringChance(family, G.save.state.playerProvince, G.save)} />
                        <div className="divider" />
                        <div className="h2">{$t(L.OffspringSkillRange)}</div>
                        <div className="row mx10 my5">
                           <div className="f1">{$t(L.Administrative)}</div>
                           <div>
                              {getOffspringSkillRangeIncl(
                                 family.male.administrative,
                                 family.female.administrative,
                              ).join(" ~ ")}
                           </div>
                        </div>
                        <div className="row mx10 my5">
                           <div className="f1">{$t(L.Diplomatic)}</div>
                           <div>
                              {getOffspringSkillRangeIncl(family.male.diplomatic, family.female.diplomatic).join(" ~ ")}
                           </div>
                        </div>
                        <div className="row mx10 my5">
                           <div className="f1">{$t(L.Military)}</div>
                           <div>
                              {getOffspringSkillRangeIncl(family.male.military, family.female.military).join(" ~ ")}
                           </div>
                        </div>
                        <div className="m10 text-dimmed">
                           {$t(L.OffspringsSkillRangeIsDerivedFromBothParentsSkills)}
                        </div>
                     </>
                  ) : null}
               </>
            )
         }
      >
         <div className="f1 text-sm mx10 my5 row">
            <div className="mi">{male ? "male" : "female"}</div>
            {person ? (
               <div className="f1">
                  <div className="text-display">{person ? person.name.join(" ") : ""}</div>
                  <div className="text-xs">
                     {$t(L.AgeXSkillY, person.age, `${person.administrative}/${person.diplomatic}/${person.military}`)}
                  </div>
               </div>
            ) : (
               <div className="f1">
                  <button
                     onClick={() => showModal(<LookForSpouseModal family={family} />)}
                     className="btn"
                     id={family.male === state.governor.male ? "FamilyNode_LookForSpouse_Governor" : undefined}
                  >
                     {$t(L.LookForSpouse)}
                  </button>
               </div>
            )}
         </div>
      </FloatingTip>
   );
}
