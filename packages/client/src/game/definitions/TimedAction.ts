import { EmptyString } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import type { IGameAction } from "../actions/GameAction";
import type { SaveGame } from "../GameState";
import { addModifier, getProvinceUpgrade } from "../logic/ProvinceLogic";
import { createGameAction, timedActionConditions } from "../logic/TimedActionLogic";
import { Price } from "./Goods";
import type { Province } from "./Province";
import type { Tech } from "./Tech";

export interface ITimedAction {
   name: () => string;
   desc?: () => string;
   duration: number;
   cooldown: number;
   tech?: Tech;
}

export interface IProvinceTimedAction extends ITimedAction {
   action: (province: Province, save: SaveGame) => IGameAction;
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
      desc: () => $t(L.TimedActionAppeaseDesc, "5"),
      duration: 0,
      cooldown: 0,
   };
   Crackdown: ITimedAction = {
      name: () => $t(L.CrackDown),
      desc: () => $t(L.TimedActionCrackdownDesc, "0", "10", "5"),
      duration: 0,
      cooldown: 0,
   };
   HoldGames: IProvinceTimedAction = {
      name: () => $t(L.HoldGames),
      desc: () => $t(L.HoldingGamesIncreasesStabilityByX, "10"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "HoldGames",
            cost: { gold: getProvinceUpgrade(province, save) * 12 },
            province: province,
            save: save,
         });
      },
   };
   ExpandGrainDole: IProvinceTimedAction = {
      name: () => $t(L.ExpandGrainDole),
      desc: () => $t(L.ExpandingGrainDoleIncreasesStabilityByX, "10"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "ExpandGrainDole",
            cost: { bread: (getProvinceUpgrade(province, save) * 12) / Price.bread },
            province: province,
            save: save,
         });
      },
   };
   UpgradeRations: IProvinceTimedAction = {
      name: () => $t(L.UpgradeRations),
      desc: () => $t(L.UpgradingRationsIncreasesWarPowerByX, "10%"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "UpgradeRations",
            cost: { cheese: (getProvinceUpgrade(province, save) * 12) / Price.cheese },
            province: province,
            save: save,
         });
      },
   };
   RefitArmor: IProvinceTimedAction = {
      name: () => $t(L.RefitArmor),
      desc: () => $t(L.RefittingArmorIncreasesWarPowerByX, "10%"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "RefitArmor",
            cost: { armor: (getProvinceUpgrade(province, save) * 12) / Price.armor },
            province: province,
            save: save,
         });
      },
   };
   ServiceWeapons: IProvinceTimedAction = {
      name: () => $t(L.ServiceWeapons),
      desc: () => $t(L.ServicingWeaponsIncreasesWarPowerByX, "10%"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "ServiceWeapons",
            cost: { weapon: (getProvinceUpgrade(province, save) * 12) / Price.weapon },
            province: province,
            save: save,
         });
      },
   };
   MakeWarSpeech: ITimedAction = {
      name: () => $t(L.MakeWarSpeech),
      desc: () => $t(L.TimedActionMakeWarSpeechDesc, "10%"),
      duration: 12,
      cooldown: 36,
   };
   GrantTaxRelief: IProvinceTimedAction = {
      name: () => $t(L.GrantTaxRelief),
      desc: () => $t(L.GrantingTaxReliefIncreasesStabilityByXAndReducesLandTaxByY, "10", "20%"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "GrantTaxRelief",
            province: province,
            save: save,
         });
      },
   };
   UndermineTheirArmy: ITimedAction = {
      name: () => $t(L.UndermineTheirArmy),
      desc: () => $t(L.UnderminingTheirArmyReducesTheirWarPowerByX, "10%"),
      duration: 12,
      cooldown: 48,
   };
   MakeCore: ITimedAction = {
      name: () => $t(L.MakeCore),
      duration: 0,
      cooldown: 12,
   };
   RecruitAGeneral: ITimedAction = {
      name: () => $t(L.RecruitAGeneral),
      desc: () => $t(L.RecruitingAGeneralCostsGoldEveryMonthAGeneralHasABaseSkillOfX, "1/1/1"),
      duration: 12 * 30,
      cooldown: 12 * 30,
   };
   FortifyBorders: ITimedAction = {
      name: () => $t(L.FortifyOurBorders),
      desc: () => $t(L.TimedActionFortifyBordersDesc, "100%"),
      duration: 12 * 2,
      cooldown: 12 * 4,
   };
   AppointPontiff: IProvinceTimedAction = {
      name: () => $t(L.AppointAPontiff),
      desc: () => $t(L.AppointingAPontiffGivesXMonthlyAdministrativePoints, "+1"),
      duration: 24,
      cooldown: 48,
      action: (province, save) => {
         return createGameAction({
            timedAction: "AppointPontiff",
            cost: { administrative: 12 },
            conditions: [
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
            ],
            province: province,
            save: save,
         });
      },
   };
   AppointEnvoy: IProvinceTimedAction = {
      name: () => $t(L.AppointAnEnvoy),
      desc: () => $t(L.AppointingAnEnvoyGivesXMonthlyDiplomaticPoints, "+1"),
      duration: 24,
      cooldown: 48,
      action: (province, save) => {
         return createGameAction({
            timedAction: "AppointEnvoy",
            cost: { diplomatic: 12 },
            conditions: [
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
            ],
            province: province,
            save: save,
         });
      },
   };
   AppointArmyStaff: IProvinceTimedAction = {
      name: () => $t(L.AppointArmyStaff),
      desc: () => $t(L.AppointingArmyStaffGivesXMonthlyMilitaryPoints, "+1"),
      duration: 24,
      cooldown: 48,
      action: (province, save) => {
         return createGameAction({
            timedAction: "AppointArmyStaff",
            cost: { military: 12 },
            conditions: [
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
            ],
            province: province,
            save: save,
         });
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
      desc: () => $t(L.CorruptingOfficialsIncreasesOurInfiltrationByX, "50"),
      duration: 0,
      cooldown: 12 * 5,
   };
   Bankruptcy: ITimedAction = {
      name: () => $t(L.Bankruptcy),
      duration: 10 * 12,
      cooldown: 0,
   };
   ChangeRival: ITimedAction = {
      name: () => $t(L.ChangeRival),
      duration: 0,
      cooldown: 12 * 10,
   };
   Denounce: ITimedAction = {
      name: () => $t(L.Denounce),
      desc: () => $t(L.TimedActionDenounceDesc, "50", "10%", "20%"),
      duration: 12 * 2,
      cooldown: 12 * 4,
   };
   DemandElectionBacking: ITimedAction = {
      name: () => $t(L.DemandElectionBacking),
      desc: () => $t(L.TimedActionDemandElectionBackingDesc, "1"),
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
   RequestFunding: IProvinceTimedAction = {
      name: () => $t(L.RequestFunding),
      desc: () => $t(L.RequestingFundingIncreasesAllTilesLandTaxAndTileOutputByX, "25%"),
      duration: 12,
      cooldown: 12,
      action: (province, save) => {
         return createGameAction({
            timedAction: "RequestFunding",
            cost: { consulPoint: 1 },
            province: province,
            save: save,
            effect: () => {
               addModifier({
                  modifier: "TileOutput",
                  name: $t(L.RequestFunding),
                  value: 0.25,
                  duration: 12,
                  type: "multiply",
                  province: province,
                  save: save,
               });
               addModifier({
                  modifier: "LandTax",
                  name: $t(L.RequestFunding),
                  value: 0.25,
                  duration: 12,
                  type: "multiply",
                  province: province,
                  save: save,
               });
            },
         });
      },
   };
   EnactSenateOversight: IProvinceTimedAction = {
      name: () => $t(L.EnactSenateOversight),
      desc: () => $t(L.TimedActionEnactSenateOversightDesc, "+1"),
      duration: 12,
      cooldown: 12,
      action: (province, save) => {
         return createGameAction({
            timedAction: "EnactSenateOversight",
            cost: { consulPoint: 1 },
            province: province,
            save: save,
         });
      },
   };
   DeclareMobilization: IProvinceTimedAction = {
      name: () => $t(L.DeclareMobilization),
      desc: () => $t(L.DeclaringMobilizationIncreasesOurWarPowerByX, "10%"),
      duration: 12,
      cooldown: 12,
      action: (province, save) => {
         return createGameAction({
            timedAction: "DeclareMobilization",
            cost: { consulPoint: 1 },
            province: province,
            save: save,
         });
      },
   };
   AffirmCivicUnity: IProvinceTimedAction = {
      name: () => $t(L.AffirmCivicUnity),
      desc: () => $t(L.AffirmingCivicUnityIncreasesOurStabilityByX, "10"),
      duration: 12,
      cooldown: 12,
      action: (province, save) => {
         return createGameAction({
            timedAction: "AffirmCivicUnity",
            cost: { consulPoint: 1 },
            province: province,
            save: save,
         });
      },
   };
   PublicEnemy: ITimedAction = {
      name: () => $t(L.NamePublicEnemy),
      desc: () => $t(L.TimedActionPublicEnemyDesc, "10%"),
      duration: 12 * 2,
      cooldown: 12 * 2,
   };
   SendAGift: ITimedAction = {
      name: () => $t(L.SendAGift),
      desc: () => $t(L.SendingAGiftToAProvinceIncreasesTheirAttitudeTowardsUsByX, "25"),
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
   DiplomaticTreaty: ITimedAction = {
      name: () => $t(L.DiplomaticTreaty),
      desc: () => $t(L.OfferDefensePactAllianceAndPatronageTreatiesToOtherProvinces),
      duration: 12 * 10,
      cooldown: 12,
   };
   GuaranteeDefense: ITimedAction = {
      name: () => $t(L.GuaranteeDefense),
      desc: () => $t(L.TimedActionGuaranteeDefenseDesc, "50"),
      duration: 12 * 4,
      cooldown: 12 * 2,
   };
   DeterAggression: ITimedAction = {
      name: () => $t(L.DeterAggression),
      desc: () => $t(L.TimedActionDeterAggressionDesc, "10%", "20%"),
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
   ReformCuria: IProvinceTimedAction = {
      name: () => $t(L.ReformCuria),
      desc: () => $t(L.ReformingCuriaIncreasesGoverningCapacityByX, "100"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "ReformCuria",
            cost: { administrative: getProvinceUpgrade(province, save) },
            province: province,
            save: save,
         });
      },
   };
   RenewVestments: IProvinceTimedAction = {
      name: () => $t(L.RenewVestments),
      desc: () => $t(L.RenewingVestmentsIncreasesGoverningCapacityByX, "100"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "RenewVestments",
            cost: { garments: (getProvinceUpgrade(province, save) * 12) / Price.garments },
            province: province,
            save: save,
         });
      },
   };
   RecruitTalents: IProvinceTimedAction = {
      name: () => $t(L.RecruitTalents),
      desc: () => $t(L.RecruitingTalentsIncreasesGoverningCapacityByX, "100"),
      duration: 12,
      cooldown: 24,
      action: (province, save) => {
         return createGameAction({
            timedAction: "RecruitTalents",
            cost: { gold: getProvinceUpgrade(province, save) * 12 },
            province: province,
            save: save,
         });
      },
   };
   DecimateOurArmy: ITimedAction = {
      name: () => $t(L.DecimateOurArmy),
      desc: () => $t(L.DecimatingOurArmyReducesOurStandingArmyByXAndGrantsUsYWarScore, "10%", "1"),
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
      desc: () => $t(L.TimedActionForceAttackDesc, "10%", "1"),
      duration: 6,
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
      desc: () => $t(L.TimedActionSummonGovernorDesc, "10%", "10%"),
      duration: 12,
      cooldown: 12 * 3,
   };
   RequestMilitaryAid: ITimedAction = {
      name: () => $t(L.RequestMilitaryAid),
      desc: () => $t(L.TimedActionRequestMilitaryAidDesc, "10%", "10%"),
      duration: 12,
      cooldown: 12 * 3,
   };
   SubvertGarrison: ITimedAction = {
      name: () => $t(L.SubvertBorderGarrison),
      desc: () => $t(L.TimedActionSubvertGarrisonDesc, "20%"),
      duration: 12,
      cooldown: 12 * 4,
   };
   InciteUnrest: ITimedAction = {
      name: () => $t(L.InciteBorderUnrest),
      desc: () => $t(L.TimedActionInciteUnrestDesc, "20"),
      duration: 12,
      cooldown: 12 * 4,
   };
   FabricateCasusBelli: ITimedAction = {
      name: () => $t(L.FabricateCasusBelli),
      desc: () => $t(L.TimedActionFabricateCasusBelliDesc),
      duration: 12 * 5,
      cooldown: 12 * 10,
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
   CurryFavor: ITimedAction = {
      name: () => $t(L.CurryFavor),
      desc: () => $t(L.TimedActionCurryFavorDesc, "20", "20"),
      duration: 0,
      cooldown: 12 * 2,
   };
   TradeGoods: ITimedAction = {
      name: () => $t(L.TradeGoods),
      duration: 12 * 5,
      cooldown: 12 * 2,
   };
   AppointBishop: IProvinceTimedAction = {
      name: () => $t(L.AppointBishop),
      desc: () => $t(L.AppointBishopDesc, "+1"),
      duration: 12 * 10,
      cooldown: 12 * 10,
      action: (province, save) => {
         return createGameAction({
            timedAction: "AppointBishop",
            cost: { christianity: (12 * 10) / 2 },
            province: province,
            save: save,
         });
      },
   };
   GameEventTimer: ITimedAction = {
      name: () => EmptyString,
      duration: 0,
      cooldown: 12 * 5,
   };
}

export type TimedAction = keyof TimedActionDefinitions;
export const TimedActions = new TimedActionDefinitions();
