import { ScrollArea } from "@mantine/core";
import { CloseButtonClass, SidebarMargin, SidebarTopMargin, SidebarWidth } from "../UIConstant";
import { hideSidebar } from "./SidebarManager";

export function SidebarComp({
   title,
   children,
   width = SidebarWidth,
}: React.PropsWithChildren<{ title: React.ReactNode; width?: string }>): React.ReactElement {
   return (
      <div
         className="panel"
         style={{
            width,
            margin: `${SidebarTopMargin} 0 ${SidebarMargin} ${SidebarMargin}`,
            height: `calc(100vh - calc(${SidebarTopMargin} + ${SidebarMargin}))`,
            display: "flex",
            flexDirection: "column",
         }}
      >
         {title}
         <ScrollArea scrollbars="y" className="f1">
            {children}
            <div className="h10" />
         </ScrollArea>
      </div>
   );
}

export function SidebarHeader({ title }: { title: React.ReactNode }): React.ReactElement {
   return (
      <div className="header">
         <div className="f1">{title}</div>
         <div className={`mi pointer ${CloseButtonClass}`} onClick={hideSidebar}>
            close
         </div>
      </div>
   );
}
