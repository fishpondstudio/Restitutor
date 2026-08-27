import type { IPCService } from "@project/electron/src/IPCService";
import { rpcClient } from "@project/shared/src/thirdparty/TRPCClient";
import { saveGame } from "../game/LoadSave";
import { showError } from "../game/logic/AlertLogic";
import { playError } from "../ui/Sound";
import { G } from "../utils/Global";

export function isSteam(): boolean {
   return typeof IPCBridge !== "undefined";
}

export const SteamClient = rpcClient<IPCService>({
   request: (method: string, params: any[]) => {
      if (typeof IPCBridge === "undefined") {
         throw new Error("SteamClient is not defined");
      }
      return IPCBridge.rpcCall(method, params);
   },
});

window.addEventListener("DOMContentLoaded", () => {
   if (typeof IPCBridge !== "undefined") {
      IPCBridge.onClose(() => {
         if (G.save) {
            saveGame(G.save)
               .then(() => SteamClient.quit())
               .catch((e) => {
                  playError();
                  showError(String(e));
               });
         } else {
            SteamClient.quit();
         }
      });
   }
});

export function openUrl(url: string): void {
   if (isSteam()) {
      SteamClient.openUrl(url);
      return;
   }
   window.open(url, "_blank");
}
