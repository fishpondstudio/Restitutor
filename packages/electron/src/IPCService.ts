import console from "node:console";
import path from "node:path";
import type { workshop } from "@fishpondstudio/steamworks.js/client";
import { app, type BrowserWindow, shell } from "electron";
import { exists, outputFile, readFile, unlink } from "fs-extra";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import { type IModConfigFile, type IModInfo, ModConfigFile } from "../../client/src/ui/mods/ModConfigFile";
import { jsonDecode } from "../../shared/src/utils/Serialization";
import { getGameSavePath, getLocalGameSavePath, type SteamClient } from ".";

export class IPCService {
   private _client: SteamClient;
   private _mainWindow: BrowserWindow;

   constructor(steam: SteamClient, mainWindow: BrowserWindow) {
      this._client = steam;
      this._mainWindow = mainWindow;
   }

   public async fileWrite(name: string, content: string): Promise<void> {
      await outputFile(path.join(getGameSavePath(), this.getSteamId(), name), compressToUint8Array(content));
   }

   public async fileWriteBytes(name: string, content: Uint8Array): Promise<void> {
      if (content.byteLength <= 0) return;
      await outputFile(path.join(getGameSavePath(), this.getSteamId(), name), Buffer.from(content));
   }

   public async fileRead(name: string): Promise<string | undefined> {
      try {
         const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
         return decompressFromUint8Array(content);
      } catch (error) {
         return undefined;
      }
   }

   public async fileReadBytes(name: string): Promise<ArrayBuffer> {
      const content = await readFile(path.join(getGameSavePath(), this.getSteamId(), name));
      return content.buffer;
   }

   public async fileDelete(name: string): Promise<void> {
      const filePath = path.join(getGameSavePath(), this.getSteamId(), name);
      if (await exists(filePath)) {
         unlink(filePath);
      }
   }

   public openUrl(url: string): void {
      shell.openExternal(url);
   }

   public getSteamId(): string {
      return this._client.localplayer.getSteamId().steamId64.toString();
   }

   public async getAuthSessionTicket(): Promise<string> {
      return (await this._client.auth.getAuthTicketForWebApi("")).getBytes().toString("hex");
   }

   public getAppId(): number {
      return this._client.utils.getAppId();
   }

   public getBetaName(): string {
      return this._client.apps.currentBetaName() ?? "";
   }

   public openMainSaveFolder(): void {
      shell.openPath(path.join(getGameSavePath(), this.getSteamId()));
   }

   public openBackupSaveFolder(): void {
      shell.openPath(path.join(getLocalGameSavePath(), this.getSteamId()));
   }

   public openLogFolder(): void {
      shell.openPath(getLocalGameSavePath());
   }

   public enterFullScreen(): void {
      this._mainWindow.setFullScreen(true);
   }

   public exitFullScreen(): void {
      this._mainWindow.setFullScreen(false);
   }

   public unlockAchievement(key: string): boolean {
      return this._client.achievement.activate(key);
   }

   public async getInstalledMods(): Promise<IModInfo[]> {
      const ids = this._client.workshop.getSubscribedItems();
      const result: IModInfo[] = [];
      for (const id of ids) {
         const info = this._client.workshop.installInfo(id);
         if (info) {
            if (await exists(path.join(info.folder, "index.html"))) {
               result.push({ id, kind: "TotalConversion" });
            } else if (await exists(path.join(info.folder, "index.js"))) {
               result.push({ id, kind: "Addon" });
            }
         }
      }
      return result;
   }

   public async getModInfo(id: bigint): Promise<workshop.WorkshopItem | null> {
      return this._client.workshop.getItem(id);
   }

   public async launchGame(): Promise<void> {
      try {
         const config = await this.fileRead(ModConfigFile);
         if (config) {
            const modConfigFile = jsonDecode<IModConfigFile>(config);
            if (modConfigFile.totalConversion) {
               const info = this._client.workshop.installInfo(modConfigFile.totalConversion);
               if (info) {
                  const file = path.join(info.folder, "index.html");
                  if (await exists(file)) {
                     this._mainWindow.loadFile(file);
                     return;
                  }
               }
            }
         }
         const url = new URL(this._mainWindow.webContents.getURL());
         url.searchParams.delete("mod");
         this._mainWindow.loadURL(url.toString());
      } catch (error) {
         console.error(error);
      }
   }

   public async loadAddonMods(): Promise<string[]> {
      const result: string[] = [];
      try {
         const config = await this.fileRead(ModConfigFile);
         if (config) {
            const modConfigFile = jsonDecode<IModConfigFile>(config);
            for (const mod of modConfigFile.addons) {
               const info = this._client.workshop.installInfo(mod);
               if (info) {
                  const file = path.join(info.folder, "index.js");
                  if (await exists(file)) {
                     const content = await readFile(file, "utf8");
                     result.push(content);
                  }
               }
            }
         }
      } catch (error) {
         console.error(error);
      }
      return result;
   }

   public quit(): void {
      app.exit(0);
   }
}
