import { app } from "electron";

// Must run before any other app.* — Chromium picks ozone during early init.
if (process.platform === "linux") {
   if (process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === "wayland") {
      app.commandLine.appendSwitch("ozone-platform", "wayland");
   } else {
      app.commandLine.appendSwitch("ozone-platform", "x11");
   }
}
