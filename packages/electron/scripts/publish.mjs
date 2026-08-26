import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs-extra";

const fullBuild = process.argv.includes("--full");
const rootPath = path.resolve(path.join("../../"));
const versionFile = path.join(rootPath, "packages", "client", "src", "version.json");
const version = JSON.parse(fs.readFileSync(versionFile, "utf-8"));
const build = ++version.build;
fs.writeFileSync(versionFile, JSON.stringify(version));

console.log(`🔔 Build Number: ${build}`);

cmd("pnpm run build", path.join(rootPath, "packages", "client"));
cmd("npx wrangler pages deploy ./dist --project-name restitutor", path.join(rootPath, "packages", "client"));
fs.removeSync("./node_modules");
cmd("npm install", path.join(rootPath, "packages", "electron"));

if (fullBuild) {
   cmd("npm run package -- --platform=win32,linux,darwin", path.join(rootPath, "packages", "electron"));
   cmd(`rcodesign sign --p12-file local/app-sign.p12 --p12-password-file local/p12-password`
      + ` --code-signature-flags runtime`
      + ` --entitlements-xml-file local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Restitutor Helper.app":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Restitutor Helper.app":local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Restitutor Helper (Renderer).app":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Restitutor Helper (Renderer).app":local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Restitutor Helper (GPU).app":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Restitutor Helper (GPU).app":local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Restitutor Helper (Plugin).app":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Restitutor Helper (Plugin).app":local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler":local/entitlements.plist`
      + ` --code-signature-flags "Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt":runtime`
      + ` --entitlements-xml-file "Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt":local/entitlements.plist`
      + ` ./out/Restitutor-darwin-x64/Restitutor.app`, path.join(rootPath, "packages", "electron"));
   cmd(`rcodesign notary-submit --api-key-file local/app-store.json --staple out/Restitutor-darwin-x64/Restitutor.app`, path.join(rootPath, "packages", "electron"));
} else {
   copyGameFiles("Restitutor-win32-x64");
   copyGameFiles("Restitutor-linux-x64");
   copyGameFiles("Restitutor-darwin-x64");
}

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   process.exit(1);
}

copyVdf("win32.vdf");
copyVdf("linux.vdf");
copyVdf("darwin.vdf");

copyBuild("Restitutor-win32-x64");
copyBuild("Restitutor-linux-x64");
copyBuild("Restitutor-darwin-x64");

cmd(
   `${path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh")} +runscript ../restitutor.txt`,
   process.env.STEAMWORKS_PATH,
);

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}

function replaceVersion(path) {
   const content = fs.readFileSync(path, { encoding: "utf8" });
   fs.writeFileSync(path, content.replace("@Version", build));
}


function copyVdf(filename) {
   fs.copyFileSync(
      path.join(rootPath, "packages", "electron", "scripts", filename),
      path.join(process.env.STEAMWORKS_PATH, "restitutor", filename),
   );
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "restitutor", filename));
};

function copyBuild(folder) {
   cmd(`rcodesign notary-submit --api-key-file local/app-store.json --staple out/Restitutor-darwin-x64/Restitutor.app`, path.join(rootPath, "packages", "electron"));
   fs.removeSync(path.join(process.env.STEAMWORKS_PATH, folder));
   fs.copySync(
      path.join(rootPath, "packages", "electron", "out", folder),
      path.join(process.env.STEAMWORKS_PATH, folder),
   );
};

function copyGameFiles(folder) {
   const buildFolder = path.join(rootPath, "packages", "electron", "out", folder);
   if (!fs.existsSync(buildFolder)) {
      console.error(`Build folder ${buildFolder} does not exist`);
      process.exit(1);
   }
   fs.removeSync(path.join(buildFolder, "game"));
   fs.copySync(
      path.join(rootPath, "packages", "client", "dist"),
      path.join(buildFolder, "game"),
   );
};