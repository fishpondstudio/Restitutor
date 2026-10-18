import { finalizeCondition } from "../game/actions/GameAction";
import type { CharacterSlot } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import { getCharacterSlotCapacityCondition } from "../game/logic/TKCharacterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ActionButton } from "./ActionButton";
import { showPanel } from "./common/ShowPanel";
import { SelectCharacterSlotModal } from "./SelectCharacterModal";
import { TKCharacterComp } from "./TKCharacterComp";

export function CharacterSlotComp({ slot }: { slot: CharacterSlot }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const character = state.characterSlots[slot];
   return (
      <div className="box">
         <div className="row">
            {character ? (
               <TKCharacterComp character={character} />
            ) : (
               <div
                  className="f1 text-dimmed text-lg text-display"
                  style={{ height: "7rem", alignContent: "center", marginLeft: "2rem" }}
               >
                  Empty Slot
               </div>
            )}
            <div className="mr10 col g5">
               <ActionButton
                  className="btn p2"
                  action={() => ({
                     condition: finalizeCondition([
                        getCharacterSlotCapacityCondition(slot, G.save.state.playerProvince, G.save),
                     ]),
                     execute() {
                        showPanel(SelectCharacterSlotModal, { slot });
                     },
                  })}
               >
                  <div className="mi xs">swap_horiz</div>
               </ActionButton>
               {character && (
                  <button
                     className="btn p2"
                     onClick={() => {
                        delete state.characterSlots[slot];
                        GameStateUpdated.emit();
                     }}
                  >
                     <div className="mi xs text-red">delete</div>
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
