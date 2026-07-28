import { $t, L } from "../../utils/i18n";
import { HispaniaProvinces } from "../definitions/TileConstants";
import { TimedActions } from "../definitions/TimedAction";
import { getOriginalTileCount } from "../GameState";
import { coreTileCountCondition } from "../logic/MissionLogic";
import { getProvinceName } from "../logic/ProvinceLogic";
import { allCoreTileCondition, anyCoreTileCondition, isCoreTileCondition } from "../logic/TileLogic";
import { getTimedActionTimeLeft } from "../logic/TimedActionLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const HispaniaEvent = {
   Hispania1: {
      name: () => $t(L.TheRoadsIntoGaul),
      image: EventImage.Pyrenees,
      desc: () => $t(L.TheRoadsIntoGaulDesc),
      condition: {
         province: HispaniaProvinces,
         conditions: (province, save) => {
            return [
               coreTileCountCondition(getOriginalTileCount(province) + 10, province, save),
               anyCoreTileCondition([8781900, 8847436, 8847437, 8912973, 8978509], province, save),
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.MarchAlongTheCoastIntoNarbonensis),
            casusBelli: {
               Narbonensis: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.OpenTheWesternRoadIntoAquitania),
            casusBelli: {
               Aquitania: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
            modifiers: {
               Stability: { type: "add", value: 20, duration: 12 * 2 },
            },
         },
      ],
   },
   Hispania2: {
      name: () => $t(L.AcrossTheStraitOfGibraltar),
      image: EventImage.Gibraltar,
      desc: () => $t(L.AcrossTheStraitOfGibraltarDesc),
      condition: {
         province: HispaniaProvinces,
         conditions: (province, save) => {
            return [isCoreTileCondition(8585300, province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.LaunchTheInvasionFromBaelo),
            casusBelli: {
               Mauretania: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 12 * 2 },
            },
         },
         {
            label: () => $t(L.PlanTheAfricanCampaignWithCare),
            resources: {
               administrative: 50,
               diplomatic: 50,
               military: 50,
            },
            casusBelli: {
               Mauretania: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
         },
      ],
   },
   Hispania3: {
      name: () => $t(L.TheSuebiMustBeDrivenOut),
      image: EventImage.Gibraltar,
      desc: () => $t(L.TheSuebiMustBeDrivenOutDesc),
      condition: {
         playerOnly: true,
         province: HispaniaProvinces,
         provinceOnMap: ["Suebi"],
         conditions: (province, save) => {
            return [
               {
                  name: $t(L.$1NoLongerHas$2, getProvinceName("Suebi", save), TimedActions.BarbarianInvasions.name()),
                  value: getTimedActionTimeLeft("BarbarianInvasions", "Suebi", save) <= 0,
               },
            ];
         },
      },
      buttons: [
         {
            label: () => $t(L.TurnTheirStrongholdsAgainstThem),
            casusBelli: {
               Suebi: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 5 * 12, province: "Suebi" },
            ],
         },
         {
            label: () => $t(L.ShatterTheirWillToFight),
            casusBelli: {
               Suebi: { casusBelli: "ConquestMission", duration: 12 * 10 },
            },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.2, duration: 5 * 12, province: "Suebi" },
            ],
         },
      ],
   },
   Hispania4: {
      name: () => $t(L.AFootholdInAfrica),
      image: EventImage.Gibraltar,
      desc: () => $t(L.AFootholdInAfricaDesc),
      condition: {
         playerOnly: true,
         provinceOnMap: ["Mauretania"],
         province: HispaniaProvinces,
         conditions: (province, save) => {
            return [allCoreTileCondition([8519765, 8519766, 8585302], province, save)];
         },
      },
      buttons: [
         {
            label: () => $t(L.TurnTheirFortressesAgainstThem),
            resources: { generalSkillPoint: 3, gold: 1500 },
            provinceModifiers: [
               { modifier: "Defense", type: "multiply", value: -0.2, duration: 5 * 12, province: "Mauretania" },
            ],
         },
         {
            label: () => $t(L.ShatterTheirWillToFight),
            resources: { consulPoint: 3, administrative: 50, diplomatic: 50, military: 50 },
            provinceModifiers: [
               { modifier: "WarPower", type: "multiply", value: -0.2, duration: 5 * 12, province: "Mauretania" },
            ],
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
