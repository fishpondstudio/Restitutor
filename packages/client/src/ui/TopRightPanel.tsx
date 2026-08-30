import { Menu } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { clamp, cls, entriesOf, hasFlag } from "@project/shared/src/utils/Helper";
import { memo } from "react";
import { DiscordUrl, SteamUrl } from "../game/definitions/Constant";
import { GameOptionUpdated, GameSpeedChanged, GameTimeUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { getGameDate } from "../game/logic/GameDateTime";
import { useShortcut } from "../game/Shortcut";
import { openUrl } from "../rpc/SteamClient";
import { getOverlay, Overlays, setOverlay } from "../scenes/Overlays";
import { G, isDev, setSpeed } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";
import { IconCatalog } from "./IconCatalog";

export function TopRightPanel(): React.ReactNode {
   if (!G.save) return null;
   return (
      <div className="top-right-panel panel">
         <TimeComp />
         <div className="divider vertical" />
         <OverlayComp />
         <div className="divider vertical" />
         <SpeedComp />
         <SteamDiscordComp />
      </div>
   );
}

const Speed = [0, 1, 2, 3, 4, 7, 14];
const FasterSpeed = [0, 1, 7, 14, 30, 90, 360, 3600];

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

function OverlayComp(): React.ReactNode {
   const forceUpdate = useForceUpdate();
   const current = getOverlay();
   return (
      <Menu position="bottom-end">
         <Menu.Target>
            <div className="px15 pointer">{Overlays[current]()}</div>
         </Menu.Target>
         <Menu.Dropdown className="panel">
            {entriesOf(Overlays).map(([overlay, label]) => (
               <Menu.Item
                  key={overlay}
                  onClick={() => {
                     setOverlay(overlay);
                     forceUpdate();
                  }}
                  className={cls(overlay === current ? "text-primary" : null)}
               >
                  {label()}
               </Menu.Item>
            ))}
         </Menu.Dropdown>
      </Menu>
   );
}

function SpeedComp(): React.ReactNode {
   refreshOnTypedEvent(GameSpeedChanged);
   const speed = isDev() ? FasterSpeed : Speed;
   useShortcut("IncreaseGameSpeed", () => {
      setSpeed(speed[clamp(speed.indexOf(G.speed) + 1, 0, speed.length - 1)]);
   }, []);
   useShortcut("DecreaseGameSpeed", () => {
      setSpeed(speed[clamp(speed.indexOf(G.speed) - 1, 0, speed.length - 1)]);
   }, []);
   return (
      <Menu position="bottom-end">
         <Menu.Target>
            <div className="px15 pointer">
               <div id="TopRightPanel_Speed">{G.speed}x</div>
            </div>
         </Menu.Target>
         <Menu.Dropdown className="panel">
            {speed.map((speed) => (
               <Menu.Item
                  id={`TopRightPanel_Speed_${speed}`}
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
      <div className="text-sm text text-center" style={{ width: "7.5rem" }}>
         {currentDate.toLocaleDateString()} ({G.save.state.month})
      </div>
   );
}

function _DiscordComp(): React.ReactNode {
   return (
      <FloatingTip label={$t(L.JoinOurDiscordServer)}>
         <img
            src={IconCatalog.Discord}
            style={{ display: "block", height: "1.125rem" }}
            onClick={() => openUrl(DiscordUrl)}
         />
      </FloatingTip>
   );
}

export const DiscordComp = memo(_DiscordComp);

function _SteamComp(): React.ReactNode {
   return (
      <FloatingTip label={$t(L.WishlistTheFullGameOnSteam)}>
         <img
            src={IconCatalog.Steam}
            style={{ display: "block", height: "1.25rem" }}
            onClick={() => openUrl(SteamUrl)}
         />
      </FloatingTip>
   );
}

export const SteamComp = memo(_SteamComp);
