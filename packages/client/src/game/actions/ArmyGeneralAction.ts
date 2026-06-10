import { setFlag } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { PersonFlags } from "../definitions/Family";
import type { Province } from "../definitions/Province";
import type { SaveGame } from "../GameState";
import { addProvinceStat, getProvinceStat, setProvinceStat } from "../logic/ProvinceLogic";
import { startTimedAction } from "../logic/TimedActionLogic";
import { getCurrentGeneral, getGeneralSkillUpgradeCost } from "../logic/WarLogic";
import { EmptyGameAction } from "./EmptyGameAction";
import { finalizeCondition, type IGameAction } from "./GameAction";

export function MakeGovernorGeneralAction(province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: $t(L.DoesNotHaveAGeneral),
               value: getCurrentGeneral(province, save) === undefined,
            },
            {
               name: $t(L.OurGovernorIsAtLeast$1YearsOld, "16"),
               value: state.governor.male.age >= 16,
            },
         ],
      }),
      effect: () => {
         const governor = state.governor.male;
         governor.flag = setFlag(governor.flag, PersonFlags.IsGeneral);
         setProvinceStat("infantrySkill", 1, province, save);
         setProvinceStat("rangedSkill", 1, province, save);
         setProvinceStat("cavalrySkill", 1, province, save);
      },
   };
}

export function RecruitGeneralAction(province: Province, save: SaveGame): IGameAction {
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: $t(L.DoesNotHaveAGeneral),
               value: getCurrentGeneral(province, save) === undefined,
            },
         ],
      }),
      effect: () => {
         startTimedAction("RecruitAGeneral", province, save);
         setProvinceStat("infantrySkill", 1, province, save);
         setProvinceStat("rangedSkill", 1, province, save);
         setProvinceStat("cavalrySkill", 1, province, save);
      },
   };
}

export function UpgradeGeneralSkillAction(
   skill: "infantrySkill" | "rangedSkill" | "cavalrySkill",
   province: Province,
   save: SaveGame,
): IGameAction {
   return {
      condition: finalizeCondition({
         breakdown: [
            {
               name: $t(L.WeHaveAppointedAGeneral),
               value: getCurrentGeneral(province, save) !== undefined,
            },
         ],
      }),
      effect: () => {
         addProvinceStat(skill, 1, province, save);
      },
      cost: {
         generalSkillPoint: getGeneralSkillUpgradeCost(getProvinceStat(skill, province, save)),
      },
   };
}
