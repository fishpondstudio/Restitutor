import { finalizeCondition, type ICondition, type IGameAction } from "../game/actions/GameAction";
import type { CharacterSlot } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import {
   assignTKCharacter,
   getCharacterAssignmentConditions,
   getProvinceCharacters,
} from "../game/logic/TKCharacterLogic";
import type { TKCharacter } from "../game/ThreeKingdoms/TKCharacter";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { hideModal, ModalComp, ModalTitleBar } from "../utils/ModalManager";
import { ActionButton } from "./ActionButton";
import { TKCharacterComp } from "./TKCharacterComp";
import { Grid2 } from "./UIConstant";

export function SelectCharacterSlotModal({ slot }: { slot: CharacterSlot }): React.ReactNode {
   return (
      <SelectCharacterModal
         conditions={(character) =>
            getCharacterAssignmentConditions(slot, character, G.save.state.playerProvince, G.save)
         }
         onSelected={(character) => {
            if (assignTKCharacter(character, slot, G.save.state.playerProvince, G.save)) {
               GameStateUpdated.emit();
            }
         }}
      />
   );
}

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
   const characters = getProvinceCharacters(G.save.state.playerProvince, G.save);
   return (
      <ModalComp size="md" title={<ModalTitleBar title={$t(L.SelectCharacter)} dismiss />}>
         {characters.length === 0 && <div className="m10 text-dimmed">{$t(L.NoCharactersInOurRoster)}</div>}
         <div style={Grid2} className="m10">
            {characters.map((character) => {
               return (
                  <div className="box row g5" key={character}>
                     <TKCharacterComp character={character} />
                     <ActionButton
                        className="btn p2 mr10"
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
                        <div className="mi sm">arrow_forward</div>
                     </ActionButton>
                  </div>
               );
            })}
         </div>
      </ModalComp>
   );
}
