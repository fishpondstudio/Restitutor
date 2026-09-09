import type React from "react";
import type { IFamily, IPerson } from "../game/definitions/Family";
import { getPersonTraitDescription, PersonTrait } from "../game/definitions/PersonTrait";
import { getDeathChance, getOffspringChance, getOffspringSkillRangeIncl } from "../game/logic/GovernorLogic";
import { getProvinceName } from "../game/logic/ProvinceLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { BreakdownComp } from "./BreakdownComp";

export function PersonTooltip({ person, family }: { person: IPerson; family: IFamily }): React.ReactNode {
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   return (
      <>
         <div className="h2">{person.name.join(" ")}</div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Age)}</div>
            <div>{person.age}</div>
         </div>
         <div className="row mx10">
            <div className="f1">{$t(L.Skill)}</div>
            <div>
               {person.administrative}/{person.diplomatic}/{person.military}
            </div>
         </div>
         <div className="mx10 text-xs text-dimmed">
            {$t(L.Administrative)}/{$t(L.Diplomatic)}/{$t(L.Military)}
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.OriginallyFrom)}</div>
            <div>{getProvinceName(person.province, G.save)}</div>
         </div>
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
               <div className="text-dimmed text-xs text-italic">{getPersonTraitDescription(trait)}</div>
            </div>
         ))}
         {person === state.governor.male ? (
            <div className="mx10 my5 text-yellow text-italic">{$t(L.ANewTraitIsAcquiredEvery$1Years, "10")}</div>
         ) : (
            <div className="mx10 my5 text-red text-italic">{$t(L.OnlyGovernorsTraitsHaveActiveEffects)}</div>
         )}
         <div className="h2">{$t(L.DeathChance)}</div>
         <BreakdownComp breakdown={getDeathChance(person, G.save.state.playerProvince, G.save)} />
         {family.male && (family.female === person || family.concubines.includes(person)) ? (
            <>
               <div className="h2">{$t(L.OffspringChance)}</div>
               <BreakdownComp breakdown={getOffspringChance(family, person, G.save.state.playerProvince, G.save)} />
               <div className="h2">{$t(L.OffspringSkillRange)}</div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Administrative)}</div>
                  <div>{getOffspringSkillRangeIncl(family.male.administrative, person.administrative).join(" ~ ")}</div>
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Diplomatic)}</div>
                  <div>{getOffspringSkillRangeIncl(family.male.diplomatic, person.diplomatic).join(" ~ ")}</div>
               </div>
               <div className="row mx10 my5">
                  <div className="f1">{$t(L.Military)}</div>
                  <div>{getOffspringSkillRangeIncl(family.male.military, person.military).join(" ~ ")}</div>
               </div>
               <div className="m10 text-dimmed text-xs">{$t(L.OffspringsSkillRangeIsDerivedFromBothParentsSkills)}</div>
            </>
         ) : null}
      </>
   );
}
