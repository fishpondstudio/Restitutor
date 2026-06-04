import { cls, EmptyString, entriesOf, formatNumber, keysOf } from "@project/shared/src/utils/Helper";
import Bankruptcy from "../assets/images/Bankruptcy.svg";
import Core from "../assets/images/Core.svg";
import Decree from "../assets/images/Decree.svg";
import Diplomat from "../assets/images/Diplomat.svg";
import Dissent from "../assets/images/Dissent.svg";
import EmptyAdvisor from "../assets/images/EmptyAdvisor.svg";
import Legacy from "../assets/images/Legacy.svg";
import Loan from "../assets/images/Loan.svg";
import Marriage from "../assets/images/Marriage.svg";
import Overextension from "../assets/images/Overextension.svg";
import PendingEvent from "../assets/images/PendingEvent.svg";
import Pontiff from "../assets/images/Pontiff.svg";
import Production from "../assets/images/Production.svg";
import Rebellion from "../assets/images/Rebellion.svg";
import Rivals from "../assets/images/Rivals.svg";
import Senate from "../assets/images/Senate.svg";
import TechIcon from "../assets/images/Tech.svg";
import Trade from "../assets/images/Trade.svg";
import Treaty from "../assets/images/Treaty.svg";
import Truce from "../assets/images/Truce.svg";
import UpgradeArmyGeneralIcon from "../assets/images/UpgradeArmyGeneral.svg";
import VacantArmyGeneralIcon from "../assets/images/VacantArmyGeneral.svg";
import WarOngoing from "../assets/images/WarOngoing.svg";
import WarStalled from "../assets/images/WarStalled.svg";
import WarWarning from "../assets/images/WarWarning.svg";
import { UpgradeGeneralSkillAction } from "../game/actions/ArmyGeneralAction";
import { canDoAction } from "../game/actions/GameAction";
import { CanTradeCostCondition } from "../game/actions/TradeActions";
import { Goods } from "../game/definitions/Goods";
import { LegacyUpgrades } from "../game/definitions/LegacyUpgrade";
import { type Province, TreatyNames } from "../game/definitions/Province";
import { SocialClassNames } from "../game/definitions/SocialClass";
import { Tech } from "../game/definitions/Tech";
import { getTileName } from "../game/definitions/TileName";
import { TimedActions } from "../game/definitions/TimedAction";
import type { SaveGame } from "../game/GameState";
import { getCurrentRelations, getDiplomats, getRelations } from "../game/logic/DiplomacyLogic";
import { getEligibleForMarriage } from "../game/logic/GovernorLogic";
import { getLegacyUpgradeCost, getLegacyUpgradeLevel } from "../game/logic/LegacyUpgradeLogic";
import {
   getProvinceName,
   getProvinceOverextension,
   getProvinceProductionCapacity,
   getProvinceResource,
   getProvinceUsedProductionCapacity,
} from "../game/logic/ProvinceLogic";
import { getEstimatedDissentTime } from "../game/logic/SocialClassLogic";
import { getTechsCanBeResearched, hasResearched } from "../game/logic/TechLogic";
import { monthToNextYear } from "../game/logic/TickLogic";
import { PendingGameEventTimeoutMonths } from "../game/logic/TickProvince";
import { getTileUnrest } from "../game/logic/TileLogic";
import { getTimedActionTimeLeft } from "../game/logic/TimedActionLogic";
import {
   getCurrentGeneral,
   getCurrentWars,
   getTruceMonthsLeft,
   getWarSuccessChance,
   type IWar,
   isWarStalled,
} from "../game/logic/WarLogic";
import { TechTreeScene } from "../scenes/TechTreeScene";
import { G } from "../utils/Global";
import { $t, L } from "../utils/i18n";
import { showModal } from "../utils/ModalManager";
import { ArmyModal } from "./ArmyModal";
import { BankruptcyEffectComp } from "./BankruptcyEffectComp";
import { showSidebar } from "./common/Sidebar";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { DiplomacyPage } from "./DiplomacyPage";
import { FamilyTreeModal } from "./FamilyModal";
import { GameEventModal } from "./GameEventModal";
import { GovernmentModal } from "./GovernmentModal";
import { InternalAffairsModal } from "./InternalAffairsModal";
import { LegacyUpgradePage } from "./LegacyUpgradePage";
import { ProductionModal } from "./ProductionModal";
import { SenateModal } from "./SenateModal";
import { SocialClassModal } from "./SocialClassModal";
import { TradeModal } from "./TradeModal";
import { TreasuryPage } from "./TreasuryPage";
import { WarModal } from "./WarModal";
import { WarTooltip } from "./WarTooltip";

export function LeftPanel(): React.ReactNode {
   if (!G.save) return null;
   return (
      <div className="left-panel">
         {[...getCurrentWars(G.save.state.playerProvince, G.save).map(WarTodo), ...Todos].map((todo) => {
            const tooltip = todo.tooltip(G.save);
            if (!tooltip) return null;
            return (
               <FloatingTip key={todo.name(G.save)} w={300} className="p0" label={tooltip}>
                  <div
                     id={todo.id}
                     className={cls("item", todo.className(G.save))}
                     onClick={todo.onClick.bind(null, G.save)}
                  >
                     <img src={todo.icon(G.save)} />
                  </div>
               </FloatingTip>
            );
         })}
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

function WarTodo(war: IWar, index: number): ITodo {
   return {
      id: `LeftPanel_OngoingWar_${index}`,
      name: (save) => $t(L.XYWar, getProvinceName(war.attacker, save), getProvinceName(war.defender, save)),
      icon: (save) => {
         if (war.attacker === save.state.playerProvince) {
            const successChance = getWarSuccessChance(
               war.attacker,
               war.coAttackers,
               war.defender,
               war.coDefenders,
               save,
            );
            if (war.actualWarScore >= war.requiredWarScore) {
               return WarOngoing;
            }
            if (successChance < 0.5) {
               return WarWarning;
            }
            if (isWarStalled(war, save)) {
               return WarStalled;
            }
         }
         return WarOngoing;
      },
      className: (save) => {
         if (war.attacker === save.state.playerProvince) {
            const successChance = getWarSuccessChance(
               war.attacker,
               war.coAttackers,
               war.defender,
               war.coDefenders,
               save,
            );
            if (war.actualWarScore >= war.requiredWarScore) {
               return "green animate-bounce-left";
            }
            if (isWarStalled(war, save)) {
               return "yellow animate-pulse";
            }
            if (successChance < 0.5) {
               return "red animate-pulse";
            }
         }
         return "green";
      },
      tooltip: (save) => {
         return <WarTooltip war={war} />;
      },
      onClick: (save) => {
         showModal(<WarModal war={war} />);
      },
   } as const;
}

const Rebellions: ITodo = {
   name: (save) => $t(L.CurrentlyOrAboutToRebel),
   icon: (save) => Rebellion,
   className: (save) => {
      for (const [tile, data] of save.state.tiles) {
         if (data.province === save.state.playerProvince) {
            if (data.rebellion >= 10) {
               return "red animate-bounce-left";
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
               current.add(getTileName(tile));
            } else if (data.rebellion >= 8 && getTileUnrest(tile, save).value >= 0) {
               aboutTo.add(getTileName(tile));
            }
         }
      }
      if (current.size === 0 && aboutTo.size === 0) {
         return null;
      }
      return (
         <div className="m10">
            {current.size > 0 && <div>{html($t(L.TilesCurrentlyInRebellionX, Array.from(current).join(", ")))}</div>}
            {aboutTo.size > 0 && <div>{html($t(L.TilesAboutToRebelX, Array.from(aboutTo).join(", ")))}</div>}
            <div>{$t(L.ClickToViewDetails)}</div>
         </div>
      );
   },
   onClick: (save) => {
      showModal(<InternalAffairsModal />);
   },
};

const ProvinceBankrupt: ITodo = {
   name: (save) => $t(L.OurProvinceIsBankrupt),
   icon: (save) => Bankruptcy,
   className: (save) => "red",
   tooltip: (save) => {
      const timeLeft = getTimedActionTimeLeft("Bankruptcy", save.state.playerProvince, save);
      if (timeLeft <= 0) {
         return null;
      }
      return <BankruptcyEffectComp province={save.state.playerProvince} />;
   },
   onClick: (save) => {
      showSidebar(<TreasuryPage />);
   },
};

const EligibleForMarriage: ITodo = {
   name: (save) => $t(L.FamilyMembersEligibleForMarriage),
   icon: (save) => Marriage,
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
         <div className="m10">{$t(L.WeHaveXFamilyMembersEligibleForMarriageClickToViewDetails, result.length)}</div>
      );
   },
   onClick: (save) => {
      showModal(<FamilyTreeModal />);
   },
};

const SocialClassDissent: ITodo = {
   name: (save) => $t(L.SocialClassesInDissent),
   icon: (save) => Dissent,
   className: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return EmptyString;
      }
      const isDissent = entriesOf(state.socialClasses).some(([sc, data]) => data.dissent > data.loyalty);
      return isDissent ? "red" : "yellow";
   },
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return null;
      }
      const socialClasses = entriesOf(state.socialClasses).filter(([sc, data]) => {
         const estimatedDissentTime = getEstimatedDissentTime(sc, save.state.playerProvince, save);
         return Number.isFinite(estimatedDissentTime) && estimatedDissentTime >= 0 && estimatedDissentTime <= 12;
      });
      if (socialClasses.length === 0) {
         return null;
      }
      return (
         <div className="m10">
            {$t(L.DissentIsRisingAmongTheFollowingSocialClasses)}
            <ul>
               {socialClasses.map(([sc, data]) => {
                  const estimatedDissentTime = getEstimatedDissentTime(sc, save.state.playerProvince, save);
                  const status =
                     estimatedDissentTime === 0
                        ? $t(L.InDissent)
                        : estimatedDissentTime > 0 && Number.isFinite(estimatedDissentTime)
                          ? $t(L.InXMonths, formatNumber(estimatedDissentTime))
                          : "";
                  return (
                     <li key={sc}>
                        {SocialClassNames[sc]()} ({status})
                     </li>
                  );
               })}
            </ul>
            {$t(L.ClickToViewDetails)}
         </div>
      );
   },
   onClick: (save) => {
      showModal(<SocialClassModal />);
   },
};

const PledgeSupportToConsulCandidates: ITodo = {
   name: (save) => $t(L.PledgeSupportInConsulElection),
   icon: (save) => Senate,
   className: (save) => "yellow",
   tooltip: (save) => {
      const votes = save.state.senate.votes.get(save.state.playerProvince)?.size ?? 0;
      if (votes < 2) {
         return <div className="m10">{$t(L.PledgeSupportConsulElectionTooltip)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showModal(<SenateModal />);
   },
};

const ExpiringConsulPoints: ITodo = {
   name: (save) => $t(L.ExpiringConsulPoints),
   icon: (save) => Decree,
   className: (save) => "yellow",
   tooltip: (save) => {
      const monthsToNextYear = monthToNextYear(save);
      if (
         getProvinceResource("consulPoint", save.state.playerProvince, save) > 0 &&
         monthsToNextYear > 0 &&
         monthsToNextYear < 6
      ) {
         return (
            <div className="m10">
               {$t(
                  L.ExpiringConsulPointsTooltip,
                  getProvinceResource("consulPoint", save.state.playerProvince, save),
                  monthToNextYear(save),
               )}
            </div>
         );
      }
      return null;
   },
   onClick: (save) => {
      showModal(<SenateModal />);
   },
};

const VacantArmyGeneral: ITodo = {
   name: (save) => $t(L.VacantArmyGeneral),
   icon: (save) => VacantArmyGeneralIcon,
   className: (save) => "yellow",
   tooltip: (save) => {
      const general = getCurrentGeneral(save.state.playerProvince, save);
      if (general === undefined) {
         return <div className="m10">{$t(L.VacantArmyGeneralTooltip)}</div>;
      }
      return null;
   },
   onClick: (save) => {
      showModal(<ArmyModal />);
   },
};

const UpgradeArmyGeneral: ITodo = {
   name: (save) => $t(L.UpgradeArmyGeneral),
   icon: (save) => UpgradeArmyGeneralIcon,
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
      showModal(<ArmyModal />);
   },
};

const TooFewRivals: ITodo = {
   name: (save) => $t(L.TooFewRivals),
   icon: (save) => Rivals,
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
      showSidebar(<DiplomacyPage province={save.state.playerProvince} />);
   },
};

const EnactedTruce: ITodo = {
   name: (save) => $t(L.EnactedTruce),
   icon: (save) => Truce,
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
                     {$t(L.XMonthsLeft, formatNumber(monthsLeft))})
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
            showSidebar(<DiplomacyPage province={province} />);
            return;
         }
      }
   },
};

const IdleDiplomats: ITodo = {
   name: (save) => $t(L.IdleDiplomats),
   icon: (save) => Diplomat,
   className: (save) => "yellow",
   tooltip: (save) => {
      const currentRelations = getCurrentRelations(save.state.playerProvince, save);
      const totalDiplomats = getDiplomats(save.state.playerProvince, save);
      const idleDiplomats = totalDiplomats.value - currentRelations.size;
      if (idleDiplomats <= 0) {
         return null;
      }
      return <div className="m10">{$t(L.IdleDiplomatsTooltip, idleDiplomats)}</div>;
   },
   onClick: (save) => {},
};

const OutstandingLoans: ITodo = {
   name: (save) => $t(L.OutstandingLoans),
   icon: (save) => Loan,
   className: (save) => "yellow",
   tooltip: (save) => {
      const data = save.state.provinces[save.state.playerProvince];
      if (!data) {
         return null;
      }
      if (data.loans.length === 0) {
         return null;
      }
      return <div className="m10">{$t(L.OutstandingLoansTooltip, data.loans.length)}</div>;
   },
   onClick: (save) => {
      showSidebar(<TreasuryPage />);
   },
};

const OverextensionWarning: ITodo = {
   name: (save) => $t(L.Overextension),
   icon: (save) => Overextension,
   className: (save) => "yellow",
   tooltip: (save) => {
      const overextension = getProvinceOverextension(save.state.playerProvince, save);
      if (overextension.value > 0) {
         return (
            <div className="m10">{$t(L.WeHaveXOverextensionClickToViewDetails, formatNumber(overextension.value))}</div>
         );
      }
      return null;
   },
   onClick: (save) => {
      showModal(<InternalAffairsModal />);
   },
};

const TechCanBeResearched: ITodo = {
   name: (save) => $t(L.TechCanBeResearched),
   icon: (save) => TechIcon,
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
                  L.WeHaveXTechsThatCanBeResearchedYClickToViewDetails,
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
   icon: (save) => Pontiff,
   className: (save) => "green",
   tooltip: (save) => {
      const result: string[] = [];
      const appointPontiff = TimedActions.AppointPontiff.action(save.state.playerProvince, save);
      if (canDoAction(appointPontiff, save.state.playerProvince, save)) {
         result.push($t(L.Pontiff));
      }
      const appointEnvoy = TimedActions.AppointEnvoy.action(save.state.playerProvince, save);
      if (canDoAction(appointEnvoy, save.state.playerProvince, save)) {
         result.push($t(L.Envoy));
      }
      const appointArmyStaff = TimedActions.AppointArmyStaff.action(save.state.playerProvince, save);
      if (canDoAction(appointArmyStaff, save.state.playerProvince, save)) {
         result.push($t(L.ArmyStaff));
      }
      if (result.length === 0) {
         return null;
      }
      return <div className="m10">{$t(L.XCanBeAppointedClickToViewDetails, result.join(", "))}</div>;
   },
   onClick: (save) => {
      showModal(<GovernmentModal />);
   },
};

const EmptyAdvisorSlots: ITodo = {
   name: (save) => $t(L.EmptyAdvisorSlots),
   icon: (save) => EmptyAdvisor,
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
      showModal(<GovernmentModal />);
   },
};

const CanMakeCore: ITodo = {
   id: "LeftPanel_CanMakeCore",
   name: (save) => $t(L.NonCoreTiles),
   icon: (save) => Core,
   className: (save) => "yellow",
   tooltip: (save) => {
      const tiles = new Set<string>();
      for (const [tile, data] of save.state.tiles) {
         if (data.province === save.state.playerProvince && !data.coreProvinces.has(data.province)) {
            tiles.add(getTileName(tile));
         }
      }
      if (tiles.size === 0) return null;
      return (
         <div className="m10">
            {html($t(L.TilesThatAreNotOurCoreXClickToViewDetails, Array.from(tiles).join(", ")))}
         </div>
      );
   },
   onClick: (save) => {
      showModal(<InternalAffairsModal />);
   },
};

const AvailableProductionCapacity: ITodo = {
   id: "LeftPanel_AvailableProductionCapacity",
   name: (save) => $t(L.AvailableProductionCapacity),
   icon: (save) => Production,
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
               L.WeHaveXAvailableProductionCapacityClickToViewDetails,
               formatNumber(totalCapacity.value - usedCapacity),
            )}
         </div>
      );
   },
   onClick: (save) => {
      showModal(<ProductionModal />);
   },
};

const CanMakeTrade: ITodo = {
   id: "LeftPanel_CanMakeTrade",
   name: (save) => $t(L.CanMakeTrade),
   icon: (save) => Trade,
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
      showModal(<TradeModal provinces={new Set([])} />);
   },
};

const CanUpgradeLegacy: ITodo = {
   name: (save) => $t(L.AvailableLegacyUpgrades),
   icon: (save) => Legacy,
   className: (save) => "yellow",
   tooltip: (save) => {
      for (const upgrade of keysOf(LegacyUpgrades)) {
         const level = getLegacyUpgradeLevel(upgrade, save.state.playerProvince, save);
         if (getProvinceResource("legacy", save.state.playerProvince, save) >= getLegacyUpgradeCost(level + 1)) {
            return <div className="m10">{$t(L.WeHaveAvailableLegacyUpgradesClickToViewDetails)}</div>;
         }
      }
      return null;
   },
   onClick: (save) => {
      showSidebar(<LegacyUpgradePage />);
   },
};

const TreatiesAboutToExpire: ITodo = {
   name: (save) => $t(L.TreatiesAboutToExpire),
   icon: (save) => Treaty,
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
            {html($t(L.TheFollowingDiplomaticTreatiesAreAboutToExpireInLessThanXMonthsY, "6", treaties.join(", ")))}
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
            showSidebar(<DiplomacyPage province={otherProvince} />);
            return;
         }
      }
   },
};

const PendingGameEvent: ITodo = {
   name: (save) => $t(L.PendingEventDecision),
   icon: (save) => PendingEvent,
   className: (save) => "green animate-bounce-left",
   tooltip: (save) => {
      const state = save.state.provinces[save.state.playerProvince];
      if (!state) {
         return null;
      }
      for (const [event, data] of state.events) {
         return (
            <div className="m10">
               {$t(L.PendingGameEventAutoDecideInXMonths, formatNumber(PendingGameEventTimeoutMonths))}
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
         showModal(<GameEventModal event={event} />);
         return;
      }
   },
};

const Todos = [
   Rebellions,
   SocialClassDissent,
   ProvinceBankrupt,
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
   TreatiesAboutToExpire,
   EligibleForMarriage,
   PledgeSupportToConsulCandidates,
   ExpiringConsulPoints,
   OutstandingLoans,
   TechCanBeResearched,
   CanAppointPontiff,
   PendingGameEvent,
] as const satisfies ITodo[];
