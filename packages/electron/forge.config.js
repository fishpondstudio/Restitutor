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

            // Electron appendSwitch("ozone-platform") is ignored on some Linux builds;
            // CLI flag works. Wrap the binary so Wayland sessions get native ozone.
            if (platform === "linux") {
               const bin = path.join(outputPath, "Restitutor");
               const real = path.join(outputPath, "Restitutor.bin");
               if (!fs.existsSync(bin)) {
                  throw new Error(`Linux binary missing: ${bin}`);
               }
               if (!fs.existsSync(real)) {
                  fs.renameSync(bin, real);
               }
               const wrapper = `#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OZ=( )
if [[ -n "\${WAYLAND_DISPLAY:-}" || "\${XDG_SESSION_TYPE:-}" == "wayland" ]]; then
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
