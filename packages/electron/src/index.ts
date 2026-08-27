import path from "node:path";
import { type Client, init, shutdown } from "@fishpondstudio/steamworks.js";
import type { workshop } from "@fishpondstudio/steamworks.js/client";
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { ensureDirSync, existsSync, renameSync } from "fs-extra";
import { SaveKey } from "../../client/src/game/definitions/Constant";
import { getInstallRoot } from "./InstallRoot";
import { IPCService } from "./IPCService";

export type SteamClient = Omit<Client, "init" | "runCallbacks">;
const ProductName = "Restitutor";

app.commandLine.appendSwitch("enable-logging", "file");

ensureDirSync(getLocalGameSavePath());
ensureDirSync(getGameSavePath());

const logPath = path.join(getLocalGameSavePath(), `${ProductName}.log`);
if (existsSync(logPath)) {
   renameSync(logPath, path.join(getLocalGameSavePath(), `${ProductName}-prev.log`));
}

app.commandLine.appendSwitch("log-file", logPath);
app.commandLine.appendSwitch("enable-experimental-web-platform-features");

export function getGameSavePath(): string {
   return path.join(app.getPath("appData"), `${ProductName}Saves`);
}

export function getLocalGameSavePath(): string {
   return path.join(app.getPath("appData"), `${ProductName}Local`);
}

export const MIN_WIDTH = 1136;
export const MIN_HEIGHT = 640;

const createWindow = async () => {
   try {
      const steam = init();

      const ids = steam.workshop.getSubscribedItems();
      const installed: (workshop.InstallInfo & { id: bigint })[] = [];
      for (const id of ids) {
         const info = steam.workshop.installInfo(id);
         if (info) {
            installed.push({ ...info, id });
         } else {
            steam.workshop.download(id, true);
         }
      }

      const params = new URLSearchParams();

      if (installed.length > 0) {
         console.log(`Installed mods: ${installed.map(({ id }) => id.toString()).join(",")}`);
         params.set("mod", "");
      }

      const mainWindow = new BrowserWindow({
         webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: !app.isPackaged,
            backgroundThrottling: false,
         },
         minHeight: MIN_HEIGHT,
         minWidth: MIN_WIDTH,
         show: false,
         backgroundColor: "#000000",
      });

      const service = new IPCService(steam, mainWindow);
      ipcMain.handle("__RPCCall", (_e, method: keyof IPCService, args) => {
         // @ts-expect-error
         return service[method].apply(service, args);
      });

      mainWindow.removeMenu();
      mainWindow.maximize();
      mainWindow.show();

      if (app.isPackaged) {
         const installRoot = getInstallRoot();
         const gameIndex = path.join(installRoot, "game", "index.html");
         if (!existsSync(gameIndex)) {
            throw new Error(`Game content is missing: ${gameIndex}`);
         }
         await mainWindow.loadFile(gameIndex, { search: params.toString() });
         mainWindow.webContents.openDevTools();
      } else {
         await mainWindow.loadURL(`http://localhost:5173/?${params.toString()}`);
         mainWindow.webContents.openDevTools();
      }

      if (steam.utils.isSteamRunningOnSteamDeck()) {
         mainWindow.setFullScreen(true);
      }

      mainWindow.on("close", (e) => {
         e.preventDefault();
         dialog
            .showMessageBox({
               type: "info",
               title: `Save and Exit ${ProductName}`,
               message: `Are you sure to save the game and exit ${ProductName}?`,
               buttons: ["Yes", "No"],
            })
            .then((result) => {
               if (result.response === 0) {
                  mainWindow.webContents.send("close");
               }
            });
      });

      mainWindow.webContents.on("before-input-event", (_e, input) => {
         if (input.control && input.shift && input.key.toLocaleLowerCase() === "r") {
            dialog
               .showMessageBox({
                  type: "info",
                  title: "Hard Reset",
                  message: "You requested a hard reset, all progress will be lost.",
                  buttons: ["Hard Reset", "Cancel"],
               })
               .then((result) => {
                  if (result.response === 0) {
                     service.fileDelete(SaveKey);
                     mainWindow.webContents.reload();
                  }
               });
         }
      });
   } catch (error) {
      dialog.showErrorBox("Failed to Start Game", String(error));
      quit();
   }
};

Menu.setApplicationMenu(null);

app.on("ready", createWindow);

app.on("window-all-closed", () => {
   quit();
});

function quit() {
   shutdown();
   app.quit();
}
