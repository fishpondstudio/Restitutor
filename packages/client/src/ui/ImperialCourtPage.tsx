import { finalizeCondition } from "../game/actions/GameAction";
import { type CharacterSlot, GovernmentTier, getAncestralTempleSlots } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import { isTKCharacterAvailable } from "../game/logic/TKCharacterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ActionButton } from "./ActionButton";
import { showPanel } from "./common/ShowPanel";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";
import { SelectCharacterModal } from "./SelectCharacterModal";
import { TKCharacterComp } from "./TKCharacterComp";
import { Grid1 } from "./UIConstant";

export function ImperialCourtPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const tier = GovernmentTier[state.tier];
   const slots = getAncestralTempleSlots();
   const usedSlots = slots.filter((slot) => state.characterSlots[slot]).length;
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.ImperialCourt} title="Imperial Court" />}>
         <div className="h1 row">
            <div className="f1">Ancestral Temple</div>
            <div>
               {usedSlots}/{tier.advisors}
            </div>
            <div>({tier.name()})</div>
         </div>
         <div className="m10" style={Grid1}>
            {slots.map((slot) => {
               const character = state.characterSlots[slot];
               return (
                  <div className="box row" key={slot}>
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
                                 {
                                    name: "We have an available Ancestor Temple slot",
                                    value: !!character || tier.advisors > usedSlots,
                                    desc: `Total Slots: ${tier.advisors}, Used: ${usedSlots}`,
                                 },
                              ]),
                              execute() {
                                 showPanel(SelectAncestorModal, { slot });
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
               );
            })}
         </div>
      </SidebarComp>
   );
}

function SelectAncestorModal({ slot }: { slot: CharacterSlot }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const usedSlots = getAncestralTempleSlots().filter((slot) => state.characterSlots[slot]).length;
   const limit = GovernmentTier[state.tier].advisors;
   return (
      <SelectCharacterModal
         conditions={(character) => [
            {
               name: "Character is not assigned",
               value: isTKCharacterAvailable(character, G.save.state.playerProvince, G.save),
            },
            {
               name: "Character is dead",
               value: (state.characters.get(character)?.monthsLeft ?? 0) <= 0,
            },
            {
               name: "We have an available ancestor temple slot",
               value: !!state.characterSlots[slot] || limit > usedSlots,
               desc: `Total Slots: ${limit}, Used: ${usedSlots}`,
            },
         ]}
         onSelected={(character) => {
            state.characterSlots[slot] = character;
            GameStateUpdated.emit();
         }}
      />
   );
}
