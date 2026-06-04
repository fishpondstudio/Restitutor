import { forEach } from "@project/shared/src/utils/Helper";
import { type DependencyList, useEffect, useState } from "react";
import { SettingsModal } from "../ui/SettingsModal";
import { CloseButtonClass } from "../ui/UIConstant";
import { G, revertSpeed, setSpeed } from "../utils/Global";
import { useTypedEvent } from "../utils/Hook";
import { showModal } from "../utils/ModalManager";
import { CurrentShortcuts, OnKeydown, OnKeyup } from "./Events";
import type { IShortcutConfig, Shortcut } from "./ShortcutDefinition";

export function getShortcutKey(s: IShortcutConfig): string {
   const keys: string[] = [];
   if (s.key === "") {
      return "";
   }
   if (s.ctrl) {
      keys.push("Ctrl");
   }
   if (s.shift) {
      keys.push("Shift");
   }
   if (s.alt) {
      keys.push("Alt");
   }
   if (s.meta) {
      keys.push("Command");
   }

   if (s.key === " ") {
      keys.push("Space");
   } else {
      keys.push(s.key);
   }

   return keys.join(" + ").toUpperCase();
}

export function isShortcutEqual(a: IShortcutConfig, b: IShortcutConfig): boolean {
   return (
      a.ctrl === b.ctrl &&
      a.shift === b.shift &&
      a.alt === b.alt &&
      a.meta === b.meta &&
      a.key.toUpperCase() === b.key.toUpperCase()
   );
}

export function makeShortcut(e: {
   ctrlKey: boolean;
   shiftKey: boolean;
   altKey: boolean;
   metaKey: boolean;
   key: string;
}): IShortcutConfig {
   return {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
      key: e.key,
   };
}

CurrentShortcuts.set("Pause", () => {
   if (G.speed !== 0) {
      setSpeed(0);
   } else {
      revertSpeed();
   }
});

CurrentShortcuts.set("CloseOpenModal", () => {
   const buttons = document.getElementsByClassName(CloseButtonClass);
   if (buttons.length === 0) {
      showModal(<SettingsModal />);
      return;
   }
   const button = buttons[buttons.length - 1] as HTMLElement;
   if (
      button.checkVisibility({
         checkOpacity: true,
         checkVisibilityCSS: true,
         contentVisibilityAuto: true,
         opacityProperty: true,
         visibilityProperty: true,
      })
   ) {
      button.click();
   }
});

export const useShortcut = (shortcut: Shortcut, callback: (event: KeyboardEvent) => void, deps: DependencyList) => {
   useEffect(() => {
      CurrentShortcuts.set(shortcut, callback);
      return () => {
         CurrentShortcuts.delete(shortcut);
      };
   }, [shortcut, callback, ...deps]);
};

export function initShortcut(): void {
   window.addEventListener("keydown", (e) => {
      OnKeydown.emit(e);
      const isTextInput =
         e.target instanceof HTMLTextAreaElement ||
         (e.target instanceof HTMLInputElement && (!e.target.type || e.target.type === "text")) ||
         (e.target as HTMLElement).isContentEditable;
      if (isTextInput) {
         return;
      }
      const shortcut = makeShortcut(e);

      forEach(G.save.options.shortcuts, (key, config) => {
         if (isShortcutEqual(config, shortcut)) {
            const callback = CurrentShortcuts.get(key);
            if (callback) {
               e.preventDefault();
               e.stopPropagation();
               callback(e);
            }
         }
      });
   });
   window.addEventListener("keyup", (e) => {
      OnKeyup.emit(e);
   });
}

export function useDebugKey(): boolean {
   const [isDebug, setIsDebug] = useState(false);
   useTypedEvent(OnKeydown, (e) => {
      if (import.meta.env.DEV && e.key.toLowerCase() === "d") {
         setIsDebug(true);
      }
   });
   useTypedEvent(OnKeyup, (e) => {
      if (e.key.toLowerCase() === "d") {
         setIsDebug(false);
      }
   });
   return isDebug;
}
