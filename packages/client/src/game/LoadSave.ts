import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { dateToYYYYMMDD } from "@project/shared/src/utils/Helper";
import { jsonDecode, jsonEncode } from "@project/shared/src/utils/Serialization";
import { compressToUint8Array, decompressFromUint8Array } from "lz-string";
import { BackupCount, BackupFrequency, SaveKey } from "./definitions/Constant";
import type { SaveGame } from "./GameState";
import { getGameDate } from "./logic/GameDateTime";
import { deleteFile, readFile, writeFile } from "./NativeUtils";

export async function loadGame(): Promise<SaveGame> {
   const json = await readFile(SaveKey);
   if (!json) {
      throw new Error("Save not found");
   }
   return jsonDecode<SaveGame>(json);
}

export async function saveGame(save: SaveGame): Promise<void> {
   if (resetRequested) {
      return;
   }
   const serialized = jsonEncode(save);
   await writeFile(SaveKey, serialized);
}

let counter = 0;
let lastBackupTime = Date.now();

export async function saveAndBackupGame(save: SaveGame): Promise<void> {
   await saveGame(save);
   if (Date.now() - lastBackupTime > BackupFrequency) {
      await writeFile(`${SaveKey}_${(counter % BackupCount) + 1}`, jsonEncode(save));
      ++counter;
      lastBackupTime = Date.now();
   }
}

let resetRequested = false;

export async function resetGame(): Promise<void> {
   resetRequested = true;
   await deleteFile(SaveKey);
}

export async function loadFromFile(): Promise<SaveGame> {
   let file: File;
   if (typeof window.showOpenFilePicker === "function") {
      const [fileHandle] = await window.showOpenFilePicker();
      file = await fileHandle.getFile();
   } else {
      file = await new Promise<File>((resolve, reject) => {
         const input = document.createElement("input");
         input.type = "file";
         input.hidden = true;
         const cancel = () => {
            input.remove();
            reject(new DOMException("File selection cancelled", "AbortError"));
         };
         input.addEventListener("cancel", cancel, { once: true });
         input.addEventListener(
            "change",
            () => {
               const selectedFile = input.files?.[0];
               if (!selectedFile) {
                  cancel();
                  return;
               }
               input.remove();
               resolve(selectedFile);
            },
            { once: true },
         );
         document.body.append(input);
         input.click();
      });
   }
   const json = await file.arrayBuffer();
   return jsonDecode<SaveGame>(decompressFromUint8Array(new Uint8Array(json)));
}

export async function saveToFile(save: SaveGame): Promise<string | null> {
   const name = `${save.state.playerProvince}_${dateToYYYYMMDD(getGameDate(save.state.tick, save))}_${save.state.scenario}_V${save.options.version}.save`;
   if (Capacitor.isNativePlatform()) {
      const data = compressToUint8Array(jsonEncode(save)) as Uint8Array<ArrayBuffer>;
      const base64 = await new Promise<string>((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve((reader.result as string).split(",")[1]);
         reader.onerror = () => reject(reader.error);
         reader.readAsDataURL(new Blob([data], { type: "application/octet-stream" }));
      });
      const { uri } = await Filesystem.writeFile({
         path: `exports/${crypto.randomUUID()}/${name}`,
         directory: Directory.Cache,
         data: base64,
         recursive: true,
      });
      // Keep the cached file available while the receiving app reads it.
      await Share.share({ files: [uri] });
      return null;
   }
   if (typeof window.showSaveFilePicker === "function") {
      const fileHandle = await window.showSaveFilePicker({ suggestedName: name });
      const writable = await fileHandle.createWritable();
      await writable.write(compressToUint8Array(jsonEncode(save)) as Uint8Array<ArrayBuffer>);
      await writable.close();
      return fileHandle.name;
   }
   const data = compressToUint8Array(jsonEncode(save)) as Uint8Array<ArrayBuffer>;
   const url = URL.createObjectURL(new Blob([data], { type: "application/octet-stream" }));
   const link = document.createElement("a");
   link.href = url;
   link.download = name;
   document.body.append(link);
   try {
      link.click();
   } finally {
      link.remove();
      // Give the browser time to consume the URL before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
   }
   return null;
}
