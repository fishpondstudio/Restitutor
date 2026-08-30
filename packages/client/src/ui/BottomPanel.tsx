import { SegmentedControl } from "@mantine/core";
import { OnSceneSwitched } from "../game/Events";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideSidebar } from "./common/SidebarManager";
import { FloatingTip } from "./components/FloatingTip";
import { IconCatalog } from "./IconCatalog";

export function BottomPanel(): React.ReactNode {
   return (
      <div className="bottom-panel panel">
         <SceneSwitcherComp />
      </div>
   );
}

function SceneSwitcherComp(): React.ReactNode {
   refreshOnTypedEvent(OnSceneSwitched);
   if (!G.scene) return null;
   return (
      <SegmentedControl
         fullWidth
         radius="6"
         color="rgba(255, 255, 255, 0.2)"
         styles={{
            root: {
               background: "none",
               "--sc-font-size": "var(--mantine-font-size-md)",
            },
         }}
         data={[
            {
               label: (
                  <FloatingTip label={$t(L.WorldMap)}>
                     <img src={IconCatalog.MapIcon} height={24} className="display-block" />
                  </FloatingTip>
               ),
               value: WorldScene.name,
            },
            {
               label: (
                  <FloatingTip label={$t(L.TechTree)}>
                     <img
                        src={IconCatalog.TechTree}
                        id={
                           G.scene.isCurrent(TechTreeScene)
                              ? "BottomPanel_TechTree_Active"
                              : "BottomPanel_TechTree_Inactive"
                        }
                        height={24}
                        className="display-block"
                     />
                  </FloatingTip>
               ),
               value: TechTreeScene.name,
            },
         ]}
         onChange={(value) => {
            switch (value) {
               case WorldScene.name: {
                  hideSidebar();
                  G.scene.loadScene(WorldScene);
                  break;
               }
               case TechTreeScene.name: {
                  hideSidebar();
                  G.scene.loadScene(TechTreeScene);
                  break;
               }
            }
         }}
         value={G.scene.currentSceneId}
      />
   );
}
