import { Menu } from "@mantine/core";
import { clamp, cls, hasFlag } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import Discord from "../../src/assets/images/Discord.svg";
import Steam from "../../src/assets/images/Steam.svg";
import { DiscordUrl, SteamUrl } from "../game/definitions/Constant";
import { GameOptionUpdated, GameSpeedChanged, GameTimeUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { getGameDate } from "../game/logic/TickLogic";
import { useShortcut } from "../game/Shortcut";
import { openUrl } from "../rpc/SteamClient";
import { G, setSpeed } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";

export function TopRightPanel(): React.ReactNode {
   if (!G.save) return null;
   return (
      <div className="top-right-panel panel">
         <TimeComp />
         <div className="divider vertical" />
         <SpeedComp />
         <SteamDiscordComp />
      </div>
   );
}

// const isDev = import.meta.env.DEV;
const isDev = true;
const Speed = isDev ? [0, 1, 2, 3, 4, 7, 14, 30, 360] : [0, 1, 2, 3, 4, 7, 14];
// const Speed = [0, 1, 2, 3, 4, 7, 14];

function SteamDiscordComp(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   if (hasFlag(G.save.options.flag, GameOptionFlag.HideSteamDiscordButton)) {
      return null;
   }
   return (
      <>
         <div className="divider vertical" />
         <div className="w10" />
         <SteamComp />
         <div className="w10" />
         <DiscordComp />
         <div className="w10" />
      </>
   );
}

function SpeedComp(): React.ReactNode {
   refreshOnTypedEvent(GameSpeedChanged);
   useShortcut("IncreaseGameSpeed", () => {
      setSpeed(Speed[clamp(Speed.indexOf(G.speed) + 1, 0, Speed.length - 1)]);
   }, []);
   useShortcut("DecreaseGameSpeed", () => {
      setSpeed(Speed[clamp(Speed.indexOf(G.speed) - 1, 0, Speed.length - 1)]);
   }, []);
   return (
      <Menu position="bottom-end">
         <Menu.Target>
            <div className="px15 pointer">{G.speed}x</div>
         </Menu.Target>
         <Menu.Dropdown>
            {Speed.map((speed) => (
               <Menu.Item
                  key={speed}
                  onClick={() => {
                     setSpeed(speed);
                  }}
                  className={cls(speed === G.speed ? "text-primary" : null)}
               >
                  {speed}x
               </Menu.Item>
            ))}
         </Menu.Dropdown>
      </Menu>
   );
}

function TimeComp(): React.ReactNode {
   refreshOnTypedEvent(GameTimeUpdated);
   const currentDate = getGameDate(G.save.state.tick);
   return (
      <div className="text-sm text text-center" style={{ width: 120 }}>
         {currentDate.toLocaleDateString()} ({G.save.state.month})
      </div>
   );
}

function _DiscordComp(): React.ReactNode {
   return (
      <FloatingTip label={$t(L.JoinOurDiscordServer)}>
         <img src={Discord} style={{ display: "block", height: 18 }} onClick={() => openUrl(DiscordUrl)} />
      </FloatingTip>
   );
}

export const DiscordComp = memo(_DiscordComp);

function _SteamComp(): React.ReactNode {
   return (
      <FloatingTip label={$t(L.WishlistTheFullGameOnSteam)}>
         <img src={Steam} style={{ display: "block", height: 20 }} onClick={() => openUrl(SteamUrl)} />
      </FloatingTip>
   );
}

export const SteamComp = memo(_SteamComp);
