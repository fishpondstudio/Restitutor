import { createTheme, type MantineColorsTuple, MantineProvider, Portal, Tooltip } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { initDevtools } from "@pixi/devtools";
import { Application } from "pixi.js";
import { createRoot } from "react-dom/client";
import { bootstrap } from "./Bootstrap";
import "./css/main.css";
import { Fonts } from "./Fonts";
import { getVersion } from "./game/Version";
import { ASCIIMapPanel } from "./ui/ASCIIMapPanel";
import { BottomPanel } from "./ui/BottomPanel";
import { Popover } from "./ui/common/Popover";
import { Sidebar } from "./ui/common/SidebarManager";
import { LoadingComp } from "./ui/components/LoadingComp";
import { TopPanel } from "./ui/TopPanel";
import { TutorialPanel } from "./ui/TutorialPanel";
import { G, isDev } from "./utils/Global";
import { ModalManager } from "./utils/ModalManager";

const RomanColors: MantineColorsTuple = [
   "#fff3e9",
   "#f4e6da",
   "#e3cbb7",
   "#d3af91",
   "#c59770",
   "#bd885b",
   "#b9804f",
   "#a97142",
   "#926036",
   "#80522a",
];

const theme = createTheme({
   fontFamily: `${Fonts.MainFont}, sans-serif`,
   lineHeights: {
      xs: "1.0",
      sm: "1.1",
      md: "1.25",
      lg: "1.5",
      xl: "1.75",
   },
   colors: {
      roman: RomanColors,
   },
   primaryColor: "roman",
   components: {
      Portal: Portal.extend({
         defaultProps: {
            reuseTargetNode: true,
         },
      }),
      Tooltip: Tooltip.extend({
         defaultProps: {
            color: "gray",
            maw: "22rem",
            multiline: true,
         },
      }),
   },
   defaultRadius: "sm",
});

if (isDev()) {
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
      <ASCIIMapPanel />
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

if (isDev()) {
   initDevtools({ app });
}

G.pixi = app;
G.params = new URLSearchParams(window.location.search);
document.body.appendChild(app.view as HTMLCanvasElement);
const renderer = getWebglRenderInfo(app);
document.title = `Restitutor ${getVersion()} ${renderer}`;
bootstrap();

function getWebglRenderInfo(app: Application): string {
   const gl = app.view.getContext("webgl2") ?? app.view.getContext("webgl");
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
