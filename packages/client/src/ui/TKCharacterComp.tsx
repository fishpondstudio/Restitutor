import { formatNumber } from "@project/shared/src/utils/Helper";
import { durationToString } from "../game/definitions/Modifier";
import { GameStateUpdated } from "../game/Events";
import { getTKCharacterName, getTKCharacterProvince, getTKCharacterState } from "../game/logic/TKCharacterLogic";
import { type TKCharacter, TKCharacters, TKCharacterTier, TKCharacterTraits } from "../game/ThreeKingdoms/TKCharacter";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";

export function TKCharacterComp({ character }: { character: TKCharacter }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const { fullName, courtesyName } = getTKCharacterName(character);
   const config = TKCharacters[character];
   const province = getTKCharacterProvince(character, G.save);
   const state = province === null ? null : G.save.state.provinces[province];
   const monthsLeft = getTKCharacterState(character, G.save)?.monthsLeft ?? 0;
   const governor = state?.governor.male?.character === character ? state.governor.male : undefined;
   return (
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
                  <FloatingTip key={trait} label={() => TKCharacterTraits[trait].name()}>
                     <div className="mi xs" style={{ marginLeft: "-0.2rem" }}>
                        {TKCharacterTraits[trait].icon}
                     </div>
                  </FloatingTip>
               ))}
               {monthsLeft > 0 ? (
                  <FloatingTip
                     label={() =>
                        governor
                           ? `${fullName} is currently ${formatNumber(governor.age)} years old.`
                           : `${fullName} has ${durationToString(monthsLeft)} of life remaining.`
                     }
                  >
                     <div>{governor ? `${governor.age}yo` : `${Math.floor(monthsLeft / 12)}y`}</div>
                  </FloatingTip>
               ) : (
                  <FloatingTip label={() => `${fullName} is currently dead.`}>
                     <div className="mi xs">skull</div>
                  </FloatingTip>
               )}
               <div className="f1" />
            </div>
         </div>
      </div>
   );
}
