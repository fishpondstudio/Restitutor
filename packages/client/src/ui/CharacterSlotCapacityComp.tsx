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
               `Your current tier is ${tier.name()}. You have ${tier.slots} slots available in total, which are shared among advisors, strategists, and ancestral temples.`
            }
         >
            <div>({tier.name()})</div>
         </FloatingTip>
      </>
   );
}
