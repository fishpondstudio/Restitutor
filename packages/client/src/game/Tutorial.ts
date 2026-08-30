import { entriesOf, formatNumber, formatPercent, type Tile } from "@project/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { unlockAchievement } from "./Achievement";
import { Goods } from "./definitions/Goods";
import { DefaultConscription, Province, ProvinceResourceNames } from "./definitions/Province";
import { SocialClass } from "./definitions/SocialClass";
import { Tech } from "./definitions/Tech";
import { Tiles } from "./definitions/TileConstants";
import { getTileName } from "./definitions/TileName";
import { LugdunensisEvent } from "./events/LugdunensisEvent";
import type { SaveGame } from "./GameState";
import { BaseDiplomats, getRelation } from "./logic/DiplomacyLogic";
import { addModifier } from "./logic/ModifierLogic";
import {
   ConsulCandidatesCount,
   ConsulElectionMonths,
   fillOfferAmount,
   getProvinceResource,
   getProvinceStat,
} from "./logic/ProvinceLogic";
import { getTimedActionTimeLeft } from "./logic/TimedActionLogic";
import { getCurrentGeneral, getCurrentWars, WarOneTimeDiplomaticPoint } from "./logic/WarLogic";
import { provinceSel, techSel } from "./ProvinceSelector";

const TutorialEnemyProvince: Province = "Belgica" as const;
const TutorialWarGoal: Tile = Tiles.Durocortorum;

export interface ITutorial {
   id: string;
   name: (save: SaveGame) => string;
   desc: (save: SaveGame) => string;
   progress: (save: SaveGame) => [number, number];
   selectors: string[];
   button?: () => string;
   setup?: (save: SaveGame) => void;
}

export const Tutorial: ITutorial[] = [
   {
      id: "Welcome",
      name: () => $t(L.WelcomeToRestitutor),
      desc: () => $t(L.TutorialWelcomeDesc$1, "Lugdunensis"),
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
      name: () => $t(L.TutorialSelectRivals$1, formatNumber(2)),
      desc: () => $t(L.TutorialSelectRivalsDesc$1$2, formatNumber(2), TutorialEnemyProvince),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         return [state?.rivals.filter(Boolean).length ?? 0, 2];
      },
      selectors: ["#TopPanel_Diplomats", ".DiplomacyPage_SelectRival"],
   },
   {
      id: "IncreaseTargetConscription",
      name: () => $t(L.IncreaseTargetConscription),
      desc: () =>
         $t(
            L.TutorialIncreaseTargetConscriptionDesc$1$2,
            formatPercent(DefaultConscription / 100),
            formatPercent(15 / 100),
         ),
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
      desc: () => $t(L.RecruitAGeneralDescV2),
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
      name: () => $t(L.TutorialInfiltrate$1, Province[TutorialEnemyProvince].name()),
      desc: () => $t(L.TutorialInfiltrateDesc$1$2, formatNumber(BaseDiplomats), TutorialEnemyProvince),
      progress: (save) => {
         if (getRelation(save.state.playerProvince, TutorialEnemyProvince, save)?.infiltrate.active) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: [provinceSel("Belgica"), "#DiplomacyPage_Infiltrate_Belgica"],
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
      name: () => $t(L.Reach$1DiplomaticPoints, formatNumber(WarOneTimeDiplomaticPoint)),
      desc: () => $t(L.TutorialReachDiplomaticPointsDesc$1, formatNumber(WarOneTimeDiplomaticPoint)),
      progress: (save) => {
         return [getProvinceResource("diplomatic", save.state.playerProvince, save), WarOneTimeDiplomaticPoint];
      },
      selectors: [],
   },
   {
      id: "ChangeGovernmentFocus",
      name: () => $t(L.ChangeGovernmentFocus),
      desc: () => $t(L.TutorialChangeGovernmentFocusDesc),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         if (state?.focus === "military") {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_MilitaryPoint", "#GovernmentModal_Focus_military"],
   },
   {
      id: "DeclareWar",
      name: () => $t(L.TutorialDeclareWarOn$1, Province[TutorialEnemyProvince].name()),
      desc: () => $t(L.TutorialDeclareWarDesc$1$2, TutorialEnemyProvince, TutorialWarGoal),
      progress: (save) => {
         if (
            getCurrentWars(save.state.playerProvince, save).find(
               (war) => war.attacker === save.state.playerProvince && war.defender === TutorialEnemyProvince,
            )
         ) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: [
         provinceSel("Belgica"),
         "#DiplomacyPage_DeclareWar_Belgica",
         `#DeclareWarPage_Tile_${TutorialWarGoal}_Unselected`,
         "#DeclareWarPage_DeclareWar_Belgica:enabled",
      ],
      setup: (save) => {
         addModifier({
            modifier: "WarPower",
            name: $t(L.Tutorial),
            type: "multiply",
            value: -0.2,
            duration: 12 * 2,
            province: "Belgica",
            save,
         });
      },
   },
   {
      id: "IncreaseGameSpeed",
      name: () => $t(L.IncreaseGameSpeed),
      desc: () => $t(L.TutorialIncreaseGameSpeedDesc$1$2$3, "3", "1", "7x"),
      progress: (save) => {
         if (G.speed >= 7) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopRightPanel_Speed", "#TopRightPanel_Speed_7"],
   },
   {
      id: "SignPeaceTreaty",
      name: () => $t(L.SignPeaceTreaty),
      desc: () => $t(L.TutorialSignPeaceTreatyAfterVictoryDesc$1, TutorialWarGoal),
      progress: (save) => {
         if (save.state.tiles.get(TutorialWarGoal)?.province === save.state.playerProvince) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#LeftPanel_OngoingWar_0.animate-bounce-right", "#WarModal_SignPeaceTreaty"],
   },
   {
      id: "MakeCore",
      name: (save) => $t(L.TutorialMakeTileOurCore$1, getTileName(TutorialWarGoal, save)),
      desc: () => $t(L.MakeDurocortorumOurCoreDesc),
      progress: (save) => {
         const data = save.state.tiles.get(TutorialWarGoal);
         if (data?.province === save.state.playerProvince && data?.coreProvinces.has(save.state.playerProvince)) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_InternalAffairs", `#InternalAffairsPage_MakeCore_${TutorialWarGoal}`],
   },
   {
      id: "UpgradeProduction",
      name: (save) => $t(L.TutorialUpgradeTileProduction$1, getTileName(Tiles.Lutetia, save)),
      desc: () => $t(L.TutorialUpgradeTileProductionDesc$1, Tiles.Lutetia),
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
      desc: () => $t(L.TutorialLowerArmyMaintenanceDesc$1, formatPercent(70 / 100)),
      progress: (save) => {
         const armyMaintenance = getProvinceStat("armyMaintenance", save.state.playerProvince, save);
         if (armyMaintenance <= 70) {
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
      desc: () => $t(L.TutorialFindGovernorSpouseDesc$1, SocialClass.UpperClass.name()),
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
      id: "SocialClass",
      name: () => $t(L.AdoptASocialClassAgenda),
      desc: () => $t(L.TutorialSocialClassAgendaDesc),
      progress: (save) => {
         if (getTimedActionTimeLeft("GrantSocialClassBonus", save.state.playerProvince, save) > 0) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_SocialClass", ".SocialClassModal_Adopt:enabled"],
   },
   {
      id: "Trade",
      name: () => $t(L.TutorialSetUpTradeWith$1, Province.Aquitania.name()),
      desc: () => $t(L.TutorialSetUpTradeDesc$1$2$3, Goods.wood.name(), "Aquitania", ProvinceResourceNames.gold()),
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
      desc: () =>
         $t(
            L.TutorialVoteForConsulElectionDesc$1$2$3,
            formatNumber(ConsulElectionMonths / 12),
            formatNumber(ConsulCandidatesCount),
            formatNumber(2),
         ),
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
      name: () => $t(L.Reach$1MilitaryPoints, formatNumber(300)),
      desc: () => $t(L.TutorialReachMilitaryPointsDesc$1, formatNumber(300)),
      progress: (save) => {
         return [getProvinceResource("military", save.state.playerProvince, save), 300];
      },
      selectors: [],
   },
   {
      id: "Research",
      name: () => $t(L.TutorialResearch$1, Tech.B3.name()),
      desc: () => $t(L.TutorialResearchDesc$1, Tech.B3.name()),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         if (state?.unlockedTech.has("B3")) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#BottomPanel_TechTree_Inactive", techSel("B3"), "#TechPage_Research_B3"],
   },
   {
      id: "Production",
      name: () => $t(L.TutorialSetUpProduction$1, Goods.lumber.name()),
      desc: () => $t(L.TutorialSetUpProductionDesc$1$2, formatNumber(2), Goods.lumber.name()),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         const lumberProduction = state?.production.lumber?.capacity ?? 0;
         return [lumberProduction, 2];
      },
      selectors: ["#TopPanel_Production", "#ProductionNode_Capacity_lumber_0", "#ProductionNode_Capacity_lumber_1"],
   },
   {
      id: "Mission",
      name: () => $t(L.LetMissionsGuideOurRestoration),
      desc: () => $t(L.TutorialMissionsDesc$1$1, LugdunensisEvent.Lugdunensis1.name()),
      progress: (save) => {
         const state = save.state.provinces[save.state.playerProvince];
         if (state?.usedEvents.has("Lugdunensis1")) {
            return [1, 1];
         }
         return [0, 1];
      },
      selectors: ["#TopPanel_Mission", "#MissionPage_Lugdunensis1"],
      button: () => $t(L.IllCompleteTheMissionLater),
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
      setup: (save) => {
         unlockAchievement("CompleteTutorial");
      },
      selectors: ["#TopPanel_LegacyUpgrade", "#LegacyUpgradeModal_Rebirth", "#RebirthPage_RebirthButton"],
   },
] as const;

console.assert(
   Tutorial[0].setup === undefined,
   "Tutorial[0].setup will not be called, do this in `initNewPlayerSaveGame` instead!",
);
