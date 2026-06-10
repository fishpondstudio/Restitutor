import { entriesOf } from "@project/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { Tiles } from "./definitions/TileConstants";
import type { SaveGame } from "./GameState";
import { getRelation } from "./logic/DiplomacyLogic";
import { fillOfferAmount, getProvinceResource, getProvinceStat } from "./logic/ProvinceLogic";
import { getCurrentGeneral, getCurrentWars } from "./logic/WarLogic";

export interface ITutorial {
   id: string;
   name: () => string;
   desc: () => string;
   progress: (save: SaveGame) => [number, number];
   selectors: string[];
   button?: () => string;
   setup?: (save: SaveGame) => void;
}

export const Tutorial: ITutorial[] = [
   {
      id: "Welcome",
      name: () => $t(L.WelcomeToRestitutor),
      desc: () => $t(L.WelcomeToRestitutorDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: [],
      button: () => $t(L.ImReadyToRestoreTheEmpire),
   },
   {
      id: "HireAdvisors",
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
      id: "SelectRivals",
      name: () => $t(L.SelectTwoRivals),
      desc: () => $t(L.SelectTwoRivalsDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         return [state?.rivals.filter(Boolean).length ?? 0, 2];
      },
      selectors: ["#TopPanel_Diplomats", ".DiplomacyPage_SelectRival"],
   },
   {
      id: "IncreaseTargetConscription",
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
      id: "RecruitGeneral",
      name: () => $t(L.RecruitAGeneralTutorial),
      desc: () => $t(L.RecruitAGeneralDesc),
      progress: (save) => {
         if (getCurrentGeneral(save.state.playerProvince, save) !== undefined) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_WarPower", "#ArmyModal_RecruitGeneral"],
   },
   {
      id: "InfiltrateBelgica",
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
      id: "Unpause",
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
      id: "ReachDiplomaticPoint",
      name: () => $t(L.ReachXDiplomaticPoints, "50"),
      desc: () => $t(L.Reach50DiplomaticPointsDesc),
      progress: (save) => {
         return [getProvinceResource("diplomatic", save.state.playerProvince, save), 50];
      },
      selectors: [],
   },
   {
      id: "DeclareWar",
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
         `#DeclareWarPage_Tile_${Tiles.Durocortorum}_Unselected`,
         "#DeclareWarPage_DeclareWar_Belgica:enabled",
      ],
   },
   {
      id: "SignPeaceTreaty",
      name: () => $t(L.SignPeaceTreaty),
      desc: () => $t(L.SignPeaceTreatyDesc),
      progress: (save) => {
         if (save.state.tiles.get(Tiles.Durocortorum)?.province === save.state.playerProvince) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#LeftPanel_OngoingWar_0.animate-bounce-left", "#WarModal_SignPeaceTreaty"],
   },
   {
      id: "MakeCore",
      name: () => $t(L.MakeDurocortorumOurCore),
      desc: () => $t(L.MakeDurocortorumOurCoreDesc),
      progress: (save) => {
         const data = save.state.tiles.get(Tiles.Durocortorum);
         if (data?.province === save.state.playerProvince && data?.coreProvinces.has(save.state.playerProvince)) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_InternalAffairs", `#InternalAffairsPage_MakeCore_${Tiles.Durocortorum}`],
   },
   {
      id: "UpgradeProduction",
      name: () => $t(L.UpgradeLutetiasProduction),
      desc: () => $t(L.UpgradeLutetiasProductionDesc),
      progress: (save) => {
         const data = save.state.tiles.get(Tiles.Lutetia);
         if ((data?.upgradeCount ?? 0) > 0) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_TileCount", `#TileListModal_UpgradeProduction_${Tiles.Lutetia}`],
   },
   {
      id: "LowerArmyMaintenance",
      name: () => $t(L.LowerArmyMaintenance),
      desc: () => $t(L.LowerArmyMaintenanceDesc),
      progress: (save) => {
         const armyMaintenance = getProvinceStat("armyMaintenance", save.state.playerProvince, save);
         if (armyMaintenance <= 80) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_WarPower", "#ArmyModal_ArmyMaintenance"],
   },
   {
      id: "UpgradeGeneralSkill",
      name: () => $t(L.UpgradeGeneralSkill),
      desc: () => $t(L.UpgradeGeneralSkillDesc),
      progress: (save) => {
         const infantrySkill = getProvinceStat("infantrySkill", save.state.playerProvince, save);
         if (infantrySkill >= 2) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_WarPower", "#ArmyModal_UpgradeInfantrySkill"],
   },
   {
      id: "FindSpouse",
      name: () => $t(L.FindOurGovernorASpouse),
      desc: () => $t(L.FindOurGovernorASpouseDesc),
      progress: (save) => {
         const governor = save.state.provinces[save.state.playerProvince]?.governor;
         if (governor?.female) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_FamilyTree", "#FamilyNode_LookForSpouse_Governor", "#LookForSpouse_UpperClass"],
   },
   {
      id: "Trade",
      name: () => $t(L.SetUpATradeWithAquitania),
      desc: () => $t(L.SetUpATradeWithAquitaniaDesc),
      progress: (save) => {
         const trade = getRelation(save.state.playerProvince, "Aquitania", save)?.trade;
         if (trade) {
            return [1, 1];
         }
         return [0, 1];
      },
      setup: (save) => {
         const aquitania = save.state.provinces.Aquitania;
         if (aquitania) {
            aquitania.tradeOffers[2] = fillOfferAmount({ theyOffer: "gold", weOffer: "wood" });
         }
      },
      selectors: ["#TopPanel_Trade", "#TradeModal_Trade_Aquitania_2"],
   },
   {
      id: "Senate",
      name: () => $t(L.VoteForConsulElection),
      desc: () => $t(L.VoteForConsulElectionDesc),
      progress: (save) => {
         const votes = save.state.senate.votes.get(save.state.playerProvince);
         return [votes?.size ?? 0, 2];
      },
      setup: (save) => {
         const aquitania = save.state.provinces.Aquitania;
         if (aquitania) {
            aquitania.tradeOffers[2] = fillOfferAmount({ theyOffer: "gold", weOffer: "wood" });
         }
      },
      selectors: ["#TopPanel_Senate", "#SenateModal_Candidate_1_Pledge", "#SenateModal_Candidate_0_Pledge"],
   },
   {
      id: "PayOffLoans",
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
      id: "ReachMilitaryPoints",
      name: () => $t(L.ReachXMilitaryPoints, "300"),
      desc: () => $t(L.Reach300MilitaryPointsDesc),
      progress: (save) => {
         return [getProvinceResource("military", save.state.playerProvince, save), 300];
      },
      selectors: [],
   },
   {
      id: "Research",
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
      id: "CarryOn",
      name: () => $t(L.CarryOnUntilProgressSlowsDown),
      desc: () => $t(L.CarryOnUntilProgressSlowsDownDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: [],
      button: () => $t(L.TellMeMoreAboutRebirth),
   },
   {
      id: "Rebirth",
      name: () => $t(L.RebirthAndStartANewRun),
      desc: () => $t(L.RebirthAndStartANewRunDesc),
      progress: (save) => {
         return [0, 1];
      },
      selectors: ["#TopPanel_LegacyUpgrade", "#LegacyUpgradePage_Rebirth"],
   },
] as const;

console.assert(
   Tutorial[0].setup === undefined,
   "Tutorial[0].setup will not be called, do this in `initNewPlayerSaveGame` instead!",
);
