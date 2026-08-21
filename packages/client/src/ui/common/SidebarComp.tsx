import { ScrollArea } from "@mantine/core";
import type { ImageWithCredit } from "../../game/events/ImageWithCredit";
import { $t, L } from "../../utils/i18n";
import { FloatingTip } from "../components/FloatingTip";
import { CloseButtonClass, SidebarMargin, SidebarTopMargin, SidebarWidth } from "../UIConstant";
import { hideSidebar } from "./SidebarManager";

export function SidebarComp({
   title,
   children,
   width = SidebarWidth,
   scrollViewportRef,
}: React.PropsWithChildren<{
   title: React.ReactNode;
   width?: string;
   scrollViewportRef?: React.Ref<HTMLDivElement>;
}>): React.ReactElement {
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
         <ScrollArea scrollbars="y" className="f1" viewportRef={scrollViewportRef}>
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
export function SidebarImageHeader({
   image,
   title,
   children,
}: React.PropsWithChildren<{
   image: ImageWithCredit;
   title: React.ReactNode;
}>): React.ReactNode {
   return (
      <div className="text-shadow" style={{ position: "relative" }}>
         <img src={image.url} className="w100 display-block" />
         <div
            style={{
               position: "absolute",
               top: "50%",
               left: 0,
               right: 0,
               bottom: 0,
               background: "linear-gradient(to bottom, transparent, rgba(40, 40, 40, 1))",
            }}
         />
         <div
            style={{ position: "absolute", top: "0.3125rem", right: "0.3125rem" }}
            className={`mi pointer text-white ${CloseButtonClass}`}
            onClick={hideSidebar}
         >
            close
         </div>
         <FloatingTip label={$t(L.ImageCredit$1, image.credit)}>
            <div className="text-roman text-xl" style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem" }}>
               {title}
            </div>
         </FloatingTip>
         {children}
      </div>
   );
}
