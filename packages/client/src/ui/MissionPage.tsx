import { Switch } from "@mantine/core";
import { clearFlag, hasFlag, setFlag } from "@project/shared/src/utils/Helper";
import { useLayoutEffect, useRef, useState } from "react";
import { GameOptionUpdated, GameStateUpdated } from "../game/Events";
import {
   getAvailableEvents,
   getEventButtons,
   getGameEventButtonDesc,
   getGameEventCondition,
} from "../game/events/GameEventLogic";
import { type GameEvent, GameEvents } from "../game/events/GameEvents";
import { GameOptionFlag } from "../game/GameOption";
import { addGameEvent } from "../game/logic/TickProvince";
import { G, isDev } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { SidebarComp, SidebarHeader } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";
import "./MissionPage.css";
import { remToPx } from "./common/UIScaling";

export function MissionPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   const events = getAvailableEvents(
      G.save.state.playerProvince,
      hasFlag(G.save.options.flag, GameOptionFlag.ShowAllMissions),
      G.save,
   );
   return (
      <SidebarComp title={<SidebarHeader title={$t(L.Missions)} />}>
         <div className="box m10 p10 row text-sm">
            <div className="f1 text-display">{$t(L.CurrentlyAvailableEventsOnly)}</div>
            <Switch
               size="xs"
               checked={!hasFlag(G.save.options.flag, GameOptionFlag.ShowAllMissions)}
               onChange={(e) => {
                  G.save.options.flag = e.currentTarget.checked
                     ? clearFlag(G.save.options.flag, GameOptionFlag.ShowAllMissions)
                     : setFlag(G.save.options.flag, GameOptionFlag.ShowAllMissions);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         {events.map((event) => (
            <MissionEvent key={event} event={event} />
         ))}
      </SidebarComp>
   );
}

const MaxContainerHeight = 10;

function MissionEvent({ event }: { event: GameEvent }): React.ReactNode {
   const [isConditionExpanded, setIsConditionExpanded] = useState(false);
   const [isConditionOverflowing, setIsConditionOverflowing] = useState(false);
   const conditionContentRef = useRef<HTMLDivElement>(null);
   const config = GameEvents[event];
   const condition = getGameEventCondition(config.condition, G.save.state.playerProvince, G.save);
   const buttons = getEventButtons(event, G.save.state.playerProvince, G.save);

   useLayoutEffect(() => {
      const conditionContent = conditionContentRef.current;
      if (!conditionContent) {
         return;
      }

      const updateOverflow = () => {
         setIsConditionOverflowing(conditionContent.scrollHeight > remToPx(`${MaxContainerHeight}rem`));
      };

      updateOverflow();
      const resizeObserver = new ResizeObserver(updateOverflow);
      resizeObserver.observe(conditionContent);
      return () => resizeObserver.disconnect();
   }, []);

   return (
      <div className="box m10 text-sm" id={`MissionPage_${event}`}>
         <FloatingTip label={config.desc()}>
            <div className="h1 row">
               {config.type === "random" ? "*" : ""}
               {config.name()}
               <div className="f1" />
               {isDev() ? (
                  <div
                     className="mi sm pointer"
                     onClick={() => {
                        if (import.meta.env.DEV) {
                           addGameEvent(event, G.save.state.playerProvince, G.save);
                        }
                     }}
                  >
                     open_in_new
                  </div>
               ) : null}
            </div>
         </FloatingTip>
         <div className="mission-page-event-container">
            <div
               style={{ maxHeight: isConditionExpanded ? undefined : `${MaxContainerHeight}rem`, overflow: "hidden" }}
            >
               <div ref={conditionContentRef}>
                  <ConditionBreakdownComp condition={condition} />
               </div>
               {isConditionExpanded && <div style={{ height: "1rem" }} />}
            </div>
            {isConditionOverflowing && (
               <div
                  style={{ height: `${MaxContainerHeight / 2}rem` }}
                  className="collapse-control"
                  onClick={() => setIsConditionExpanded((expanded) => !expanded)}
               >
                  <div className="mi">{isConditionExpanded ? "expand_less" : "expand_more"}</div>
               </div>
            )}
         </div>
         <div className="h3">
            {$t(L.Rewards)}
            {buttons.length > 1 ? ` ${$t(L.ChooseOne)}` : ""}
         </div>
         {buttons.map((button, index) => (
            <FloatingTip key={index} label={getGameEventButtonDesc(button, G.save.state.playerProvince, G.save)}>
               <div className="row ml10 mr5 my5 g5">
                  <div className="mi xs">arrow_forward</div>
                  <div className="f1">{button.label()}</div>
               </div>
            </FloatingTip>
         ))}
      </div>
   );
}
