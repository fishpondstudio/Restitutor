import { getAncestralTempleSlots } from "../game/definitions/GovernmentTier";
import { GameStateUpdated } from "../game/Events";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { CharacterSlotCapacityComp } from "./CharacterSlotCapacityComp";
import { CharacterSlotComp } from "./CharacterSlotComp";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";
import { Grid1 } from "./UIConstant";

export function ImperialCourtPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const slots = getAncestralTempleSlots();
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.ImperialCourt} title="Imperial Court" />}>
         <div className="h1 row g5">
            <div className="f1">Ancestral Temple</div>
            <CharacterSlotCapacityComp />
         </div>
         <div className="m10" style={Grid1}>
            {slots.map((slot) => (
               <CharacterSlotComp key={slot} slot={slot} />
            ))}
         </div>
      </SidebarComp>
   );
}
