import { createTheme, MantineProvider, Portal, Tooltip } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import { createRoot } from "react-dom/client";
import { bootstrap } from "./Bootstrap";
import "./css/main.css";
import { Fonts } from "./assets";
import { getVersion } from "./game/Version";
import { BottomPanel } from "./ui/BottomPanel";
import { Popover } from "./ui/common/Popover";
import { Sidebar } from "./ui/common/Sidebar";
import { LoadingComp } from "./ui/components/LoadingComp";
import { TopPanel } from "./ui/TopPanel";
import { TutorialPanel } from "./ui/TutorialPanel";
import { G } from "./utils/Global";
import { ModalManager } from "./utils/ModalManager";

const theme = createTheme({
   fontFamily: `${Fonts.MainFont}, sans-serif`,
   lineHeights: {
      xs: "1.0",
      sm: "1.1",
      md: "1.25",
      lg: "1.5",
      xl: "1.75",
   },
   primaryColor: "violet",
   components: {
      Portal: Portal.extend({
         defaultProps: {
            reuseTargetNode: true,
         },
      }),
      Tooltip: Tooltip.extend({
         defaultProps: {
            color: "gray",
            maw: "350px",
            multiline: true,
         },
      }),
   },
   defaultRadius: "sm",
});

if (import.meta.env.DEV) {
   document.body.classList.add("dev");
}

const root = document.getElementById("root")!;
createRoot(root).render(
   <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Notifications />
      <Sidebar />
      <TopPanel />
      <BottomPanel />
      <TutorialPanel />
      {/* <ChatPanel /> */}
      <Popover />
      <ModalManager />
      <LoadingComp />
   </MantineProvider>,
);

const app = new Application({
   resizeTo: document.body,
   autoDensity: true,
   resolution: window.devicePixelRatio,
   sharedTicker: true,
   background: 0x000000,
   backgroundAlpha: 1,
});

app.ticker.maxFPS = 60;

if (import.meta.env.DEV) {
   initDevtools({ app });
}

G.pixi = app;
document.body.appendChild(app.view as HTMLCanvasElement);
document.title = `Restitutor ${getVersion()}`;
bootstrap();

function getWebglRenderInfo(app: Application): string {
   const gl = app.view.getContext("webgl2");
   if (!gl) {
      return "";
   }
   const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
   if (!debugInfo) {
      return "";
   }
   const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
   return renderer;
}
