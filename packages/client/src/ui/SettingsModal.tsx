import { SegmentedControl, Select, Slider, Switch } from "@mantine/core";
import { entriesOf, hasFlag, range, safeParseFloat, safeParseInt, toggleFlag } from "@project/shared/src/utils/Helper";
import { Fragment, useState } from "react";
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
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { ConfirmModal } from "./ConfirmModal";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { Todos } from "./LeftPanel";
import { Grid2 } from "./UIConstant";

type SettingsTab = "general" | "tabs";

export function SettingsModal(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   const [tab, setTab] = useState<SettingsTab>("general");
   return (
      <ModalComp size="lg" title={<ModalTitleBar title={$t(L.Settings)} dismiss />}>
         <div className="row g0">
            <div className="fstart" style={{ width: "10rem" }}>
               <SegmentedControl
                  fullWidth
                  className="text-display p10"
                  classNames={{
                     indicator: "frame frame-thin frame-btn",
                  }}
                  styles={{
                     root: {
                        background: "none",
                        "--sc-font-size": "var(--mantine-font-size-lg)",
                     },
                     label: {
                        padding: "0.5rem 0.625rem",
                        textAlign: "left",
                     },
                  }}
                  orientation="vertical"
                  data={[
                     { label: $t(L.General), value: "general" },
                     { label: $t(L.Todo), value: "tabs" },
                  ]}
                  value={tab}
                  onChange={(value) => setTab(value as SettingsTab)}
               />
            </div>
            <div className="divider vertical" />
            <div className="f1">
               {tab === "general" && <SettingsGeneralTab />}
               {tab === "tabs" && <SettingsTodoTab />}
            </div>
         </div>
      </ModalComp>
   );
}

function SettingsTodoTab(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <>
         <div className="h1">{$t(L.ManageTodoIconsLeftSide)}</div>
         {entriesOf(Todos).map(([id, todo]) => (
            <Fragment key={id}>
               <div key={id} className="row m10">
                  <img src={todo.icon(G.save)} style={{ width: "1.5rem" }} />
                  <div className="f1">
                     <div key={todo.name(G.save)}>{todo.name(G.save)}</div>
                  </div>
                  <Switch
                     checked={!G.save.options.disabledTodos.has(id)}
                     onChange={() => {
                        if (G.save.options.disabledTodos.has(id)) {
                           G.save.options.disabledTodos.delete(id);
                        } else {
                           G.save.options.disabledTodos.add(id);
                        }
                        GameOptionUpdated.emit();
                     }}
                  />
               </div>
               <div className="divider" />
            </Fragment>
         ))}
      </>
   );
}

function SettingsGeneralTab(): React.ReactNode {
   return (
      <>
         <div className="m10">
            <ChangeLanguageComp />
         </div>
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
         <div className="divider" />
         <div className="row mx10 my5">
            <div className="f1">{$t(L.ShowChroniclePopup)}</div>
            <div>{$t(L.Every)}</div>
            <Select
               w="5rem"
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
         <div className="h1">{$t(L.Misc)}</div>
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
         <div className="row m10">
            <div>{$t(L.UiScale)}</div>
            <div className="f1" />
            <Select
               w="5rem"
               checkIconPosition="right"
               data={range(5, 20 + 1).map((v) => `${v / 10}`)}
               value={G.save.options.uiScale.toString()}
               onChange={(value) => {
                  if (value) {
                     G.save.options.uiScale = safeParseFloat(value, 1);
                     document.documentElement.style.setProperty("font-size", `${G.save.options.uiScale}rem`);
                     GameOptionUpdated.emit();
                  }
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
                  showSuccess($t(L.GameSavedToFile$1, fileHandle.name));
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
                  showPanel(
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
      </>
   );
}
