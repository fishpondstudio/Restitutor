import { app } from "electron";

// Prefer native Wayland only when the socket is actually available.
// XDG_SESSION_TYPE=wayland without WAYLAND_DISPLAY (e.g. Steam forced to XWayland) would abort if we force ozone=wayland.
if (process.platform === "linux") {
   if (process.env.WAYLAND_DISPLAY) {
      app.commandLine.appendSwitch("ozone-platform", "wayland");
   } else {
      app.commandLine.appendSwitch("ozone-platform", "x11");
   }
}
