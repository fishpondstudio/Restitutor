import { type MantineSize, Overlay, ScrollArea, Transition } from "@mantine/core";
import { cls } from "@project/shared/src/utils/Helper";
import type { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useCallback, useEffect, useState } from "react";
import { CloseModal, ShowModal } from "../game/Events";
import type { ImageWithCredit } from "../game/events/ImageWithCredit";
import type { ShowModalEvent } from "../ui/common/PanelTypes";
import { FloatingTip } from "../ui/components/FloatingTip";
import { CloseButtonClass } from "../ui/UIConstant";
import { useTypedEvent } from "./Hook";
import { $t, L } from "./i18n";

export function ModalManager(): React.ReactNode {
   const [modals, setModals] = useState<ShowModalEvent[]>([]);
   const onClosed = useCallback((closedModal: ShowModalEvent) => {
      setModals((prevModals) => {
         return prevModals.filter((modal) => modal !== closedModal);
      });
   }, []);

   useTypedEvent(ShowModal, (modal) => {
      setModals((prevModals) => {
         if (
            modal.Component.name.endsWith("SingletonModal") &&
            prevModals.some((existing) => existing.Component === modal.Component)
         ) {
            return prevModals;
         }
         return [...prevModals, modal];
      });
   });

   return modals.map((modal, index) => {
      return (
         <Modal
            key={index}
            closeEvent={index === modals.length - 1 ? CloseModal : null}
            onClosed={() => onClosed(modal)}
         >
            {modal.content}
         </Modal>
      );
   });
}

function Modal({
   children,
   closeEvent,
   onClosed,
}: React.PropsWithChildren<{
   children: React.ReactNode;
   closeEvent: TypedEvent<void> | null;
   onClosed: () => void;
}>): React.ReactNode {
   const [mounted, setMounted] = useState(false);
   useEffect(() => {
      setMounted(true);
      const onClose = () => {
         setMounted(false);
      };
      closeEvent?.on(onClose);
      return () => {
         closeEvent?.off(onClose);
      };
   }, [closeEvent]);
   return (
      <Transition mounted={mounted} transition="fade" onExited={onClosed}>
         {(style) => {
            return (
               <Overlay style={style} className="modal-overlay">
                  {children}
               </Overlay>
            );
         }}
      </Transition>
   );
}

export function ModalComp({
   title,
   children,
   size,
   scrollbars = "y",
}: React.PropsWithChildren<{
   title?: React.ReactNode;
   size?: MantineSize;
   style?: React.CSSProperties;
   scrollbars?: "y" | "x" | "xy" | false;
}>): React.ReactNode {
   return (
      <div className={cls("modal panel", size ?? "md")}>
         {title}
         <ScrollArea.Autosize scrollbars={scrollbars} type="hover" className="modal-content">
            {children}
         </ScrollArea.Autosize>
      </div>
   );
}

export function ModalTitleBar({
   title,
   dismiss,
}: React.PropsWithChildren<{ title: React.ReactNode; dismiss?: boolean }>): React.ReactNode {
   return (
      <div className="header">
         <div className="f1">{title}</div>
         {dismiss && (
            <div className={`mi pointer ${CloseButtonClass}`} onClick={hideModal}>
               close
            </div>
         )}
      </div>
   );
}

export function hideModal() {
   CloseModal.emit();
}

document.addEventListener("mousedown", (event) => {
   if (!(event.target instanceof HTMLElement)) {
      return;
   }
   if (event.target.classList.contains("modal-overlay")) {
      const buttons = event.target.getElementsByClassName(CloseButtonClass);
      const button = buttons[buttons.length - 1];
      if (button instanceof HTMLElement) {
         button.click();
      }
   }
});

export function ModalImageHeader({
   image,
   title,
   children,
}: React.PropsWithChildren<{
   image: ImageWithCredit;
   title: React.ReactNode;
}>): React.ReactNode {
   return (
      <div className="text-shadow" style={{ position: "relative" }}>
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
         <FloatingTip label={$t(L.ImageCredit$1, image.credit)}>
            <div className="text-roman text-lg" style={{ position: "absolute", bottom: "0.625rem", left: "0.625rem" }}>
               {title}
            </div>
         </FloatingTip>
         {children}
         <div
            className={`mi pointer text-white ${CloseButtonClass}`}
            onClick={hideModal}
            style={{ position: "absolute", top: "0.3125rem", right: "0.3125rem" }}
         >
            close
         </div>
         <img className="display-block w100" src={image.url} />
      </div>
   );
}
