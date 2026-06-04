import { ScrollArea } from "@mantine/core";
import { Fonts } from "../../assets";
import { CloseButtonClass } from "../UIConstant";
import { hideSidebar } from "./Sidebar";

export const SidebarWidth = 400;
const TopMargin = 55;
const BottomMargin = 10;

export function SidebarComp({
   title,
   children,
   width = SidebarWidth,
}: React.PropsWithChildren<{ title: React.ReactNode; width?: number }>): React.ReactElement {
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
}: React.PropsWithChildren<{ title: React.ReactNode; width?: number }>): React.ReactElement {
   return (
      <div
         className="panel"
         style={{
            width,
            margin: `${TopMargin}px 10px ${BottomMargin}px 0`,
            height: `calc(100vh - ${TopMargin + BottomMargin}px)`,
            display: "flex",
            flexDirection: "column",
         }}
      >
         <div className="header">
            <div className="f1" style={{ fontFamily: Fonts.TitleFont }}>
               {title}
            </div>
            <div className={`mi pointer ${CloseButtonClass}`} onClick={hideSidebar}>
               close
            </div>
         </div>
         {children}
      </div>
   );
}
