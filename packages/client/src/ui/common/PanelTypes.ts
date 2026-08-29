import type { ReactElement } from "react";

export interface PanelIdentity {
   readonly name: string;
}

export interface ShowModalEvent {
   Component: PanelIdentity;
   content: ReactElement;
}
