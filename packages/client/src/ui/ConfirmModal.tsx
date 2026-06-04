import { cls } from "@project/shared/src/utils/Helper";
import type React from "react";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";

export function ConfirmModal({
   title,
   message,
   confirm,
}: {
   title: React.ReactNode;
   message: React.ReactNode;
   confirm: {
      label: React.ReactNode;
      onClick: () => void;
      class?: string;
   };
}): React.ReactNode {
   return (
      <ModalComp size="sm" title={<ModalTitleBar title={title} />}>
         <div className="m10">{message}</div>
         <div className="m10 row">
            <button className="btn f1" onClick={hideModal}>
               {$t(L.Cancel)}
            </button>
            <button className={cls("btn f1", confirm.class)} onClick={confirm.onClick}>
               {confirm.label}
            </button>
         </div>
      </ModalComp>
   );
}
