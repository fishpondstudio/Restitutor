import { getAncestralTempleSlots } from "../game/definitions/GovernmentTier";
import { getResourceName } from "../game/definitions/ProvinceResources";
import { GameStateUpdated } from "../game/Events";
import { getProvinceResource } from "../game/logic/ResourceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { CharacterSlotCapacityComp } from "./CharacterSlotCapacityComp";
import { CharacterSlotComp } from "./CharacterSlotComp";
import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";
import { ProvinceResourceImages } from "./ProvinceResourceImages";
import { TimedActionButton } from "./TimedActionButton";
import { Grid1, Grid2 } from "./UIConstant";

export function ImperialCourtPage(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const state = G.save.state.provinces[G.save.state.playerProvince];
   if (!state) {
      return null;
   }
   const slots = getAncestralTempleSlots();
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.ImperialCourt} title="Imperial Court" />}>
         <div className="h1 row">
            <div className="f1">Imperial Court</div>
            <div>
               {getProvinceResource("consulPoint", G.save.state.playerProvince, G.save)}{" "}
               {getResourceName("consulPoint", G.save.state.scenario)}
            </div>
            <img
               src={ProvinceResourceImages.consulPoint}
               className="icon-block"
               style={{ height: "2.1rem", margin: "-0.5rem 0" }}
            />
         </div>
         <div style={Grid2} className="m10">
            <TimedActionButton timedAction="RequestFunding" />
            <TimedActionButton timedAction="CutPublicSpending" />
            <TimedActionButton timedAction="EnactSenateOversight" />
            <TimedActionButton timedAction="AffirmCivicUnity" />
            <TimedActionButton timedAction="DeclareMobilization" />
            <TimedActionButton timedAction="BolsterDignitas" />
         </div>
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
