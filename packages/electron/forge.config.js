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
         platforms: ["win32", "linux"],
      },
   ],
   hooks: {
      postPackage: (_forgeConfig, { platform, outputPaths }) => {
         const clientDist = path.resolve(__dirname, "../client/dist");
         if (!fs.existsSync(path.join(clientDist, "index.html"))) {
            throw new Error(`Client build is missing: ${clientDist}`);
         }
         for (const outputPath of outputPaths) {
            // Electron Packager returns the .app itself on macOS and the install
            // directory on Windows/Linux.
            const installRoot = platform === "darwin" ? path.dirname(outputPath) : outputPath;
            fs.copySync(clientDist, path.join(installRoot, "game"), { overwrite: true });
         }
      },
   },
};
