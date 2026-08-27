import { Switch } from "@mantine/core";
import { jsonDecode, jsonEncode } from "@project/shared/src/utils/Serialization";
import { useEffect, useState } from "react";
import { getVersion } from "../../game/Version";
import { openUrl, SteamClient } from "../../rpc/SteamClient";
import { ModalComp, ModalTitleBar } from "../../utils/ModalManager";
import { type IModConfigFile, type IModInfo, ModConfigFile } from "./ModConfigFile";

interface IWorkshopItem {
   publishedFileId: bigint;
   title: string;
   description: string;
   previewUrl?: string;
}

export function ModsManager(): React.ReactNode {
   const [installedMods, setInstalledMods] = useState<IModInfo[]>([]);
   const [modConfigFile, setModConfigFile] = useState<IModConfigFile>({ addons: new Set() });
   useEffect(() => {
      SteamClient.getInstalledMods().then((mods) => {
         setInstalledMods(mods);
      });
      SteamClient.fileRead(ModConfigFile).then((config) => {
         if (config) {
            setModConfigFile(jsonDecode<IModConfigFile>(config));
         }
      });
      document.title = `Restitutor Mods Manager ${getVersion()}`;
   }, []);
   return (
      <ModalComp
         title={
            <>
               <ModalTitleBar title="Mods Manager" />
               <div className="row m10">
                  <button
                     className="btn text-xl px10 py5 row g5"
                     onClick={() => {
                        openUrl("https://steamcommunity.com/app/4431750/workshop/");
                     }}
                  >
                     <div className="mi sm">open_in_new</div>
                     Steam Workshop
                  </button>
                  <div className="f1" />
                  <button
                     className="btn text-xl px10 py5 primary"
                     onClick={async () => {
                        await SteamClient.fileWrite(ModConfigFile, jsonEncode(modConfigFile));
                        await SteamClient.launchGame();
                     }}
                  >
                     Launch Game
                  </button>
               </div>
               <div className="h1">Installed Mods</div>
            </>
         }
         size="lg"
      >
         {installedMods.map((mod) => {
            return (
               <ModItem
                  key={mod.id}
                  mod={mod}
                  checked={
                     mod.kind === "Addon" ? modConfigFile.addons.has(mod.id) : modConfigFile.totalConversion === mod.id
                  }
                  onChange={(checked) => {
                     if (mod.kind === "Addon") {
                        if (checked) {
                           modConfigFile.addons.add(mod.id);
                        } else {
                           modConfigFile.addons.delete(mod.id);
                        }
                     }
                     if (mod.kind === "TotalConversion") {
                        if (checked) {
                           modConfigFile.totalConversion = mod.id;
                        } else {
                           modConfigFile.totalConversion = undefined;
                        }
                     }
                     setModConfigFile({ ...modConfigFile });
                  }}
               />
            );
         })}
         <div className="m10 text-dimmed">
            There are two kinds of mods: <i>addon</i> and <i>total conversion</i>. You can load multiple addon mods but
            only one total conversion mod. Mods might not be compatible with each other. The game remembers your last
            loaded mods.
         </div>
      </ModalComp>
   );
}

function ModItem({
   mod,
   checked,
   onChange,
}: {
   mod: IModInfo;
   checked: boolean;
   onChange: (checked: boolean) => void;
}): React.ReactNode {
   const [info, setInfo] = useState<IWorkshopItem | null>(null);
   useEffect(() => {
      SteamClient.getModInfo(mod.id)
         .then((data) => setInfo(data))
         .catch((error) => console.error(error));
   }, [mod.id]);
   return (
      <div className="box row g20 m10" key={mod.id}>
         <div>
            <img src={info?.previewUrl} alt={info?.title} style={{ width: "60px", height: "60px", display: "block" }} />
         </div>
         <div className="f1" style={{ minWidth: 0 }}>
            <div className="text-roman text-ellipsis">{info?.title ?? `Loading ${mod.id}...`}</div>
            <div className="text-ellipsis">
               ({mod.kind === "Addon" ? "Addon" : "Total Conversion"}) {info?.description ?? `Loading ${mod.id}...`}
            </div>
         </div>
         <div className="mr10">
            <Switch
               checked={checked}
               onChange={(e) => {
                  onChange(e.target.checked);
               }}
            />
         </div>
      </div>
   );
}
