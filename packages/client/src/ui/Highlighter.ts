import { getDefaultZIndex } from "@mantine/core";
import { getCurrentTutorial } from "../game/Tutorial";
import { G } from "../utils/Global";

const highlighter = document.body.appendChild(document.createElement("div"));
highlighter.className = "element-highlighter";

export function initHighlighter(): void {
   setInterval(tickHighlighter, 1000);
}

function tickHighlighter(): void {
   const tutorial = getCurrentTutorial(G.save);
   if (!tutorial) {
      highlighter.style.display = "none";
      return;
   }
   const selectors = tutorial.selectors;
   for (let i = selectors.length - 1; i >= 0; i--) {
      const selector = selectors[i];
      const element = document.querySelector(selector);
      if (element) {
         const rect = element.getBoundingClientRect();
         highlighter.style.display = "block";
         highlighter.style.top = `${rect.top - 5}px`;
         highlighter.style.left = `${rect.left - 5}px`;
         highlighter.style.width = `${rect.width + 10}px`;
         highlighter.style.height = `${rect.height + 10}px`;
         highlighter.style.zIndex = String(getDefaultZIndex("overlay") + 1);
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
