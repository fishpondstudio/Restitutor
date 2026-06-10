import { Progress } from "@mantine/core";
import { formatNumber, hasFlag, toggleFlag } from "@project/shared/src/utils/Helper";
import { GameOptionUpdated, GameStateUpdated } from "../game/Events";
import { GameOptionFlag } from "../game/GameOption";
import { getCurrentTutorial } from "../game/TutorialLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ChangeLanguageComp } from "./ChangeLanguageComp";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";

export function TutorialPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   refreshOnTypedEvent(GameOptionUpdated);
   const tutorial = getCurrentTutorial(G.save);
   if (!tutorial) {
      return null;
   }
   const [progress, total] = tutorial.progress(G.save);
   const minimizeTutorial = hasFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial);
   return (
      <div className="tutorial-panel panel">
         <FloatingTip
            className="p0"
            label={<div className="m10">{html(tutorial.desc())}</div>}
            disabled={!minimizeTutorial}
         >
            <div className="row g5 m10">
               <div className="mi lg">flag</div>
               <div className="f1">
                  <div className="row g20 text-display text-lg">
                     <div className="f1">{tutorial.name()}</div>
                     <div>
                        {formatNumber(progress)}/{formatNumber(total)}
                     </div>
                  </div>
                  <div className="h5" />
                  <Progress value={(100 * progress) / total} />
               </div>
            </div>
         </FloatingTip>
         {!minimizeTutorial && (
            <>
               <div className="divider" />
               {tutorial.id === "Welcome" && (
                  <>
                     <div className="m10">
                        <ChangeLanguageComp />
                     </div>
                     <div className="divider" />
                  </>
               )}
               <div className="m10">{html(tutorial.desc())}</div>
            </>
         )}
         {tutorial.button && (
            <div className="m10 row g5">
               <button
                  className="btn py2 f1"
                  onClick={() => {
                     G.save.state.completedTutorials.add(tutorial.id);
                     GameStateUpdated.emit();
                  }}
               >
                  {tutorial.button()}
               </button>
               <FloatingTip
                  label={
                     hasFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial)
                        ? $t(L.ExpandTutorialPanel)
                        : $t(L.CollapseTutorialPanel)
                  }
               >
                  <button
                     className="btn py2"
                     onClick={() => {
                        G.save.options.flag = toggleFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial);
                        GameOptionUpdated.emit();
                     }}
                  >
                     <div className="mi sm">
                        {hasFlag(G.save.options.flag, GameOptionFlag.CollapseTutorial) ? "open_in_full" : "hide"}
                     </div>
                  </button>
               </FloatingTip>
            </div>
         )}
      </div>
   );
}
