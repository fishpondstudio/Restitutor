const fs = require("fs-extra");
const path = require("node:path");

module.exports = {
   packagerConfig: {
      icon: "./icons/icon",
      ignore: [
         /src\/*/,
         /scripts\/*/,
         /save\/*/,
         /\.ts/,
         /steam_appid\.txt/,
         /\.git(ignore|modules)/,
         /forge\.config\.js/,
         /package-lock\.json/,
         /tsconfig\.json/,
         /clean\.js/,
      ],
      asar: {
         unpack: "*.{node,dll,dylib,so,lib}",
      },
   },
   rebuildConfig: {},
   makers: [
      {
         name: "@electron-forge/maker-zip",
         platforms: ["win32", "linux", "darwin"],
      },
   ],
   hooks: {
      postPackage: (_forgeConfig, { platform, outputPaths }) => {
         const clientDist = path.resolve(__dirname, "../client/dist");
         if (!fs.existsSync(path.join(clientDist, "index.html"))) {
            throw new Error(`Client build is missing: ${clientDist}`);
         }
         for (const outputPath of outputPaths) {
            const targetPath = path.join(outputPath, "game");
            console.log(`Copying from ${clientDist} to ${targetPath}`);
            fs.copySync(clientDist, targetPath, { overwrite: true });

            // On Hyprland, appendSwitch(ozone-platform) alone still lands on XWayland;
            // the CLI flag works. Wrap so WAYLAND_DISPLAY sessions get native ozone.
            // linux-ozone.ts covers electron-forge start; this wrapper covers packaged builds.
            if (platform === "linux") {
               const bin = path.join(outputPath, "Restitutor");
               const real = path.join(outputPath, "Restitutor.bin");
               if (!fs.existsSync(bin)) {
                  throw new Error(`Linux binary missing: ${bin}`);
               }
               // Always replace .bin so a stale leftover cannot ship with a new wrapper.
               if (fs.existsSync(real)) {
                  fs.removeSync(real);
               }
               fs.renameSync(bin, real);
               const wrapper = `#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OZ=( )
if [[ -n "\${WAYLAND_DISPLAY:-}" ]]; then
  OZ=(--ozone-platform=wayland)
else
  OZ=(--ozone-platform=x11)
fi
exec "$DIR/Restitutor.bin" "\${OZ[@]}" "$@"
`
               fs.writeFileSync(bin, wrapper, { mode: 0o755 });
               console.log(`Wrapped Linux binary with Wayland/X11 ozone launcher`);
            }
         }
      },
   },
};
