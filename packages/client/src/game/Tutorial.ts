import { entriesOf, hasFlag, type Tile } from "@project/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { GameOptionFlag } from "./GameOption";
import type { SaveGame } from "./GameState";
import { getRelation } from "./logic/DiplomacyLogic";
import { getProvinceResource, getProvinceStat } from "./logic/ProvinceLogic";
import { getCurrentGeneral, getCurrentWars } from "./logic/WarLogic";

export interface ITutorial {
   id: number;
   name: () => string;
   desc: () => string;
   progress: (save: SaveGame) => [number, number];
   selectors: string[];
   button?: () => string;
}

let id = 0;

function getTutorialId(): number {
   return id++;
}

const DurocortorumTile: Tile = 9044035;
const LutetiaTile: Tile = 8978500;

export const Tutorial: ITutorial[] = [
   {
      id: getTutorialId(),
      name: () => $t(L.WelcomeToRestitutor),
      desc: () => $t(L.WelcomeToRestitutorDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: [],
      button: () => $t(L.ImReadyToRestoreTheEmpire),
   },
   {
      id: getTutorialId(),
      name: () => $t(L.HireGovernmentAdvisors),
      desc: () => $t(L.HireGovernmentAdvisorsDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         return [entriesOf(state?.advisors ?? {}).filter(([_, data]) => data.selected !== null).length, 3];
      },
      selectors: [
         "#TopPanel_AdministrativePoint",
         ".GovernmentModal_SelectAdvisor",
         ".GovernmentModal_SelectAdvisor_0",
      ],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.SelectTwoRivals),
      desc: () => $t(L.SelectTwoRivalsDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         return [state?.rivals.filter(Boolean).length ?? 0, 2];
      },
      selectors: ["#TopPanel_Diplomats", ".DiplomacyPage_SelectRival"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.IncreaseTargetConscription),
      desc: () => $t(L.IncreaseTargetConscriptionDesc),
      progress: (save) => {
         if (getProvinceStat("targetConscription", save.state.playerProvince, save) >= 15) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_WarPower", "#ArmyModal_TargetConscription"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.MakeOurGovernorAGeneral),
      desc: () => $t(L.MakeOurGovernorAGeneralDesc),
      progress: (save) => {
         if (getCurrentGeneral(save.state.playerProvince, save) !== undefined) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_WarPower", "#ArmyModal_MakeGovernorGeneral"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.InfiltrateBelgica),
      desc: () => $t(L.InfiltrateBelgicaDesc),
      progress: (save) => {
         if (getRelation(save.state.playerProvince, "Belgica", save)?.infiltrate.active) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#DiplomacyPage_Infiltrate_Belgica"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.UnpauseTheGame),
      desc: () => $t(L.UnpauseTheGameDesc),
      progress: (save) => {
         if (G.speed > 0) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#PausePanel_Button"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.ReachXDiplomaticPoints, "50"),
      desc: () => $t(L.Reach50DiplomaticPointsDesc),
      progress: (save) => {
         return [getProvinceResource("diplomatic", save.state.playerProvince, save), 50];
      },
      selectors: [],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.DeclareWarOnBelgica),
      desc: () => $t(L.DeclareWarOnBelgicaDesc),
      progress: (save) => {
         if (
            getCurrentWars(save.state.playerProvince, save).find(
               (war) => war.attacker === save.state.playerProvince && war.defender === "Belgica",
            )
         ) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: [
         "#DiplomacyPage_DeclareWar_Belgica",
         "#DeclareWarPage_Tile_Durocortorum_Unselected",
         "#DeclareWarPage_DeclareWar_Belgica:enabled",
      ],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.SignPeaceTreaty),
      desc: () => $t(L.SignPeaceTreatyDesc),
      progress: (save) => {
         if (save.state.tiles.get(DurocortorumTile)?.province === save.state.playerProvince) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#LeftPanel_OngoingWar_0.animate-bounce-left", "#WarModal_SignPeaceTreaty"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.MakeDurocortorumOurCore),
      desc: () => $t(L.MakeDurocortorumOurCoreDesc),
      progress: (save) => {
         const data = save.state.tiles.get(DurocortorumTile);
         if (data?.province === save.state.playerProvince && data?.coreProvinces.has(save.state.playerProvince)) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_InternalAffairs", "#InternalAffairs_MakeCore_Durocortorum"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.UpgradeLutetiasProduction),
      desc: () => $t(L.UpgradeLutetiasProductionDesc),
      progress: (save) => {
         const data = save.state.tiles.get(LutetiaTile);
         if ((data?.upgradeCount ?? 0) > 0) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_TileCount", "#TileListModal_UpgradeProduction_Lutetia"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.PayOffOurLoans),
      desc: () => $t(L.PayOffOurLoansDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         if (state?.loans.length === 0) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_Gold", ".TreasuryPage_Repay_Loan"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.ReachXMilitaryPoints, "300"),
      desc: () => $t(L.Reach300MilitaryPointsDesc),
      progress: (save) => {
         return [getProvinceResource("military", save.state.playerProvince, save), 300];
      },
      selectors: [],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.ResearchHarshPacification),
      desc: () => $t(L.ResearchHarshPacificationDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         if (state?.unlockedTech.has("B3")) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#BottomPanel_TechTree_Inactive", "#TechPage_Research_B3"],
   },
   {
      id: getTutorialId(),
      name: () => $t(L.CarryOnUntilProgressSlowsDown),
      desc: () => $t(L.CarryOnUntilProgressSlowsDownDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: [],
      button: () => $t(L.TellMeMoreAboutRebirth),
   },
   {
      id: getTutorialId(),
      name: () => $t(L.RebirthAndStartANewRun),
      desc: () => $t(L.RebirthAndStartANewRunDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: ["#TopPanel_LegacyUpgrade", "#LegacyUpgradePage_Rebirth"],
   },
] as const;

export function getCurrentTutorial(save: SaveGame): ITutorial | null {
   if (!save) {
      return null;
   }
   if (hasFlag(save.options.flag, GameOptionFlag.HideTutorial)) {
      return null;
   }
   for (const t of Tutorial) {
      if (save.state.completedTutorials.has(t.id)) {
         continue;
      }
      const [progress, total] = t.progress(G.save);
      if (progress >= total) {
         save.state.completedTutorials.add(t.id);
         continue;
      }
      return t;
   }
   return null;
}
