import { cls, formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { Province } from "../game/definitions/Province";
import { ChristianHeresy, Religion } from "../game/definitions/Religion";
import type { SpawnedProvince } from "../game/definitions/SpawnedProvince";
import { LoomingDisasterYears, type UpcomingDisaster } from "../game/events/DisasterLogic";
import { GameEvents } from "../game/events/GameEvents";
import { formatYear, getGameDate } from "../game/logic/GameDateTime";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { renderMarkup } from "./ParseMarkup";

export function DisasterCard({ disaster }: { disaster: UpcomingDisaster }): React.ReactNode {
   const yearsLeft = disaster.year - getGameDate(G.save.state.tick, G.save).getFullYear();
   const looming = yearsLeft <= LoomingDisasterYears;
   const config = GameEvents[disaster.event];
   const provinces = Array.from(new Set(config.buttons.flatMap((button) => button.spawnProvinces ?? [])));
   const heresies = Array.from(new Set(config.buttons.flatMap((button) => button.spawnHeresies ?? [])));
   return (
      <div className="box">
         <FloatingTip
            fixedWidth
            className="p0"
            label={() => (
               <>
                  <div className="h2 row">
                     <div>{formatYear(disaster.year)}</div>
                     <div className="f1"></div>
                     <div>({$t(L.In$1Years, formatNumber(yearsLeft))})</div>
                  </div>
                  <div className="m10">{html(config.desc())}</div>
               </>
            )}
         >
            <div className="h1">
               <div className={cls("row", looming ? "text-red" : "")}>
                  <div>{config.name()}</div>
                  <div className="f1" />
                  <span className="text-sm text-body">{formatYear(disaster.year)}</span>
               </div>
            </div>
         </FloatingTip>
         <div className="m10">
            {provinces.map((province) => (
               <SpawnProvinceAreasComp key={province} province={province} />
            ))}
            {heresies.map((heresy) => (
               <HeresyAreasComp key={heresy} heresy={heresy} />
            ))}
         </div>
      </div>
   );
}

function SpawnProvinceAreasComp({ province }: { province: SpawnedProvince }): React.ReactNode {
   return (
      <div>
         {renderMarkup(
            $t(
               L.ANewBarbarianPolity$1FormsAndTakesOverTheFollowingTiles$2,
               province,
               Province[province].tiles.map((tile) => `<Tile>${tile}</Tile>`).join(", "),
            ),
         )}
      </div>
   );
}

function HeresyAreasComp({ heresy }: { heresy: ChristianHeresy }): React.ReactNode {
   const config = ChristianHeresy[heresy];
   return (
      <div>
         {renderMarkup(
            $t(
               L.HeresySpreadAreas$1$2$3,
               Religion[heresy].name(),
               config.provinces.map((province) => `<Province>${province}</Province>`).join(", "),
               formatPercent(config.percentage),
            ),
         )}
      </div>
   );
}
