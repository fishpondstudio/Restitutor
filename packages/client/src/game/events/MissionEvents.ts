import { fromEntries } from "@project/shared/src/utils/Helper";
import { $t, L } from "../../utils/i18n";
import { ProvinceNameOverrides } from "../definitions/Province";
import {
   EasternMediterraneanProvinces,
   WesternMediterraneanProvinces,
   WesternRomanEmpireProvinces,
} from "../definitions/TileConstants";
import { RefreshTiles } from "../Events";
import { getOriginalTileCount } from "../GameState";
import { allyCountCondition, minCoreTileCondition } from "../logic/MissionLogic";
import { isGreatPowerCondition, setProvinceNameOverride } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MissionEvents = {
   Mission1: {
      name: () => $t(L.AStrongAlliance),
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.AStrongAllianceDesc),
      condition: {
         conditions: (province, save) => [allyCountCondition(2, province, save)],
      },
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
         conditions: (province, save) => [
            isGreatPowerCondition(province, save),
            minCoreTileCondition(getOriginalTileCount(province) + 5, province, save),
         ],
      },
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
         conditions: (province, save) => [minCoreTileCondition(getOriginalTileCount(province) * 2, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.PlanANewProvincialCapital),
            resources: {
               capitalRelocationPoint: 1,
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
   Mission3: {
      name: () => $t(L.TheWesternRomanEmpireRestored),
      image: EventImage.CaesarsTriumph,
      desc: () => $t(L.WesternRomanEmpireRestoredDesc),
      condition: {
         province: WesternRomanEmpireProvinces,
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
            custom: [
               {
                  effect: (province, save) => {
                     setProvinceNameOverride(province, "WesternRomanEmpire", save);
                     RefreshTiles.emit({ tiles: [], options: { visual: true } });
                  },
                  desc: () => {
                     return $t(L.OurProvinceIsNowKnownAsThe$1, ProvinceNameOverrides.WesternRomanEmpire());
                  },
               },
            ],
         },
      ],
   },
   Mission4: {
      name: () => $t(L.DominionOfTheWesternSea),
      image: EventImage.NavalBattle,
      desc: () => $t(L.DominionOfTheWesternSeaDesc),
      condition: {
         province: WesternMediterraneanProvinces,
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
         province: EasternMediterraneanProvinces,
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
} as const satisfies Record<string, IGameEventConfig>;
