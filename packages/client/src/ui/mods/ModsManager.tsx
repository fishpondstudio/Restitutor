import { Select, Switch } from "@mantine/core";
import { type Language, SupportedLanguages } from "@project/shared/src/rpc/ServerMessageTypes";
import { jsonDecode, jsonEncode } from "@project/shared/src/utils/Serialization";
import { useEffect, useState } from "react";
import { Languages } from "../../game/Languages";
import { getVersion } from "../../game/Version";
import { openUrl, SteamClient } from "../../rpc/SteamClient";
import { $t, L } from "../../utils/i18n";
import { ModalComp, ModalTitleBar } from "../../utils/ModalManager";
import { html } from "../components/RenderHTMLComp";
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
   const [language, setLanguage] = useState<Language>(SupportedLanguages[0]);
   useEffect(() => {
      SteamClient.getInstalledMods().then((mods) => {
         setInstalledMods(mods);
      });
      SteamClient.fileRead(ModConfigFile).then((config) => {
         if (config) {
            setModConfigFile(jsonDecode<IModConfigFile>(config));
         }
      });
      document.title = $t(L.RestitutorModsManager$1, getVersion());
   }, []);
   return (
      <ModalComp
         title={
            <>
               <ModalTitleBar title={$t(L.ModsManager)} />
               <div className="row m10">
                  <Select
                     className="f1"
                     leftSection={<div className="mi sm">translate</div>}
                     checkIconPosition="right"
                     data={SupportedLanguages.map((language) => ({
                        label: Languages[language].$$Language,
                        value: language,
                     }))}
                     value={language}
                     onChange={(value) => {
                        if (value) {
                           const newLanguage = value as Language;
                           Object.assign(L, Languages[newLanguage]);
                           document.title = $t(L.RestitutorModsManager$1, getVersion());
                           setLanguage(newLanguage);
                        }
                     }}
                  />
                  <button
                     className="btn text-xl px10 py5 row g5"
                     onClick={() => {
                        openUrl("https://steamcommunity.com/app/4431750/workshop/");
                     }}
                  >
                     <div className="mi sm">open_in_new</div>
                     {$t(L.SteamWorkshop)}
                  </button>
                  <div className="f1" />
                  <button
                     className="btn text-xl px10 py5 primary"
                     onClick={async () => {
                        await SteamClient.fileWrite(ModConfigFile, jsonEncode(modConfigFile));
                        await SteamClient.launchGame();
                     }}
                  >
                     {$t(L.LaunchGame)}
                  </button>
               </div>
               <div className="h1">{$t(L.InstalledMods)}</div>
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
         <div className="m10 text-dimmed">{html($t(L.ModsManagerDescription))}</div>
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
            <div className="text-roman text-ellipsis">{info?.title ?? $t(L.Loading$1, mod.id)}</div>
            <div className="text-ellipsis">
               ({mod.kind === "Addon" ? $t(L.Addon) : $t(L.TotalConversion)}){" "}
               {info?.description ?? $t(L.Loading$1, mod.id)}
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
