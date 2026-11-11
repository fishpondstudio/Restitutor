import { GovernmentTier } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import { getUsedCharacterSlots } from "../game/logic/TKCharacterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";

export function CharacterSlotCapacityComp(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const tier = GovernmentTier[state.tier];
   return (
      <>
         <div>
            {getUsedCharacterSlots(G.save.state.playerProvince, G.save)}/{tier.slots}
         </div>
         <FloatingTip
            label={() =>
               `Your current rank is ${tier.name()}. Your character slot capacity is ${tier.slots}, shared by advisors, strategists, and ancestral temples. Characters without a slot do not count toward this limit.`
            }
         >
            <div>({tier.name()})</div>
         </FloatingTip>
      </>
   );
}
