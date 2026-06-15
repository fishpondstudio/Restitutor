import { ShowModal, UpdateSidebar } from "../../game/Events";

export function showPanel(content: React.ReactElement): void {
   if (typeof content.type === "function") {
      const name = content.type.name;
      if (name.endsWith("Modal")) {
         ShowModal.emit(content);
         return;
      }
      if (name.endsWith("Page")) {
         UpdateSidebar.emit(content);
         return;
      }
      console.error("showPanel: unknown panel type:", content.type.name);
   } else {
      console.error("showPanel: only `ReactElement` is supported");
   }
}
