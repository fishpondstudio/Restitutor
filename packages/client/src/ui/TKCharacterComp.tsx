import { formatNumber, mapOf } from "@project/shared/src/utils/Helper";
import { durationToString, modifierToString } from "../game/definitions/Modifier";
import { GameStateUpdated } from "../game/Events";
import {
   getTKCharacterMonthlyCost,
   getTKCharacterName,
   getTKCharacterProvince,
   getTKCharacterState,
   isTKCharacterRuler,
   isTKCharacterRulingOrAssigned,
} from "../game/logic/TKCharacterLogic";
import { type TKCharacter, TKCharacters, TKCharacterTier, TKCharacterTraits } from "../game/ThreeKingdoms/TKCharacter";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { BreakdownComp } from "./BreakdownComp";
import { FloatingTip } from "./components/FloatingTip";

export function TKCharacterComp({ character }: { character: TKCharacter }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const { fullName, courtesyName } = getTKCharacterName(character);
   const config = TKCharacters[character];
   const province = getTKCharacterProvince(character, G.save);
   const state = province === null ? null : G.save.state.provinces[province];
   const monthsLeft = getTKCharacterState(character, G.save)?.monthsLeft ?? 0;
   const governor = state?.governor.male?.character === character ? state.governor.male : undefined;
   const isRulingOrAssigned = isTKCharacterRulingOrAssigned(character, G.save);
   const costProvince = province ?? G.save.state.playerProvince;
   const showMonthlyCost = monthsLeft > 0 && !isTKCharacterRuler(character, costProvince, G.save);
   return (
      <FloatingTip
         fixedWidth
         className="p0"
         label={() => (
            <>
               <div className="h2">{fullName}</div>
               {Array.from(config.traits).map((trait) => (
                  <div className="row mx10 my5" key={trait}>
                     <div className="f1">{TKCharacterTraits[trait].name()}</div>
                     <div className="mi sm">{TKCharacterTraits[trait].icon}</div>
                  </div>
               ))}
               {monthsLeft > 0 ? (
                  <div className="row mx10 my5">
                     <div className="f1">
                        {governor
                           ? `${formatNumber(governor.age)} years old`
                           : `${durationToString(monthsLeft)} of life remaining`}
                     </div>
                     <div className="mi sm">schedule</div>
                  </div>
               ) : (
                  <div className="row mx10 my5">
                     <div className="f1">Dead</div>
                     <div className="mi sm">skull</div>
                  </div>
               )}
               <div className="h2 row">
                  <div className="f1">While ruling or assigned</div>
                  {isRulingOrAssigned && <div className="mi text-primary sm">check_circle</div>}
               </div>
               {mapOf(config.modifiers, (modifier, data) => (
                  <div className="mx10 my5" key={modifier}>
                     {modifierToString(modifier, data)}
                  </div>
               ))}
               {showMonthlyCost && (
                  <>
                     <div className="h2">Monthly Cost (Advisor/Strategist)</div>
                     <BreakdownComp breakdown={getTKCharacterMonthlyCost(character, costProvince, G.save)} />
                  </>
               )}
            </>
         )}
      >
         <div className="row f1">
            <img src={config.image} className="display-block mx5" style={{ width: "7rem", height: "7rem" }} />
            <div className="f1">
               <div className="text-display">{fullName}</div>
               <div className="text-sm text-dimmed">
                  <span className="text-primary">{TKCharacterTier[config.tier]()}</span>
                  {courtesyName && " · "}
                  {courtesyName}
               </div>
               <div className="text-sm text-dimmed row g5">
                  {Array.from(config.traits).map((trait) => (
                     <div key={trait} className="mi xs" style={{ marginLeft: "-0.2rem" }}>
                        {TKCharacterTraits[trait].icon}
                     </div>
                  ))}
                  {monthsLeft > 0 ? (
                     <div>{governor ? `${governor.age}yo` : `${Math.floor(monthsLeft / 12)}y`}</div>
                  ) : (
                     <div className="mi xs">skull</div>
                  )}
                  <div className="f1" />
               </div>
            </div>
         </div>
      </FloatingTip>
   );
}
