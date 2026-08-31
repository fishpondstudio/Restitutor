import { hasFlag } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { type IFamily, PersonFlags } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { isGovernorSon, setHeir } from "../logic/GovernorLogic";
import { startTimedAction, timedActionConditions } from "../logic/TimedActionLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function ChangeHeirAction(family: IFamily, province: Province, save: SaveGame): IGameAction {
   const governor = save.state.provinces[province]?.governor;
   if (!governor || !family.male || !governor.children.includes(family)) {
      return EmptyGameAction;
   }
   return {
      cost: {
         administrative: 25,
         diplomatic: 25,
      },
      condition: finalizeCondition([
         ...timedActionConditions({ action: "ChangeHeir" }, province, save),
         {
            name: $t(L.CurrentGovernorsSon),
            value: isGovernorSon(family, province, save),
         },
         {
            name: $t(L.NotCurrentHeir),
            value: hasFlag(family.male.flag, PersonFlags.IsHeir),
         },
      ]),
      effect: () => {
         startTimedAction("ChangeHeir", province, save);
         setHeir(family, province, save);
      },
   };
}
