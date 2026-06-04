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
      effect: () => $t(L.XPrestigeForYYearsAfterDeclaringWar, "-10%", "5"),
   },
   HumiliateRival: {
      name: () => $t(L.HumiliateRival),
      effect: () => $t(L.XWarPowerForYYearsAfterDeclaringWar, "+10%", "5"),
   },
   ConquestMission: {
      name: () => $t(L.ConquestMission),
      effect: () => $t(L.XWarScoreWhenWarGoalHasMoreThanOneTile, "-10%"),
   },
   ReligiousWar: {
      name: () => $t(L.ReligiousWar),
      effect: () => $t(L.XWarScoreWhenDefendersReligionIsNotChristianity, "-10%"),
   },
   DemandRejected: {
      name: () => $t(L.DemandRejected),
      effect: () => $t(L.XPrestigeForYYearsAfterDeclaringWar, "+10%", "5"),
   },
   PublicEnemy: {
      name: () => $t(L.PublicEnemy),
      effect: () => $t(L.XWarPowerForYYearsAfterDeclaringWar, "+20%", "2"),
   },
   Reconquista: {
      name: () => $t(L.Reconquista),
      effect: () => $t(L.TilesOriginallyOwnedByUsContributeXLessToWarScore, "50%"),
   },
} satisfies Record<string, ICasusBelliConfig>;

export const CasusBelli = _CasusBelli as Record<CasusBelli, ICasusBelliConfig>;
export type CasusBelli = keyof typeof _CasusBelli;
