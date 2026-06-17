import { ScrollArea } from "@mantine/core";
import { CloseButtonClass, SidebarMargin, SidebarTopMargin, SidebarWidth } from "../UIConstant";
import { hideSidebar } from "./Sidebar";

export function SidebarComp({
   title,
   children,
   width = SidebarWidth,
}: React.PropsWithChildren<{ title: React.ReactNode; width?: string }>): React.ReactElement {
   return (
      <SidebarContainer title={title} width={width}>
         <ScrollArea scrollbars="y" className="f1">
            {children}
            <div className="h10" />
         </ScrollArea>
      </SidebarContainer>
   );
}

export function SidebarContainer({
   title,
   children,
   width = SidebarWidth,
}: React.PropsWithChildren<{ title: React.ReactNode; width?: string }>): React.ReactElement {
   return (
      <div
         className="panel"
         style={{
            width,
            margin: `${SidebarTopMargin} ${SidebarMargin} ${SidebarMargin} 0`,
            height: `calc(100vh - calc(${SidebarTopMargin} + ${SidebarMargin}))`,
            display: "flex",
            flexDirection: "column",
         }}
      >
         <div className="header">
            <div className="f1">{title}</div>
            <div className={`mi pointer ${CloseButtonClass}`} onClick={hideSidebar}>
               close
            </div>
         </div>
         {children}
      </div>
   );
}
