import { type MantineSize, Overlay, ScrollArea, Transition } from "@mantine/core";
import { cls } from "@project/shared/src/utils/Helper";
import type { TypedEvent } from "@project/shared/src/utils/TypedEvent";
import { useCallback, useEffect, useState } from "react";
import { Fonts } from "../assets";
import { CloseModal, ShowModal } from "../game/Events";
import { CloseButtonClass } from "../ui/UIConstant";
import { useTypedEvent } from "./Hook";

export function ModalManager(): React.ReactNode {
   const [modals, setModals] = useState<React.ReactNode[]>([]);
   const onClosed = useCallback((closedModal: React.ReactNode) => {
      setModals((prevModals) => {
         return prevModals.filter((modal) => modal !== closedModal);
      });
   }, []);

   useTypedEvent(ShowModal, (modal) => {
      if (modal) {
         setModals([...modals, modal]);
      } else {
      }
   });

   return modals.map((modal, index) => {
      return (
         <Modal key={index} closeEvent={index === modals.length - 1 ? CloseModal : null} onClosed={onClosed}>
            {modal}
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
   onClosed: (modal: React.ReactNode) => void;
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
      <Transition
         mounted={mounted}
         transition="fade"
         onExited={() => {
            onClosed(children);
         }}
      >
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
   size,
   children,
   scrollbars = "y",
}: React.PropsWithChildren<{
   title?: React.ReactNode;
   dismiss?: boolean;
   size?: MantineSize;
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
         <div className="f1" style={{ fontFamily: Fonts.TitleFont }}>
            {title}
         </div>
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

export function showModal(modal: React.ReactElement): void {
   ShowModal.emit(modal);
}

document.addEventListener("click", (event) => {
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
