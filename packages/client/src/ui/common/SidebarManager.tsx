import { Transition } from "@mantine/core";
import { createRef, useState } from "react";
import { ToggleSidebar, UpdateSidebar } from "../../game/Events";
import { useTypedEvent } from "../../utils/Hook";
import { CloseButtonClass } from "../UIConstant";

const sidebarRef = createRef<HTMLDivElement>();

export function tryDismissSidebar(): boolean {
   const sidebar = sidebarRef.current;
   if (!sidebar) {
      return false;
   }
   const buttons = sidebar.getElementsByClassName(CloseButtonClass);
   const button = buttons[buttons.length - 1];
   if (
      button instanceof HTMLElement &&
      button.checkVisibility({
         checkOpacity: true,
         checkVisibilityCSS: true,
         contentVisibilityAuto: true,
         opacityProperty: true,
         visibilityProperty: true,
      })
   ) {
      button.click();
      return true;
   }
   return false;
}

export function hideSidebar(): void {
   ToggleSidebar.emit(false);
}

export function Sidebar(): React.ReactNode {
   const [sidebar, setSidebar] = useState<React.ReactNode>();
   const [mounted, setMounted] = useState(false);
   useTypedEvent(UpdateSidebar, (e) => {
      setSidebar(e);
      setMounted(true);
   });
   useTypedEvent(ToggleSidebar, setMounted);
   return (
      <Transition
         mounted={mounted}
         transition="fade-right"
         onExited={() => {
            setSidebar(null);
         }}
      >
         {(styles) => (
            <div
               ref={sidebarRef}
               style={{
                  ...styles,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
               }}
            >
               {sidebar}
            </div>
         )}
      </Transition>
   );
}
