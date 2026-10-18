import { SidebarComp, SidebarImageHeader } from "./common/SidebarComp";
import { HeaderImages } from "./HeaderImages";

export function ImperialCourtPage(): React.ReactNode {
   return (
      <SidebarComp title={<SidebarImageHeader image={HeaderImages.ImperialCourt} title="Imperial Court" />}>
         <div className="h1">Ancestral Temple</div>
      </SidebarComp>
   );
}
