import { cls, entriesOf, forEach, formatNumber, hasFlag } from "@project/shared/src/utils/Helper";
import { UpgradeGeneralSkillAction } from "../game/actions/ArmyGeneralAction";
import { canDoAction } from "../game/actions/GameAction";
import { GrantSocialClassBonusAction } from "../game/actions/GrantSocialClassBonusAction";
import { CanTradeCostCondition } from "../game/actions/TradeActions";
import { CasusBelli } from "../game/definitions/CasusBelli";
import { TreatyNames } from "../game/definitions/Diplomacy";
import { Goods } from "../game/definitions/Goods";
import type { Province } from "../game/definitions/Province";
import { ProvinceFlags } from "../game/definitions/ProvinceState";
import { SocialClass } from "../game/definitions/SocialClass";
import { Tech } from "../game/definitions/Tech";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import { getLoomingDisasters } from "../game/events/DisasterLogic";
import { GameEvents } from "../game/events/GameEvents";
import type { SaveGame } from "../game/GameState";
import { getCurrentGeneral } from "../game/logic/ArmyLogic";
import { getCurrentRelations, getDiplomats, getRelations } from "../game/logic/DiplomacyLogic";
import { getOngoingEcumenicalCouncil } from "../game/logic/EcumenicalCouncilLogic";
import { formatYear, getGameDate } from "../game/logic/GameDateTime";
import { getEligibleForMarriage } from "../game/logic/GovernorLogic";
import { getLegacyUpgradeCost } from "../game/logic/LegacyUpgradeLogic";
import { getProvinceProductionCapacity, getProvinceUsedProductionCapacity } from "../game/logic/ProductionLogic";
import { getProvinceName, getProvinceOverextension, monthsToNextConsulElection } from "../game/logic/ProvinceLogic";
import { getProvinceResource } from "../game/logic/ResourceLogic";
import { getAgendas, isSocialClassDisloyal, isSocialClassDominant } from "../game/logic/SocialClassLogic";
import { getTechsCanBeResearched, hasResearched } from "../game/logic/TechLogic";
import { PendingGameEventTimeoutMonths } from "../game/logic/TickProvince";
import { getTileUnrest } from "../game/logic/TileLogic";
import { getTimedActionTimeLeft, makeGameAction } from "../game/logic/TimedActionLogic";
import {
   getCurrentWars,
   getTruceMonthsLeft,
   getWarPowerComparison,
   type IWar,
   isWarStalled,
} from "../game/logic/WarLogic";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { ArmySingletonModal } from "./ArmySingletonModal";
import { BankruptcyEffectComp } from "./BankruptcyEffectComp";
import { BarbarianRaidModal } from "./BarbarianRaidModal";
import { ChristianEmpirePage } from "./ChristianEmpirePage";
import { showPanel } from "./common/ShowPanel";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DiplomacyPage } from "./DiplomacyPage";
import { DisasterPage } from "./DisasterPage";
import { EcumenicalCouncilPage } from "./EcumenicalCouncilPage";
import { FamilyTreeSingletonModal } from "./FamilyTreeSingletonModal";
import { GameEventModal } from "./GameEventModal";
import { GovernmentSingletonModal } from "./GovernmentSingletonModal";
import { IconCatalog } from "./IconCatalog";
import { InternalAffairsPage } from "./InternalAffairsPage";
import { JustinianReconquestPage } from "./JustinianReconquestPage";
import { LegacyUpgradeSingletonModal } from "./LegacyUpgradeSingletonModal";
import { ProductionSingletonModal } from "./ProductionSingletonModal";
import { SenatePage } from "./SenatePage";
import { SocialClassSingletonModal } from "./SocialClassSingletonModal";
import { TetrarchyPage } from "./TetrarchyPage";
import { ThirdCenturyCrisisPage } from "./ThirdCenturyCrisisPage";
import { TradeSingletonModal } from "./TradeSingletonModal";
import { TreasuryPage } from "./TreasuryPage";
import { WarModal } from "./WarModal";
import { WarTooltip } from "./WarTooltip";

export function TodoPanel(): React.ReactNode {
   if (!G.save) return null;
   if (G.params.get("hide")?.includes("todo")) return null;
   return (
      <div className="todo-panel">
         {[...getCurrentWars(G.save.state.playerProvince, G.save).map(WarTodo), ...entriesOf(Todos)].map(
            ([id, todo]) => {
               const tooltip = todo.tooltip(G.save);
               if (!tooltip) return null;
               return (
                  <FloatingTip key={id} fixedWidth className="p0" label={() => tooltip}>
                     <div
                        id={todo.id}
                        className={cls("item", todo.className(G.save))}
                        onClick={todo.onClick.bind(null, G.save)}
                     >
                        <img src={todo.icon(G.save)} />
                     </div>
                  </FloatingTip>
               );
            },
         )}
      </div>
   );
}

export interface ITodo {
   id?: string;
   name: (save: SaveGame) => string;
   icon: (save: SaveGame) => string;
   className: (save: SaveGame) => string;
   tooltip: (save: SaveGame) => React.ReactNode;
   onClick: (save: SaveGame) => void;
}

function WarTodo(war: IWar, index: number): [string, ITodo] {
   const todo: ITodo = {
      id: `LeftPanel_OngoingWar_${index}`,
      name: (save) => $t(L.$1$2War, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
      icon: (save) => {
         if (war.attacker === save.state.playerProvince) {
            const successChance = getWarPowerComparison(
               war.attacker,
               war.coAttackers,
               war.defender,
               war.coDefenders,
               save,
            ).successChance;
            if (war.actualWarScore >= war.requiredWarScore) {
               return IconCatalog.WarOngoing;
            }
            if (successChance <= 0.5) {
               return IconCatalog.WarWarning;
            }
            if (isWarStalled(war, save)) {
               return IconCatalog.WarStalled;
            }
         }
         return IconCatalog.WarOngoing;
      },
      className: (save) => {
         if (war.attacker === save.state.playerProvince) {
            const successChance = getWarPowerComparison(
               war.attacker,
               war.coAttackers,
               war.defender,
               war.coDefenders,
               save,
            ).successChance;
            if (war.actualWarScore >= war.requiredWarScore) {
               return "green animate-bounce-right";
            }
            if (isWarStalled(war, save)) {
               return "yellow animate-pulse";
            }
            if (successChance <= 0.5) {
               return "red animate-pulse";
            }
         }
         return "green";
      },
      tooltip: (save) => {
         return <WarTooltip war={war} />;
      },
      onClick: (save) => {
         showPanel(WarModal, { war });
      },
   } as const;

   return [`OngoingWar${index}`, todo];
}

const Rebellions: ITodo = {
   name: (save) => $t(L.CurrentlyOrAboutToRebel),
   icon: (save) => IconCatalog.Rebellion,
   className: (save) => {
      for (const [tile, data] of save.state.tiles) {
         if (data.province === save.state.playerProvince) {
            if (data.rebellion >= 10) {
               return "red animate-bounce-right";
            }
         }
      }
      return "red";
   },
   tooltip: (save) => {
      const current = new Set<string>();
      const aboutTo = new Set<string>();
      for (const [tile, data] of save.state.tiles) {
         if (data.province === save.state.playerProvince) {
            if (data.rebellion >= 10) {
               current.add(getTileName(tile, save));
            } else if (data.rebellion >= 8 && getTileUnrest(tile, save).value >= 0) {
               aboutTo.add(getTileName(tile, save));
            }
         }
      }
      if (current.size === 0 && aboutTo.size === 0) {
         return null;
      }
      return (
         <div className="m10">
            {current.size > 0 && <div>{html($t(L.TilesCurrentlyInRebellion$1, Array.from(current).join(", ")))}</div>}
            {aboutTo.size > 0 && <div>{html($t(L.TilesAboutToRebel$1, Array.from(aboutTo).join(", ")))}</div>}
            <div>{$t(L.ClickToViewDetails)}</div>
         </div>
      );
   },
   onClick: (save) => {
      showPanel(InternalAffairsPage, {});
   },
};

const LoomingDisasters: ITodo = {
   name: () => $t(L.LoomingDisasters),
   icon: () => IconCatalog.Disaster,
   className: () => "red",
   tooltip: (save) => {
      const disasters = getLoomingDisasters(save);
      if (disasters.length === 0) {
         return null;
      }
      return (
         <div className="m10">
            <div>{$t(L.TheFollowingDisastersAreLooming)}</div>
            <ul>
               {disasters.map((disaster) => {
                  const yearsLeft = disaster.year - getGameDate(save.state.tick, save).getFullYear();
                  return (
                     <li key={disaster.event}>
                        {GameEvents[disaster.event].name()} ({formatYear(disaster.year)},{" "}
                        {$t(L.In$1Years, formatNumber(yearsLeft))})
                     </li>
                  );
               })}
            </ul>
            <div>{$t(L.ClickToViewDetails)}</div>
         </div>
      );
   },
   onClick: () => {
      showPanel(DisasterPage, {});
   },
};

const ProvinceBankrupt: ITodo = {
   name: (save) => $t(L.OurProvinceIsBankrupt),
   icon: (save) => IconCatalog.Bankruptcy,
   className: (save) => "red",
   tooltip: (save) => {
      const timeLeft = getTimedActionTimeLeft("Bankruptcy", save.state.playerProvince, save);
      if (timeLeft <= 0) {
         return null;
      }
      return <BankruptcyEffectComp province={save.state.playerProvince} />;
   },
   onClick: (save) => {
      showPanel(TreasuryPage, {});
   },
};

const EligibleForMarriage: ITodo = {
   name: (save) => $t(L.FamilyMembersEligibleForMarriage),
   icon: (save) => IconCatalog.Marriage,
   className: (save) => "yellow",
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return null;
      }
      const result = getEligibleForMarriage(state.governor);
      if (result.length === 0) {
         return null;
      }
      return (
         <div className="m10">{$t(L.WeHave$1FamilyMembersEligibleForMarriageClickToViewDetails, result.length)}</div>
      );
   },
   onClick: (save) => {
      showPanel(FamilyTreeSingletonModal, {});
   },
};

const SocialClassDissent: ITodo = {
   name: (save) => $t(L.DominantOrDisloyalSocialClasses),
   icon: (save) => IconCatalog.Dissent,
   className: () => "red",
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return null;
      }
      const result: string[] = [];
      forEach(SocialClass, (socialClass, data) => {
         if (isSocialClassDominant(socialClass, save.state.playerProvince, save)) {
            result.push($t(L.$1ClassIsDominantTooltip, SocialClass[socialClass].name()));
         }
         if (isSocialClassDisloyal(socialClass, save.state.playerProvince, save)) {
            result.push($t(L.$1ClassIsDisloyalTooltip, SocialClass[socialClass].name()));
         }
      });
      if (result.length === 0) {
         return null;
      }
      return (
         <div className="m10">
            {result.map((r) => (
               <div key={r}>{r}</div>
            ))}
            <div>{$t(L.ClickToViewDetails)}</div>
         </div>
      );
   },
   onClick: (save) => {
      showPanel(SocialClassSingletonModal, {});
   },
};

const PledgeSupportToConsulCandidates: ITodo = {
   name: (save) => $t(L.PledgeSupportInConsulElection),
   icon: (save) => IconCatalog.Senate,
   className: (save) => "yellow",
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state || hasFlag(state.flags, ProvinceFlags.AutomaticallyPledgeSupport)) {
         return null;
      }
      const votes = save.state.senate.votes.get(save.state.playerProvince)?.size ?? 0;
      if (votes < 2) {
         return <div className="m10">{$t(L.PledgeSupportConsulElectionTooltip)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showPanel(SenatePage, {});
   },
};

const ExpiringConsulPoints: ITodo = {
   name: (save) => $t(L.ExpiringConsulPoints),
   icon: (save) => IconCatalog.Decree,
   className: (save) => "yellow",
   tooltip: (save) => {
      const monthsToNextElection = monthsToNextConsulElection(save);
      if (getProvinceResource("consulPoint", save.state.playerProvince, save) > 0 && monthsToNextElection < 6) {
         return (
            <div className="m10">
               {$t(
                  L.ExpiringConsulPointsTooltip$1$2,
                  getProvinceResource("consulPoint", save.state.playerProvince, save),
                  monthsToNextElection,
               )}
            </div>
         );
      }
      return null;
   },
   onClick: (save) => {
      showPanel(SenatePage, {});
   },
};

const SocialClassAgenda: ITodo = {
   name: (save) => $t(L.AdoptASocialClassAgenda),
   icon: (save) => IconCatalog.SocialClass,
   className: () => "yellow",
   tooltip: (save) => {
      const agendas = getAgendas(10, G.save.state.playerProvince, G.save);
      for (const agenda of agendas) {
         if (
            canDoAction(
               GrantSocialClassBonusAction(agenda, save.state.playerProvince, save),
               save.state.playerProvince,
               save,
            )
         ) {
            return <div className="m10">{$t(L.SocialClassAgendaAvailableTooltip)}</div>;
         }
      }
      return null;
   },
   onClick: (save) => {
      showPanel(SocialClassSingletonModal, {});
   },
};

const ExpiringCasusBelli: ITodo = {
   name: (save) => $t(L.ExpiringCasusBelli),
   icon: (save) => IconCatalog.CasusBelli,
   className: () => "yellow",
   tooltip: (save) => {
      const result: { province: Province; casusBelli: CasusBelli; monthsLeft: number }[] = [];
      getRelations(save.state.playerProvince, save)?.forEach((relation, province) => {
         relation.casusBelli.forEach(({ monthsLeft }, casusBelli) => {
            if (monthsLeft < 12) {
               result.push({ province, casusBelli, monthsLeft });
            }
         });
      });
      if (result.length === 0) {
         return null;
      }
      return (
         <div className="m10">
            {result.map(({ province, casusBelli, monthsLeft }) => (
               <div key={`${province}-${casusBelli}`}>
                  {getProvinceName(province, save)}: {CasusBelli[casusBelli].name()} (
                  {$t(L.$1MonthsLeft, formatNumber(monthsLeft))})
               </div>
            ))}
         </div>
      );
   },
   onClick: (save) => {
      showPanel(DiplomacyPage, { province: save.state.playerProvince });
   },
};

const VacantArmyGeneral: ITodo = {
   name: (save) => $t(L.VacantArmyGeneral),
   icon: (save) => IconCatalog.VacantArmyGeneral,
   className: (save) => "yellow",
   tooltip: (save) => {
      const general = getCurrentGeneral(save.state.playerProvince, save);
      if (general === undefined) {
         return <div className="m10">{$t(L.VacantArmyGeneralTooltip)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showPanel(ArmySingletonModal, {});
   },
};

const ThirdCenturyCrisis: ITodo = {
   name: () => TimedActions.ThirdCenturyCrisis.name(),
   icon: () => IconCatalog.Crisis,
   className: () => "green",
   tooltip: (save) => {
      if (getTimedActionTimeLeft("ThirdCenturyCrisis", save.state.playerProvince, save) <= 0) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.$1IsOngoing$2MonthsLeftClickToViewDetails,
               TimedActions.ThirdCenturyCrisis.name(),
               formatNumber(getTimedActionTimeLeft("ThirdCenturyCrisis", save.state.playerProvince, save)),
            )}
         </div>
      );
   },
   onClick: () => {
      showPanel(ThirdCenturyCrisisPage, {});
   },
};

const Tetrarchy: ITodo = {
   name: () => TimedActions.Tetrarchy.name(),
   icon: () => IconCatalog.Tetrarchy,
   className: () => "green",
   tooltip: (save) => {
      if (getTimedActionTimeLeft("Tetrarchy", save.state.playerProvince, save) <= 0) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.$1IsOngoing$2MonthsLeftClickToViewDetails,
               TimedActions.Tetrarchy.name(),
               formatNumber(getTimedActionTimeLeft("Tetrarchy", save.state.playerProvince, save)),
            )}
         </div>
      );
   },
   onClick: () => {
      showPanel(TetrarchyPage, {});
   },
};

const ChristianEmpire: ITodo = {
   name: () => TimedActions.ChristianEmpire.name(),
   icon: () => IconCatalog.ChiRho,
   className: () => "green",
   tooltip: (save) => {
      if (getTimedActionTimeLeft("ChristianEmpire", save.state.playerProvince, save) <= 0) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.$1IsOngoing$2MonthsLeftClickToViewDetails,
               TimedActions.ChristianEmpire.name(),
               formatNumber(getTimedActionTimeLeft("ChristianEmpire", save.state.playerProvince, save)),
            )}
         </div>
      );
   },
   onClick: () => {
      showPanel(ChristianEmpirePage, {});
   },
};

const JustinianReconquest: ITodo = {
   name: () => TimedActions.JustinianReconquest.name(),
   icon: () => IconCatalog.Reconquest,
   className: () => "green",
   tooltip: (save) => {
      if (getTimedActionTimeLeft("JustinianReconquest", save.state.playerProvince, save) <= 0) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.$1IsOngoing$2MonthsLeftClickToViewDetails,
               TimedActions.JustinianReconquest.name(),
               formatNumber(getTimedActionTimeLeft("JustinianReconquest", save.state.playerProvince, save)),
            )}
         </div>
      );
   },
   onClick: () => {
      showPanel(JustinianReconquestPage, {});
   },
};

const EcumenicalCouncil: ITodo = {
   name: (save) => $t(L.EcumenicalCouncil),
   icon: (save) => IconCatalog.EcumenicalCouncil,
   className: (save) => "green",
   tooltip: (save) => {
      const council = getOngoingEcumenicalCouncil(save.state.playerProvince, save);
      if (!council) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.$1IsOngoing$2MonthsLeftClickToViewDetails,
               TimedActions[council].name(),
               formatNumber(getTimedActionTimeLeft(council, save.state.playerProvince, save)),
            )}
         </div>
      );
   },
   onClick: (save) => {
      showPanel(EcumenicalCouncilPage, {});
   },
};

const BarbarianRaid: ITodo = {
   name: (save) => $t(L.BarbarianRaid),
   icon: (save) => IconCatalog.Barbarian,
   className: (save) =>
      save.state.wars.find((war) => war.casusBelli === "BarbarianRaid" && war.defender === save.state.playerProvince)
         ? "red"
         : "yellow",
   tooltip: (save) => {
      if (save.state.wars.find((war) => war.casusBelli === "BarbarianRaid")) {
         return <div className="m10">{$t(L.BarbarianRaidsAreOngoingClickToViewDetails)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showPanel(BarbarianRaidModal, {});
   },
};

const UpgradeArmyGeneral: ITodo = {
   name: (save) => $t(L.UpgradeArmyGeneral),
   icon: (save) => IconCatalog.UpgradeArmyGeneral,
   className: (save) => "yellow",
   tooltip: (save) => {
      const general = getCurrentGeneral(save.state.playerProvince, save);
      if (!general) {
         return null;
      }
      for (const skill of ["infantrySkill", "rangedSkill", "cavalrySkill"] as const) {
         const action = UpgradeGeneralSkillAction(skill, save.state.playerProvince, save);
         if (canDoAction(action, save.state.playerProvince, save)) {
            return <div className="m10">{$t(L.OurArmyGeneralCanBeUpgradedClickToViewDetails)}</div>;
         }
      }
      return null;
   },
   onClick: (save) => {
      showPanel(ArmySingletonModal, {});
   },
};

const TooFewRivals: ITodo = {
   name: (save) => $t(L.TooFewRivals),
   icon: (save) => IconCatalog.Rivals,
   className: (save) => "yellow",
   tooltip: (save) => {
      const data = save.state.provinces[save.state.playerProvince];
      if (!data) {
         return null;
      }
      if (data.rivals.filter(Boolean).length >= 2) {
         return null;
      }
      return <div className="m10">{$t(L.WeHaveTooFewRivalsClickToSelectMoreRivals)}</div>;
   },
   onClick: (save) => {
      showPanel(DiplomacyPage, { province: save.state.playerProvince });
   },
};

const EnactedTruce: ITodo = {
   name: (save) => $t(L.EnactedTruce),
   icon: (save) => IconCatalog.Truce,
   className: (save) => "yellow",
   tooltip: (save) => {
      const result = entriesOf(save.state.provinces).flatMap(([province, data]) => {
         if (province === save.state.playerProvince) return [];
         const truceMonthsLeft = getTruceMonthsLeft(save.state.playerProvince, province, save);
         return truceMonthsLeft > 0 ? [[province, truceMonthsLeft] as [Province, number]] : [];
      });
      if (result.length === 0) return null;
      return (
         <div className="m10">
            {$t(L.TheFollowingTrucesAreEnacted)}
            <ul>
               {result.map(([province, monthsLeft]) => (
                  <li key={province}>
                     {getProvinceName(save.state.playerProvince, save)}-{getProvinceName(province, save)} (
                     {$t(L.$1MonthsLeft, formatNumber(monthsLeft))})
                  </li>
               ))}
            </ul>
            {$t(L.ClickToViewDetails)}
         </div>
      );
   },
   onClick: (save) => {
      for (const [province, _] of entriesOf(save.state.provinces)) {
         const truceMonthsLeft = getTruceMonthsLeft(save.state.playerProvince, province, save);
         if (truceMonthsLeft > 0) {
            showPanel(DiplomacyPage, { province });
            return;
         }
      }
   },
};

const IdleDiplomats: ITodo = {
   name: (save) => $t(L.IdleDiplomats),
   icon: (save) => IconCatalog.Diplomat,
   className: (save) => "yellow",
   tooltip: (save) => {
      const currentRelations = getCurrentRelations(save.state.playerProvince, save);
      const totalDiplomats = getDiplomats(save.state.playerProvince, save);
      const idleDiplomats = totalDiplomats.value - currentRelations.size;
      if (idleDiplomats <= 0) {
         return null;
      }
      return <div className="m10">{$t(L.IdleDiplomatsTooltip$1, idleDiplomats)}</div>;
   },
   onClick: (save) => {},
};

const OutstandingLoans: ITodo = {
   name: (save) => $t(L.OutstandingLoans),
   icon: (save) => IconCatalog.Loan,
   className: (save) => "yellow",
   tooltip: (save) => {
      const data = save.state.provinces[save.state.playerProvince];
      if (!data) {
         return null;
      }
      if (data.loans.length === 0) {
         return null;
      }
      return <div className="m10">{$t(L.OutstandingLoansTooltip$1, data.loans.length)}</div>;
   },
   onClick: (save) => {
      showPanel(TreasuryPage, {});
   },
};

const OverextensionWarning: ITodo = {
   name: (save) => $t(L.Overextension),
   icon: (save) => IconCatalog.Overextension,
   className: (save) => "yellow",
   tooltip: (save) => {
      const overextension = getProvinceOverextension(save.state.playerProvince, save);
      if (overextension.value > 0) {
         return (
            <div className="m10">
               {$t(L.WeHave$1OverextensionClickToViewDetails, formatNumber(overextension.value))}
            </div>
         );
      }
      return null;
   },
   onClick: (save) => {
      showPanel(InternalAffairsPage, {});
   },
};

const TechCanBeResearched: ITodo = {
   name: (save) => $t(L.TechCanBeResearched),
   icon: (save) => IconCatalog.Tech,
   className: (save) => "green",
   tooltip: (save) => {
      const techs = getTechsCanBeResearched(save.state.playerProvince, save);
      if (techs.length === 0) {
         return null;
      }
      return (
         <div className="m10">
            {html(
               $t(
                  L.WeHave$1TechsThatCanBeResearched$2ClickToViewDetails,
                  techs.length,
                  techs.map((t) => Tech[t].name()).join(", "),
               ),
            )}
         </div>
      );
   },
   onClick: (save) => {
      const techs = getTechsCanBeResearched(save.state.playerProvince, save);
      if (techs.length === 0) {
         return;
      }
      G.scene.loadScene(TechTreeScene).selectTech(techs[0]);
   },
};

const CanAppointPontiff: ITodo = {
   name: (save) => $t(L.PontiffEnvoyArmyStaffCanBeAppointed),
   icon: (save) => IconCatalog.Pontiff,
   className: (save) => "green",
   tooltip: (save) => {
      const result: string[] = [];
      const appointPontiff = makeGameAction("AppointPontiff", save.state.playerProvince, save);
      if (canDoAction(appointPontiff, save.state.playerProvince, save)) {
         result.push($t(L.Pontiff));
      }
      const appointEnvoy = makeGameAction("AppointEnvoy", save.state.playerProvince, save);
      if (canDoAction(appointEnvoy, save.state.playerProvince, save)) {
         result.push($t(L.Envoy));
      }
      const appointArmyStaff = makeGameAction("AppointArmyStaff", save.state.playerProvince, save);
      if (canDoAction(appointArmyStaff, save.state.playerProvince, save)) {
         result.push($t(L.ArmyStaff));
      }
      if (result.length === 0) {
         return null;
      }
      return <div className="m10">{$t(L.$1CanBeAppointedClickToViewDetails, result.join(", "))}</div>;
   },
   onClick: (save) => {
      showPanel(GovernmentSingletonModal, {});
   },
};

const EmptyAdvisorSlots: ITodo = {
   name: (save) => $t(L.EmptyAdvisorSlots),
   icon: (save) => IconCatalog.EmptyAdvisor,
   className: (save) => "yellow",
   tooltip: (save) => {
      const data = save.state.provinces[save.state.playerProvince];
      if (!data) {
         return null;
      }
      for (const [k, v] of entriesOf(data.advisors)) {
         if (v.selected === null) {
            return <div className="m10">{$t(L.WeHaveEmptyAdvisorSlotsClickToSelectAdvisors)}</div>;
         }
      }
   },
   onClick: (save) => {
      showPanel(GovernmentSingletonModal, {});
   },
};

const CanMakeCore: ITodo = {
   id: "LeftPanel_CanMakeCore",
   name: (save) => $t(L.NonCoreTiles),
   icon: (save) => IconCatalog.Core,
   className: (save) => "yellow",
   tooltip: (save) => {
      const tiles = new Set<string>();
      for (const [tile, data] of save.state.tiles) {
         if (data.province === save.state.playerProvince && !data.coreProvinces.has(data.province)) {
            tiles.add(getTileName(tile, save));
         }
      }
      if (tiles.size === 0) return null;
      return (
         <div className="m10">
            {html($t(L.TilesThatAreNotOurCore$1ClickToViewDetails, Array.from(tiles).join(", ")))}
         </div>
      );
   },
   onClick: (save) => {
      showPanel(InternalAffairsPage, {});
   },
};

const AvailableProductionCapacity: ITodo = {
   id: "LeftPanel_AvailableProductionCapacity",
   name: (save) => $t(L.AvailableProductionCapacity),
   icon: (save) => IconCatalog.Production,
   className: (save) => "yellow",
   tooltip: (save) => {
      const totalCapacity = getProvinceProductionCapacity(G.save.state.playerProvince, G.save);
      const usedCapacity = getProvinceUsedProductionCapacity(G.save.state.playerProvince, G.save);
      if (usedCapacity >= totalCapacity.value) {
         return null;
      }
      const hasUnlockedProduction = entriesOf(Goods).some(([goods, def]) => {
         const tech = Goods[goods].tech;
         return tech && hasResearched(tech, G.save.state.playerProvince, G.save);
      });
      if (!hasUnlockedProduction) {
         return null;
      }
      return (
         <div className="m10">
            {$t(
               L.WeHave$1AvailableProductionCapacityClickToViewDetails,
               formatNumber(totalCapacity.value - usedCapacity),
            )}
         </div>
      );
   },
   onClick: (save) => {
      showPanel(ProductionSingletonModal, {});
   },
};

const CanMakeTrade: ITodo = {
   id: "LeftPanel_CanMakeTrade",
   name: (save) => $t(L.CanMakeTrade),
   icon: (save) => IconCatalog.Trade,
   className: (save) => "yellow",
   tooltip: (save) => {
      for (const [otherProvince, data] of entriesOf(save.state.provinces)) {
         if (otherProvince === save.state.playerProvince) continue;
         const cond = CanTradeCostCondition(save.state.playerProvince, otherProvince, save);
         if (canDoAction(cond, save.state.playerProvince, save)) {
            return <div className="m10">{$t(L.WeCanMakeANewTradeClickToViewDetails)}</div>;
         }
      }
      return null;
   },
   onClick: (save) => {
      showPanel(TradeSingletonModal, { provinces: new Set([]) });
   },
};

const CanUpgradeLegacy: ITodo = {
   name: (save) => $t(L.AvailableLegacyUpgrades),
   icon: (save) => IconCatalog.Legacy,
   className: (save) => "yellow",
   tooltip: (save) => {
      const cost = getLegacyUpgradeCost(save.state.playerProvince, save);
      const available = getProvinceResource("legacy", save.state.playerProvince, save);
      if (available >= cost) {
         return <div className="m10">{$t(L.WeHaveAvailableLegacyUpgradesClickToViewDetails)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showPanel(LegacyUpgradeSingletonModal, {});
   },
};

const TreatiesAboutToExpire: ITodo = {
   name: (save) => $t(L.TreatiesAboutToExpire),
   icon: (save) => IconCatalog.Treaty,
   className: (save) => "yellow",
   tooltip: (save) => {
      const relations = getRelations(save.state.playerProvince, save);
      if (!relations) {
         return null;
      }
      const treaties = Array.from(relations).flatMap(([otherProvince, data]) => {
         if (data.treaty && data.treaty.month + TimedActions.DiplomaticTreaty.duration - save.state.month < 6) {
            return [`${getProvinceName(otherProvince, save)} (${TreatyNames[data.treaty.type]()})`];
         }
         return [];
      });
      if (treaties.length === 0) return null;
      return (
         <div className="m10">
            {html($t(L.TheFollowingDiplomaticTreatiesAreAboutToExpire$1$2, "6", treaties.join(", ")))}
         </div>
      );
   },
   onClick: (save) => {
      const relations = getRelations(save.state.playerProvince, save);
      if (!relations) {
         return;
      }
      for (const [otherProvince, data] of relations) {
         if (data.treaty && data.treaty.month + TimedActions.DiplomaticTreaty.duration - save.state.month < 6) {
            showPanel(DiplomacyPage, { province: otherProvince });
            return;
         }
      }
   },
};

const PendingGameEvent: ITodo = {
   name: (save) => $t(L.PendingEventDecision),
   icon: (save) => IconCatalog.PendingEvent,
   className: (save) => "green animate-bounce-right",
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return null;
      }
      for (const [event, data] of state.events) {
         return (
            <div className="m10">
               {$t(L.PendingGameEventAutoDecideIn$1Months, formatNumber(PendingGameEventTimeoutMonths))}
            </div>
         );
      }
      return null;
   },
   onClick: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return;
      }
      for (const [event, data] of state.events) {
         showPanel(GameEventModal, { event });
         return;
      }
   },
};

const _Todos = {
   ProvinceBankrupt,
   Rebellions,
   LoomingDisasters,
   BarbarianRaid,
   SocialClassDissent,
   ThirdCenturyCrisis,
   Tetrarchy,
   ChristianEmpire,
   JustinianReconquest,
   EcumenicalCouncil,
   TooFewRivals,
   VacantArmyGeneral,
   UpgradeArmyGeneral,
   EnactedTruce,
   IdleDiplomats,
   CanUpgradeLegacy,
   OverextensionWarning,
   CanMakeCore,
   EmptyAdvisorSlots,
   AvailableProductionCapacity,
   CanMakeTrade,
   SocialClassAgenda,
   TreatiesAboutToExpire,
   EligibleForMarriage,
   PledgeSupportToConsulCandidates,
   ExpiringConsulPoints,
   ExpiringCasusBelli,
   OutstandingLoans,
   TechCanBeResearched,
   CanAppointPontiff,
   PendingGameEvent,
} as const satisfies Record<string, ITodo>;

export type Todo = keyof typeof _Todos;
export const Todos = _Todos as Record<Todo, ITodo>;
