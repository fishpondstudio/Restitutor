import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs-extra";

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
cmd("npm run package -- --platform=win32,linux", path.join(rootPath, "packages", "electron"));

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   process.exit();
}

const copyVdf = (filename) => {
   fs.copyFileSync(
      path.join(rootPath, "packages", "electron", "scripts", filename),
      path.join(process.env.STEAMWORKS_PATH, "restitutor", filename),
   );
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "restitutor", filename));
};

const copyBuild = (folder) => {
   fs.removeSync(path.join(process.env.STEAMWORKS_PATH, folder));
   fs.copySync(
      path.join(rootPath, "packages", "electron", "out", folder),
      path.join(process.env.STEAMWORKS_PATH, folder),
   );
};

copyVdf("win32.vdf");
copyVdf("linux.vdf");

copyBuild("Restitutor-win32-x64");
copyBuild("Restitutor-linux-x64");

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
