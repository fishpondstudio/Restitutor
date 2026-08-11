import { dateToYYYYMMDD } from "@project/shared/src/utils/Helper";
import { jsonDecode, jsonEncode } from "@project/shared/src/utils/Serialization";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import { isSteam, SteamClient } from "../rpc/SteamClient";
import { idbDel, idbGet, idbSet } from "../utils/BrowserStorage";
import { SaveKey } from "./definitions/Constant";
import type { SaveGame } from "./GameState";
import { getGameDate } from "./logic/GameDateTime";

export async function loadGame(): Promise<SaveGame> {
   const json = isSteam() ? await SteamClient.fileRead(SaveKey) : await idbGet<string>(SaveKey);
   if (!json) {
      throw new Error("Save not found");
   }
   return jsonDecode<SaveGame>(json);
}

export async function saveGame(save: SaveGame): Promise<void> {
   const serialized = jsonEncode(save);
   if (isSteam()) {
      await SteamClient.fileWrite(SaveKey, serialized);
   } else {
      await idbSet(SaveKey, serialized);
   }
}

export async function resetGame(): Promise<void> {
   if (isSteam()) {
      await SteamClient.fileDelete(SaveKey);
   } else {
      await idbDel(SaveKey);
   }
}

export async function loadFromFile(): Promise<SaveGame> {
   const [fileHandle] = await window.showOpenFilePicker();
   const file = await fileHandle.getFile();
   const json = await file.arrayBuffer();
   return jsonDecode<SaveGame>(decompressFromUint8Array(new Uint8Array(json)));
}

export async function saveToFile(save: SaveGame): Promise<FileSystemFileHandle> {
   const fileHandle = await window.showSaveFilePicker({
      suggestedName: `${save.state.playerProvince}_${dateToYYYYMMDD(getGameDate(save.state.tick))}_V${save.options.version}.save`,
   });
   const writable = await fileHandle.createWritable();
   await writable.write(compressToUint8Array(jsonEncode(save)) as Uint8Array<ArrayBuffer>);
   await writable.close();
   return fileHandle;
}
