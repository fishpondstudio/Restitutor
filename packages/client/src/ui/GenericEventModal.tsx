import { hasFlag } from "@project/shared/src/utils/Helper";
import { Fragment, useEffect } from "react";
import { GameOptionFlag } from "../game/GameOption";
import { G, revertSpeed, setSpeed } from "../utils/Global";
import { hideModal, ModalComp } from "../utils/ModalManager";
import { FloatingTip } from "./components/FloatingTip";
import { CloseButtonClass } from "./UIConstant";

export function GenericEventModal({
   title,
   titleTooltip,
   content,
   image,
   buttons,
   dismiss,
}: {
   title: React.ReactNode;
   titleTooltip: React.ReactNode;
   content: React.ReactNode;
   image: string;
   buttons: React.ReactNode[];
   dismiss?: boolean;
}): React.ReactNode {
   useEffect(() => {
      if (!hasFlag(G.save.options.flag, GameOptionFlag.PauseGameOnEvent)) {
         return;
      }
      if (G.speed > 0) {
         setSpeed(0);
      }
      return () => {
         if (G.speed <= 0) revertSpeed();
      };
   }, []);
   return (
      <ModalComp size="lg">
         <div className="modal-transparent-header row">
            <FloatingTip className="p0" w={300} label={titleTooltip}>
               <div className="f1 text-display text-lg">{title}</div>
            </FloatingTip>
            {dismiss && (
               <div className={`pointer mi ${CloseButtonClass}`} onClick={hideModal}>
                  close
               </div>
            )}
         </div>
         <img src={image} className="display-block w100" />
         <div className="modal-transparent-body">
            <div className="m10">{content}</div>
            <div className="col stretch">
               {buttons.map((button, index) => (
                  <Fragment key={index}>
                     <div className="divider" />
                     {button}
                  </Fragment>
               ))}
            </div>
         </div>
      </ModalComp>
   );
}
