import { setFlag } from "@project/shared/src/utils/Helper";
import { type Province, Provinces } from "./game/definitions/Province";
import { GameOptionFlag } from "./game/GameOption";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { WorldScene } from "./scenes/WorldScene";
import { ProductionModal } from "./ui/ProductionModal";
import { G, GameFlags, setSpeed } from "./utils/Global";
import { showModal } from "./utils/ModalManager";

export function loadGameScene() {
   const params = new URLSearchParams(location.href.split("?")[1]);

   if (params.has("sandbox")) {
      G.flags = setFlag(G.flags, GameFlags.Sandbox);
      G.save.options.flag = setFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
      const sandbox = params.get("sandbox");
      if (sandbox && Provinces.includes(sandbox as Province)) {
         G.save.state.playerProvince = sandbox as Province;
      }
      setSpeed(360);
   } else {
      setSpeed(0);
   }

   if (params.has("production")) {
      showModal(<ProductionModal />);
   }

   const scene = params.get("scene")?.toLowerCase();
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
