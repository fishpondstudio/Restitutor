import { EmptyString } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { finalizeCondition, type IGameCostCondition } from "../actions/GameAction";
import type { IGameEffect } from "../GameEffect";
import type { SaveGame } from "../GameState";
import { getProvinceUpgrade } from "../logic/ProvinceLogic";
import { timedActionConditions } from "../logic/TimedActionLogic";
import { Price } from "./Goods";
import type { Province } from "./Province";
import type { Tech } from "./Tech";

export interface IBaseTimedAction {
   name: () => string;
   cooldown: number;
   tech?: Tech;
}

export interface ITimedAction extends IBaseTimedAction {
   desc?: () => string;
   duration: number;
}

export interface IGameEffectAction extends IBaseTimedAction {
   costCondition: (province: Province, save: SaveGame) => IGameCostCondition;
   effect: IGameEffect;
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
   HoldGames: IGameEffectAction = {
      name: () => $t(L.HoldGames),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { gold: getProvinceUpgrade(province, save) * 12 },
         };
      },
      effect: {
         modifiers: {
            Stability: { type: "add", value: 10, duration: 12 },
         },
      },
   };
   ExpandGrainDole: IGameEffectAction = {
      name: () => $t(L.ExpandGrainDole),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { bread: (getProvinceUpgrade(province, save) * 12) / Price.bread },
         };
      },
      effect: {
         modifiers: {
            Stability: { type: "add", value: 10, duration: 12 },
         },
      },
   };
   UpgradeRations: IGameEffectAction = {
      name: () => $t(L.UpgradeRations),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { cheese: (getProvinceUpgrade(province, save) * 12) / Price.cheese },
         };
      },
      effect: {
         modifiers: {
            WarPower: { type: "multiply", value: 0.1, duration: 12 },
         },
      },
   };
   RefitArmor: IGameEffectAction = {
      name: () => $t(L.RefitArmor),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { armor: (getProvinceUpgrade(province, save) * 12) / Price.armor },
         };
      },
      effect: {
         modifiers: {
            WarPower: { type: "multiply", value: 0.1, duration: 12 },
         },
      },
   };
   ServiceWeapons: IGameEffectAction = {
      name: () => $t(L.ServiceWeapons),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { weapon: (getProvinceUpgrade(province, save) * 12) / Price.weapon },
         };
      },
      effect: {
         modifiers: {
            WarPower: { type: "multiply", value: 0.1, duration: 12 },
         },
      },
   };
   MakeWarSpeech: ITimedAction = {
      name: () => $t(L.MakeWarSpeech),
      desc: () => $t(L.TimedActionMakeWarSpeechDesc, "10%"),
      duration: 12,
      cooldown: 36,
   };
   GrantTaxRelief: IGameEffectAction = {
      name: () => $t(L.GrantTaxRelief),
      cooldown: 24,
      costCondition: (province, save) => ({}),
      effect: {
         modifiers: {
            Stability: { type: "add", value: 10, duration: 12 },
            LandTax: { type: "multiply", value: -0.2, duration: 12 },
         },
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
   AppointPontiff: IGameEffectAction = {
      name: () => $t(L.AppointAPontiff),
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { administrative: 12 },
            condition: finalizeCondition({
               breakdown: [
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
            }),
         };
      },
      effect: {
         modifiers: {
            AdministrativePoint: { type: "add", value: 1, duration: 24 },
         },
      },
   };
   AppointEnvoy: IGameEffectAction = {
      name: () => $t(L.AppointAnEnvoy),
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { diplomatic: 12 },
            condition: finalizeCondition({
               breakdown: [
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
            }),
         };
      },
      effect: {
         modifiers: {
            DiplomaticPoint: { type: "add", value: 1, duration: 24 },
         },
      },
   };
   AppointArmyStaff: IGameEffectAction = {
      name: () => $t(L.AppointArmyStaff),
      cooldown: 48,
      costCondition: (province, save) => {
         return {
            cost: { military: 12 },
            condition: finalizeCondition({
               breakdown: [
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
            }),
         };
      },
      effect: {
         modifiers: {
            MilitaryPoint: { type: "add", value: 1, duration: 24 },
         },
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
   RequestFunding: IGameEffectAction = {
      name: () => $t(L.RequestFunding),
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      effect: {
         modifiers: {
            TileOutput: { type: "multiply", value: 0.25, duration: 12 },
            LandTax: { type: "multiply", value: 0.25, duration: 12 },
         },
      },
   };
   EnactSenateOversight: IGameEffectAction = {
      name: () => $t(L.EnactSenateOversight),
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      effect: {
         modifiers: {
            AdministrativePoint: { type: "add", value: 1, duration: 12 },
            DiplomaticPoint: { type: "add", value: 1, duration: 12 },
            MilitaryPoint: { type: "add", value: 1, duration: 12 },
         },
      },
   };
   DeclareMobilization: IGameEffectAction = {
      name: () => $t(L.DeclareMobilization),
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      effect: {
         modifiers: {
            WarPower: { type: "add", value: 0.1, duration: 12 },
         },
      },
   };
   AffirmCivicUnity: IGameEffectAction = {
      name: () => $t(L.AffirmCivicUnity),
      cooldown: 12,
      costCondition: (province, save) => {
         return {
            cost: { consulPoint: 1 },
         };
      },
      effect: {
         modifiers: {
            Stability: { type: "add", value: 10, duration: 12 },
         },
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
   ReformCuria: IGameEffectAction = {
      name: () => $t(L.ReformCuria),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { administrative: getProvinceUpgrade(province, save) },
         };
      },
      effect: {
         modifiers: {
            GoverningCapacity: { type: "add", value: 100, duration: 12 },
         },
      },
   };
   RenewVestments: IGameEffectAction = {
      name: () => $t(L.RenewVestments),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { garments: (getProvinceUpgrade(province, save) * 12) / Price.garments },
         };
      },
      effect: {
         modifiers: {
            GoverningCapacity: { type: "add", value: 100, duration: 12 },
         },
      },
   };
   RecruitTalents: IGameEffectAction = {
      name: () => $t(L.RecruitTalents),
      cooldown: 24,
      costCondition: (province, save) => {
         return {
            cost: { gold: getProvinceUpgrade(province, save) * 12 },
         };
      },
      effect: {
         modifiers: {
            GoverningCapacity: { type: "add", value: 100, duration: 12 },
         },
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
   AppointBishop: IGameEffectAction = {
      name: () => $t(L.AppointBishop),
      cooldown: 12 * 10,
      costCondition: (province, save) => {
         return {
            cost: { christianity: (12 * 10) / 2 },
         };
      },
      effect: {
         modifiers: {
            ChristianityYearly: { type: "add", value: 1, duration: 12 },
         },
      },
   };
   GameEventTimer: ITimedAction = {
      name: () => EmptyString,
      duration: 0,
      cooldown: 12 * 5,
   };
}

export type TimedAction = keyof TimedActionDefinitions;
export type TimedActionWithDuration = {
   [K in TimedAction]: TimedActionDefinitions[K] extends { duration: number } ? K : never;
}[TimedAction];
export const TimedActions = new TimedActionDefinitions();
