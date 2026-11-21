import { finalizeCondition } from "../game/actions/GameAction";
import { type CharacterSlot, getCharacterUnassignmentLabel } from "../game/definitions/GovernmentTier";
import { Modifiers } from "../game/definitions/Modifier";
import { GameStateUpdated } from "../game/Events";
import {
   getCharacterInSlot,
   getCharacterSlotCapacityCondition,
   getTKCharacterMonthlyCost,
   unassignTKCharacter,
} from "../game/logic/TKCharacterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
import { ActionButton } from "./ActionButton";
import { BreakdownTooltip } from "./BreakdownRow";
import { showPanel } from "./common/ShowPanel";
import { colorNumber } from "./components/ColorNumber";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { SelectCharacterSlotModal } from "./SelectCharacterModal";
import { TKCharacterComp } from "./TKCharacterComp";

export function StrategistSlotComp({ slot }: { slot: CharacterSlot }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const character = getCharacterInSlot(G.save.state.playerProvince, slot, G.save);
   const monthlyCost = character
      ? getTKCharacterMonthlyCost(character, G.save.state.playerProvince, G.save)
      : undefined;
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
                  {$t(L.EmptySlot)}
               </div>
            )}
         </div>
         <div className="divider" />
         <div className="row m5 g5">
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
                  title={getCharacterUnassignmentLabel(slot)}
                  onClick={() => {
                     if (unassignTKCharacter(character, G.save.state.playerProvince, G.save)) {
                        GameStateUpdated.emit();
                     }
                  }}
               >
                  <div className="mi xs text-red">delete</div>
               </button>
            )}
            {monthlyCost ? (
               <BreakdownTooltip breakdown={monthlyCost}>
                  <div className="row f1 text-sm g5 ml5">
                     <div>{Modifiers.MonthlyGold.name()}</div>
                     <div>
                        <img src={ProvinceResourceImages.gold} className="icon-block dimmed" />
                     </div>
                     <div className="f1" />
                     <div className="mr10">{colorNumber(-monthlyCost.value)}</div>
                  </div>
               </BreakdownTooltip>
            ) : (
               <div className="f1" />
            )}
         </div>
      </div>
   );
}
