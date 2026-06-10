import { $t, L } from "../../utils/i18n";

export interface ICasusBelliConfig {
   name: () => string;
   effect?: () => string;
}

export const _CasusBelli = {
   None: {
      name: () => $t(L.None),
   },
   DiplomaticDispute: {
      name: () => $t(L.DiplomaticDispute),
      effect: () => $t(L.$1PrestigeFor$2YearsAfterDeclaringWar, "-10%", "5"),
   },
   HumiliateRival: {
      name: () => $t(L.HumiliateRival),
      effect: () => $t(L.$1WarPowerFor$2YearsAfterDeclaringWar, "+10%", "5"),
   },
   ConquestMission: {
      name: () => $t(L.ConquestMission),
      effect: () => $t(L.$1WarScoreWhenWarGoalHasMoreThanOneTile, "-10%"),
   },
   ReligiousWar: {
      name: () => $t(L.ReligiousWar),
      effect: () => $t(L.$1WarScoreWhenDefendersReligionIsNotChristianity, "-10%"),
   },
   DemandRejected: {
      name: () => $t(L.DemandRejected),
      effect: () => $t(L.$1PrestigeFor$2YearsAfterDeclaringWar, "+10%", "5"),
   },
   PublicEnemy: {
      name: () => $t(L.PublicEnemy),
      effect: () => $t(L.$1WarPowerFor$2YearsAfterDeclaringWar, "+20%", "2"),
   },
   Reconquista: {
      name: () => $t(L.Reconquista),
      effect: () => $t(L.TilesOriginallyOwnedByUsContribute$1LessToWarScore, "50%"),
   },
} satisfies Record<string, ICasusBelliConfig>;

export const CasusBelli = _CasusBelli as Record<CasusBelli, ICasusBelliConfig>;
export type CasusBelli = keyof typeof _CasusBelli;
