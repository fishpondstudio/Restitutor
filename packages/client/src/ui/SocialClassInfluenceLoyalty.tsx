import { formatNumber, formatPercent } from "@project/shared/src/utils/Helper";
import { SocialClass } from "../game/definitions/SocialClass";
import {
   getSocialClassInfluence,
   getSocialClassInfluencePercentage,
   getSocialClassLoyalty,
} from "../game/logic/SocialClassLogic";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";

export function SocialClassInfluenceLoyalty({ socialClass }: { socialClass: SocialClass }): React.ReactNode {
   const influence = getSocialClassInfluence(socialClass, G.save.state.playerProvince, G.save);
   const loyalty = getSocialClassLoyalty(socialClass, G.save.state.playerProvince, G.save);
   return (
      <>
         {" "}
         <div className="h2">{$t(L.$1Class, SocialClass[socialClass].name())}</div>
         <div className="row mx10 my5">
            <div className="f1">
               {$t(L.Influence)}/{$t(L.Percentage)}
            </div>
            <div>
               {formatNumber(influence)}/
               {formatPercent(getSocialClassInfluencePercentage(socialClass, G.save.state.playerProvince, G.save))}
            </div>
            <div className="mi xs text-primary">whatshot</div>
         </div>
         <div className="row mx10 my5">
            <div className="f1">{$t(L.Loyalty)}</div>
            <div>{formatNumber(loyalty)}</div>
            <div className="mi xs text-primary">favorite</div>
         </div>
      </>
   );
}
