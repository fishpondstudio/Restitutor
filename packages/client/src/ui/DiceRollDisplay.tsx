import { Progress } from "@mantine/core";
import { cls, formatPercent, round, shuffle } from "@project/shared/src/utils/Helper";
import { useEffect, useState } from "react";
import type { IGameAction } from "../game/actions/GameAction";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { FloatingTip } from "./components/FloatingTip";

export function DiceRollComp({
   chance,
   chanceTooltip,
   action,
   onAccept,
   onReject,
   acceptTooltip,
   rejectTooltip,
}: {
   chance: number;
   chanceTooltip: React.ReactNode;
   action: IGameAction;
   onAccept: () => void;
   onReject: () => void;
   acceptTooltip: React.ReactNode;
   rejectTooltip: React.ReactNode;
}): React.ReactNode {
   const [diceRoll, setDiceRoll] = useState<number | null>(null);
   const [rollComplete, setRollComplete] = useState(false);
   const oldEffect = action.effect;
   action.effect = ({ headless }: { headless: boolean }) => {
      setDiceRoll(round(Math.random() * 100, 2));
      oldEffect({ headless });
   };
   return (
      <>
         <FloatingTip w={300} className="p0" label={chanceTooltip}>
            <div className="box p10 m10">
               <Progress value={chance * 100} />
               <div className="h5" />
               <div className="row">
                  <div>
                     <div>{formatPercent(chance)}</div>
                     <div className="text-sm text-dimmed text-italic">{$t(L.Accept)}</div>
                  </div>
                  <div className="f1"></div>
                  <div className="text-right">
                     <div>{formatPercent(1 - chance)}</div>
                     <div className="text-sm text-dimmed text-italic">{$t(L.Reject)}</div>
                  </div>
               </div>
            </div>
         </FloatingTip>
         {diceRoll === null ? (
            <div className="m10">
               <ActionButton
                  className="w100 py2"
                  action={action}
                  tooltip={(element) => {
                     return (
                        <>
                           {element}
                           <div className="h2">
                              <div className="text-green">{$t(L.IfOurDemandIsAccepted)}</div>
                           </div>
                           {acceptTooltip}
                           <div className="h2">
                              <div className="text-red">{$t(L.IfOurDemandIsRejected)}</div>
                           </div>
                           {rejectTooltip}
                        </>
                     );
                  }}
               >
                  {$t(L.SendDemand)}
               </ActionButton>
            </div>
         ) : (
            <DiceRollDisplay
               className="my20"
               value={diceRoll.toFixed(2).padStart(5, "0")}
               duration={1000}
               onComplete={() => setRollComplete(true)}
            />
         )}
         {rollComplete && diceRoll && (
            <div className="m10">
               {diceRoll < chance * 100 ? (
                  <FloatingTip className="p0" w={300} label={acceptTooltip}>
                     <button className="btn w100 py2 text-green" onClick={onAccept}>
                        {$t(L.OurDemandWasAccepted)}
                     </button>
                  </FloatingTip>
               ) : (
                  <FloatingTip className="p0" w={300} label={rejectTooltip}>
                     <button className="btn w100 py2 text-red" onClick={onReject}>
                        {$t(L.OurDemandWasRejected)}
                     </button>
                  </FloatingTip>
               )}
            </div>
         )}
      </>
   );
}

function DiceRollDisplay({
   value,
   duration,
   className,
   onComplete,
}: {
   className?: string;
   value: string;
   duration: number;
   onComplete?: () => void;
}) {
   const chars = value.split("");
   const digitCount = chars.length - (chars.includes(".") ? 1 : 0);
   let numberIndex = digitCount - 1;
   useEffect(() => {
      setTimeout(() => {
         onComplete?.();
      }, duration * digitCount);
   }, [duration, onComplete, digitCount]);
   return (
      <div className={cls("dice-roll-display", className)}>
         {chars.map((char, index) => {
            if (char === ".") {
               return (
                  <div key={index} className="dice-roll-display-digit">
                     .
                  </div>
               );
            }
            const idx = numberIndex;
            --numberIndex;
            return <DiceRollDigit digit={char} key={index} delay={idx * duration} duration={duration} />;
         })}
      </div>
   );
}

const NumberRollCount = 10;

function DiceRollDigit({ digit, delay, duration }: { digit: string; delay: number; duration: number }) {
   const [display, setDisplay] = useState(digit === "." ? "." : "");
   useEffect(() => {
      if (digit === ".") {
         return;
      }
      setTimeout(() => {
         let count = 0;
         const digits = shuffle(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
         const interval = setInterval(() => {
            if (count === NumberRollCount - 1) {
               clearInterval(interval);
               setDisplay(digit);
            } else {
               setDisplay(digits[count % digits.length]);
               ++count;
            }
         }, duration / NumberRollCount);
      }, delay);
   }, [digit, delay, duration]);
   return <div className="dice-roll-display-digit">{display}</div>;
}
