import { Transition } from "@mantine/core";
import { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useState } from "react";
import { useTypedEvent } from "../../utils/Hook";

const UpdateSidebar = new TypedEvent<React.ReactNode>();
const ToggleSidebar = new TypedEvent<boolean>();

export function showSidebar(content: React.ReactNode) {
   UpdateSidebar.emit(content);
}

export function hideSidebar() {
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
         transition="fade-left"
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
                  right: 0,
                  bottom: 0,
               }}
            >
               {sidebar}
            </div>
         )}
      </Transition>
   );
}
