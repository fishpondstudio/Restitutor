import { getDefaultZIndex } from "@mantine/core";
import { rgbToHex } from "@project/shared/src/thirdparty/RandomColor";
import { safeParseInt } from "@project/shared/src/utils/Helper";
import type { Province } from "../game/definitions/Province";
import type { Tech } from "../game/definitions/Tech";
import { MapForegroundColors } from "../game/logic/MapColor";
import { ProvinceSelectorPrefix, TechSelectorPrefix } from "../game/ProvinceSelector";
import { getCurrentTutorial } from "../game/TutorialLogic";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { WorldScene } from "../scenes/WorldScene";
import { G } from "../utils/Global";

const highlighter = document.body.appendChild(document.createElement("div"));
highlighter.className = "element-highlighter";

export function initHighlighter(): void {
   setInterval(tickHighlighter, 1000);
}

const _zIndexCache = new Map<string, string>();

function tickHighlighter(): void {
   const tutorial = getCurrentTutorial(G.save);
   if (!tutorial) {
      highlighter.style.display = "none";
      return;
   }
   const selectors = tutorial.selectors;
   for (let i = selectors.length - 1; i >= 0; i--) {
      const selector = selectors[i];
      let rect: DOMRect | undefined;
      let zIndex: string = String(getDefaultZIndex("app") + 1);

      if (selector.startsWith(ProvinceSelectorPrefix)) {
         const province = selector.slice(ProvinceSelectorPrefix.length) as Province;
         const labelRect = G.scene.getCurrent(WorldScene)?.getProvinceLabelRect(province);
         if (labelRect) {
            rect = new DOMRect(labelRect.min.x - 5, labelRect.min.y - 5, labelRect.width + 10, labelRect.height + 10);
            highlighter.style.backgroundColor = rgbToHex(MapForegroundColors[province]);
         }
      } else if (selector.startsWith(TechSelectorPrefix)) {
         const tech = selector.slice(TechSelectorPrefix.length) as Tech;
         const labelRect = G.scene.getCurrent(TechTreeScene)?.getTechRect(tech as Tech);
         if (labelRect) {
            rect = new DOMRect(labelRect.min.x - 5, labelRect.min.y - 5, labelRect.width + 10, labelRect.height + 10);
            highlighter.style.backgroundColor = "";
         }
      } else {
         const element = document.querySelector(selector);
         if (element) {
            rect = element?.getBoundingClientRect();
            const cachedZIndex = _zIndexCache.get(selector);
            if (cachedZIndex) {
               zIndex = cachedZIndex;
            } else {
               zIndex = getEffectiveZIndex(element);
               _zIndexCache.set(selector, zIndex);
            }
            highlighter.style.backgroundColor = "";
         }
      }
      if (rect) {
         highlighter.style.display = "block";
         highlighter.style.top = `${rect.top - 5}px`;
         highlighter.style.left = `${rect.left - 5}px`;
         highlighter.style.width = `${rect.width + 10}px`;
         highlighter.style.height = `${rect.height + 10}px`;
         highlighter.style.zIndex = zIndex;
         setTimeout(() => {
            highlighter.style.top = `${rect.top}px`;
            highlighter.style.left = `${rect.left}px`;
            highlighter.style.width = `${rect.width}px`;
            highlighter.style.height = `${rect.height}px`;
         }, 500);
         return;
      }
   }
   highlighter.style.display = "none";
}

function getEffectiveZIndex(element: Element): string {
   let zIndex: number = getDefaultZIndex("app");

   let current: Element | null = element;
   while (current && current !== document.body) {
      const currentZIndex = getComputedStyle(current).zIndex;
      if (currentZIndex !== "auto") {
         zIndex = safeParseInt(currentZIndex, 0);
      }
      current = current.parentElement;
   }

   return String(zIndex + 1);
}
