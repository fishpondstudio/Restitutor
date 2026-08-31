import { EmptyString, forEach, formatNumber } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type IGameCostCondition } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { getTotalUpgrades } from "../logic/ProvinceLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { BreachOfThePeaceDurationYear, onGeneralEnded } from "../logic/WarLogic";
import { CasusBelli } from "./CasusBelli";
import { Price } from "./Goods";
import type { IBaseModifier, Modifier } from "./Modifier";
import type { Province } from "./Province";
import { SpawnedProvinceBoostMonths } from "./SpawnedProvince";
import { Tech } from "./Tech";

export interface ITimedAction {
   name: () => string;
   desc?: () => string;
   cooldown: number;
   duration: number;
   tech?: Tech;
   onStart?: (province: Province, save: SaveGame) => void;
   onEnd?: (province: Province, save: SaveGame) => void;
}

export interface ITimedEffectAction extends ITimedAction {
   costCondition: (province: Province, save: SaveGame) => IGameCostCondition;
   modifiers: Partial<Record<Modifier, Omit<IBaseModifier, "name">>>;
}

class TimedActionDefinitions {
   UpgradeInfrastructure: ITimedAction = {
      name: () => $t(L.UpgradeInfrastructure),
      desc: () => $t(L.TimedActionUpgradeInfrastructureDesc),
      duration: 0,
      cooldown: 0,
   };
   UpgradeProduction: ITimedAction = {
      name: () => $t(L.UpgradeProduction),
      desc: () => $t(L.TimedActionUpgradeProductionDesc),
      duration: 0,
      cooldown: 0,
   };
   UpgradePopulation: ITimedAction = {
      name: () => $t(L.UpgradePopulation),
      desc: () => $t(L.TimedActionUpgradePopulationDesc),
      duration: 0,
      cooldown: 0,
   };
   Appease: ITimedAction = {
      name: () => $t(L.Appease),
      desc: () => $t(L.TimedActionAppeaseDesc$1, "5"),
      duration: 0,
      cooldown: 0,
   };
   Crackdown: ITimedAction = {
      name: () => $t(L.CrackDown),
      desc: () => $t(L.TimedActionCrackdownDesc$1$2$3, "0", "10", "5"),
      duration: 0,
      cooldown: 0,
   };
   HoldGames: ITimedEffectAction = {
      name: () => $t(L.HoldGames),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { gold: getTotalUpgrades(province, save) * 12 },
         };
      },
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   };
   ExpandGrainDole: ITimedEffectAction = {
      name: () => $t(L.ExpandGrainDole),
      cooldown: 24,
      duration: 12,
      costCondition: (province, save) => {
         return {
            cost: { bread: (getTotalUpgrades(province, save) * 12) / Price.bread },
         };
      },
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   };
   UpgradeRations: ITimedEffectAction = {
      name: () => $t(L.UpgradeRations),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { cheese: (getTotalUpgrades(province, save) * 12) / Price.cheese },
         };
      },
      modifiers: {
         WarPower: { type: "multiply", value: 0.1 },
      },
   };
   RefitArmor: ITimedEffectAction = {
      name: () => $t(L.RefitArmor),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { armor: (getTotalUpgrades(province, save) * 12) / Price.armor },
         };
      },
      modifiers: {
         WarPower: { type: "multiply", value: 0.1 },
      },
   };
   ServiceWeapons: ITimedEffectAction = {
      name: () => $t(L.ServiceWeapons),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { weapon: (getTotalUpgrades(province, save) * 12) / Price.weapon },
         };
      },
      modifiers: {
         WarPower: { type: "multiply", value: 0.1 },
      },
   };
   MakeWarSpeech: ITimedAction = {
      name: () => $t(L.MakeWarSpeech),
      desc: () => $t(L.MakeWarSpeechDesc),
      duration: 0,
      cooldown: 12,
   };
   GrantTaxRelief: ITimedEffectAction = {
      name: () => $t(L.GrantTaxRelief),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => ({}),
      modifiers: {
         Stability: { type: "add", value: 10 },
         LandTax: { type: "multiply", value: -0.2 },
      },
   };
   UndermineTheirArmy: ITimedAction = {
      name: () => $t(L.UndermineTheirArmy),
      desc: () => $t(L.UnderminingTheirArmyReducesTheirWarPowerBy$1, "10%"),
      duration: 12,
      cooldown: 48,
   };
   MakeCore: ITimedAction = {
      name: () => $t(L.MakeCore),
      desc: () => $t(L.MadeCoreTileRemainsCoreAfterReconquest),
      duration: 0,
      cooldown: 12,
   };
   RecruitAGeneral: ITimedAction = {
      name: () => $t(L.RecruitAGeneral),
      desc: () => $t(L.RecruitingAGeneralCostsGoldEveryMonthAGeneralHasABaseSkillOf$1, "1/1/1"),
      duration: 12 * 30,
      cooldown: 12 * 30,
      onEnd: (province, save) => {
         onGeneralEnded(province, save);
      },
   };
   FortifyBorders: ITimedAction = {
      name: () => $t(L.FortifyOurBorders),
      desc: () => $t(L.TimedActionFortifyBordersDesc$1, "100%"),
      duration: 12 * 2,
      cooldown: 12 * 4,
   };
   AppointPontiff: ITimedEffectAction = {
      name: () => $t(L.AppointAPontiff),
      duration: 24,
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { administrative: 12 },
            condition: finalizeCondition([
               ...timedActionConditions(
                  { action: "AppointEnvoy", label: $t(L.AppointingAnEnvoyIsNotOnCooldown), ignoreTech: true },
                  province,
                  save,
               ),
               ...timedActionConditions(
                  {
                     action: "AppointArmyStaff",
                     label: $t(L.AppointingArmyStaffIsNotOnCooldown),
                     ignoreTech: true,
                  },
                  province,
                  save,
               ),
            ]),
         };
      },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
      },
   };
   AppointEnvoy: ITimedEffectAction = {
      name: () => $t(L.AppointAnEnvoy),
      duration: 24,
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { diplomatic: 12 },
            condition: finalizeCondition([
               ...timedActionConditions(
                  { action: "AppointPontiff", label: $t(L.AppointingAPontiffIsNotOnCooldown), ignoreTech: true },
                  province,
                  save,
               ),
               ...timedActionConditions(
                  {
                     action: "AppointArmyStaff",
                     label: $t(L.AppointingArmyStaffIsNotOnCooldown),
                     ignoreTech: true,
                  },
                  province,
                  save,
               ),
            ]),
         };
      },
      modifiers: {
         DiplomaticPoint: { type: "add", value: 1 },
      },
   };
   AppointArmyStaff: ITimedEffectAction = {
      name: () => $t(L.AppointArmyStaff),
      duration: 24,
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { military: 12 },
            condition: finalizeCondition([
               ...timedActionConditions(
                  { action: "AppointPontiff", label: $t(L.AppointingAPontiffIsNotOnCooldown), ignoreTech: true },
                  province,
                  save,
               ),
               ...timedActionConditions(
                  { action: "AppointEnvoy", label: $t(L.AppointingAnEnvoyIsNotOnCooldown), ignoreTech: true },
                  province,
                  save,
               ),
            ]),
         };
      },
      modifiers: {
         MilitaryPoint: { type: "add", value: 1 },
      },
   };
   SetGovernmentFocus: ITimedAction = {
      name: () => $t(L.SetGovernmentFocus),
      desc: () => $t(L.TimedActionSetGovernmentFocusDesc),
      duration: 0,
      cooldown: 120,
   };
   CorruptOfficials: ITimedAction = {
      name: () => $t(L.CorruptOfficials),
      desc: () => $t(L.CorruptingOfficialsIncreasesOurInfiltrationBy$1, "50"),
      duration: 0,
      cooldown: 12 * 5,
   };
   Bankruptcy: ITimedEffectAction = {
      name: () => $t(L.Bankruptcy),
      duration: 10 * 12,
      cooldown: 0,
      costCondition: (province, save) => {
         return {};
      },
      modifiers: {
         LandTax: { type: "multiply", value: -0.8 },
         TileOutput: { type: "multiply", value: -0.8 },
         Manpower: { type: "multiply", value: -0.8 },
         Stability: { type: "add", value: -10 },
         InfrastructureUpgradeCost: { type: "multiply", value: 1 },
         ProductionUpgradeCost: { type: "multiply", value: 1 },
         PopulationUpgradeCost: { type: "multiply", value: 1 },
         ResearchCost: { type: "multiply", value: 1 },
         MonthlyInterestRate: { type: "multiply", value: 1 },
      },
   };
   ChangeRival: ITimedAction = {
      name: () => $t(L.ChangeRival),
      duration: 0,
      cooldown: 12 * 10,
   };
   Denounce: ITimedAction = {
      name: () => $t(L.Denounce),
      desc: () => $t(L.TimedActionDenounceDesc$1$2$3, "50", "10%", "20%"),
      duration: 12 * 2,
      cooldown: 12 * 4,
   };
   DemandElectionBacking: ITimedAction = {
      name: () => $t(L.DemandElectionBacking),
      desc: () => $t(L.TimedActionDemandElectionBackingDesc$1, "1"),
      duration: 0,
      cooldown: 6,
   };
   DemandTribute: ITimedAction = {
      name: () => $t(L.DemandATribute),
      desc: () => $t(L.TimedActionDemandTributeDesc),
      duration: 12 * 1,
      cooldown: 12 * 4,
   };
   DemandTile: ITimedAction = {
      name: () => $t(L.DemandATile),
      desc: () => $t(L.TimedActionDemandTileDesc),
      duration: 12 * 5,
      cooldown: 12 * 10,
   };
   RequestFunding: ITimedEffectAction = {
      name: () => $t(L.RequestFunding),
      duration: 12,
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      modifiers: {
         TileOutput: { type: "multiply", value: 0.25 },
         LandTax: { type: "multiply", value: 0.25 },
      },
   };
   EnactSenateOversight: ITimedEffectAction = {
      name: () => $t(L.EnactSenateOversight),
      duration: 12,
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      modifiers: {
         AdministrativePoint: { type: "add", value: 1 },
         DiplomaticPoint: { type: "add", value: 1 },
         MilitaryPoint: { type: "add", value: 1 },
      },
   };
   DeclareMobilization: ITimedEffectAction = {
      name: () => $t(L.DeclareMobilization),
      duration: 12,
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      modifiers: {
         WarPower: { type: "multiply", value: 0.2 },
      },
   };
   BolsterDignitas: ITimedEffectAction = {
      name: () => $t(L.BolsterDignitas),
      duration: 12,
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      modifiers: {
         Prestige: { type: "multiply", value: 0.2 },
      },
   };
   AffirmCivicUnity: ITimedEffectAction = {
      name: () => $t(L.AffirmCivicUnity),
      duration: 12,
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      modifiers: {
         Stability: { type: "add", value: 20 },
      },
   };
   PublicEnemy: ITimedAction = {
      name: () => $t(L.NamePublicEnemy),
      desc: () => $t(L.TimedActionPublicEnemyDesc$1, "10%"),
      duration: 12 * 2,
      cooldown: 12 * 2,
   };
   SendAGift: ITimedAction = {
      name: () => $t(L.SendAGift),
      desc: () => $t(L.SendingAGiftToAProvinceIncreasesTheirAttitudeTowardsUsBy$1, "25"),
      duration: 12,
      cooldown: 12 * 10,
   };
   PlunderWarTile: ITimedAction = {
      name: () => $t(L.PlunderWarTile),
      desc: () => $t(L.TimedActionPlunderWarTileDesc),
      duration: 0,
      cooldown: 0,
   };
   DissolveTreaty: ITimedAction = {
      name: () => $t(L.DissolveTreaty),
      desc: () => $t(L.TimedActionDissolveTreatyDesc),
      duration: 0,
      cooldown: 24,
   };
   NullifyTruce: ITimedAction = {
      name: () => $t(L.NullifyTruce),
      desc: () => $t(L.TimedActionNullifyTruceDesc),
      duration: 0,
      cooldown: 24,
   };
   DiplomaticTreaty: ITimedAction = {
      name: () => $t(L.DiplomaticTreaty),
      desc: () => $t(L.OfferDefensePactAllianceAndPatronageTreatiesToOtherProvinces),
      duration: 12 * 10,
      cooldown: 12,
   };
   GuaranteeDefense: ITimedAction = {
      name: () => $t(L.GuaranteeDefense),
      desc: () => $t(L.TimedActionGuaranteeDefenseDesc$1, "50"),
      duration: 12 * 4,
      cooldown: 12 * 2,
   };
   DeterAggression: ITimedAction = {
      name: () => $t(L.DeterAggression),
      desc: () => $t(L.TimedActionDeterAggressionDesc$1$2, "10%", "20%"),
      duration: 12 * 4,
      cooldown: 12 * 2,
   };
   RevealElectionBacking: ITimedAction = {
      name: () => $t(L.RevealElectionBacking),
      desc: () => $t(L.TimedActionRevealElectionBackingDesc),
      duration: 12,
      cooldown: 6,
   };
   TreatySabotaged: ITimedAction = {
      name: () => $t(L.TreatySabotaged),
      duration: 12 * 5,
      cooldown: 0,
   };
   ReformCuria: ITimedEffectAction = {
      name: () => $t(L.ReformCuria),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { administrative: getTotalUpgrades(province, save) },
         };
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   };
   RenewVestments: ITimedEffectAction = {
      name: () => $t(L.RenewVestments),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { garments: (getTotalUpgrades(province, save) * 12) / Price.garments },
         };
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   };
   RecruitTalents: ITimedEffectAction = {
      name: () => $t(L.RecruitTalents),
      duration: 12,
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { gold: getTotalUpgrades(province, save) * 12 },
         };
      },
      modifiers: {
         GoverningCapacity: { type: "add", value: 100 },
      },
   };
   DecimateOurArmy: ITimedAction = {
      name: () => $t(L.DecimateOurArmy),
      desc: () => $t(L.DecimatingOurArmyReducesOurStandingArmyBy$1AndGrantsUs$2WarScore, "10%", "1"),
      duration: 0,
      cooldown: 24,
   };
   HireMercenaries: ITimedAction = {
      name: () => $t(L.HireMercenaries),
      desc: () => $t(L.TimedActionHireMercenariesDesc),
      duration: 0,
      cooldown: 12,
   };
   ForceAttack: ITimedAction = {
      name: () => $t(L.LaunchForcefulAttack),
      desc: () => $t(L.TimedActionForceAttackDesc$1$2, "10%", "1"),
      duration: 12,
      cooldown: 24,
   };
   AnnexClient: ITimedAction = {
      name: () => $t(L.AnnexClient),
      desc: () => $t(L.AnnexingAClientImmediatelyAnnexesAllTheirTiles),
      duration: 0,
      cooldown: 12 * 10,
   };
   SummonGovernor: ITimedAction = {
      name: () => $t(L.SummonGovernor),
      desc: () => $t(L.TimedActionSummonGovernorDesc$1$2, "10%", "10%"),
      duration: 12,
      cooldown: 12 * 3,
   };
   RequestMilitaryAid: ITimedAction = {
      name: () => $t(L.RequestMilitaryAid),
      desc: () => $t(L.TimedActionRequestMilitaryAidDesc$1$2, "10%", "10%"),
      duration: 12,
      cooldown: 12 * 3,
   };
   SubvertGarrison: ITimedAction = {
      name: () => $t(L.SubvertBorderGarrison),
      desc: () => $t(L.TimedActionSubvertGarrisonDesc$1, "20%"),
      duration: 12,
      cooldown: 12 * 4,
   };
   InciteUnrest: ITimedAction = {
      name: () => $t(L.InciteBorderUnrest),
      desc: () => $t(L.TimedActionInciteUnrestDesc$1, "20"),
      duration: 12,
      cooldown: 12 * 4,
   };
   FabricateCasusBelli: ITimedAction = {
      name: () => $t(L.FabricateCasusBelli),
      desc: () => $t(L.TimedActionFabricateCasusBelliDesc),
      duration: 12 * 2,
      cooldown: 12 * 4,
   };
   ProclaimCrusade: ITimedAction = {
      name: () => $t(L.ProclaimCrusade),
      desc: () => $t(L.ProclaimingACrusadeGrantsUsAReligiousWarCasusBelliAgainstThem),
      duration: 12 * 5,
      cooldown: 12 * 10,
   };
   EvangelizeTile: ITimedAction = {
      name: () => $t(L.Evangelize),
      desc: () => $t(L.TimedActionEvangelizeTileDesc),
      duration: 0,
      cooldown: 12,
   };
   TradeGoods: ITimedAction = {
      name: () => $t(L.TradeGoods),
      duration: 12 * 5,
      cooldown: 12 * 2,
   };
   AppointBishop: ITimedEffectAction = {
      name: () => $t(L.AppointBishop),
      duration: 12 * 10,
      cooldown: 12 * 10,
      costCondition: (province, save) => {
         return {
            cost: { christianity: 5 },
         };
      },
      modifiers: {
         ChristianityYearly: { type: "add", value: 1 },
      },
   };
   GameEventTimer: ITimedAction = {
      name: () => EmptyString,
      duration: 0,
      cooldown: 12 * 5,
   };
   GrantSocialClassBonus: ITimedAction = {
      name: () => EmptyString,
      duration: 12 * 5,
      cooldown: 12 * 5,
   };
   SocialClassFavor: ITimedAction = {
      name: () => $t(L.SocialClassFavor),
      desc: () => $t(L.SocialClassFavorDesc),
      duration: 0,
      cooldown: 12 * 2,
   };
   SocialClassCurtail: ITimedAction = {
      name: () => $t(L.SocialClassCurtail),
      desc: () => $t(L.SocialClassCurtailDesc),
      duration: 0,
      cooldown: 12 * 2,
   };
   BarbarianInvasions: ITimedEffectAction = {
      name: () => $t(L.BarbarianInvasions),
      duration: SpawnedProvinceBoostMonths,
      cooldown: 0,
      costCondition: (province, save) => {
         return {};
      },
      modifiers: {
         Stability: { type: "add", value: 10 },
      },
   };
   BarbarianActions: ITimedAction = {
      name: () => EmptyString,
      duration: 12,
      cooldown: 12,
   };
   EcumenicalCouncil1: ITimedAction = {
      name: () => $t(L.TheFirstCouncilOfNicaea),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil2: ITimedAction = {
      name: () => $t(L.TheFirstCouncilOfConstantinople),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil3: ITimedAction = {
      name: () => $t(L.TheCouncilOfEphesus),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil4: ITimedAction = {
      name: () => $t(L.TheCouncilOfChalcedon),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil5: ITimedAction = {
      name: () => $t(L.TheSecondCouncilOfConstantinople),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil6: ITimedAction = {
      name: () => $t(L.TheThirdCouncilOfConstantinople),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncil7: ITimedAction = {
      name: () => $t(L.TheSecondCouncilOfNicaea),
      duration: 12 * 10,
      cooldown: 0,
   };
   EcumenicalCouncilAction: ITimedAction = {
      name: () => $t(L.SponsorDelegate),
      duration: 0,
      cooldown: 6,
   };
   ChangeHeir: ITimedAction = {
      name: () => $t(L.AppointHeir),
      desc: () => $t(L.TimedActionAppointHeirDesc),

      duration: 0,
      cooldown: 24,
   };
   RelocateCapital: ITimedAction = {
      name: () => $t(L.RelocateCapital),
      desc: () => $t(L.TimedActionRelocateCapitalDesc),
      duration: 24,
      cooldown: 24,
   };
   ProclaimRightOfReprisal: ITimedAction = {
      name: () => $t(L.ProclaimRightOfReprisal),
      desc: () =>
         $t(
            L.TimedActionProclaimRightOfReprisalDesc$1$2,
            CasusBelli.BreachOfThePeace.name(),
            formatNumber(BreachOfThePeaceDurationYear),
         ),
      duration: 0,
      cooldown: 12 * 2,
   };
}

export const RelocateCapitalModifier: { modifier: Modifier } & IBaseModifier = {
   modifier: "Stability",
   type: "add",
   value: -10,
   duration: 24,
};

export type TimedAction = keyof TimedActionDefinitions;
export type TimedEffectAction = {
   [K in TimedAction]: TimedActionDefinitions[K] extends ITimedEffectAction ? K : never;
}[TimedAction];
export const TimedActions = new TimedActionDefinitions();
export const EcumenicalCouncils = [
   "EcumenicalCouncil1",
   "EcumenicalCouncil2",
   "EcumenicalCouncil3",
   "EcumenicalCouncil4",
   "EcumenicalCouncil5",
   "EcumenicalCouncil6",
   "EcumenicalCouncil7",
] as const satisfies TimedAction[];

forEach(Tech, (tech, config) => {
   config.timedActions?.forEach((timedAction) => {
      TimedActions[timedAction].tech = tech;
   });
});
