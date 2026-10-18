import { finalizeCondition, type ICondition, type IGameAction } from "../game/actions/GameAction";
import { GameStateUpdated } from "../game/Events";
import type { TKCharacter } from "../game/ThreeKingdoms/TKCharacter";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { TKCharacterComp } from "./TKCharacterComp";
import { Grid2 } from "./UIConstant";

export function SelectCharacterModal({
   conditions,
   onSelected,
}: {
   conditions: (character: TKCharacter) => ICondition[];
   onSelected: (character: TKCharacter) => void;
}): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const characters = Array.from(state.characters.keys());
   return (
      <ModalComp size="md" title={<ModalTitleBar title="Select Character" dismiss />}>
         {characters.length === 0 && <div className="m10 text-dimmed">No characters available.</div>}
         <div style={Grid2} className="m10">
            {characters.map((character) => {
               return (
                  <div className="box row g5" key={character}>
                     <TKCharacterComp character={character} />
                     <ActionButton
                        className="btn mr10"
                        action={() => {
                           return {
                              condition: finalizeCondition(conditions(character)),
                              execute() {
                                 onSelected(character);
                                 hideModal();
                              },
                           } satisfies IGameAction;
                        }}
                     >
                        Select
                     </ActionButton>
                  </div>
               );
            })}
         </div>
      </ModalComp>
   );
}
