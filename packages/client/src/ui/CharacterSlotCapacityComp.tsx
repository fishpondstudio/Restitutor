import { formatNumber } from "@project/shared/src/utils/Helper";
import { GovernmentTier } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import { getUsedCharacterSlots } from "../game/logic/TKCharacterLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { $t, L } from "../utils/i18n";
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
         <FloatingTip label={() => $t(L.CharacterSlotCapacityDesc$1$2, tier.name(), formatNumber(tier.slots))}>
            <div>({tier.name()})</div>
         </FloatingTip>
      </>
   );
}
