import type { IAABB } from "@project/shared/src/utils/AABB";
import { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import type React from "react";
import { useState } from "react";
import { useTypedEvent } from "../../utils/Hook";

export const SetPopover = new TypedEvent<IPopover | undefined>();

export interface IPopover {
   rect: IAABB;
   content: React.ReactNode;
}

export function Popover(): React.ReactNode {
   const [popover, setPopover] = useState<IPopover>();

   useTypedEvent(SetPopover, (e) => {
      setPopover(e);
   });

   if (!popover) {
      return null;
   }

   return (
      <div
         style={{
            position: "absolute",
            left: popover.rect.min.x,
            top: popover.rect.min.y,
            width: popover.rect.width,
            height: popover.rect.height,
         }}
      >
         {popover.content}
      </div>
   );
}
