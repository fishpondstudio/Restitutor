import { Transition } from "@mantine/core";
import { useState } from "react";
import { ToggleSidebar, UpdateSidebar } from "../../game/Events";
import { useTypedEvent } from "../../utils/Hook";

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
