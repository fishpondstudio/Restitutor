import { SegmentedControl, Select, Slider, Switch } from "@mantine/core";
import { entriesOf, hasFlag, range, safeParseFloat, safeParseInt, toggleFlag } from "@project/shared/src/utils/Helper";
import { Fragment, useEffect, useState } from "react";
import { DiscordUrl, PatchNotesUrl, SteamCommunityUrl, SteamUrl } from "../game/definitions/Constant";
import { GameOptionUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { getWebglRenderInfo } from "../game/GetWebglRenderInfo";
import { loadFromFile, resetGame, saveGame, saveToFile } from "../game/LoadSave";
import { showSuccess } from "../game/logic/AlertLogic";
import { getShortcutKey, isShortcutEqual, makeShortcut } from "../game/Shortcut";
import { DefaultShortcuts, Shortcut, type Shortcut as ShortcutId } from "../game/ShortcutDefinition";
import { getVersion } from "../game/Version";
import { isSteam, openUrl, SteamClient } from "../rpc/SteamClient";
import { G, GameFlags } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { ConfirmModal } from "./ConfirmModal";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { Todos } from "./TodoPanel";
import { Grid2 } from "./UIConstant";

type SettingsTab = "general" | "shortcuts" | "todos";

export function SettingsSingletonModal(): React.ReactNode {
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
                     { label: $t(L.Shortcuts), value: "shortcuts" },
                     { label: $t(L.Todo), value: "todos" },
                  ]}
                  value={tab}
                  onChange={(value) => setTab(value as SettingsTab)}
               />
            </div>
            <div className="divider vertical" />
            <div className="f1">
               {tab === "general" && <SettingsGeneralTab />}
               {tab === "shortcuts" && <SettingsShortcutsTab />}
               {tab === "todos" && <SettingsTodoTab />}
            </div>
         </div>
      </ModalComp>
   );
}

const ModifierKeys = new Set(["Alt", "Control", "Meta", "Shift"]);

function SettingsShortcutsTab(): React.ReactNode {
   const [recording, setRecording] = useState<ShortcutId | null>(null);

   useEffect(() => {
      if (!recording) {
         return;
      }

      const onKeyDown = (event: KeyboardEvent) => {
         event.preventDefault();
         event.stopImmediatePropagation();
         if (ModifierKeys.has(event.key)) {
            return;
         }

         const next = makeShortcut(event);
         const previous = G.save.options.shortcuts[recording];
         const conflict = (Object.keys(DefaultShortcuts) as ShortcutId[]).find(
            (shortcut) => shortcut !== recording && isShortcutEqual(G.save.options.shortcuts[shortcut], next),
         );

         if (conflict) {
            G.save.options.shortcuts[conflict] = previous;
         }
         G.save.options.shortcuts[recording] = next;
         setRecording(null);
         GameOptionUpdated.emit();
      };

      window.addEventListener("keydown", onKeyDown, true);
      return () => window.removeEventListener("keydown", onKeyDown, true);
   }, [recording]);

   return (
      <>
         <div className="m10 row">
            <div className="f1 text-sm text-dimmed">{$t(L.ClickAShortcutThenPressTheDesiredKey)}</div>
            <button
               className="btn"
               onClick={() => {
                  G.save.options.shortcuts = structuredClone(DefaultShortcuts);
                  setRecording(null);
                  GameOptionUpdated.emit();
               }}
            >
               {$t(L.ResetAll)}
            </button>
         </div>
         <div className="m10 text-dimmed"></div>
         <div className="divider" />
         {(Object.keys(DefaultShortcuts) as ShortcutId[]).map((shortcut) => {
            const isDefault = isShortcutEqual(G.save.options.shortcuts[shortcut], DefaultShortcuts[shortcut]);
            return (
               <Fragment key={shortcut}>
                  <div className="row m10">
                     <div className="f1">{Shortcut[shortcut]()}</div>
                     <button
                        className="btn"
                        style={{ minWidth: "10rem" }}
                        onClick={() => setRecording(recording === shortcut ? null : shortcut)}
                     >
                        {recording === shortcut
                           ? $t(L.PressAnyKey)
                           : (getShortcutKey(G.save.options.shortcuts[shortcut]) ?? $t(L.Unassigned))}
                     </button>
                     <button
                        aria-label={$t(L.Reset)}
                        className="btn"
                        disabled={isDefault}
                        title={$t(L.Reset)}
                        onClick={() => {
                           G.save.options.shortcuts[shortcut] = { ...DefaultShortcuts[shortcut] };
                           setRecording(null);
                           GameOptionUpdated.emit();
                        }}
                     >
                        <div className="mi sm">restart_alt</div>
                     </button>
                  </div>
                  <div className="divider" />
               </Fragment>
            );
         })}
      </>
   );
}

function SettingsTodoTab(): React.ReactNode {
   refreshOnTypedEvent(GameOptionUpdated);
   return (
      <>
         <div className="h1">{$t(L.ManageTodoIconsRightSide)}</div>
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
         <div className="row m10">
            <div className="f1">{$t(L.PauseWhenAGameEventOccurs)}</div>
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.PauseGameOnEvent)}
               onChange={() => {
                  G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.PauseGameOnEvent);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="row m10">
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
         <div className="row m10">
            <div className="f1">{$t(L.ShowTutorial)}</div>
            <Switch
               checked={!hasFlag(G.save.options.flag, GameOptionFlag.HideTutorial)}
               onChange={() => {
                  G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.HideTutorial);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         <div className="row m10">
            <div className="f1">{$t(L.CollapseTutorialPanel)}</div>
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial)}
               onChange={() => {
                  G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial);
                  GameOptionUpdated.emit();
               }}
            />
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
         <div className="row m10">
            <div className="f1">{$t(L.HideSteamAndDiscordButtons)}</div>
            <Switch
               checked={hasFlag(G.save.options.flag, GameOptionFlag.HideSteamDiscordButton)}
               onChange={() => {
                  G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.HideSteamDiscordButton);
                  GameOptionUpdated.emit();
               }}
            />
         </div>
         {isSteam() && (
            <div className="row m10">
               <div className="f1">{$t(L.FullScreen)}</div>
               <button
                  className="btn"
                  onClick={() => {
                     SteamClient.enterFullScreen();
                  }}
               >
                  {$t(L.Enter)}
               </button>
               <button
                  className="btn"
                  onClick={() => {
                     SteamClient.exitFullScreen();
                  }}
               >
                  {$t(L.Exit)}
               </button>
            </div>
         )}
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
            {G.pixi && (
               <div className="my5">
                  <div>{$t(L.GraphicsDebugInfo)}</div>
                  <div className="my5 text-dimmed text-sm text-mono">{getWebglRenderInfo(G.pixi)}</div>
               </div>
            )}
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
            {isSteam() && (
               <button
                  className="btn"
                  onClick={async () => {
                     SteamClient.openMainSaveFolder();
                  }}
               >
                  {$t(L.OpenSaveFolder)}
               </button>
            )}
            {isSteam() && (
               <button
                  className="btn"
                  onClick={async () => {
                     SteamClient.openLogFolder();
                  }}
               >
                  {$t(L.OpenLogFolder)}
               </button>
            )}
            {hasFlag(G.flags, GameFlags.Demo) ? (
               <button className="btn" onClick={() => openUrl(SteamUrl)}>
                  {$t(L.WishlistOnSteam)}
                  <div className="mi sm fixed-right">open_in_new</div>
               </button>
            ) : (
               <button className="btn row" onClick={() => openUrl(SteamCommunityUrl)}>
                  {$t(L.SteamCommunity)}
                  <div className="mi sm fixed-right">open_in_new</div>
               </button>
            )}
            <button className="btn" onClick={() => openUrl(DiscordUrl)}>
               {$t(L.JoinDiscord)}
               <div className="mi sm fixed-right">open_in_new</div>
            </button>{" "}
            <button className="btn" onClick={() => openUrl(PatchNotesUrl)}>
               {$t(L.ViewPatchNotes)}
               <div className="mi sm fixed-right">open_in_new</div>
            </button>
            <button
               className="btn text-red"
               onClick={() => {
                  showPanel(ConfirmModal, {
                     title: $t(L.HardReset),
                     message: $t(L.AreYouSureYouWantToHardResetTheGameThisCannotBeUndone),
                     confirm: {
                        label: $t(L.HardReset),
                        class: "text-red",
                        onClick: async () => {
                           await resetGame();
                           window.location.reload();
                        },
                     },
                  });
               }}
            >
               {$t(L.HardReset)}
            </button>
         </div>
      </>
   );
}
