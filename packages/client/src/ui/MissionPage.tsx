import { Switch } from "@mantine/core";
import { clearFlag, hasFlag, setFlag } from "@project/shared/src/utils/Helper";
import { GameOptionUpdated, GameStateUpdated } from "../game/Events";
import {
   getAvailableEvents,
   getEventButtons,
   getGameEventButtonDesc,
   getGameEventCondition,
} from "../game/events/GameEventLogic";
import { GameEvents } from "../game/events/GameEvents";
import { GameOptionFlag } from "../game/GameOption";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ConditionBreakdownComp } from "./ConditionBreakdownComp";
import { SidebarComp } from "./common/SidebarComp";
import { FloatingTip } from "./components/FloatingTip";

export function MissionPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   const events = getAvailableEvents(
      G.save.state.playerProvince,
      hasFlag(G.save.options.flag, GameOptionFlag.ShowAllMissions),
      G.save,
   );
   return (
      <SidebarComp title={$t(L.Missions)}>
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
         {events.map((event) => {
            const config = GameEvents[event];
            const condition = getGameEventCondition(config.condition, G.save.state.playerProvince, G.save);
            const buttons = getEventButtons(event, G.save.state.playerProvince, G.save);
            return (
               <div className="box m10 text-sm" key={event}>
                  <FloatingTip label={config.desc()}>
                     <div className="h1">
                        {config.type === "random" ? "*" : ""}
                        {config.name()}
                     </div>
                  </FloatingTip>
                  <ConditionBreakdownComp condition={condition} />
                  <div className="h3">
                     {$t(L.Rewards)}
                     {buttons.length > 1 ? ` ${$t(L.ChooseOne)}` : ""}
                  </div>
                  {buttons.map((button, index) => (
                     <FloatingTip
                        key={index}
                        label={getGameEventButtonDesc(button, G.save.state.playerProvince, G.save)}
                     >
                        <div className="row ml10 mr5 my5 g5" key={button.label()}>
                           <div className="mi xs">arrow_forward</div>
                           <div className="f1">{button.label()}</div>
                        </div>
                     </FloatingTip>
                  ))}
               </div>
            );
         })}
      </SidebarComp>
   );
}
