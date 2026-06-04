import { Select, Slider, Switch } from "@mantine/core";
import { hasFlag, safeParseInt, toggleFlag } from "@project/shared/src/utils/Helper";
import { DiscordUrl, PatchNotesUrl, SteamUrl } from "../game/definitions/Constant";
import { GameOptionUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { loadFromFile, resetGame, saveGame, saveToFile } from "../game/LoadSave";
import { showSuccess } from "../game/logic/AlertLogic";
import { getVersion } from "../game/Version";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar, showModal } from "../utils/ModalManager";
import { ConfirmModal } from "./ConfirmModal";
import { FloatingTip } from "./components/FloatingTip";
import { Grid2 } from "./UIConstant";

export function SettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <ModalComp title={<ModalTitleBar title={$t(L.Settings)} dismiss />}>
         <div className="h1">{$t(L.Gameplay)}</div>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.PauseWhenAGameEventOccurs)}</div>
               <Switch
                  checked={hasFlag(G.save.options.flag, GameOptionFlag.PauseGameOnEvent)}
                  onChange={() => {
                     G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.PauseGameOnEvent);
                     GameOptionUpdated.emit();
                  }}
               />
            </div>
            <div className="row my5">
               <div className="f1">{$t(L.HideSteamAndDiscordButtons)}</div>
               <Switch
                  checked={hasFlag(G.save.options.flag, GameOptionFlag.HideSteamDiscordButton)}
                  onChange={() => {
                     G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.HideSteamDiscordButton);
                     GameOptionUpdated.emit();
                  }}
               />
            </div>
         </div>
         <div className="h1">{$t(L.Chronicle)}</div>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.ShowChroniclePopup)}</div>
               <div>{$t(L.Every)}</div>
               <Select
                  w={65}
                  data={["1", "2", "5", "10"]}
                  value={G.save.options.chroniclePopupFrequency.toString()}
                  onChange={(value) => {
                     if (value) {
                        G.save.options.chroniclePopupFrequency = safeParseInt(value, 1);
                        GameOptionUpdated.emit();
                     }
                  }}
                  allowDeselect={false}
                  checkIconPosition="right"
               />
               <div>{$t(L.Year)}</div>
            </div>
         </div>
         <div className="h1">{$t(L.Tutorial)}</div>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.ShowTutorial)}</div>
               <Switch
                  checked={!hasFlag(G.save.options.flag, GameOptionFlag.HideTutorial)}
                  onChange={() => {
                     G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
                     GameOptionUpdated.emit();
                  }}
               />
            </div>
            <div className="row my5">
               <div className="f1">{$t(L.CollapseTutorialPanel)}</div>
               <Switch
                  checked={hasFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial)}
                  onChange={() => {
                     G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial);
                     GameOptionUpdated.emit();
                  }}
               />
            </div>
         </div>
         <div className="h1">{$t(L.Sound)}</div>
         <div className="row m10">
            <div>{$t(L.Volume)}</div>
            <Slider
               className="f1"
               min={0}
               max={1}
               step={0.1}
               value={G.save.options.volume}
               onChange={(value) => {
                  G.save.options.volume = value;
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="h1">{$t(L.Version)}</div>
         <div className="m10">
            <div className="row my5">
               <div className="f1">{$t(L.GameVersion)}</div>
               <div>{getVersion()}</div>
            </div>
            <FloatingTip label={$t(L.YouCanOnlyLoadSaveFilesThatMatchTheSupportedSaveVersion)}>
               <div className="row my5">
                  <div className="f1">{$t(L.SupportedSaveVersion)}</div>
                  <div>{G.save.options.version}</div>
               </div>
            </FloatingTip>
         </div>
         <div className="divider" />
         <div className="m10" style={Grid2}>
            <button
               className="btn"
               onClick={async () => {
                  const fileHandle = await saveToFile(G.save);
                  showSuccess($t(L.GameSavedToFileX, fileHandle.name));
               }}
            >
               {$t(L.SaveToFile)}
            </button>
            <button
               className="btn"
               onClick={async () => {
                  G.save = await loadFromFile();
                  saveGame(G.save);
                  window.location.reload();
               }}
            >
               {$t(L.LoadFromFile)}
            </button>
            <button className="btn" onClick={() => openUrl(SteamUrl)}>
               {$t(L.WishlistOnSteam)}
            </button>
            <button className="btn" onClick={() => openUrl(DiscordUrl)}>
               {$t(L.JoinDiscord)}
            </button>{" "}
            <button className="btn" onClick={() => openUrl(PatchNotesUrl)}>
               {$t(L.ViewPatchNotes)}
            </button>
            <button
               className="btn text-red"
               onClick={() => {
                  showModal(
                     <ConfirmModal
                        title={$t(L.HardReset)}
                        message={$t(L.AreYouSureYouWantToHardResetTheGameThisCannotBeUndone)}
                        confirm={{
                           label: $t(L.HardReset),
                           class: "text-red",
                           onClick: async () => {
                              await resetGame();
                              window.location.reload();
                           },
                        }}
                     />,
                  );
               }}
            >
               {$t(L.HardReset)}
            </button>
         </div>
      </ModalComp>
   );
}
