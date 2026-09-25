import { fromEntries, sizeOf } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { Tech } from "../definitions/Tech";
import {
   EasternMediterraneanProvinces,
   WesternMediterraneanProvinces,
   WesternRomanEmpireProvinces,
} from "../definitions/TileConstants";
import type { ConditionChecks } from "../logic/Calculation";
import {
   allyCountChecks,
   eliminatedBarbariansChecks,
   minCoreTileChecks,
   setProvinceNameOverrideEffect,
   techCountChecks,
} from "../logic/MissionLogic";
import { isGreatPowerChecks } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MissionEvents = {
   Mission1: {
      name: () => $t(L.AStrongAlliance),
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.AStrongAllianceDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* allyCountChecks(2, province, save);
         },
      },
      achievement: "FormAlliance",
      buttons: [
         {
            label: () => $t(L.LetOurAlliesMarchBesideUsInWar),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OurAllianceShallElevateOurPrestige),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
         },
      ],
   },
   Mission2: {
      name: () => $t(L.ANewHegemonRises),
      image: EventImage.ZenobiaCaptured,
      desc: () => $t(L.ANewHegemonRisesDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* isGreatPowerChecks(province, save);
            yield* minCoreTileChecks(Province[province].tiles.length + 5, province, save);
         },
      },
      achievement: "BecomeGreatPower",
      buttons: [
         {
            label: () => $t(L.LetCommerceFlowThroughOurPorts),
            modifiers: {
               TradeCapacity: { type: "add", value: 1 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ChannelOurStrengthIntoProduction),
            modifiers: {
               ProductionCapacity: { type: "add", value: 5 },
               TileOutput: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
      ],
   },
   Mission6: {
      name: () => $t(L.AProvinceTransformed),
      image: EventImage.ImperialCity,
      desc: () => $t(L.AProvinceTransformedDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* minCoreTileChecks(Province[province].tiles.length * 2, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.PlanANewProvincialCapital),
            resources: {
               mandate: 1,
            },
         },
         {
            label: () => $t(L.SecureAlliesInTheSenate),
            resources: {
               consulPoint: 5,
            },
         },
         {
            label: () => $t(L.EmpowerTheProvincialGovernment),
            resources: {
               administrative: 60,
               diplomatic: 60,
               military: 60,
            },
         },
      ],
   },
   Mission7: {
      name: () => $t(L.EveryArtMastered),
      image: EventImage.PhilosophySchool,
      desc: () => $t(L.EveryArtMasteredDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* techCountChecks(sizeOf(Tech), province, save);
         },
      },
      achievement: "ResearchAllTechs",
      buttons: [
         {
            label: () => $t(L.FoundACapitalOfLearning),
            resources: {
               mandate: 1,
            },
         },
         {
            label: () => $t(L.GiveScholarsAVoiceInTheSenate),
            resources: {
               consulPoint: 5,
            },
         },
         {
            label: () => $t(L.DispatchExpertsAcrossTheProvince),
            resources: {
               administrative: 60,
               diplomatic: 60,
               military: 60,
            },
         },
      ],
   },
   Mission3: {
      name: () => $t(L.TheWesternRomanEmpireRestored),
      image: EventImage.CaesarsTriumph,
      desc: () => $t(L.WesternRomanEmpireRestoredDesc),
      condition: {
         province: new Set(WesternRomanEmpireProvinces),
         annexAndCore: fromEntries(WesternRomanEmpireProvinces.map((province) => [province, Number.POSITIVE_INFINITY])),
      },
      achievement: "RestoreWesternRomanEmpire",
      wikipedia: "Western_Roman_Empire",
      buttons: [
         {
            label: () => $t(L.TheWestIsRomanOnceMore),
            modifiers: {
               GoverningCapacity: { type: "add", value: 200 },
               AdministrativePoint: { type: "add", value: 1 },
               DiplomaticPoint: { type: "add", value: 1 },
               MilitaryPoint: { type: "add", value: 1 },
            },
            custom: [setProvinceNameOverrideEffect("WesternRomanEmpire")],
         },
      ],
   },
   Mission4: {
      name: () => $t(L.DominionOfTheWesternSea),
      image: EventImage.NavalBattle,
      desc: () => $t(L.DominionOfTheWesternSeaDesc),
      condition: {
         province: new Set(WesternMediterraneanProvinces),
         annexAndCore: fromEntries(
            WesternMediterraneanProvinces.map((province) => [province, Number.POSITIVE_INFINITY]),
         ),
      },
      achievement: "DominateWesternMediterranean",
      buttons: [
         {
            label: () => $t(L.GovernTheShoresThroughLaw),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.BindThePortsThroughDiplomacy),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               DiplomaticPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.EntrustTheSeaToOurFleets),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
      ],
   },
   Mission5: {
      name: () => $t(L.DominionOfTheEasternSea),
      image: EventImage.ConstantinopleBuilt,
      desc: () => $t(L.DominionOfTheEasternSeaDesc),
      condition: {
         province: new Set(EasternMediterraneanProvinces),
         annexAndCore: fromEntries(
            EasternMediterraneanProvinces.map((province) => [province, Number.POSITIVE_INFINITY]),
         ),
      },
      achievement: "DominateEasternMediterranean",
      buttons: [
         {
            label: () => $t(L.GovernTheEasternShoresByLaw),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               AdministrativePoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.BindTheEasternPortsByTreaty),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               DiplomaticPoint: { type: "add", value: 1 },
            },
         },
         {
            label: () => $t(L.EntrustTheEastToOurFleets),
            modifiers: {
               GoverningCapacity: { type: "add", value: 100 },
               MilitaryPoint: { type: "add", value: 1 },
            },
         },
      ],
   },
   Mission8: {
      name: () => $t(L.TheSpoilsOfVictory),
      image: EventImage.GallicSack,
      desc: () => $t(L.TheSpoilsOfVictoryDesc),
      condition: {
         conditions: function* (province, save): ConditionChecks {
            yield* eliminatedBarbariansChecks(1, province, save);
         },
      },
      buttons: [
         {
            label: () => $t(L.SanctionPlunderForOurProvince),
            provinceUpgrades: ["RightOfPlunder"],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
