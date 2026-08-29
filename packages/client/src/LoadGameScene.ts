import { clearFlag, setFlag } from "@project/shared/src/utils/Helper";
import { RetailSteamId } from "./game/definitions/Constant.ts";
import { type Province, Provinces } from "./game/definitions/Province";
import { GameOptionFlag } from "./game/GameOption";
import { isSteam, SteamClient } from "./rpc/SteamClient";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { showPanel } from "./ui/common/ShowPanel";
import { LegacyUpgradeSingletonModal } from "./ui/LegacyUpgradeSingletonModal";
import { G, GameFlags, setSpeed } from "./utils/Global";

export function loadGameScene() {
   if (G.params.has("sandbox")) {
      G.flags = setFlag(G.flags, GameFlags.Sandbox);
      G.save.options.flag = setFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
      const sandbox = G.params.get("sandbox");
      if (sandbox && Provinces.includes(sandbox as Province)) {
         G.save.state.playerProvince = sandbox as Province;
      }
      setSpeed(360);
   } else {
      setSpeed(0);
   }

   if (G.params.has("nodev")) {
      G.flags = setFlag(G.flags, GameFlags.NoDev);
   }

   if (!import.meta.env.DEV) {
      G.flags = setFlag(G.flags, GameFlags.Demo);
   }

   if (isSteam()) {
      SteamClient.getAppId().then((steamId) => {
         if (steamId === RetailSteamId) {
            G.flags = clearFlag(G.flags, GameFlags.Demo);
         }
      });
   }

   if (G.params.has("legacy")) {
      showPanel(LegacyUpgradeSingletonModal, {});
   }

   const scene = G.params.get("scene")?.toLowerCase();
   switch (scene) {
      case "tech": {
         G.scene.loadScene(TechTreeScene);
         break;
      }
      default: {
         G.scene.loadScene(WorldScene);
         break;
      }
   }
}
