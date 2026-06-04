import { entriesOf } from "@project/shared/src/utils/Helper";
import { Fragment } from "react/jsx-runtime";
import { ResearchTechAction } from "../game/actions/ResearchTechAction";
import { Buildings } from "../game/definitions/Building";
import { Goods } from "../game/definitions/Goods";
import { Modifiers, modifierToString } from "../game/definitions/Modifier";
import { Tech } from "../game/definitions/Tech";
import { TimedActions } from "../game/definitions/TimedAction";
import { GameStateUpdated } from "../game/Events";
import { getResearchCost, getResearchCostBreakdown } from "../game/logic/TechLogic";
import { TimedActionDescComp } from "../game/logic/TimedActionLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownComp } from "./BreakdownComp";
import { BreakdownTooltip } from "./BreakdownRow";
import { SidebarComp } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { ResourceCostComp } from "./ResourceCostComp";

export function TechPage({ tech }: { tech: Tech }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const breakdown = getResearchCostBreakdown(G.save.state.playerProvince, G.save);
   const unlockCost = getResearchCost(tech, breakdown.value);
   const config = Tech[tech];
   return (
      <SidebarComp title={config.name()}>
         {config.requires.length > 0 && <div className="h1">{$t(L.Prerequisites)}</div>}
         {config.requires.map((t) => (
            <div className="mx10 my5 row" key={t}>
               <div className="f1">{Tech[t].name()}</div>
               {state.unlockedTech.has(t) ? (
                  <div className="mi xs text-green">check_circle</div>
               ) : (
                  <div className="mi xs text-red">cancel</div>
               )}
            </div>
         ))}
         <div className="h1">{$t(L.ResearchCost)}</div>
         {state.unlockedTech.has(tech) ? (
            <div className="row m10">
               <div className="f1">{$t(L.Researched)}</div>
               <div className="mi xs text-green">check_circle</div>
            </div>
         ) : (
            <>
               <BreakdownTooltip breakdown={breakdown}>
                  <div>
                     <ResourceCostComp cost={unlockCost} />
                  </div>
               </BreakdownTooltip>
               <div className="mx10 mb10">
                  <ActionButton
                     id={`TechPage_Research_${tech}`}
                     className="w100 py2"
                     action={ResearchTechAction(tech, G.save.state.playerProvince, G.save)}
                     tooltip={(element) => (
                        <>
                           {element}
                           <div className="divider" />
                           <div className="m10">{$t(L.TheCostOfThisResearchIsCalculatedAsFollows)}</div>
                           <BreakdownComp breakdown={breakdown} />
                        </>
                     )}
                  >
                     {$t(L.Research)}
                  </ActionButton>
               </div>
            </>
         )}
         {config.buildings?.map((building) => {
            const buildingConfig = Buildings[building];
            return (
               <Fragment key={building}>
                  <div className="h1">{$t(L.Buildings)}</div>
                  <div className="row m10" key={building}>
                     <div className="f1">
                        <div>{buildingConfig.name()}</div>
                        <div className="text-dimmed text-sm">{buildingConfig.desc()}</div>
                     </div>
                     <img src={buildingConfig.image} height={40} className="img-border" />
                  </div>
               </Fragment>
            );
         })}
         {config.goods?.map((goods) => {
            return (
               <Fragment key={goods}>
                  <div className="h1">{$t(L.Production)}</div>
                  <div className="m10" key={goods}>
                     {Goods[goods].name()}
                     <div className="text-sm text-dimmed">
                        {entriesOf(Goods[goods].input)
                           .map(([input, amount]) => `${amount} ${Goods[input].name()}`)
                           .join(" + ")}
                        {" -> "} {Goods[goods].name()}
                     </div>
                  </div>
               </Fragment>
            );
         })}
         {config.timedActions && (
            <>
               <div className="h1">{$t(L.Actions)}</div>
               {config.timedActions.map((timedAction, index) => {
                  const def = TimedActions[timedAction];
                  return (
                     <Fragment key={index}>
                        <FloatingTip className="p0" w={300} label={<TimedActionDescComp action={timedAction} />}>
                           <div className="m10">
                              <div>{def.name()}</div>
                              {def.desc && html(def.desc(), { className: "text-sm text-dimmed" })}
                           </div>
                        </FloatingTip>
                        <div className="divider" />
                     </Fragment>
                  );
               })}
            </>
         )}
         {config.modifiers && (
            <>
               <div className="h1">{$t(L.Modifiers)}</div>
               {entriesOf(config.modifiers).map(([modifier, modifierConfig], index) => (
                  <Fragment key={index}>
                     <FloatingTip label={Modifiers[modifier].desc()}>
                        <div className="m10">{modifierToString(modifier, modifierConfig)}</div>
                     </FloatingTip>
                     <div className="divider" />
                  </Fragment>
               ))}
            </>
         )}
         {config.upgrades && (
            <>
               <div className="h1">{$t(L.Upgrades)}</div>
               {config.upgrades.map((upgrade, index) => (
                  <Fragment key={index}>
                     <div className="m10">{html(upgrade())}</div>
                     <div className="divider" />
                  </Fragment>
               ))}
            </>
         )}
      </SidebarComp>
   );
}
